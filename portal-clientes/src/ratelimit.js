'use strict';

/**
 * Rate limiter simple en memoria (ventana fija por clave). Suficiente para un
 * solo proceso, que es el caso de este portal. Evita fuerza bruta de OTP,
 * bombardeo de correos y abuso general de los endpoints.
 */

const buckets = new Map(); // key -> { count, reset }

// Limpieza periódica de claves vencidas (evita fuga de memoria).
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
}, 5 * 60 * 1000).unref?.();

/** IP real del cliente: prioriza el header de Cloudflare. */
function clientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.ip ||
    'unknown'
  );
}

/**
 * Crea un middleware de rate limit.
 * @param {object} opts { windowMs, max, prefix, keyFn }
 *   keyFn(req) -> string extra para la clave (además de la IP). Opcional.
 */
function rateLimit({ windowMs, max, prefix = '', keyFn }) {
  return (req, res, next) => {
    const extra = keyFn ? ':' + keyFn(req) : '';
    const key = `${prefix}:${clientIp(req)}${extra}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.reset) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((b.reset - now) / 1000)));
      return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta más tarde.' });
    }
    next();
  };
}

module.exports = { rateLimit, clientIp };
