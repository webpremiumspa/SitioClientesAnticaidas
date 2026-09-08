'use strict';

/**
 * Store de sesiones de express-session respaldado en disco (src/kv.js).
 *
 * El MemoryStore por defecto guarda las sesiones en la memoria de UN proceso.
 * Como LiteSpeed levanta varios, un cliente logueado recibía 401 al azar según
 * qué proceso le tocara. Esto lo comparte entre todos.
 *
 * No se usa una dependencia externa (connect-file-store y similares) a
 * propósito: el proyecto versiona node_modules y no corre npm en el servidor
 * (ver README), así que añadir un paquete obliga a tocar el deploy. La API de
 * Store son cuatro métodos.
 */

const session = require('express-session');
const kv = require('./kv');

const NS = 'sess';
const TTL_POR_DEFECTO = 8 * 60 * 60 * 1000; // igual que cookie.maxAge en app.js

/** TTL de la sesión según su cookie; cae al valor por defecto si no la trae. */
function ttlDe(sess, fallback) {
  const c = sess && sess.cookie;
  if (c) {
    if (typeof c.maxAge === 'number' && c.maxAge > 0) return c.maxAge;
    if (c.expires) {
      const ms = new Date(c.expires).getTime() - Date.now();
      if (ms > 0) return ms;
    }
  }
  return fallback;
}

class FileSessionStore extends session.Store {
  constructor({ ttlMs = TTL_POR_DEFECTO } = {}) {
    super();
    this.ttlMs = ttlMs;
  }

  get(sid, cb) {
    setImmediate(() => {
      try {
        cb(null, kv.get(NS, sid) || null);
      } catch (e) {
        cb(e);
      }
    });
  }

  set(sid, sess, cb) {
    setImmediate(() => {
      try {
        kv.set(NS, sid, sess, ttlDe(sess, this.ttlMs));
        cb(null);
      } catch (e) {
        cb(e);
      }
    });
  }

  // Renueva la expiración sin reescribir nada más (resave:false lo usa para
  // mantener viva la sesión de un cliente que sigue navegando).
  touch(sid, sess, cb) {
    this.set(sid, sess, cb);
  }

  destroy(sid, cb) {
    setImmediate(() => {
      try {
        kv.del(NS, sid);
        cb(null);
      } catch (e) {
        cb(e);
      }
    });
  }
}

module.exports = { FileSessionStore };
