'use strict';

/**
 * Rutas de la API del portal.
 *   POST /api/login/solicitar  { rut }            -> envía código al email
 *   POST /api/login/verificar  { rut, codigo }    -> inicia sesión
 *   POST /api/logout
 *   GET  /api/session                              -> estado de sesión
 *   GET  /api/portal                               -> PORTAL_DATA del cliente
 *   GET  /api/doc/:docId                           -> descarga/stream de un PDF
 *   GET  /api/health                               -> estado del sync
 */

const express = require('express');
const config = require('./config');
const auth = require('./auth');
const portal = require('./portal');
const sync = require('./sync');

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.rut) return next();
  return res.status(401).json({ error: 'No autenticado' });
}

router.post('/login/solicitar', async (req, res) => {
  const { rut } = req.body || {};
  try {
    const r = await auth.solicitarCodigo(rut);
    if (!r.ok) return res.status(400).json(r);
    res.json({ ok: true, emailMask: r.emailMask });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
});

router.post('/login/verificar', (req, res) => {
  const { rut, codigo } = req.body || {};
  const r = auth.verificarCodigo(rut, codigo);
  if (!r.ok) return res.status(400).json(r);
  req.session.rut = r.rut;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  if (req.session) req.session.destroy(() => {});
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
  // En demo no hay archivos reales.
  if (config.demoMode) {
    return res.status(404).json({ error: 'Documento no disponible en modo demo' });
  }
  try {
    const graph = require('./graph');
    const { res: upstream, name } = await graph.descargarDoc(req.params.docId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(name)}"`);
    // Node 24: stream web -> node. Reenvía el cuerpo.
    const { Readable } = require('stream');
    if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
    else res.end();
  } catch (e) {
    console.error('[doc]', e.message);
    res.status(502).json({ error: 'No se pudo obtener el documento' });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', ...sync.status() });
});

module.exports = router;
