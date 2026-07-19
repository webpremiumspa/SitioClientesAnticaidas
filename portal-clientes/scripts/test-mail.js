'use strict';

/**
 * Prueba de envío SMTP. Verifica que las credenciales y el puerto funcionen.
 *
 * Uso (desde portal-clientes/):
 *   node scripts/test-mail.js destino@dominio.cl
 *
 * Requiere en las variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_SECURE,
 * SMTP_USER, SMTP_PASS, SMTP_FROM.
 */

const config = require('../src/config');
const mailer = require('../src/mailer');

const destino = process.argv[2];

(async () => {
  if (!destino) {
    console.error('Uso: node scripts/test-mail.js destino@dominio.cl');
    process.exit(1);
  }
  if (!config.smtp.host) {
    console.error('Falta SMTP_HOST (y credenciales) en las variables de entorno.');
    process.exit(1);
  }
  console.log(`Enviando correo de prueba a ${destino} vía ${config.smtp.host}:${config.smtp.port} ...`);
  try {
    const r = await mailer.enviarCodigo(destino, '123456');
    console.log('✔ Resultado:', r);
    console.log('Si el correo llegó, el SMTP y el puerto están OK.');
  } catch (e) {
    console.error('✖ ERROR SMTP:', e.message);
    console.error('Posibles causas: credenciales, o el hosting bloquea el puerto saliente.');
    process.exit(1);
  }
})();
