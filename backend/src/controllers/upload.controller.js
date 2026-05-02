import xlsx from "xlsx";

export const processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    // Leer archivo cargado
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return res.json({
      message: "Archivo procesado correctamente",
      rows: data.length,
      data,
    });

  } catch (error) {
    console.error("Error al procesar archivo:", error);
    res.status(500).json({ error: "Hubo un error procesando el archivo" });
  }
};
