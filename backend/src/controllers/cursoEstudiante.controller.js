import { Curso, User, CursoEstudiante } from "../models/index.js";

// ================================================
// Agregar estudiante a un curso
// ================================================
export const agregarEstudiante = async (req, res) => {
  try {
    const { id_curso, id_estudiante } = req.body;

    if (!id_curso || !id_estudiante) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Validar curso
    const curso = await Curso.findByPk(id_curso);
    if (!curso) {
      return res.status(404).json({ message: "El curso no existe." });
    }

    // Validar estudiante
    const estudiante = await User.findByPk(id_estudiante);
    if (!estudiante || estudiante.tipo_usuario !== "estudiante") {
      return res.status(404).json({ message: "El usuario no es un estudiante." });
    }

    // Validar si ya está en el curso
    const yaEsta = await CursoEstudiante.findOne({
      where: { id_curso, id_estudiante },
    });

    if (yaEsta) {
      return res.status(400).json({ message: "El estudiante ya está registrado en este curso." });
    }

    // Guardar relación
    await CursoEstudiante.create({ id_curso, id_estudiante });

    return res.json({ message: "Estudiante agregado correctamente." });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Error al agregar estudiante.", error });
  }
};

// ================================================
// Listar estudiantes de un curso
// ================================================
export const obtenerEstudiantesDelCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;

    const curso = await Curso.findByPk(id_curso);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    const estudiantes = await curso.getUsers({
      attributes: ["id", "nombre", "apellido", "correo"],
      joinTableAttributes: [],
    });

    return res.json(estudiantes);

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Error al obtener estudiantes.", error });
  }
};

// ================================================
// Eliminar estudiante del curso
// ================================================
export const eliminarEstudianteDelCurso = async (req, res) => {
  try {
    const { id_curso, id_estudiante } = req.params;

    const registro = await CursoEstudiante.findOne({
      where: { id_curso, id_estudiante },
    });

    if (!registro) {
      return res.status(404).json({ message: "El estudiante no está en este curso." });
    }

    await registro.destroy();

    return res.json({ message: "Estudiante eliminado del curso." });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Error al eliminar estudiante.", error });
  }
};

// ================================================
// Obtener TODOS los cursos de un estudiante
// ================================================
export const obtenerCursosDeEstudiante = async (req, res) => {
  try {
    const { id_estudiante } = req.params;

    const estudiante = await User.findByPk(id_estudiante);
    if (!estudiante || estudiante.tipo_usuario !== "estudiante") {
      return res.status(404).json({ message: "Estudiante no encontrado." });
    }

    const cursos = await Curso.findAll({
      include: [
        {
          model: User,
          where: { id: id_estudiante },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: User,
          as: "docente",
          attributes: ["id", "nombre", "apellido", "correo"]
        }
      ],
      attributes: [
        "id",
        "codigo",
        "nombre",
        "grupo",
        "semestre",
        "estado"
      ]
    });

    return res.json(cursos);

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Error al obtener cursos del estudiante", error });
  }
};
