'use strict';

/**
 * Sincronización única. En producción ES el único sync del portal: lo dispara
 * un cron de cPanel una vez al día (ver README).
 *
 * El cron DEBE invocarse con el node del entorno virtual de cPanel, que es el
 * que exporta las variables de entorno de la aplicación:
 *
 *   /home/USUARIO/nodevenv/clientes.anticaidas.cl/24/bin/node \
 *     /home/USUARIO/clientes.anticaidas.cl/scripts/sync-once.js
 *
 * Si se llama con el node del sistema no habrá APPSHEET_APP_ID y la app
 * entraría en modo demo, sobrescribiendo portal.json con datos de ejemplo.
 * La guarda de abajo aborta antes de que eso ocurra.
 */

const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const kv = require('../src/kv');
const sync = require('../src/sync');

const LOCK = path.join(config.dataDir, 'sync.lock');
// Un sync del catálogo completo tarda minutos, no horas. Pasado este tiempo el
// lock se considera basura de un proceso que murió a medias.
const LOCK_MAX_MS = 2 * 60 * 60 * 1000;

/** ¿Hay un proceso vivo con ese PID? */
function vivo(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // existe pero es de otro usuario
  }
}

/** Toma el lock. Devuelve false si ya hay otra sincronización en curso. */
function tomarLock(reintento = false) {
  kv.ensureDataDir();
  try {
    const fd = fs.openSync(LOCK, 'wx'); // falla si ya existe: atómico
    fs.writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    fs.closeSync(fd);
    return true;
  } catch (e) {
    if (e.code !== 'EEXIST' || reintento) throw e;

    let edad = Infinity;
    let info = null;
    try {
      edad = Date.now() - fs.statSync(LOCK).mtimeMs;
      info = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
    } catch (_) { /* lock ilegible: se trata como rancio */ }

    if (edad < LOCK_MAX_MS && info && info.pid && vivo(info.pid)) return false;

    console.warn(`[sync-once] lock rancio (${Math.round(edad / 1000)}s, pid ${info && info.pid}): se reclama`);
    try { fs.unlinkSync(LOCK); } catch (_) { /* otro se nos adelantó */ }
    return tomarLock(true);
  }
}

function liberarLock() {
  try { fs.unlinkSync(LOCK); } catch (_) { /* ya no está */ }
}

/**
 * Aborta si la app caería en modo demo sin haberlo pedido explícitamente.
 * Sin esta guarda, un cron mal configurado (sin las variables de entorno)
 * reemplazaría el catálogo real por los datos de ejemplo, en silencio.
 */
function guardaDemo() {
  const pedido = ['true', '1'].includes(String(process.env.DEMO_MODE || '').toLowerCase());
  if (config.demoMode && !pedido) {
    console.error(
      '[sync-once] ABORTA: no hay APPSHEET_APP_ID, la app está en modo demo y ' +
        'esto sobrescribiría portal.json con datos de ejemplo.\n' +
        '            El cron debe usar el node de nodevenv (ver cabecera de este archivo).\n' +
        '            Si de verdad quieres datos demo, ejecuta con DEMO_MODE=true.'
    );
    return false;
  }
  return true;
}

(async () => {
  if (!guardaDemo()) process.exit(2);

  if (!tomarLock()) {
    console.log('[sync-once] ya hay una sincronización en curso; no hago nada.');
    process.exit(0);
  }

  let code = 0;
  try {
    const r = await sync.runSync();
    console.log('Resultado:', r);
    if (r && r.error) code = 1;
  } catch (e) {
    console.error('[sync-once] excepción:', e.message);
    code = 1;
  } finally {
    liberarLock();
  }
  process.exit(code);
})();
