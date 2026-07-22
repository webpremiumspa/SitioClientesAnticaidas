'use strict';

/**
 * Store local en archivo JSON. Actúa como caché de los datos sincronizados
 * desde AppSheet, para que las peticiones del cliente respondan al instante
 * (la API de AppSheet es lenta y no debe golpearse en cada request).
 *
 * Se eligió JSON en disco (y no SQLite) para evitar dependencias nativas que
 * complican el despliegue en cPanel. El volumen de datos (cientos de
 * proyectos) es perfectamente manejable en memoria + archivo.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const DATA_DIR = config.dataDir;
const DB_FILE = path.join(DATA_DIR, 'portal.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  // Auto-protección: si esta carpeta cayera dentro del docroot, este .htaccess
  // impide que Apache sirva portal.json por HTTP (fuga de datos de clientes).
  const ht = path.join(DATA_DIR, '.htaccess');
  try {
    if (!fs.existsSync(ht)) {
      fs.writeFileSync(ht, 'Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n');
    }
  } catch (_) { /* si el FS no lo permite, seguimos */ }
}

let cache = null;

function emptyDb() {
  return { updatedAt: null, proyectos: [], carpetasMeta: {} };
}

/** Carga el store desde disco (una vez) a memoria. */
function load() {
  if (cache) return cache;
  ensureDir();
  try {
    if (fs.existsSync(DB_FILE)) {
      cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } else {
      cache = emptyDb();
    }
  } catch (e) {
    console.error('[store] no se pudo leer', DB_FILE, e.message);
    cache = emptyDb();
  }
  return cache;
}

/** Reemplaza proyectos + metadata de carpetas y persiste a disco. */
function save({ proyectos, carpetasMeta }) {
  ensureDir();
  cache = {
    updatedAt: new Date().toISOString(),
    proyectos: proyectos || [],
    carpetasMeta: carpetasMeta || {},
  };
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cache), 'utf8');
  fs.renameSync(tmp, DB_FILE); // escritura atómica
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
