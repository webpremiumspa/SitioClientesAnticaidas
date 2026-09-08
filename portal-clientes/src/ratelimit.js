'use strict';

/**
 * Rate limiter simple (ventana fija por clave). Evita fuerza bruta de OTP,
 * bombardeo de correos y abuso general de los endpoints.
 *
 * Los contadores viven en el store compartido en disco (src/kv.js), NO en
 * memoria: cPanel/LiteSpeed corre varios procesos y cada uno llevaba su propia
 * cuenta desde cero, así que el límite real era N veces el configurado (con 3
 * procesos, 12 solicitudes de código por IP se convertían en 36).
 *
 * Sólo se aplica a endpoints de baja frecuencia (login y formularios), así que
 * el par de operaciones de disco por request no es un problema.
 */

const kv = require('./kv');

const NS = 'rl';

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

    let b;
    try {
      b = kv.update(NS, key, windowMs, (cur) =>
        !cur || now > cur.reset
          ? { count: 1, reset: now + windowMs }
          : { count: cur.count + 1, reset: cur.reset }
      );
    } catch (e) {
      // Si el disco falla, no bloqueamos el portal entero por el limitador.
      console.error('[ratelimit]', e.message);
      return next();
    }

    if (b.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((b.reset - now) / 1000)));
      return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta más tarde.' });
    }
    next();
  };
}

module.exports = { rateLimit, clientIp };
