/* Helper de recursos. En este despliegue las imágenes se sirven como archivos
   estáticos (assets/...), así que __res devuelve el fallback relativo.
   Los datos del portal YA NO están aquí: se cargan desde /api/portal. */

window.__res = function (id, fallback) {
  return (window.__resources && window.__resources[id]) || fallback;
};
