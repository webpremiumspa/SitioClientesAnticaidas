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

const app = express();
app.set('trust proxy', 1); // detrás del proxy de cPanel/Passenger

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'portal.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production', // requiere HTTPS en prod
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

// Arranca la sincronización (demo o real según configuración).
sync.start();

const port = config.port;
app.listen(port, () => {
  console.log(
    `Portal Anticaidas escuchando en :${port} — modo ${config.demoMode ? 'DEMO' : 'AppSheet'} (${config.env})`
  );
});

module.exports = app;
