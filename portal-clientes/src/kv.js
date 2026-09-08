'use strict';

/**
 * Estado compartido en disco, con expiración.
 *
 * cPanel/LiteSpeed no levanta "la app": levanta VARIOS procesos de la app, y
 * cada uno tiene su propia memoria. Por eso nada que deba sobrevivir a la
 * petición siguiente puede vivir en una variable de módulo: el proceso que
 * atiende POST /login/verificar puede no ser el que atendió /login/solicitar.
 *
 * Este KV guarda un archivo JSON por clave bajo DATA_DIR/<ns>/, con escritura
 * atómica (tmp + rename), de modo que todos los procesos ven el mismo estado.
 * Lo usan: sesiones (sessionstore.js), códigos OTP (auth.js) y los contadores
 * de rate limit (ratelimit.js).
 *
 * Es SÍNCRONO a propósito: son unos cientos de bytes por clave y sólo lo tocan
 * endpoints de baja frecuencia (login y formularios) más la lectura de sesión.
 * Así auth.js y ratelimit.js siguen siendo síncronos y no hay que propagar
 * async por toda la cadena de middlewares.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const DATA_DIR = config.dataDir;

/**
 * Crea DATA_DIR si falta. Auto-protección: si esta carpeta cayera dentro del
 * docroot, este .htaccess impide que Apache sirva portal.json o las sesiones
 * por HTTP (fuga de datos de clientes).
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const ht = path.join(DATA_DIR, '.htaccess');
  try {
    if (!fs.existsSync(ht)) {
      fs.writeFileSync(ht, 'Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n');
    }
  } catch (_) { /* si el FS no lo permite, seguimos */ }
}

function nsDir(ns) {
  ensureDataDir();
  const d = path.join(DATA_DIR, ns);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

/** La clave se hashea: evita RUTs o ids de sesión en nombres de archivo. */
function fileFor(ns, key) {
  const h = crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 32);
  return path.join(nsDir(ns), h + '.json');
}

function unlinkSafe(f) {
  try { fs.unlinkSync(f); } catch (_) { /* ya no está */ }
}

/** Lee una clave. Devuelve null si no existe, está vencida o está corrupta. */
function get(ns, key) {
  const f = fileFor(ns, key);
  let rec;
  try {
    rec = JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') unlinkSafe(f); // JSON corrupto: se descarta
    return null;
  }
  if (rec && rec.exp && Date.now() > rec.exp) {
    unlinkSafe(f);
    return null;
  }
  return rec ? rec.v : null;
}

/** Escribe una clave con TTL en ms (null = sin expiración). */
function set(ns, key, value, ttlMs) {
  const f = fileFor(ns, key);
  const rec = { exp: ttlMs ? Date.now() + ttlMs : null, v: value };
  // El tmp lleva el PID: dos procesos escribiendo a la vez no se pisan el
  // archivo temporal, y el rename final es atómico.
  const tmp = `${f}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(rec), 'utf8');
    fs.renameSync(tmp, f);
  } catch (e) {
    unlinkSafe(tmp);
    throw e;
  }
  return value;
}

function del(ns, key) {
  unlinkSafe(fileFor(ns, key));
}

/**
 * Lee, transforma y vuelve a escribir. Si `fn` devuelve null/undefined la clave
 * se borra. No es atómico entre procesos (leer-modificar-escribir); con el
 * volumen de este portal la ventana es despreciable y lo peor que puede pasar
 * es perder un incremento de rate limit.
 */
function update(ns, key, ttlMs, fn) {
  const next = fn(get(ns, key));
  if (next === null || next === undefined) {
    del(ns, key);
    return next;
  }
  return set(ns, key, next, ttlMs);
}

/** Borra las claves vencidas de un namespace. */
function sweep(ns) {
  let d;
  try { d = nsDir(ns); } catch (_) { return 0; }
  let n = 0;
  let archivos;
  try { archivos = fs.readdirSync(d); } catch (_) { return 0; }
  const ahora = Date.now();
  for (const nombre of archivos) {
    if (!nombre.endsWith('.json')) continue;
    const f = path.join(d, nombre);
    try {
      const rec = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (rec && rec.exp && ahora > rec.exp) { unlinkSafe(f); n++; }
    } catch (_) {
      unlinkSafe(f); // corrupto o borrado por otro proceso
      n++;
    }
  }
  return n;
}

const NAMESPACES = ['sess', 'otp', 'rl'];

function sweepAll() {
  for (const ns of NAMESPACES) {
    try { sweep(ns); } catch (_) { /* la limpieza nunca debe tumbar la app */ }
  }
}

// Limpieza periódica de vencidos (los archivos también se borran al leerlos
// vencidos, esto es para las claves que nadie vuelve a consultar).
const barrido = setInterval(sweepAll, 15 * 60 * 1000);
barrido.unref && barrido.unref();

module.exports = { ensureDataDir, get, set, del, update, sweep, sweepAll, NAMESPACES };
