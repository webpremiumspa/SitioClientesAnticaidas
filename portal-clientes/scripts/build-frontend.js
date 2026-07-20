'use strict';

/**
 * Precompila el frontend: transforma los archivos JSX (public/js/*.js) a JS
 * plano y los concatena en public/app.bundle.js. Así el navegador NO necesita
 * Babel ni eval/inline → permite un CSP estricto y mejora el rendimiento.
 *
 * Uso: node scripts/build-frontend.js   (correr en local antes de commitear)
 */

const fs = require('fs');
const path = require('path');
const Babel = require('../public/vendor/babel.js');

const jsDir = path.join(__dirname, '..', 'public', 'js');
const outFile = path.join(__dirname, '..', 'public', 'app.bundle.js');

// Orden importa: data -> componentes -> dashboard -> detalle -> modales -> app.
const files = [
  '00-data.js',
  '01-components.js',
  '02-dashboard.js',
  '03-detail.js',
  '04-modals.js',
  '05-app.js',
];

let bundle = '// Bundle generado por scripts/build-frontend.js — NO editar a mano.\n"use strict";\n';
for (const f of files) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  const { code } = Babel.transform(src, { presets: ['react'], filename: f });
  bundle += `\n/* ===== ${f} ===== */\n${code}\n`;
}

fs.writeFileSync(outFile, bundle);
console.log('OK app.bundle.js escrito:', bundle.length, 'bytes');
