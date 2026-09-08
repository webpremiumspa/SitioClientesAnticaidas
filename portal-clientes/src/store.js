'use strict';

/**
 * Store local en archivo JSON. Actúa como caché de los datos sincronizados
 * desde AppSheet, para que las peticiones del cliente respondan al instante
 * (la API de AppSheet es lenta y no debe golpearse en cada request).
 *
 * Se eligió JSON en disco (y no SQLite) para evitar dependencias nativas que
 * complican el despliegue en cPanel. El volumen de datos (cientos de
 * proyectos) es perfectamente manejable en memoria + archivo.
 *
 * IMPORTANTE — quién escribe y quién lee: en producción el único que llama a
 * save() es el cron (scripts/sync-once.js). Los procesos web sólo leen, así
 * que la copia en memoria se RE-LEE cuando cambia la fecha de modificación del
 * archivo. Sin eso, cada proceso web se quedaría sirviendo para siempre los
 * datos que cargó al arrancar.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { ensureDataDir } = require('./kv');

const DATA_DIR = config.dataDir;
const DB_FILE = path.join(DATA_DIR, 'portal.json');

// Cada cuánto, como mucho, se vuelve a preguntar al FS si el archivo cambió.
// Los datos se refrescan una vez al día: no hace falta un stat por request.
const CHECK_INTERVAL_MS = 5000;

let cache = null;
let cacheKey = '';      // "<mtimeMs>:<size>" del archivo que se cargó
let ultimoCheck = 0;

function emptyDb() {
  return { updatedAt: null, proyectos: [], carpetasMeta: {} };
}

function leerArchivo() {
  cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  return cache;
}

/**
 * Devuelve el store en memoria, recargándolo desde disco si el archivo cambió.
 * El sync escribe con tmp + rename (atómico), así que aquí nunca se lee un
 * archivo a medio escribir: se ve la versión vieja o la nueva, nunca ambas.
 */
function load() {
  const ahora = Date.now();
  if (cache && ahora - ultimoCheck < CHECK_INTERVAL_MS) return cache;
  ultimoCheck = ahora;

  ensureDataDir();
  let st = null;
  try {
    st = fs.statSync(DB_FILE);
  } catch (_) {
    // Todavía no hubo ningún sync. Si ya teníamos datos en memoria los
    // conservamos: mejor servir algo viejo que vaciar el portal.
    if (!cache) cache = emptyDb();
    return cache;
  }

  const key = `${st.mtimeMs}:${st.size}`;
  if (cache && key === cacheKey) return cache;

  try {
    leerArchivo();
    cacheKey = key;
  } catch (e) {
    console.error('[store] no se pudo leer', DB_FILE, e.message);
    if (!cache) cache = emptyDb();
  }
  return cache;
}

/** Reemplaza proyectos + metadata de carpetas y persiste a disco. */
function save({ proyectos, carpetasMeta }) {
  ensureDataDir();
  const db = {
    updatedAt: new Date().toISOString(),
    proyectos: proyectos || [],
    carpetasMeta: carpetasMeta || {},
  };
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db), 'utf8');
  fs.renameSync(tmp, DB_FILE); // escritura atómica

  cache = db;
  try {
    const st = fs.statSync(DB_FILE);
    cacheKey = `${st.mtimeMs}:${st.size}`;
  } catch (_) {
    cacheKey = '';
  }
  ultimoCheck = Date.now();
  return cache;
}

/** Metadata global de carpetas descubiertas { key: {label,cat,desc,order} }. */
function getCarpetasMeta() {
  return load().carpetasMeta || {};
}

/** Todos los proyectos cacheados. */
function getProyectos() {
  return load().proyectos;
}

/** Proyectos de un cliente por RUT (ya normalizado por el llamador). */
function getProyectosPorRut(rutNorm) {
  const { sameRut } = require('./util');
  return getProyectos().filter((p) => sameRut(p.cliente && p.cliente.rut, rutNorm));
}

function meta() {
  const db = load();
  return { updatedAt: db.updatedAt, total: db.proyectos.length };
}

module.exports = { load, save, getProyectos, getProyectosPorRut, getCarpetasMeta, meta };
