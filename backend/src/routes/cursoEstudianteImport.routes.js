import { Router } from "express";
import upload from "../middlewares/upload.js";
import { importEstudiantes } from "../controllers/cursoEstudianteImport.controller.js";

const router = Router();

router.post("/estudiantes", upload.single("file"), importEstudiantes);

export default router;
