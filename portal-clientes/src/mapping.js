'use strict';

/**
 * Mapeo entre las filas crudas de AppSheet (PROYECTOS + REGISTRO) y la
 * estructura interna del portal. Ajustado contra la respuesta REAL del `Find`.
 *
 * Hechos certificados con datos reales (cliente CENTRAL COLMITO, RUT 76326949-3):
 *  - ESTADO llega como id numérico ("4","10") -> Ref a la tabla STATUS. Se
 *    traduce con statusMap (id -> nombre) construido en el sync.
 *  - Fechas en formato US MM/DD/YYYY ("05/18/2026") y datetime con hora.
 *  - NOMBRE DEL PROYECTO suele venir vacío.
 *  - El tipo de sistema está en columnas de conteo (LV HORIZONTAL, etc.).
 *  - La carpeta SharePoint del proyecto sale de URL_Comercial:
 *      /Clientes/{CODIGO} {CLIENTE}/COMERCIAL  ->  "{CODIGO} {CLIENTE}"
 */

const { normalizeRut, usToISO } = require('./util');

function pick(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  }
  return '';
}

/** Convierte MM/DD/YYYY[ hh:mm:ss] (formato AppSheet US) a DD-MM-YYYY. */
function fechaUSaDMY(s) {
  if (!s) return null;
  const datePart = String(s).trim().split(' ')[0]; // descarta la hora
  const m = datePart.split('/');
  if (m.length !== 3) return datePart; // formato inesperado: se deja tal cual
  const [mm, dd, yyyy] = m;
  const p = (x) => String(x).padStart(2, '0');
  return `${p(dd)}-${p(mm)}-${yyyy}`;
}

/** Extrae la carpeta de proyecto desde URL_Comercial. */
function carpetaProyecto(urlComercial, codigo, cliente) {
  let path = String(urlComercial || '');
  try {
    const qi = path.indexOf('id=');
    path = decodeURIComponent(qi >= 0 ? path.slice(qi + 3).split('&')[0] : path);
  } catch (_) { /* usa el string tal cual */ }
  const marker = '/Clientes/';
  const i = path.indexOf(marker);
  if (i >= 0) {
    const seg = path.slice(i + marker.length).split('/')[0];
    if (seg) return seg;
  }
  // Fallback: "{CODIGO} {CLIENTE}"
  return [codigo, cliente].filter(Boolean).join(' ').trim();
}

/** Descripción de tipo de sistema a partir de las columnas de conteo. */
const SISTEMAS = {
  'LV HORIZONTAL': 'LV Horizontal',
  'LV VERTICAL': 'LV Vertical',
  'PUNTO DE ANCLAJE': 'Punto de Anclaje',
  'PASILLO TECNICO': 'Pasillo Técnico',
  BARANDA: 'Baranda',
  'ESCALA FIJA': 'Escala Fija',
  'ESCALA CROSS OVER': 'Escala Cross Over',
  OTROS: 'Otros',
};
function tipoSistemaDesdeConteos(pRow) {
  const partes = [];
  for (const [col, label] of Object.entries(SISTEMAS)) {
    const n = parseInt(pRow[col], 10);
    if (Number.isFinite(n) && n > 0) partes.push(n > 1 ? `${label} ×${n}` : label);
  }
  return partes.join(' · ');
}

/**
 * Traduce el nombre de estado (tabla STATUS) a los estados del portal.
 * Estados reales: 1 PREPARADO, 2 PENDIENTE, 3 INGRESADO, 4 Pend: MATERIAL,
 * 5 Pend: ACREDITAR, 6 EN EJECUCION, 7 CERTIFICADOS, 8 FINALIZADO,
 * 9 CANCELADO, 10 HABILITACIÓN.
 * El pill del portal va en mayúsculas por CSS, así que usamos el nombre real.
 */
function mapEstadoNombre(nombre) {
  const e = String(nombre || '').toUpperCase().trim();
  if (['FINALIZADO', 'CERTIFICADOS'].includes(e)) {
    return { estado: 'terminado', estadoLabel: 'Terminado' };
  }
  if (['CANCELADO', 'CANCELADA'].includes(e)) {
    // Los proyectos cancelados NO se muestran al cliente (se filtran en portal.js).
    return { estado: 'cancelado', estadoLabel: 'Cancelado' };
  }
  return { estado: 'en-ejecucion', estadoLabel: nombre || 'En proceso' };
}

/** Último día del mes (ISO) para año/mes dados (mes 1-12). */
function finDeMesISO(anio, mes) {
  return new Date(Date.UTC(anio, mes, 0)).toISOString().slice(0, 10);
}

/**
 * Interpreta una fecha AppSheet flexible:
 *  - "MM/DD/YYYY[ hh:mm:ss]" -> ese día
 *  - "MM/YYYY"               -> último día de ese mes
 * Devuelve ISO "YYYY-MM-DD" o null.
 */
function fechaFlexISO(s) {
  if (!s) return null;
  const datePart = String(s).trim().split(' ')[0];
  const parts = datePart.split('/');
  if (parts.length === 3) return usToISO(s);
  if (parts.length === 2) {
    const mm = parseInt(parts[0], 10);
    const yyyy = parseInt(parts[1], 10);
    if (mm >= 1 && mm <= 12 && yyyy > 1900) return finDeMesISO(yyyy, mm);
  }
  return null;
}

