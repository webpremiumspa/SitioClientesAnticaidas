'use strict';

/**
 * Envío de correo por SMTP (nodemailer):
 *   - código de acceso (OTP) al cliente,
 *   - solicitudes de los formularios del portal al ejecutivo.
 * Sin SMTP configurado no envía: en local registra en consola para poder
 * probar el flujo.
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
    // Sólo en desarrollo local SIN SMTP se muestra el código (para poder probar).
    // Nunca en producción, y nunca si hay SMTP configurado (servidor real).
    if (config.env !== 'production') {
      console.log(`[mailer] (local sin SMTP) código de ${email}: ${codigo}`);
    } else {
      console.warn('[mailer] SMTP no configurado; no se envió el código.');
    }
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

/** Escapa texto del cliente antes de meterlo en el HTML del correo. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Envía al ejecutivo una solicitud hecha desde el portal (auto-atención o
 * nuevo proyecto). El destino es EJECUTIVO_EMAIL; el Reply-To queda apuntando
 * al cliente para poder responderle directo desde el correo.
 *
 * @param {object} p
 *   @param {string} p.titulo    Asunto legible del tipo de solicitud.
 *   @param {object} p.cliente   { razonSocial, rut, solicitante, email, telefono }
 *   @param {[string,string][]} p.campos  Pares etiqueta/valor ya normalizados.
 */
async function enviarSolicitud({ titulo, cliente, campos }) {
  const destino = config.ejecutivo.email;
  const t = getTransport();

  const filas = campos.filter(([, v]) => v !== '' && v != null);
  const texto =
    `${titulo}\n\n` +
    `Cliente: ${cliente.razonSocial} (${cliente.rut})\n` +
    `Solicitante: ${cliente.solicitante}\n` +
    `Correo: ${cliente.email}\n` +
    `Teléfono: ${cliente.telefono}\n\n` +
    filas.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n';

  if (!t) {
    if (config.env !== 'production') {
      console.log(`[mailer] (local sin SMTP) solicitud para ${destino}:\n${texto}`);
    } else {
      console.warn('[mailer] SMTP no configurado; no se envió la solicitud.');
    }
    return { sent: false, demo: true };
  }

  const filasHtml = filas
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6a7c97;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#0c1d33">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');

  await t.sendMail({
    from: config.smtp.from,
    to: destino,
    replyTo: cliente.email || undefined, // responder le llega al cliente
    subject: `[Portal] ${titulo} — ${cliente.razonSocial}`,
    text: texto,
    html: `<div style="font-family:sans-serif;max-width:640px">
      <h2 style="color:#0c1d33;margin:0 0 4px">${esc(titulo)}</h2>
      <p style="color:#6a7c97;font-size:13px;margin:0 0 18px">Enviada desde el Portal de Clientes.</p>
      <table style="font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 12px 6px 0;color:#6a7c97;white-space:nowrap">Cliente</td><td style="padding:6px 0;color:#0c1d33"><strong>${esc(cliente.razonSocial)}</strong> (${esc(cliente.rut)})</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6a7c97;white-space:nowrap">Solicitante</td><td style="padding:6px 0;color:#0c1d33">${esc(cliente.solicitante)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6a7c97;white-space:nowrap">Correo</td><td style="padding:6px 0;color:#0c1d33">${esc(cliente.email)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#6a7c97;white-space:nowrap">Teléfono</td><td style="padding:6px 0;color:#0c1d33">${esc(cliente.telefono)}</td></tr>
        <tr><td colspan="2" style="padding:10px 0"><hr style="border:0;border-top:1px solid #dfe7f1"></td></tr>
        ${filasHtml}
      </table>
    </div>`,
  });
  return { sent: true };
}

module.exports = { enviarCodigo, enviarSolicitud };
