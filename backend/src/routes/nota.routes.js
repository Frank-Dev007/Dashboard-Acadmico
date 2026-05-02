import { Router } from "express";
import {
  getNotas,
  getNotaById,
  createNota,
  updateNota,
  deleteNota,
} from "../controllers/nota.controller.js";

const router = Router();

router.get("/", getNotas);
router.get("/:id", getNotaById);
router.post("/", createNota);
router.put("/:id", updateNota);
router.delete("/:id", deleteNota);

export default router;
