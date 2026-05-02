import { Router } from "express";
import {
  getActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad,
} from "../controllers/actividad.controller.js";

const router = Router();

router.get("/", getActividades);
router.get("/:id", getActividadById);
router.post("/", createActividad);
router.put("/:id", updateActividad);
router.delete("/:id", deleteActividad);

export default router;
