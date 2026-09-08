'use strict';

/**
 * Autenticación en dos pasos:
 *   1) El cliente ingresa su RUT. Si existe en el store (columna RUT de
 *      PROYECTOS), generamos un código y lo enviamos al email registrado del
 *      contacto de ese cliente. El email NO se expone al frontend (se enmascara).
 *   2) El cliente ingresa el código; si coincide y no venció, queda logueado.
 *
 * Los códigos viven en el store compartido en disco (src/kv.js), NO en memoria:
 * los dos pasos son peticiones HTTP distintas y cPanel/LiteSpeed puede
 * atenderlas con procesos distintos. Con un Map en memoria, el proceso que
 * recibía el código no era necesariamente el que lo había generado, y el login
 * fallaba de forma intermitente con "Solicita un código primero".
 */

const config = require('./config');
const store = require('./store');
const kv = require('./kv');
const mailer = require('./mailer');
const { normalizeRut, sameRut, generarCodigo } = require('./util');

// Namespace del KV. Clave: rutNorm (se hashea al escribir el archivo).
// Valor: { codigo, exp, issuedAt, email, intentos }
const NS = 'otp';

const MAX_INTENTOS = 5;

// El registro se guarda un rato MÁS que la vigencia del código para poder
// responder "el código venció" en vez de "solicita un código primero".
const GRACIA_MS = 5 * 60 * 1000;

/** Enmascara un email: iacunaf@inacap.cl -> i***f@inacap.cl */
function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [u, dom] = email.split('@');
  const vis = u.length <= 2 ? u[0] : u[0] + '***' + u[u.length - 1];
  return `${vis}@${dom}`;
}

/** Busca el email de contacto de un cliente por RUT en el store. */
function emailDeCliente(rutNorm) {
  const p = store.getProyectosPorRut(rutNorm)[0];
  return p && p.cliente ? p.cliente.email : '';
}

/**
 * Decide a qué dirección se envía el código:
 *  1) Whitelist de RUTs de prueba -> correo de pruebas (válido en producción).
 *  2) Override global OTP_TEST_EMAIL -> correo de pruebas (sólo no-producción).
 *  3) Correo real del cliente.
 */
function destinoCodigo(rutNorm, emailCliente) {
  if (config.otpTestRutsEmail && config.otpTestRuts.includes(rutNorm)) {
    return config.otpTestRutsEmail;
  }
  if (config.otpTestEmail) return config.otpTestEmail;
  return emailCliente;
}

const RESEND_COOLDOWN_MS = 60 * 1000;

/** TTL con que se guarda un registro OTP, a partir de su vencimiento. */
function ttlDe(rec) {
  return Math.max(1000, rec.exp - Date.now() + GRACIA_MS);
}

/**
 * Paso 1: solicitar código. Respuesta SIEMPRE uniforme (`{ ok: true }`), no
 * revela si el RUT existe ni el correo (anti-enumeración). Si el RUT existe y
 * no hay un código reciente, envía uno al correo registrado del cliente.
 */
async function solicitarCodigo(rutRaw) {
  const rut = normalizeRut(rutRaw);
  if (rut.length < 8) return { ok: false, error: 'RUT inválido' };

  const email = emailDeCliente(rut);
  if (email) {
    const prev = kv.get(NS, rut);
    // Cooldown: no reenvía si ya se emitió un código hace menos de 60s
    // (evita bombardeo de correo a un cliente).
    if (!prev || Date.now() - prev.issuedAt > RESEND_COOLDOWN_MS) {
      const codigo = generarCodigo(6);
      const rec = {
        codigo,
        exp: Date.now() + config.otpTtlMin * 60 * 1000,
        issuedAt: Date.now(),
        email,
        intentos: 0,
      };
      kv.set(NS, rut, rec, ttlDe(rec));
      const destino = destinoCodigo(rut, email);
      try {
        await mailer.enviarCodigo(destino, codigo);
      } catch (e) {
        console.error('[auth] envío código', e.message);
      }
    }
  }
  return { ok: true };
}

/**
 * Paso 2: verificar código. Devuelve { ok } o { ok:false, error }.
 */
function verificarCodigo(rutRaw, codigo) {
  const rut = normalizeRut(rutRaw);
  const p = kv.get(NS, rut);
  if (!p) return { ok: false, error: 'Solicita un código primero' };
  if (Date.now() > p.exp) {
    kv.del(NS, rut);
    return { ok: false, error: 'El código venció. Solicita uno nuevo.' };
  }
  p.intentos += 1;
  if (p.intentos > MAX_INTENTOS) {
    kv.del(NS, rut);
    return { ok: false, error: 'Demasiados intentos. Solicita un código nuevo.' };
  }
  if (String(codigo).trim() !== p.codigo) {
    kv.set(NS, rut, p, ttlDe(p)); // persiste el intento fallido
    return { ok: false, error: 'Código incorrecto' };
  }
  kv.del(NS, rut);
  return { ok: true, rut };
}

module.exports = { solicitarCodigo, verificarCodigo, maskEmail };
