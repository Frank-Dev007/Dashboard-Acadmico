import { Router } from "express";
import upload from "../middlewares/upload.js";

import {
  agregarEstudiante,
  obtenerEstudiantesDelCurso,
  eliminarEstudianteDelCurso,
  obtenerCursosDeEstudiante
} from "../controllers/cursoEstudiante.controller.js";

import { importEstudiantes } from "../controllers/cursoEstudianteImport.controller.js";

const router = Router();

// Importación por archivo
router.post("/estudiantes", upload.single("file"), importEstudiantes);

// CRUD
router.post("/", agregarEstudiante);
router.get("/curso/:id_curso", obtenerEstudiantesDelCurso);
router.delete("/:id_curso/:id_estudiante", eliminarEstudianteDelCurso);

// ***** NUEVA RUTA PARA TU DASHBOARD *****
router.get("/estudiante/:id_estudiante", obtenerCursosDeEstudiante);

export default router;
