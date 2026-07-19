'use strict';

/**
 * Configuración central. Todo sale de variables de entorno (process.env).
 * Ningún secreto vive en el código: se cargan desde .env en desarrollo
 * y desde el panel de cPanel (Environment variables) en producción.
 */

require('dotenv').config();

function bool(v, def = false) {
  if (v === undefined || v === null || v === '') return def;
  return String(v).toLowerCase() === 'true' || v === '1';
}
function int(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 3000),
  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',

  // Si no hay App ID o se fuerza DEMO_MODE, corremos con datos de ejemplo.
  demoMode: bool(process.env.DEMO_MODE, false) || !process.env.APPSHEET_APP_ID,

  appsheet: {
    appId: process.env.APPSHEET_APP_ID || '',
    accessKey: process.env.APPSHEET_ACCESS_KEY || '',
    region: process.env.APPSHEET_REGION || 'www',
    tablas: {
      proyectos: process.env.APPSHEET_TABLE_PROYECTOS || 'PROYECTOS',
      registro: process.env.APPSHEET_TABLE_REGISTRO || 'REGISTRO',
      status: process.env.APPSHEET_TABLE_STATUS || 'STATUS',
    },
  },

  graph: {
    tenantId: process.env.AZURE_TENANT_ID || '',
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    hostname: process.env.SHAREPOINT_HOSTNAME || 'somitalspa.sharepoint.com',
    sitePath: process.env.SHAREPOINT_SITE_PATH || '/sites/SitioclientesAnticadas',
    drive: process.env.SHAREPOINT_DRIVE || 'Clientes',
    categoriaCertificados:
      process.env.SHAREPOINT_CATEGORIA_CERTIFICADOS || 'CERTIFICADOS DE INSTALACION',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: int(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Portal Anticaidas <no-reply@anticaidas.cl>',
  },

  ejecutivo: {
    nombre: process.env.EJECUTIVO_NOMBRE || 'Carlo Cofré Ramírez',
    cargo: process.env.EJECUTIVO_CARGO || 'Ejecutivo de Cuenta · Jefe de Operaciones',
    email: process.env.EJECUTIVO_EMAIL || 'ccofre@anticaidas.cl',
    telefono: process.env.EJECUTIVO_TELEFONO || '+56 2 2226 7461',
    movil: process.env.EJECUTIVO_MOVIL || '+56 9 7642 1108',
  },

  syncIntervalMin: int(process.env.SYNC_INTERVAL_MIN, 10),
  otpTtlMin: int(process.env.OTP_TTL_MIN, 10),

  // Sólo para PRUEBAS: si se define, todos los códigos OTP se envían a esta
  // dirección en lugar del correo del cliente. Quitar en producción.
  otpTestEmail: process.env.OTP_TEST_EMAIL || '',
};

module.exports = config;
