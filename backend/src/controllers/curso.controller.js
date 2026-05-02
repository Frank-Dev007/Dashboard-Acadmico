import { Curso, User } from "../models/index.js";

// ============================================
// Obtener todos los cursos
// ============================================
export const getCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
      ],
    });

    return res.json(cursos);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener cursos", error });
  }
};

// ============================================
// Obtener curso por ID
// ============================================
export const getCursoById = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
      ],
    });

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    return res.json(curso);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener curso", error });
  }
};

// ============================================
// Obtener cursos por profesor
// ============================================
export const getCursosByProfesor = async (req, res) => {
  try {
    const { id_profesor } = req.params;

    const cursos = await Curso.findAll({
      where: { id_profesor },
      include: [
        {
          model: User,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
      ],
    });

    return res.json(cursos);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener cursos del profesor", error });
  }
};

// ============================================
// Crear curso
// ============================================
export const createCurso = async (req, res) => {
  try {
    const { nombre, semestre, grupo, id_profesor } = req.body;

    if (!nombre || !semestre || !grupo || !id_profesor) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar que el profesor exista
    const profesor = await User.findByPk(id_profesor);

    if (!profesor || profesor.tipo_usuario !== "docente") {
      return res
        .status(400)
        .json({ message: "El profesor no existe o no es docente" });
    }

    const nuevoCurso = await Curso.create({
      nombre,
      semestre,
      grupo,
      id_profesor,
    });

    return res.json(nuevoCurso);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear curso", error });
  }
};

// ============================================
// Actualizar curso
// ============================================
export const updateCurso = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    await curso.update(req.body);

    return res.json({ message: "Curso actualizado", curso });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar curso", error });
  }
};

// ============================================
// Eliminar curso
// ============================================
export const deleteCurso = async (req, res) => {
  try {
    const curso = await Curso.findByPk(req.params.id);

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    await curso.destroy();

    return res.json({ message: "Curso eliminado" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar curso", error });
  }
};
