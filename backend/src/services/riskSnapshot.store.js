// Almacén del último estado de riesgo por estudiante (para detectar transiciones
// a riesgo ALTO) y de las alertas no leídas por profesor.
//
// Estrategia: "Redis-ready". Si la variable de entorno REDIS_URL está definida
// y el paquete `redis` está instalado, usa Redis. Si no, cae a un archivo JSON
// local (backend/src/data/riskSnapshots.json). Misma interfaz en ambos casos,
// así que cuando instales Redis solo defines REDIS_URL y ya.
//
// Estructura por profesor:
//   {
//     levels: { [studentId]: "high" | "medium" | "low" },  // último nivel visto
//     unread: [ { studentId, nombre, score, level, date } ] // alertas pendientes
//   }

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const FILE_PATH = path.join(DATA_DIR, "riskSnapshots.json");

// ─── Backend Redis (opcional) ────────────────────────────────────────────────
let redisClient = null;
let redisTried = false;

const getRedis = async () => {
  if (!process.env.REDIS_URL) return null;
  if (redisClient) return redisClient;
  if (redisTried) return null; // ya intentamos y falló, no reintentar en bucle
  redisTried = true;
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (e) => console.warn("⚠️ Redis error:", e.message));
    await client.connect();
    redisClient = client;
    console.log("✅ riskSnapshot usando Redis");
    return client;
  } catch (err) {
    console.warn(
      "⚠️ Redis no disponible (usando archivo JSON):",
      err.message
    );
    return null;
  }
};

const redisKey = (teacherId) => `risk:snapshot:${teacherId}`;

// ─── Backend archivo JSON ────────────────────────────────────────────────────
const readFileStore = async () => {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {}; // archivo no existe aún
  }
};

const writeFileStore = async (data) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
};

const EMPTY = { levels: {}, unread: [] };

// ─── API pública ─────────────────────────────────────────────────────────────

export const getTeacherSnapshot = async (teacherId) => {
  const client = await getRedis();
  if (client) {
    const raw = await client.get(redisKey(teacherId));
    return raw ? JSON.parse(raw) : { ...EMPTY };
  }
  const store = await readFileStore();
  return store[teacherId] ? store[teacherId] : { ...EMPTY };
};

export const saveTeacherSnapshot = async (teacherId, snapshot) => {
  const client = await getRedis();
  if (client) {
    await client.set(redisKey(teacherId), JSON.stringify(snapshot));
    return;
  }
  const store = await readFileStore();
  store[teacherId] = snapshot;
  await writeFileStore(store);
};

export const clearUnread = async (teacherId) => {
  const snap = await getTeacherSnapshot(teacherId);
  snap.unread = [];
  await saveTeacherSnapshot(teacherId, snap);
};
