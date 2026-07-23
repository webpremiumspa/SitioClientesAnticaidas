'use strict';

/**
 * Arma la estructura PORTAL_DATA que consume el frontend, a partir del store
 * local, para un RUT autenticado. Inyecta el ejecutivo (fijo por config).
 * Las categorías de documentos son DINÁMICAS: cada carpeta de SharePoint
 * descubierta en el sync se muestra como una categoría (ver categorias.js).
 */

const config = require('./config');
const store = require('./store');
const { iniciales, hoyISO } = require('./util');

function ejecutivo() {
  return {
    nombre: config.ejecutivo.nombre,
    cargo: config.ejecutivo.cargo,
    email: config.ejecutivo.email,
    telefono: config.ejecutivo.telefono,
    movil: config.ejecutivo.movil,
    iniciales: iniciales(config.ejecutivo.nombre),
  };
}

/** Mapea los documentos (todas las categorías presentes) a la forma pública. */
function docsPublicos(p, keys) {
  const out = {};
  for (const key of keys) {
    const lista = (p.docs && p.docs[key]) || [];
    out[key] = lista.map((d) => ({
      name: d.name,
      size: d.size,
      date: d.date,
      tag: d.tag,
      path: d.docId ? `/api/doc/${encodeURIComponent(d.docId)}` : null,
    }));
  }
  return out;
}

/** Carpetas propias del proyecto (solo las que ese proyecto tiene), ordenadas. */
function carpetasDeProyecto(p, meta) {
  return Object.keys(p.docs || {})
    .map((k) => meta[k] || { key: k, label: k, cat: 'gen', desc: '', order: 100 })
    .sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label))
    .map((c) => ({ key: c.key, label: c.label, cat: c.cat, desc: c.desc }));
}

function proyectoPublico(p, meta, hoy) {
  const carpetas = carpetasDeProyecto(p, meta);
  const docs = docsPublicos(p, carpetas.map((c) => c.key));
  const pub = {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    sub: p.sub,
    direccion: p.direccion,
    comuna: p.comuna,
    region: p.region,
    tipoSistema: p.tipoSistema,
    extension: p.extension,
    cantidadUsuarios: p.cantidadUsuarios,
    diseno: p.diseno,
    instalador: p.instalador,
    solicitante: p.solicitante,
    validador: p.validador,
    estado: p.estado,
    estadoLabel: p.estadoLabel,
    fechaInicio: p.fechaInicio,
    fechaEntrega: p.fechaEntrega,
    fechaInforme: p.fechaInforme,
    progreso: p.progreso,
    proximoHito: p.proximoHito,
    descripcion: p.descripcion,
    carpetas, // categorías propias de ESTE proyecto
    docs,
  };
  // Chip de vigencia: sólo si el proyecto tiene certificados (categoría 'ci').
  const certCat = carpetas.find((c) => c.cat === 'ci');
  const certDocs = certCat ? docs[certCat.key] || [] : [];
  if (certDocs.length && p.proxMantencionISO) {
    pub.certVigencia = p.proxMantencionISO >= hoy ? 'vigente' : 'vencido';
  }
  return pub;
}

/** Devuelve el PORTAL_DATA para un RUT, o null si no tiene proyectos. */
function portalData(rutNorm) {
  const proyectos = store.getProyectosPorRut(rutNorm).filter((p) => p.estado !== 'cancelado');
  if (!proyectos.length) return null;

  const meta = store.getCarpetasMeta();
  const hoy = hoyISO();
  const cli = proyectos[0].cliente;
  return {
    cliente: {
      rut: cli.rut,
      razonSocial: cli.razonSocial,
      direccion: cli.direccion,
      comuna: cli.comuna,
      region: cli.region,
      solicitante: cli.solicitante,
      email: cli.email,
      telefono: cli.telefono,
    },
    ejecutivo: ejecutivo(),
    proyectos: proyectos.map((p) => proyectoPublico(p, meta, hoy)),
    proximaInspeccion: proximaInspeccion(proyectos, hoy),
  };
}

/**
 * Inspección/mantención futura más próxima del cliente (según PROX MANTENCION).
 * Devuelve { proyecto, fecha (MM-YYYY) } o null si no hay ninguna futura.
 */
function proximaInspeccion(proyectos, hoy) {
  let mejor = null;
  for (const p of proyectos) {
    const iso = p.proxMantencionISO;
    if (!iso || iso < hoy) continue; // sin fecha o ya vencida
    if (!mejor || iso < mejor.iso) mejor = { iso, nombre: p.nombre };
  }
  if (!mejor) return null;
  return {
    proyecto: mejor.nombre,
    fecha: `${mejor.iso.slice(5, 7)}-${mejor.iso.slice(0, 4)}`, // MM-YYYY
  };
}

/**
 * Conjunto de docId que pertenecen a los proyectos de un RUT. Autoriza
 * /api/doc: un cliente sólo descarga SUS documentos; un docId forjado no está
 * en este set (previene IDOR y acceso cruzado).
 */
function docIdsValidos(rutNorm) {
  const set = new Set();
  for (const p of store.getProyectosPorRut(rutNorm)) {
    if (p.estado === 'cancelado') continue;
    for (const lista of Object.values(p.docs || {})) {
      for (const d of lista || []) if (d.docId) set.add(d.docId);
    }
  }
  return set;
}

module.exports = { portalData, docIdsValidos };
