'use strict';

/**
 * Rutas de la API del portal.
 *   POST /api/login/solicitar  { rut }            -> envía código al email
 *   POST /api/login/verificar  { rut, codigo }    -> inicia sesión
 *   POST /api/logout
 *   GET  /api/session                              -> estado de sesión
 *   GET  /api/portal                               -> PORTAL_DATA del cliente
 *   GET  /api/doc/:docId                           -> descarga/stream de un PDF
 *   GET  /api/docs/zip?ids=a,b,c                   -> descarga varios PDF en un ZIP
 *   POST /api/solicitud                            -> formularios del portal al ejecutivo
 *   GET  /api/health                               -> estado (mínimo)
 */

const express = require('express');
const config = require('./config');
const auth = require('./auth');
const portal = require('./portal');
const sync = require('./sync');
const { rateLimit } = require('./ratelimit');

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.rut) return next();
  return res.status(401).json({ error: 'No autenticado' });
}

// Límites: solicitar código y verificar (fuerza bruta / bombardeo de correo).
const solicitarLimiter = rateLimit({ prefix: 'sol', windowMs: 15 * 60 * 1000, max: 12 });
const verificarLimiter = rateLimit({ prefix: 'ver', windowMs: 15 * 60 * 1000, max: 30 });

router.post('/login/solicitar', solicitarLimiter, async (req, res) => {
  const { rut } = req.body || {};
  try {
    const r = await auth.solicitarCodigo(rut);
    if (!r.ok) return res.status(400).json(r);
    res.json({ ok: true }); // respuesta uniforme (no revela email ni existencia)
  } catch (e) {
    res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
});

router.post('/login/verificar', verificarLimiter, (req, res) => {
  const { rut, codigo } = req.body || {};
  const r = auth.verificarCodigo(rut, codigo);
  if (!r.ok) return res.status(400).json(r);
  // Regenera la sesión al autenticar (evita fijación de sesión).
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Error de sesión' });
    req.session.rut = r.rut;
    res.json({ ok: true });
  });
});

router.post('/logout', (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.clearCookie('portal.sid');
  res.json({ ok: true });
});

router.get('/session', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.rut) });
});

router.get('/portal', requireAuth, (req, res) => {
  const data = portal.portalData(req.session.rut);
  if (!data) return res.status(404).json({ error: 'Sin proyectos para este cliente' });
  res.json(data);
});

router.get('/doc/:docId', requireAuth, async (req, res) => {
  if (config.demoMode) {
    return res.status(404).json({ error: 'Documento no disponible en modo demo' });
  }
  // AUTORIZACIÓN: el docId debe pertenecer a un proyecto del RUT en sesión.
  // Bloquea IDOR (acceso a documentos de otros clientes o docId forjados).
  const permitidos = portal.docIdsValidos(req.session.rut);
  if (!permitidos.has(req.params.docId)) {
    return res.status(404).json({ error: 'Documento no encontrado' });
  }
  try {
    const graph = require('./graph');
    const { res: upstream, name } = await graph.descargarDoc(req.params.docId);
    // Sanitiza el nombre para el header (evita inyección de cabeceras).
    const safeName = String(name || 'documento.pdf').replace(/[^\w.\- ]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    const { Readable } = require('stream');
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
    else res.end();
  } catch (e) {
    console.error('[doc]', e.message);
    res.status(502).json({ error: 'No se pudo obtener el documento' });
  }
});

// Límite defensivo del ZIP: evita que una descarga masiva agote la memoria
// del proceso (el ZIP se arma en RAM antes de enviarse).
const ZIP_MAX_DOCS = 60;
const ZIP_MAX_BYTES = 200 * 1024 * 1024;

/**
 * Descarga varios documentos en un único ZIP.
 * Los ids llegan en ?ids=<docId>,<docId>,... y se validan uno a uno contra los
 * documentos del RUT en sesión (misma protección anti-IDOR que /doc/:docId).
 */
router.get('/docs/zip', requireAuth, async (req, res) => {
  if (config.demoMode) {
    return res.status(404).json({ error: 'Documentos no disponibles en modo demo' });
  }

  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: 'Sin documentos seleccionados' });
  if (ids.length > ZIP_MAX_DOCS) {
    return res.status(400).json({ error: `Máximo ${ZIP_MAX_DOCS} documentos por descarga` });
  }

  const permitidos = portal.docIdsValidos(req.session.rut);
  if (ids.some((id) => !permitidos.has(id))) {
    return res.status(404).json({ error: 'Documento no encontrado' });
  }

  try {
    const graph = require('./graph');
    const { crearZip } = require('./zip');
    const entradas = [];
    let total = 0;
    // Secuencial a propósito: no saturamos la cuota de Microsoft Graph.
    for (const id of ids) {
      const { res: upstream, name } = await graph.descargarDoc(id);
      const data = Buffer.from(await upstream.arrayBuffer());
      total += data.length;
      if (total > ZIP_MAX_BYTES) {
        return res.status(413).json({ error: 'La selección es demasiado grande' });
      }
      entradas.push({ name, data });
    }

    const zip = crearZip(entradas);
    const base = String(req.query.nombre || 'documentos').replace(/[^\w.\- ]/g, '_').slice(0, 60) || 'documentos';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', zip.length);
    res.setHeader('Content-Disposition', `attachment; filename="${base}.zip"`);
    res.end(zip);
  } catch (e) {
    console.error('[docs/zip]', e.message);
    res.status(502).json({ error: 'No se pudieron obtener los documentos' });
  }
});

