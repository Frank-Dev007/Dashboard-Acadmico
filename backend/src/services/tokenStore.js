// Almacén de refresh tokens activos (whitelist) para poder invalidar sesiones.
//
// "Redis-ready": si REDIS_URL está definido y el paquete `redis` instalado, usa
// Redis (con expiración automática por TTL). Si no, usa un store en memoria.
//
// Se guarda el `jti` (id único) de cada refresh token por usuario. Un refresh
// solo es válido si su jti sigue en el whitelist. Logout / invalidación = borrar.

let redisClient = null;
let redisTried = false;

const getRedis = async () => {
  if (!process.env.REDIS_URL) return null;
  if (redisClient) return redisClient;
  if (redisTried) return null;
  redisTried = true;
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (e) => console.warn("⚠️ Redis error:", e.message));
    await client.connect();
    redisClient = client;
    console.log("✅ tokenStore usando Redis");
    return client;
  } catch (err) {
    console.warn("⚠️ Redis no disponible (tokens en memoria):", err.message);
    return null;
  }
};

// ── Fallback en memoria: Map<userId, Map<jti, expiresAtMs>> ───────────────────
const memStore = new Map();

const memCleanup = (userId) => {
  const set = memStore.get(userId);
  if (!set) return;
  const now = Date.now();
  for (const [jti, exp] of set) {
    if (now > exp) set.delete(jti);
  }
  if (set.size === 0) memStore.delete(userId);
};

const rKey = (userId, jti) => `refresh:${userId}:${jti}`;

// ── API pública ──────────────────────────────────────────────────────────────

export const storeRefresh = async (userId, jti, ttlSec) => {
  const client = await getRedis();
  if (client) {
    await client.set(rKey(userId, jti), "1", { EX: ttlSec });
    return;
  }
  if (!memStore.has(userId)) memStore.set(userId, new Map());
  memStore.get(userId).set(jti, Date.now() + ttlSec * 1000);
};

export const isRefreshActive = async (userId, jti) => {
  const client = await getRedis();
  if (client) {
    const v = await client.get(rKey(userId, jti));
    return v != null;
  }
  memCleanup(userId);
  const set = memStore.get(userId);
  return !!(set && set.has(jti));
};

export const revokeRefresh = async (userId, jti) => {
  const client = await getRedis();
  if (client) {
    await client.del(rKey(userId, jti));
    return;
  }
  const set = memStore.get(userId);
  if (set) set.delete(jti);
};

// Invalida TODAS las sesiones de un usuario (ej. cambio de contraseña)
export const revokeAllForUser = async (userId) => {
  const client = await getRedis();
  if (client) {
    // Borra todas las keys refresh:{userId}:*
    const keys = [];
    for await (const key of client.scanIterator({ MATCH: `refresh:${userId}:*` })) {
      keys.push(key);
    }
    if (keys.length) await client.del(keys);
    return;
  }
  memStore.delete(userId);
};
