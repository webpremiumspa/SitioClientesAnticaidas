'use strict';

/**
 * Utilidades compartidas: normalización de RUT, iniciales, fechas.
 */

/**
 * Normaliza un RUT al formato almacenado en AppSheet: dígitos + guion + DV,
 * sin puntos. Ej: "76.326.949-3", "763269493" -> "76326949-3".
 * El DV puede ser 'K'.
 */
function normalizeRut(raw) {
  if (!raw) return '';
  const clean = String(raw).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body}-${dv}`;
}

/** Compara dos RUT sin importar formato (puntos, guion, mayúsculas). */
function sameRut(a, b) {
  return normalizeRut(a) === normalizeRut(b) && normalizeRut(a) !== '';
}

/** Iniciales a partir de un nombre completo. "Carlo Cofré" -> "CC". */
function iniciales(nombre) {
  if (!nombre) return '?';
  const parts = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Genera un código OTP numérico de n dígitos. */
function generarCodigo(n = 6) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

module.exports = { normalizeRut, sameRut, iniciales, generarCodigo };
