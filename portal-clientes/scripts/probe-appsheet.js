'use strict';

/**
 * Sondeo de la API de AppSheet para CERTIFICAR la forma del JSON de respuesta.
 * Hace un `Find` sobre una tabla y muestra:
 *   - cuántas filas llegaron
 *   - las claves (nombres de columna) de la primera fila
 *   - la primera fila completa (JSON)
 *
 * Uso (desde portal-clientes/):
 *   node scripts/probe-appsheet.js PROYECTOS
 *   node scripts/probe-appsheet.js PROYECTOS 'FILTER("PROYECTOS", [RUT] = "76326949-3")'
 *   node scripts/probe-appsheet.js REGISTRO
 *
 * Requiere en .env (local, NO se sube):
 *   APPSHEET_APP_ID, APPSHEET_ACCESS_KEY, APPSHEET_REGION (www|eu)
 */

const config = require('../src/config');
const { find } = require('../src/appsheet');

const tabla = process.argv[2] || config.appsheet.tablas.proyectos;
const selector = process.argv[3] || undefined; // opcional: expresión AppSheet

(async () => {
  if (!config.appsheet.appId || !config.appsheet.accessKey) {
    console.error('Falta APPSHEET_APP_ID / APPSHEET_ACCESS_KEY en .env');
    process.exit(1);
  }
  console.log(`Find sobre "${tabla}"${selector ? ` con Selector: ${selector}` : ' (todas las filas)'}...\n`);
  const t0 = Date.now();
  try {
    const rows = await find(tabla, selector);
    const ms = Date.now() - t0;
    console.log(`✔ ${rows.length} fila(s) en ${ms} ms\n`);
    if (!rows.length) { console.log('Sin filas. Prueba otro Selector o tabla.'); return; }

    console.log('=== COLUMNAS (claves de la fila 1) ===');
    console.log(Object.keys(rows[0]).join('\n'));
    console.log('\n=== FILA 1 (JSON completo) ===');
    console.log(JSON.stringify(rows[0], null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
