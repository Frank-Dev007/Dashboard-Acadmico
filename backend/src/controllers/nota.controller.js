import { Nota, Actividad, User } from "../models/index.js";

// Obtener todas las notas
export const getNotas = async (req, res) => {
  try {
    const notas = await Nota.findAll({
      include: [
        {
          model: Actividad,
          attributes: ["id", "nombre", "tipo", "porcentaje"],
        },
        {
          model: User,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
      ],
    });

    return res.json(notas);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener notas", error });
  }
};

// Obtener nota por ID
export const getNotaById = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id, {
      include: [
        {
          model: Actividad,
          attributes: ["id", "nombre", "tipo", "porcentaje"],
        },
        {
          model: User,
          attributes: ["id", "nombre", "apellido", "correo"],
        },
      ],
    });

    if (!nota) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    return res.json(nota);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener nota", error });
  }
};

// Crear nota
export const createNota = async (req, res) => {
  try {
    const { id_estudiante, id_actividad, nota } = req.body;

    // Validar estudiante
    const estudiante = await User.findByPk(id_estudiante);
    if (!estudiante || estudiante.tipo_usuario !== "estudiante") {
      return res
        .status(400)
        .json({ message: "El estudiante no existe o no es estudiante" });
    }

    // Validar actividad
    const actividad = await Actividad.findByPk(id_actividad);
    if (!actividad) {
      return res.status(400).json({ message: "La actividad no existe" });
    }

    const nuevaNota = await Nota.create({
      id_estudiante,
      id_actividad,
      nota,
    });

    return res.json(nuevaNota);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear nota", error });
  }
};

// Actualizar nota
export const updateNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id);

    if (!nota) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    await nota.update(req.body);

    return res.json({ message: "Nota actualizada", nota });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar nota", error });
  }
};

// Eliminar nota
export const deleteNota = async (req, res) => {
  try {
    const nota = await Nota.findByPk(req.params.id);

    if (!nota) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    await nota.destroy();

    return res.json({ message: "Nota eliminada" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar nota", error });
  }
};
