import { Router } from "express";

import {
  getCursosEstudiante,
  getActividadesEstudiante,
  getNotasEstudiante
} from "../controllers/estudiante.controller.js";

const router = Router();

// ===============================
// RUTAS DEL DASHBOARD DEL ESTUDIANTE
// ===============================

// Cursos del estudiante
router.get("/:id/cursos", getCursosEstudiante);

// Actividades del estudiante
router.get("/:id/actividades", getActividadesEstudiante);

// Notas del estudiante
router.get("/:id/notas", getNotasEstudiante);

export default router;
