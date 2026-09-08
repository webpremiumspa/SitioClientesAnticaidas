'use strict';

/**
 * Sincronización de datos: AppSheet (PROYECTOS + REGISTRO) -> mapeo -> store
 * local, y completa los certificados de cada cliente desde SharePoint (Graph).
 *
 * El portal NUNCA consulta AppSheet en vivo por request: lee del store local.
 *
 * QUIÉN LO EJECUTA: en producción, un único cron de cPanel una vez al día
 * (scripts/sync-once.js). NO los procesos web — LiteSpeed levanta varios y
 * cada uno recorrería el catálogo completo por su cuenta. En desarrollo sí
 * corre en proceso (config.syncInProcess), para no tener que montar un cron.
 *
 * Como ahora corre una vez al día, un sync malo deja el portal degradado 24
 * horas en vez de 10 minutos: por eso hay guardas que prefieren NO escribir
 * antes que escribir datos vacíos o a medias.
 */

const config = require('./config');
const store = require('./store');
const { mapProyectos, buildStatusMap } = require('./mapping');
const { metaDe } = require('./categorias');

let running = false;
let lastError = null;

// Si más de este porcentaje de proyectos falla al listar sus documentos, el
// resultado se considera no confiable y no se sobrescribe el store: es
// preferible mantener el catálogo de ayer completo que publicar uno con
// documentos faltantes durante todo el día.
const MAX_FALLOS_RATIO = 0.25;

/**
 * A partir de un "dossier" [{name, docs}] arma p.docs (keyed por slug) y
 * acumula la metadata de carpeta en carpetasMeta (global).
 */
function aplicarDossier(p, dossier, carpetasMeta) {
  p.docs = {};
  for (const sub of dossier) {
    const m = metaDe(sub.name);
    p.docs[m.key] = sub.docs;
    if (!carpetasMeta[m.key]) carpetasMeta[m.key] = m;
  }
}

async function syncDemo() {
  const demo = require('./demoData');
  const proyectos = demo.proyectos();
  const carpetasMeta = {};
  for (const p of proyectos) aplicarDossier(p, p.dossier || [], carpetasMeta);
  store.save({ proyectos, carpetasMeta });
  return { source: 'demo', total: store.meta().total, fallos: 0 };
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

  // Guarda: AppSheet devolviendo vacío (permiso revocado, tabla renombrada,
  // API caída) vaciaría el portal para todos los clientes. Se aborta ANTES de
  // gastar miles de llamadas a Graph.
  const previos = store.meta().total;
  if (!proyectos.length && previos > 0) {
    throw new Error(
      `AppSheet devolvió 0 proyectos y el store tiene ${previos}: no se sobrescribe`
    );
  }

  // 2) Documentos: se listan TODAS las subcarpetas de DOSSIER DE ENTREGA de
  //    cada proyecto (dinámico, sin filtrar por lista fija). Concurrencia
  //    moderada + reintento ante 429 (en graph).
  for (const p of proyectos) p.docs = {};
  const carpetasMeta = {};
  const conFolder = proyectos.filter((p) => p.clienteFolder);
  let fallos = 0;
  await mapLimit(conFolder, config.graphConcurrency, async (p) => {
    try {
      const dossier = await graph.listarDossier(p.clienteFolder);
      aplicarDossier(p, dossier, carpetasMeta);
    } catch (e) {
      fallos++;
    }
  });

  if (conFolder.length && fallos / conFolder.length > MAX_FALLOS_RATIO) {
    throw new Error(
      `${fallos}/${conFolder.length} proyectos fallaron al listar documentos ` +
        `(>${Math.round(MAX_FALLOS_RATIO * 100)}%): no se sobrescribe el store`
    );
  }
  if (fallos) console.warn(`[sync] ${fallos}/${conFolder.length} proyectos con error al listar docs`);

  store.save({ proyectos, carpetasMeta });
  return { source: 'appsheet', total: proyectos.length, fallos };
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
    console.log(
      `[sync] ok (${r.source}) ${r.total} proyectos en ${Date.now() - t0}ms` +
        (r.fallos ? ` — ${r.fallos} sin documentos` : '')
    );
    return r;
  } catch (e) {
    lastError = e.message;
    console.error('[sync] ERROR:', e.message);
    return { error: e.message };
  } finally {
    running = false;
  }
}

/**
 * Arranca el sync inicial + el intervalo periódico. Sólo se usa en desarrollo:
 * en producción lo dispara el cron (ver app.js y README).
 */
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
