'use strict';

/**
 * Generador mínimo de archivos ZIP (método STORE, sin compresión) en memoria.
 * Sin dependencias externas: el portal corre en cPanel y evitamos sumar
 * paquetes. Los PDF ya vienen comprimidos internamente, así que "store" no
 * pierde prácticamente nada de tamaño y mantiene el código simple.
 *
 * Uso: crearZip([{ name: 'doc.pdf', data: <Buffer> }, ...]) -> Buffer
 */

// Tabla CRC-32 (polinomio 0xEDB88320), calculada una sola vez.
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** Fecha/hora en formato MS-DOS (resolución de 2 segundos). */
function dosDateTime(d) {
  const year = Math.max(1980, d.getFullYear());
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/**
 * Limpia el nombre de archivo dentro del ZIP: sin rutas ni caracteres que
 * rompan al descomprimir en Windows.
 */
function nombreSeguro(name) {
  const base = String(name || 'documento.pdf').split(/[\/]/).pop();
  const limpio = base.replace(/[\x00-\x1f<>:"|?*]/g, '_').trim();
  return limpio || 'documento.pdf';
}

/** Evita nombres repetidos dentro del ZIP: "doc.pdf", "doc (2).pdf", ... */
function deduplicar(name, usados) {
  let n = name;
  if (!usados.has(n)) { usados.add(n); return n; }
  const punto = name.lastIndexOf('.');
  const raiz = punto > 0 ? name.slice(0, punto) : name;
  const ext = punto > 0 ? name.slice(punto) : '';
  let i = 2;
  while (usados.has(n)) { n = `${raiz} (${i})${ext}`; i++; }
  usados.add(n);
  return n;
}

/**
 * Construye el ZIP completo en memoria.
 * @param {{name: string, data: Buffer}[]} entradas
 * @returns {Buffer}
 */
function crearZip(entradas) {
  const now = dosDateTime(new Date());
  const usados = new Set();
  const locales = [];   // buffers de cabecera local + datos
  const centrales = []; // buffers de la central directory
  let offset = 0;

  for (const e of entradas) {
    const data = Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data);
    const nameBuf = Buffer.from(deduplicar(nombreSeguro(e.name), usados), 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);   // firma local file header
    local.writeUInt16LE(20, 4);           // versión necesaria
    local.writeUInt16LE(0x0800, 6);       // flag: nombre en UTF-8
    local.writeUInt16LE(0, 8);            // método 0 = store
    local.writeUInt16LE(now.time, 10);
    local.writeUInt16LE(now.date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18); // tamaño comprimido
    local.writeUInt32LE(data.length, 22); // tamaño original
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);           // sin campo extra
    nameBuf.copy(local, 30);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // firma central directory
    central.writeUInt16LE(20, 4);         // versión creador
    central.writeUInt16LE(20, 6);         // versión necesaria
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(now.time, 12);
    central.writeUInt16LE(now.date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);         // extra
    central.writeUInt16LE(0, 32);         // comentario
    central.writeUInt16LE(0, 34);         // disco
    central.writeUInt16LE(0, 36);         // atributos internos
    central.writeUInt32LE(0, 38);         // atributos externos
    central.writeUInt32LE(offset, 42);    // offset de la cabecera local
    nameBuf.copy(central, 46);

    locales.push(local, data);
    centrales.push(central);
    offset += local.length + data.length;
  }

  const cd = Buffer.concat(centrales);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);      // End Of Central Directory
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entradas.length, 8);
  eocd.writeUInt16LE(entradas.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);         // offset donde empieza la CD
  eocd.writeUInt16LE(0, 20);              // sin comentario

  return Buffer.concat([...locales, cd, eocd]);
}

module.exports = { crearZip, crc32, nombreSeguro };