/* ===================== Solicitudes del portal =====================
   Los formularios "Auto-atención" y "Solicitar nuevo proyecto" envían aquí.
   El correo va a EJECUTIVO_EMAIL, con Reply-To del cliente autenticado.
   Los datos del cliente NO se toman del body: se leen del RUT en sesión, para
   que nadie pueda suplantar a otro cliente en el correo. */

// 6 solicitudes cada 15 min por IP: suficiente para uso normal, corta el abuso.
const solicitudLimiter = rateLimit({ prefix: 'sol-form', windowMs: 15 * 60 * 1000, max: 6 });

const TIPOS_SOLICITUD = {
  'auto-atencion': {
    titulo: 'Auto-atención',
    campos: [
      ['tema', 'Tema', 120, true],
      ['proyecto', 'Proyecto relacionado', 200, false],
      ['descripcion', 'Descripción', 4000, true],
    ],
  },
  'nuevo-proyecto': {
    titulo: 'Solicitud de nuevo proyecto',
    campos: [
      ['tipo', 'Tipo de sistema', 80, true],
      ['direccion', 'Dirección de la instalación', 300, true],
      ['extension', 'Extensión aprox. (m)', 40, true],
      ['usuarios', 'Usuarios simultáneos', 20, false],
      ['plazo', 'Plazo deseado', 80, false],
      ['nota', 'Notas adicionales', 4000, false],
    ],
  },
};

/** Normaliza un valor del formulario: string, sin control chars, recortado. */
function limpiar(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, max);
}

router.post('/solicitud', requireAuth, solicitudLimiter, async (req, res) => {
  const body = req.body || {};
  const def = TIPOS_SOLICITUD[String(body.tipo || '')];
  if (!def) return res.status(400).json({ error: 'Tipo de solicitud inválido' });

  // Anidados a propósito: el formulario de proyecto tiene su propio campo
  // "tipo" (tipo de sistema) y en un objeto plano pisaría al de arriba.
  const entrada = body.campos && typeof body.campos === 'object' ? body.campos : {};
  const campos = [];
  for (const [clave, etiqueta, max, obligatorio] of def.campos) {
    const valor = limpiar(entrada[clave], max);
    if (obligatorio && !valor) {
      return res.status(400).json({ error: `Falta completar: ${etiqueta}` });
    }
    campos.push([etiqueta, valor]);
  }

  // El cliente sale de la sesión, nunca del body.
  const data = portal.portalData(req.session.rut);
  if (!data) return res.status(404).json({ error: 'Cliente sin proyectos' });

  try {
    const mailer = require('./mailer');
    const r = await mailer.enviarSolicitud({ titulo: def.titulo, cliente: data.cliente, campos });
    if (!r.sent) {
      // Sin SMTP no hay forma de avisar al ejecutivo: no digas que se envió.
      return res.status(503).json({ error: 'El envío de correo no está disponible en este momento.' });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('[solicitud]', e.message);
    res.status(502).json({ error: 'No se pudo enviar la solicitud. Intenta nuevamente.' });
  }
});

// Estado mínimo (sin detalle de errores internos ni conteos). La versión
// permite verificar qué build quedó desplegada sin iniciar sesión.
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: require('../package.json').version,
    updatedAt: sync.status().updatedAt,
  });
});

module.exports = router;
