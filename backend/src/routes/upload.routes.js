import { Router } from "express";
import upload from "../middlewares/upload.js";

const router = Router();

// Ruta de prueba para subida de archivos
router.post("/", upload.single("file"), (req, res) => {
  try {
    return res.json({
      message: "Archivo subido correctamente",
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return res.status(500).json({ message: "Error al subir archivo" });
  }
});

export default router;
