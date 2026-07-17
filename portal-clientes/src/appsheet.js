'use strict';

/**
 * Cliente mínimo de la API de AppSheet (v2). Solo usamos la acción `Find`
 * (lectura). La app de AppSheet asociada a la Access Key debe ser de SOLO
 * LECTURA para que, incluso si la clave se filtrara, no se pueda escribir.
 *
 * Doc: POST https://{region}.appsheet.com/api/v2/apps/{appId}/tables/{table}/Action
 *      body { Action: "Find", Properties: {...}, Rows: [] }
 *      header ApplicationAccessKey: <key>
 */

const config = require('./config');

function endpoint(table) {
  const region = config.appsheet.region || 'www';
  const appId = encodeURIComponent(config.appsheet.appId);
  const t = encodeURIComponent(table);
  return `https://${region}.appsheet.com/api/v2/apps/${appId}/tables/${t}/Action`;
}

/**
 * Ejecuta Find sobre una tabla. `selector` es una expresión AppSheet opcional
 * para filtrar del lado del servidor, ej: FILTER("PROYECTOS", [RUT]="76326949-3").
 * Devuelve un array de filas (objetos).
 */
async function find(table, selector) {
  if (!config.appsheet.appId || !config.appsheet.accessKey) {
    throw new Error('AppSheet no configurado (APPSHEET_APP_ID / ACCESS_KEY)');
  }
  const properties = { Locale: 'es-CL' };
  if (selector) properties.Selector = selector;

  const res = await fetch(endpoint(table), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ApplicationAccessKey: config.appsheet.accessKey,
    },
    body: JSON.stringify({ Action: 'Find', Properties: properties, Rows: [] }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`AppSheet Find ${table} -> HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json().catch(() => []);
  // AppSheet devuelve directamente el array de filas.
  return Array.isArray(data) ? data : (data.Rows || []);
}

/** Trae todas las filas de PROYECTOS. */
function findProyectos(selector) {
  return find(config.appsheet.tablas.proyectos, selector);
}

/** Trae todas las filas de REGISTRO. */
function findRegistro(selector) {
  return find(config.appsheet.tablas.registro, selector);
}

/** Trae la tabla STATUS (id_status -> nombre). */
function findStatus(selector) {
  return find(config.appsheet.tablas.status, selector);
}

module.exports = { find, findProyectos, findRegistro, findStatus };
