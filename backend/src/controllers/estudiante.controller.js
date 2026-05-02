import { Curso, Actividad, Nota, User, CursoEstudiante } from "../models/index.js";

// ===============================
// 1. CURSOS DEL ESTUDIANTE
// ===============================
export const getCursosEstudiante = async (req, res) => {
  try {
    const id_estudiante = req.params.id;

    const cursos = await Curso.findAll({
      include: [
        {
          model: User,
          as: "profesor", // ⬅️ alias correcto
          attributes: ["id", "nombre", "apellido", "correo"]
        },
        {
          model: User,
          as: "estudiantes", // ⬅️ alias correcto
          attributes: [],
          through: { where: { id_estudiante } }
        }
      ]
    });

    res.json(cursos);
  } catch (error) {
    console.error("❌ ERROR getCursosEstudiante:", error);
    res.status(500).json({ message: "Error obteniendo cursos", error });
  }
};

// ===============================
// 2. ACTIVIDADES DEL ESTUDIANTE
// ===============================
export const getActividadesEstudiante = async (req, res) => {
  try {
    const id_estudiante = req.params.id;

    const actividades = await Actividad.findAll({
      include: [
        {
          model: Curso,
          include: [
            {
              model: User,
              as: "estudiantes",
              attributes: [],
              through: { where: { id_estudiante } }
            }
          ]
        }
      ]
    });

    res.json(actividades);
  } catch (error) {
    console.error("❌ ERROR getActividadesEstudiante:", error);
    res.status(500).json({ message: "Error obteniendo actividades", error });
  }
};

// ===============================
// 3. NOTAS DEL ESTUDIANTE
// ===============================
export const getNotasEstudiante = async (req, res) => {
  try {
    const id_estudiante = req.params.id;

    const notas = await Nota.findAll({
      where: { id_estudiante },
      include: [
        {
          model: Actividad,
          attributes: ["id", "nombre", "tipo", "porcentaje"],
          include: [
            {
              model: Curso,
              attributes: ["id", "nombre", "semestre", "grupo"],
              include: [
                {
                  model: User,
                  as: "profesor",
                  attributes: ["id", "nombre", "apellido"]
                }
              ]
            }
          ]
        }
      ]
    });

    res.json(notas);
  } catch (error) {
    console.error("❌ ERROR getNotasEstudiante:", error);
    res.status(500).json({ message: "Error obteniendo notas", error });
  }
};
