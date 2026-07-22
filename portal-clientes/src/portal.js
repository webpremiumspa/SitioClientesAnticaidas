'use strict';

/**
 * Arma la estructura PORTAL_DATA que consume el frontend, a partir del store
 * local, para un RUT autenticado. Inyecta el ejecutivo (fijo por config).
 * Expone solo lo necesario (no filtra rutas internas de SharePoint).
 */

const config = require('./config');
const store = require('./store');
const { iniciales } = require('./util');

// Las 4 categorías de documentos (desde config).
const CARPETAS = config.categorias.map((c) => ({
  key: c.key,
  label: c.label,
  cat: c.cat,
  desc: c.desc,
}));

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

/** Limpia un proyecto de campos internos antes de enviarlo al navegador. */
function proyectoPublico(p) {
  return {
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
    docs: docsPublicos(p),
  };
}

/** Mapea las 4 categorías de documentos a la forma pública (con URL de proxy). */
function docsPublicos(p) {
  const out = {};
  for (const c of config.categorias) {
    const lista = (p.docs && p.docs[c.key]) || [];
    out[c.key] = lista.map((d) => ({
      name: d.name,
      size: d.size,
      date: d.date,
      tag: d.tag,
      path: d.docId ? `/api/doc/${encodeURIComponent(d.docId)}` : null,
    }));
  }
  return out;
}

/** Devuelve el PORTAL_DATA para un RUT, o null si no tiene proyectos. */
function portalData(rutNorm) {
  // Los proyectos cancelados no se muestran al cliente.
  const proyectos = store.getProyectosPorRut(rutNorm).filter((p) => p.estado !== 'cancelado');
  if (!proyectos.length) return null;
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
    proyectos: proyectos.map(proyectoPublico),
    carpetas: CARPETAS,
  };
}

/**
 * Conjunto de docId que pertenecen a los proyectos de un RUT. Se usa para
 * autorizar /api/doc: un cliente sólo puede descargar SUS documentos, y un
 * docId forjado no estará en este set (previene IDOR y acceso cruzado).
 */
function docIdsValidos(rutNorm) {
  const set = new Set();
  for (const p of store.getProyectosPorRut(rutNorm)) {
    if (p.estado === 'cancelado') continue;
    for (const c of config.categorias) {
      for (const d of (p.docs && p.docs[c.key]) || []) {
        if (d.docId) set.add(d.docId);
      }
    }
  }
  return set;
}

module.exports = { portalData, CARPETAS, docIdsValidos };
