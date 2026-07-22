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

/** Normaliza un texto para comparar sin acentos, mayúsculas ni espacios extra. */
function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita marcas diacríticas (acentos)
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** slug estable a partir de un nombre de carpeta: "CÁLCULOS Y GARANTÍAS" -> "calculos-y-garantias". */
function slugKey(s) {
  return norm(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Título legible: "CALCULOS Y GARANTIAS" -> "Calculos y Garantias". */
function tituloCase(s) {
  const menores = new Set(['y', 'de', 'del', 'la', 'las', 'el', 'los', 'e', 'o', 'u']);
  return String(s || '')
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && menores.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
    .trim();
}

/** Convierte fecha AppSheet US "MM/DD/YYYY[ hh:mm:ss]" a ISO "YYYY-MM-DD". */
function usToISO(s) {
  if (!s) return null;
  const datePart = String(s).trim().split(' ')[0];
  const m = datePart.split('/');
  if (m.length !== 3) return null;
  const [mm, dd, yyyy] = m;
  const p = (x) => String(x).padStart(2, '0');
  if (!yyyy || yyyy.length !== 4) return null;
  return `${yyyy}-${p(mm)}-${p(dd)}`;
}

/** Fecha de hoy en ISO "YYYY-MM-DD". */
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  normalizeRut, sameRut, iniciales, generarCodigo, norm, slugKey, tituloCase, usToISO, hoyISO,
};
