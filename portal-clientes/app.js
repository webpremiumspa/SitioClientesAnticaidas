'use strict';

/**
 * Entrypoint del Portal de Clientes Anticaidas.
 * cPanel (Passenger) usa este archivo como "Archivo de inicio de la aplicación".
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./src/config');
const routes = require('./src/routes');
const sync = require('./src/sync');
const { FileSessionStore } = require('./src/sessionstore');

const app = express();
// `true` y no `1`: hay dos saltos (Cloudflare y LiteSpeed). Con 1 se leía el
// X-Forwarded-Proto del salto más cercano, que es http, y la cookie secure no
// se emitía nunca.
app.set('trust proxy', true);
app.disable('x-powered-by');

// Cabeceras de seguridad (aplican a respuestas servidas por Express: /api y
// el fallback SPA). Para el HTML/estáticos servidos por Apache, replicar estas
// cabeceras en el .htaccess del docroot o en Cloudflare (ver README).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // SAMEORIGIN (no DENY): el visor de PDF usa un <iframe> del mismo origen.
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (config.env === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://static.cloudflareinsights.com", // frontend precompilado + beacon CF
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://cloudflareinsights.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'", // permite el iframe del visor de PDF (mismo origen)
    ].join('; ')
  );
  next();
});

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'portal.sid',
    // En disco, no en memoria: cPanel/LiteSpeed levanta varios procesos y con
    // MemoryStore cada uno tenía sus propias sesiones (401 al azar).
    store: new FileSessionStore({ ttlMs: 8 * 60 * 60 * 1000 }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: config.cookieSecure, // COOKIE_SECURE; requiere HTTPS hasta el origen
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    },
  })
);

// API
app.use('/api', routes);

// Frontend estático
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

// Fallback SPA: cualquier ruta no-API devuelve el index.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sincronización: en producción la dispara UN cron (scripts/sync-once.js), no
// los procesos web. LiteSpeed levanta varios y cada uno recorrería el catálogo
// completo por su cuenta. En local sigue corriendo en proceso.
if (config.syncInProcess) sync.start();

const port = config.port;
app.listen(port, () => {
  console.log(
    `Portal Anticaidas escuchando en :${port} — modo ${config.demoMode ? 'DEMO' : 'AppSheet'} (${config.env}) — sync en proceso: ${config.syncInProcess ? 'sí' : 'no (cron)'}`
  );
});

module.exports = app;
