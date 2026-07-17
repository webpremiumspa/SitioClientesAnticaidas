'use strict';

/**
 * Envío de correo para el código de acceso (OTP). Usa SMTP (nodemailer).
 * En modo demo o sin SMTP configurado, no envía: registra el código en consola
 * para poder probar el flujo localmente.
 */

const config = require('./config');

let transport = null;
function getTransport() {
  if (transport) return transport;
  if (!config.smtp.host) return null;
  const nodemailer = require('nodemailer');
  transport = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return transport;
}

async function enviarCodigo(email, codigo) {
  const t = getTransport();
  if (!t) {
    console.log(`[mailer] (sin SMTP) código para ${email}: ${codigo}`);
    return { sent: false, demo: true };
  }
  await t.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Tu código de acceso — Portal Anticaidas',
    text: `Tu código de acceso es: ${codigo}\n\nVence en ${config.otpTtlMin} minutos.\nSi no solicitaste este acceso, ignora este correo.`,
    html: `<div style="font-family:sans-serif;max-width:420px">
      <h2 style="color:#0c1d33">Portal de Clientes Anticaidas</h2>
      <p>Tu código de acceso es:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#ff6b0a">${codigo}</p>
      <p style="color:#6a7c97;font-size:13px">Vence en ${config.otpTtlMin} minutos. Si no solicitaste este acceso, ignora este correo.</p>
    </div>`,
  });
  return { sent: true };
}

module.exports = { enviarCodigo };
