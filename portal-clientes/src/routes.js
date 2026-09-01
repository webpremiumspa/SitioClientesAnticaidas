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
