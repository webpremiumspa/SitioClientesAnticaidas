'use strict';

/**
 * Metadatos de presentación de una carpeta/categoría de documentos.
 * Las carpetas se descubren dinámicamente desde SharePoint; esta config sólo
 * aporta "pistas cosméticas" (ícono, nombre bonito, orden) para las conocidas.
 * Cualquier carpeta no reconocida se muestra igual, con ícono genérico.
 */

const config = require('./config');
const { norm, slugKey, tituloCase } = require('./util');

// Índice de pistas por nombre de carpeta normalizado.
const HINTS = new Map(
  config.categorias.map((c, i) => [
    norm(c.folder),
    { cat: c.cat, label: c.label, desc: c.desc, order: i },
  ])
);

/**
 * Deriva la metadata de categoría a partir del NOMBRE REAL de la subcarpeta.
 * @returns {{key, label, cat, desc, order}}
 */
function metaDe(folderName) {
  const h = HINTS.get(norm(folderName));
  return {
    key: slugKey(folderName),
    label: h ? h.label : tituloCase(folderName),
    cat: h ? h.cat : 'gen',
    desc: h ? h.desc : '',
    order: h ? h.order : 100,
  };
}

module.exports = { metaDe };
