import xlsx from "xlsx";
import csvParser from "csv-parser";
import { Readable } from "stream";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// Detectar formato
const isExcel = (mimetype) =>
  mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
  mimetype === "application/vnd.ms-excel";

const isCSV = (mimetype) => mimetype === "text/csv";

export const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo." });
    }

    let data = [];

    // Excel
    if (isExcel(req.file.mimetype)) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = xlsx.utils.sheet_to_json(sheet);
    }
    // CSV
    else if (isCSV(req.file.mimetype)) {
      data = await new Promise((resolve, reject) => {
        const rows = [];
        Readable.from(req.file.buffer)
          .pipe(csvParser())
          .on("data", (row) => rows.push(row))
          .on("end", () => resolve(rows))
          .on("error", reject);
      });
    }
    else {
      return res.status(400).json({ error: "Formato no soportado (solo CSV o Excel)." });
    }

    let insertados = 0;
    let omitidos = 0;

    for (const row of data) {
      const {
        nombre,
        apellido,
        documento,
        correo,
        password,
        tipo_usuario,
        facultad,
        programa
      } = row;

      // Validación mínima
      if (!correo || !password || !documento || !tipo_usuario) {
        omitidos++;
        continue;
      }

      // Evitar duplicados
      const existe = await User.findOne({ where: { correo } });
      if (existe) {
        omitidos++;
        continue;
      }

      // 🔐 Encriptar contraseña
      const hashed = await bcrypt.hash(password, 10);

      // Crear usuario igual que en createUser
      await User.create({
        nombre,
        apellido,
        correo,
        password: hashed,
        documento,
        tipo_usuario,
        facultad,
        programa,
        estado: false   // mismo comportamiento que createUser
      });

      insertados++;
    }

    return res.json({
      mensaje: "Importación completada",
      total: data.length,
      insertados,
      omitidos
    });

  } catch (error) {
    console.error("🔥 Error importando estudiantes:", error);
    return res.status(500).json({
      error: "Error procesando archivo.",
      detalle: error.message
    });
  }
};
