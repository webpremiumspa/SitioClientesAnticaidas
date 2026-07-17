'use strict';

/** Ejecuta una sincronización única y termina. Útil para probar/cron manual. */
const sync = require('../src/sync');

sync.runSync().then((r) => {
  console.log('Resultado:', r);
  process.exit(r && r.error ? 1 : 0);
});
