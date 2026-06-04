import { Router } from "express";
import { getCacheStats, clearCache, resetStats } from "../utils/cache.js";

const router = Router();

// GET /api/cache/stats
// Devuelve hits, misses, size, hitRate del caché en memoria
router.get("/stats", (req, res) => {
  res.json({ ok: true, ...getCacheStats() });
});

// POST /api/cache/clear?pattern=jefe-mov
// Borra todas las entradas del caché que contengan ese patrón en la key.
// Si no se pasa pattern, borra TODO el caché.
router.post("/clear", (req, res) => {
  const { pattern } = req.query;
  const removed = clearCache(pattern || null);
  res.json({
    ok: true,
    removed,
    msg: pattern
      ? `Eliminadas ${removed} entradas con patrón "${pattern}"`
      : `Caché completo limpiado (${removed} entradas)`,
  });
});

// POST /api/cache/reset-stats
// Resetea los contadores de hits/misses (no borra el caché)
router.post("/reset-stats", (req, res) => {
  resetStats();
  res.json({ ok: true, msg: "Estadísticas reseteadas" });
});

export default router;