/** ISO de PROX MANTENCION del registro; fallback EOMONTH(FECHA RECEPCION,+12). */
function calcProxMantencion(reg0) {
  const directa = fechaFlexISO(pick(reg0, 'PROX MANTENCION', 'PROX_MANTENCION'));
  if (directa) return directa;
  const rec = usToISO(pick(reg0, 'FECHA RECEPCION', 'FECHA_RECEPCION'));
  if (!rec) return null;
  const d = new Date(rec + 'T00:00:00Z');
  // EOMONTH(+12): último día del mismo mes, un año después.
  return finDeMesISO(d.getUTCFullYear() + 1, d.getUTCMonth() + 1);
}

function mapProyecto(pRow, registrosDelProyecto = [], statusMap = {}) {
  const codigo = pick(pRow, 'CODIGO DE PROYECTO');
  const cliente = pick(pRow, 'CLIENTE', 'EMPRESA');
  const estadoNombre = statusMap[String(pick(pRow, 'ESTADO'))] || '';
  const { estado, estadoLabel } = mapEstadoNombre(estadoNombre);

  const reg0 = registrosDelProyecto[0] || {};
  const registros = registrosDelProyecto.map((r) => ({
    idRegistro: pick(r, 'ID REGISTRO'),
  }));

  // Fecha de próxima mantención (para vigencia de certificados). Todos los
  // registros comparten la misma, se toma la del primero. Si la columna virtual
  // no viene, se calcula como EOMONTH(FECHA RECEPCION, +12).
  const proxMantencionISO = calcProxMantencion(reg0);

  // Extensión: suma de metros de los registros (si los hay).
  let metros = 0;
  for (const r of registrosDelProyecto) metros += parseFloat(r['METROS TOTALES']) || 0;

  return {
    id: String(codigo).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    codigo,
    nombre: pick(pRow, 'NOMBRE DEL PROYECTO') || pick(pRow, 'DIRECCION DE INSTALACION') || codigo,
    sub: tipoSistemaDesdeConteos(pRow) || pick(reg0, 'TIPO DE SISTEMA'),
    direccion: pick(pRow, 'DIRECCION DE INSTALACION', 'DIRECCION'),
    comuna: pick(pRow, 'COMUNA DE INSTALACION', 'COMUNA'),
    region: pick(pRow, 'REGION DE INSTALACION', 'REGION'),
    tipoSistema: tipoSistemaDesdeConteos(pRow) || pick(reg0, 'TIPO DE SISTEMA'),
    extension: metros > 0 ? `${metros.toLocaleString('es-CL')} m` : '',
    cantidadUsuarios: Number(pick(reg0, 'CANTIDAD DE USUARIOS')) || null,
    diseno: pick(pRow, 'DISEÑADO POR'),
    instalador: pick(reg0, 'INSTALADOR'),
    solicitante: pick(pRow, 'NOMBRE CONTACTO'),
    validador: pick(pRow, 'NOMBRE CONTACTO'),
    estado,
    estadoLabel,
    fechaInicio: fechaUSaDMY(pick(pRow, 'FECHA_DE_INICIO')),
    fechaEntrega: fechaUSaDMY(pick(pRow, 'FECHA DE FINALIZACION')),
    fechaInforme: null,
    proxMantencionISO, // para vigencia de certificados
    progreso: estado === 'terminado' || estado === 'archivado' ? 1 : 0.5,
    proximoHito: '',
    descripcion: pick(pRow, 'OBSERVACIONES') || '',

    cliente: {
      rut: normalizeRut(pick(pRow, 'RUT')),
      razonSocial: cliente,
      direccion: pick(pRow, 'DIRECCION'),
      comuna: pick(pRow, 'COMUNA'),
      region: pick(pRow, 'REGION'),
      solicitante: pick(pRow, 'NOMBRE CONTACTO'),
      email: pick(pRow, 'CORREO CONTACTO', 'EMAIL'),
      telefono: pick(pRow, 'NUMERO CONTACTO', 'TELEFONO'),
    },

    // Carpeta del proyecto en SharePoint (para listar certificados con Graph).
    clienteFolder: carpetaProyecto(pick(pRow, 'URL_Comercial'), codigo, cliente),
    registros,
    docs: { certificados: [] },
  };
}

function mapProyectos(proyectosRows, registroRows, statusMap = {}) {
  const regsPorCodigo = new Map();
  for (const r of registroRows || []) {
    const cod = pick(r, 'CODIGO DE PROYECTO');
    if (!cod) continue;
    if (!regsPorCodigo.has(cod)) regsPorCodigo.set(cod, []);
    regsPorCodigo.get(cod).push(r);
  }
  return (proyectosRows || []).map((p) => {
    const cod = pick(p, 'CODIGO DE PROYECTO');
    return mapProyecto(p, regsPorCodigo.get(cod) || [], statusMap);
  });
}

/** Construye el mapa id_status -> nombre desde las filas de la tabla STATUS. */
function buildStatusMap(statusRows) {
  const map = {};
  for (const r of statusRows || []) {
    const id = r['id_status'] !== undefined ? String(r['id_status']) : '';
    const nombre = r['nombre'] || r['Nombre'] || '';
    if (id) map[id] = nombre;
  }
  return map;
}

module.exports = { mapProyecto, mapProyectos, buildStatusMap, fechaUSaDMY, carpetaProyecto, pick };
