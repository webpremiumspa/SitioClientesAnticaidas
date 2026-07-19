'use strict';

/**
 * Autenticación en dos pasos:
 *   1) El cliente ingresa su RUT. Si existe en el store (columna RUT de
 *      PROYECTOS), generamos un código y lo enviamos al email registrado del
 *      contacto de ese cliente. El email NO se expone al frontend (se enmascara).
 *   2) El cliente ingresa el código; si coincide y no venció, queda logueado.
 *
 * Los códigos viven en memoria con expiración. Para un portal chico es
 * suficiente; si se escala a varias instancias, mover a un store compartido.
 */

const config = require('./config');
const store = require('./store');
const mailer = require('./mailer');
const { normalizeRut, sameRut, generarCodigo } = require('./util');

// rutNorm -> { codigo, exp, email, intentos }
const pendientes = new Map();

const MAX_INTENTOS = 5;

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
 * Paso 1: solicitar código. Devuelve { ok, emailMask } sin filtrar si el RUT
 * existe o no de forma explotable (respuesta uniforme para no permitir
 * enumeración de RUTs válidos).
 */
async function solicitarCodigo(rutRaw) {
  const rut = normalizeRut(rutRaw);
  if (rut.length < 8) return { ok: false, error: 'RUT inválido' };

  const email = emailDeCliente(rut);
  // Respuesta uniforme: siempre "ok". Solo enviamos si hay email real.
  if (email) {
    const codigo = generarCodigo(6);
    pendientes.set(rut, {
      codigo,
      exp: Date.now() + config.otpTtlMin * 60 * 1000,
      email,
      intentos: 0,
    });
    // En pruebas, redirige el código a OTP_TEST_EMAIL (no molesta al cliente real).
    const destino = config.otpTestEmail || email;
    try {
      await mailer.enviarCodigo(destino, codigo);
    } catch (e) {
      console.error('[auth] envío código', e.message);
    }
  }
  return { ok: true, emailMask: maskEmail(email) };
}

/**
 * Paso 2: verificar código. Devuelve { ok } o { ok:false, error }.
 */
function verificarCodigo(rutRaw, codigo) {
  const rut = normalizeRut(rutRaw);
  const p = pendientes.get(rut);
  if (!p) return { ok: false, error: 'Solicita un código primero' };
  if (Date.now() > p.exp) {
    pendientes.delete(rut);
    return { ok: false, error: 'El código venció. Solicita uno nuevo.' };
  }
  p.intentos += 1;
  if (p.intentos > MAX_INTENTOS) {
    pendientes.delete(rut);
    return { ok: false, error: 'Demasiados intentos. Solicita un código nuevo.' };
  }
  if (String(codigo).trim() !== p.codigo) {
    return { ok: false, error: 'Código incorrecto' };
  }
  pendientes.delete(rut);
  return { ok: true, rut };
}

module.exports = { solicitarCodigo, verificarCodigo, maskEmail };
