import fs from "fs";
import csv from "csv-parser";
import { User, CursoEstudiante } from "../models/index.js";

export const importEstudiantes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    const { id_curso } = req.body;

    if (!id_curso) {
      return res.status(400).json({ error: "Falta el id_curso" });
    }

    const estudiantes = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        estudiantes.push(row);
      })
      .on("end", async () => {
        try {
          for (const est of estudiantes) {
            const { documento } = est;

            const usuario = await User.findOne({ where: { documento } });

            if (!usuario) continue;

            // Registrar unión
            await CursoEstudiante.create({
              id_curso,
              id_estudiante: usuario.id,
            });
          }

          res.json({ message: "Estudiantes importados correctamente" });
        } catch (error) {
          res.status(500).json({ error: "Error interno al procesar datos" });
        }
      });
  } catch (error) {
    res.status(500).json({ error: "Error procesando archivo CSV" });
  }
};
