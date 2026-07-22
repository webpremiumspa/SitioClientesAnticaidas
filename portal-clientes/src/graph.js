'use strict';

/**
 * Microsoft Graph — acceso de SOLO LECTURA a la biblioteca de SharePoint donde
 * viven los certificados. Autenticación app-only (client credentials). El
 * registro en Azure AD usa el permiso acotado `Sites.Selected` sobre el sitio
 * SitioclientesAnticadas.
 *
 * Ruta de los certificados:
 *   /Clientes/{clienteFolder}/DOSSIER DE ENTREGA/CERTIFICADOS DE INSTALACION/
 */

const config = require('./config');

const GRAPH = 'https://graph.microsoft.com/v1.0';

// --- caché de token y de ids de sitio/drive ---
let tokenCache = { value: null, exp: 0 };
let siteId = null;
let driveId = null;

async function getToken() {
  const now = Date.now();
  if (tokenCache.value && now < tokenCache.exp - 60000) return tokenCache.value;

  const { tenantId, clientId, clientSecret } = config.graph;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Graph no configurado (AZURE_TENANT_ID / CLIENT_ID / CLIENT_SECRET)');
  }
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Graph token HTTP ${res.status}: ${t.slice(0, 300)}`);
  }
  const json = await res.json();
  tokenCache = { value: json.access_token, exp: now + json.expires_in * 1000 };
  return tokenCache.value;
}

async function gfetch(path, opts = {}) {
  const token = await getToken();
  const res = await fetch(path.startsWith('http') ? path : GRAPH + path, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  return res;
}

async function gjson(path) {
  const res = await gfetch(path);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Graph GET ${path} -> HTTP ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

/** Resuelve (y cachea) el id del sitio SharePoint. */
async function getSiteId() {
  if (siteId) return siteId;
  const { hostname, sitePath } = config.graph;
  const site = await gjson(`/sites/${hostname}:${sitePath}`);
  siteId = site.id;
  return siteId;
}

/** Resuelve (y cachea) el id de la biblioteca de documentos. */
async function getDriveId() {
  if (driveId) return driveId;
  const sid = await getSiteId();
  // Usa la biblioteca por nombre si se configuró; si no, la default del sitio.
  const wanted = (config.graph.drive || '').trim().toLowerCase();
  const drives = await gjson(`/sites/${sid}/drives`);
  const list = drives.value || [];
  let d = null;
  if (wanted) {
    d = list.find(
      (x) =>
        (x.name || '').toLowerCase() === wanted ||
        (x.webUrl || '').toLowerCase().endsWith('/' + wanted)
    );
  }
  driveId = (d || list[0] || {}).id;
  if (!driveId) throw new Error('No se encontró la biblioteca de documentos en el sitio');
  return driveId;
}

function encodePath(p) {
  return p.split('/').map(encodeURIComponent).join('/');
}

/**
 * Lista los PDF de una CATEGORÍA de un proyecto.
 * @param {string} carpetaProyecto  carpeta del proyecto dentro de "Clientes",
 *   ej. "ACB5925 CENTRAL COLMITO SA" (derivada de URL_Comercial).
 * @param {string} categoriaFolder  subcarpeta bajo "DOSSIER DE ENTREGA",
 *   ej. "CERTIFICADOS DE INSTALACION".
 * @returns {Promise<Array>} docs [{ name, size, date, tag, docId }]
 */
async function listarDocs(carpetaProyecto, categoriaFolder) {
  if (!carpetaProyecto || !categoriaFolder) return [];
  const sid = await getSiteId();
  const did = await getDriveId();
  // La biblioteca ya ES "Clientes"; la ruta interna arranca en la carpeta del proyecto.
  const rel = `${carpetaProyecto}/DOSSIER DE ENTREGA/${categoriaFolder}`;
  const path = `/sites/${sid}/drives/${did}/root:/${encodePath(rel)}:/children?$top=200&$select=id,name,size,lastModifiedDateTime,file`;

  let json;
  try {
    json = await gjson(path);
  } catch (e) {
    // Carpeta inexistente (proyecto sin esa categoría) -> lista vacía, no error.
    if (String(e.message).includes('HTTP 404')) return [];
    throw e;
  }
  return (json.value || [])
    .filter((it) => it.file && /\.pdf$/i.test(it.name))
    .map((it) => ({
      name: it.name,
      size: formatBytes(it.size),
      date: formatDate(it.lastModifiedDateTime),
      tag: 'VIGENTE',
      docId: Buffer.from(`${did}|${it.id}`).toString('base64url'),
    }));
}

/**
 * Devuelve la respuesta cruda (stream) del contenido de un documento para
 * hacer proxy de descarga. `docId` es el token base64url de listarCertificados.
 */
async function descargarDoc(docId) {
  const decoded = Buffer.from(docId, 'base64url').toString('utf8');
  const [did, itemId] = decoded.split('|');
  if (!did || !itemId) throw new Error('docId inválido');
  // Encodea los ids para que no se pueda manipular la ruta de la API de Graph.
  const d = encodeURIComponent(did);
  const it = encodeURIComponent(itemId);
  const sid = await getSiteId();
  // Metadatos (nombre) + contenido.
  const meta = await gjson(`/sites/${sid}/drives/${d}/items/${it}?$select=name,size,file`);
  const res = await gfetch(`/sites/${sid}/drives/${d}/items/${it}/content`);
  if (!res.ok && res.status !== 302) {
    throw new Error(`Graph content HTTP ${res.status}`);
  }
  return { res, name: meta.name };
}

function formatBytes(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}

module.exports = { listarDocs, descargarDoc };
