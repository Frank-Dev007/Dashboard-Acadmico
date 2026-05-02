import { Router } from "express";
import {
  getCursos,
  getCursoById,
  getCursosByProfesor,
  createCurso,
  updateCurso,
  deleteCurso,
} from "../controllers/curso.controller.js";

const router = Router();

// Obtener todos los cursos
router.get("/", getCursos);

// Obtener curso por ID
router.get("/:id", getCursoById);

// Obtener cursos por profesor
router.get("/profesor/:id_profesor", getCursosByProfesor);

// Crear curso
router.post("/", createCurso);

// Actualizar curso
router.put("/:id", updateCurso);

// Eliminar curso
router.delete("/:id", deleteCurso);

export default router;
