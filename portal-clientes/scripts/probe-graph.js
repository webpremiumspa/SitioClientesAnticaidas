'use strict';

/**
 * Sondeo de Microsoft Graph para CERTIFICAR el acceso a SharePoint.
 * Lista los certificados (PDF) de una carpeta de proyecto.
 *
 * Uso (desde portal-clientes/):
 *   node scripts/probe-graph.js "ACB5925 CENTRAL COLMITO SA"
 *
 * Requiere en .env (local, NO se sube):
 *   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
 *   SHAREPOINT_HOSTNAME, SHAREPOINT_SITE_PATH, SHAREPOINT_DRIVE (Clientes),
 *   SHAREPOINT_CATEGORIA_CERTIFICADOS
 */

const config = require('../src/config');
const graph = require('../src/graph');

const carpeta = process.argv[2];

(async () => {
  if (!config.graph.tenantId || !config.graph.clientId || !config.graph.clientSecret) {
    console.error('Faltan AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET en .env');
    process.exit(1);
  }
  if (!carpeta) {
    console.error('Uso: node scripts/probe-graph.js "<CARPETA DEL PROYECTO>"');
    console.error('Ej.:  node scripts/probe-graph.js "ACB5925 CENTRAL COLMITO SA"');
    process.exit(1);
  }
  console.log(`Sitio:      ${config.graph.hostname}${config.graph.sitePath}`);
  console.log(`Biblioteca: ${config.graph.drive}`);
  console.log(`Ruta:       ${carpeta}/DOSSIER DE ENTREGA/${config.graph.categoriaCertificados}\n`);

  const t0 = Date.now();
  try {
    const docs = await graph.listarCertificados(carpeta);
    console.log(`✔ ${docs.length} certificado(s) en ${Date.now() - t0} ms\n`);
    if (!docs.length) {
      console.log('Sin PDF. Revisa el nombre de la carpeta, la biblioteca (SHAREPOINT_DRIVE)');
      console.log('o el nombre de la subcarpeta de categoría (SHAREPOINT_CATEGORIA_CERTIFICADOS).');
      return;
    }
    for (const d of docs) console.log(`  • ${d.name}  —  ${d.size} · ${d.date}`);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
