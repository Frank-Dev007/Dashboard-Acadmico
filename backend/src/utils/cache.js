// Caché en memoria simple con TTL (time-to-live).
// Para una app de un solo proceso Node, esto es suficiente. Si en el futuro
// escalas a múltiples instancias, conviene migrar a Redis.

const cache = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Estadísticas para monitorear cómo está rindiendo el caché
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0,
};

// Devuelve el valor cacheado si existe y no expiró. undefined si no.
export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) {
    stats.misses++;
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    stats.evictions++;
    stats.misses++;
    return undefined;
  }
  stats.hits++;
  return entry.value;
};

// Guarda un valor en caché con un TTL (ms). Si no se pasa, usa el default.
export const setCached = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
  stats.sets++;
};

// Borra entradas que contengan el patrón en su key. Si no pasa pattern, borra todo.
// Devuelve cuántas entradas se eliminaron.
export const clearCache = (pattern = null) => {
  if (!pattern) {
    const size = cache.size;
    cache.clear();
    return size;
  }
  let removed = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      removed++;
    }
  }
  return removed;
};

// Estadísticas del caché para monitoreo
export const getCacheStats = () => {
  const total = stats.hits + stats.misses;
  return {
    ...stats,
    size: cache.size,
    hitRate: total > 0 ? `${((stats.hits / total) * 100).toFixed(1)}%` : "N/A",
    totalRequests: total,
  };
};

// Resetea las estadísticas (no borra el caché)
export const resetStats = () => {
  stats.hits = 0;
  stats.misses = 0;
  stats.sets = 0;
  stats.evictions = 0;
};

// ─── Middleware de Express para cachear respuestas de endpoints ──────────────
//
// Uso:
//   router.get('/foo',
//     cacheMiddleware((req) => `foo:${req.query.id}`),
//     fooController
//   );
//
// Si el caché tiene la respuesta, la devuelve directo (sin llamar al controller).
// Si no, llama al controller y guarda en caché la respuesta JSON exitosa.
export const cacheMiddleware = (keyBuilder, ttlMs = DEFAULT_TTL_MS) => {
  return (req, res, next) => {
    const key = keyBuilder(req);

    const cached = getCached(key);
    if (cached !== undefined) {
      console.log(`📦 CACHE HIT  : ${key}`);
      return res.json(cached);
    }

    console.log(`🔥 CACHE MISS : ${key}`);

    // Interceptamos res.json para guardar el resultado SOLO si es exitoso
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const isOk =
        res.statusCode >= 200 && res.statusCode < 300 && data?.ok !== false;
      if (isOk) {
        setCached(key, data, ttlMs);
      }
      return originalJson(data);
    };

    next();
  };
};
