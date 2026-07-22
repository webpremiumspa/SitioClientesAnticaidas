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

  // 2) Documentos por proyecto y categoría (SharePoint via Graph).
  //    Se paraleliza con límite de concurrencia para no golpear a Graph y no
  //    volver lento el sync (proyectos × categorías = muchas llamadas).
  const cats = config.categorias;
  for (const p of proyectos) {
    p.docs = {};
    for (const c of cats) p.docs[c.key] = [];
  }
  const tareas = [];
  for (const p of proyectos) {
    if (!p.clienteFolder) continue;
    for (const c of cats) tareas.push({ p, c });
  }
  let fallos = 0;
  await mapLimit(tareas, 8, async ({ p, c }) => {
    try {
      p.docs[c.key] = await graph.listarDocs(p.clienteFolder, c.folder);
    } catch (e) {
      fallos++;
      p.docs[c.key] = [];
    }
  });
  if (fallos) console.warn(`[sync] ${fallos}/${tareas.length} listados de docs fallaron`);

  store.saveProyectos(proyectos);
  return { source: 'appsheet', total: proyectos.length };
}

/** Ejecuta fn sobre items con un máximo de `limit` en paralelo. */
async function mapLimit(items, limit, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length || 1) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
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
