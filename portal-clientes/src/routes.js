'use strict';

/**
 * Rutas de la API del portal.
 *   POST /api/login/solicitar  { rut }            -> envía código al email
 *   POST /api/login/verificar  { rut, codigo }    -> inicia sesión
 *   POST /api/logout
 *   GET  /api/session                              -> estado de sesión
 *   GET  /api/portal                               -> PORTAL_DATA del cliente
 *   GET  /api/doc/:docId                           -> descarga/stream de un PDF
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

// Estado mínimo (sin detalle de errores internos ni conteos).
router.get('/health', (req, res) => {
  res.json({ status: 'ok', updatedAt: sync.status().updatedAt });
});

module.exports = router;
