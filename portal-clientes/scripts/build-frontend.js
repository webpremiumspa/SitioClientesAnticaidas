'use strict';

/**
 * Precompila el frontend: transforma los archivos JSX (public/js/*.js) a JS
 * plano y los concatena en public/app.bundle.js. Así el navegador NO necesita
 * Babel ni eval/inline → permite un CSP estricto y mejora el rendimiento.
 *
 * Además sella la build:
 *   - inyecta window.__APP_VERSION__ / __APP_BUILD__ (se muestran en el pie),
 *   - reescribe index.html con ?v=<build> en app.bundle.js y portal.css.
 * El "build" es un hash del contenido, así que cambia sólo si cambió el código
 * y sirve de cache-busting frente a Cloudflare (que cachea el JS/CSS).
 *
 * Uso: node scripts/build-frontend.js   (correr en local antes de commitear)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Babel = require('../public/vendor/babel.js');
const pkg = require('../package.json');

const publicDir = path.join(__dirname, '..', 'public');
const jsDir = path.join(publicDir, 'js');
const outFile = path.join(publicDir, 'app.bundle.js');
const cssFile = path.join(publicDir, 'css', 'portal.css');
const htmlFile = path.join(publicDir, 'index.html');

// Orden importa: data -> componentes -> dashboard -> detalle -> modales -> app.
const files = [
  '00-data.js',
  '01-components.js',
  '02-dashboard.js',
  '03-detail.js',
  '04-modals.js',
  '05-app.js',
];

const sha8 = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);

let code = '';
for (const f of files) {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  const { code: out } = Babel.transform(src, { presets: ['react'], filename: f });
  code += `\n/* ===== ${f} ===== */\n${out}\n`;
}

// Sello de build: depende del JS y del CSS, para que un cambio en cualquiera
// de los dos invalide la caché de ambos.
const css = fs.readFileSync(cssFile, 'utf8');
const build = sha8(sha8(code) + sha8(css));

const header =
  '// Bundle generado por scripts/build-frontend.js — NO editar a mano.\n' +
  '"use strict";\n' +
  `window.__APP_VERSION__ = ${JSON.stringify(pkg.version)};\n` +
  `window.__APP_BUILD__ = ${JSON.stringify(build)};\n`;

fs.writeFileSync(outFile, header + code);

// Cache-busting: index.html apunta a los estáticos con ?v=<build>.
const html = fs.readFileSync(htmlFile, 'utf8');
const htmlNuevo = html
  .replace(/app\.bundle\.js(\?v=[a-f0-9]+)?/g, `app.bundle.js?v=${build}`)
  .replace(/css\/portal\.css(\?v=[a-f0-9]+)?/g, `css/portal.css?v=${build}`);
if (htmlNuevo !== html) fs.writeFileSync(htmlFile, htmlNuevo);

console.log(`OK app.bundle.js escrito: ${(header + code).length} bytes`);
console.log(`   v${pkg.version} · build ${build}`);
