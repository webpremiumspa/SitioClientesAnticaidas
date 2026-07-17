'use strict';

/**
 * Sincronización de datos: AppSheet (PROYECTOS + REGISTRO) -> mapeo -> store
 * local, y completa los certificados de cada cliente desde SharePoint (Graph).
 *
 * El portal NUNCA consulta AppSheet en vivo por request: lee del store local.
 * Este sync corre al arrancar y luego cada SYNC_INTERVAL_MIN minutos.
 */

const config = require('./config');
const store = require('./store');
const { mapProyectos, buildStatusMap } = require('./mapping');

let running = false;
let lastError = null;

async function syncDemo() {
  const demo = require('./demoData');
  store.saveProyectos(demo.proyectos());
  return { source: 'demo', total: store.meta().total };
}

async function syncReal() {
  const appsheet = require('./appsheet');
  const graph = require('./graph');

  // 1) Datos desde AppSheet (llamadas lentas: por eso se cachean).
  const [proyectosRows, registroRows, statusRows] = await Promise.all([
    appsheet.findProyectos(),
    appsheet.findRegistro(),
    appsheet.findStatus(),
  ]);
  const statusMap = buildStatusMap(statusRows);
  const proyectos = mapProyectos(proyectosRows, registroRows, statusMap);

  // 2) Certificados por cliente (una vez por carpeta de cliente, no por proyecto).
  const cacheCerts = new Map();
  for (const p of proyectos) {
    const folder = p.clienteFolder;
    if (!folder) continue;
    if (!cacheCerts.has(folder)) {
      try {
        cacheCerts.set(folder, await graph.listarCertificados(folder));
      } catch (e) {
        console.error('[sync] certificados', folder, e.message);
        cacheCerts.set(folder, []);
      }
    }
    p.docs = { certificados: cacheCerts.get(folder) };
  }

  store.saveProyectos(proyectos);
  return { source: 'appsheet', total: proyectos.length };
}

async function runSync() {
  if (running) return { skipped: true };
  running = true;
  const t0 = Date.now();
  try {
    const r = config.demoMode ? await syncDemo() : await syncReal();
    lastError = null;
    console.log(`[sync] ok (${r.source}) ${r.total} proyectos en ${Date.now() - t0}ms`);
    return r;
  } catch (e) {
    lastError = e.message;
    console.error('[sync] ERROR:', e.message);
    return { error: e.message };
  } finally {
    running = false;
  }
}

/** Arranca el sync inicial + el intervalo periódico. */
function start() {
  runSync();
  const ms = Math.max(1, config.syncIntervalMin) * 60 * 1000;
  const timer = setInterval(runSync, ms);
  timer.unref && timer.unref();
  return timer;
}

function status() {
  return { ...store.meta(), demoMode: config.demoMode, lastError };
}

module.exports = { start, runSync, status };
