import { Actividad, Curso } from "../models/index.js";

// Obtener actividades
export const getActividades = async (req, res) => {
  try {
    const actividades = await Actividad.findAll({
      include: [
        {
          model: Curso,
          attributes: ["id", "nombre", "semestre"],
        },
      ],
    });

    return res.json(actividades);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener actividades", error });
  }
};

// Obtener actividad por ID
export const getActividadById = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id, {
      include: [
        {
          model: Curso,
          attributes: ["id", "nombre", "semestre"],
        },
      ],
    });

    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    return res.json(actividad);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener actividad", error });
  }
};

// Crear actividad
export const createActividad = async (req, res) => {
  try {
    const { nombre, tipo, porcentaje, id_curso } = req.body;

    // Verificar que el curso exista
    const curso = await Curso.findByPk(id_curso);
    if (!curso) {
      return res.status(400).json({ message: "El curso no existe" });
    }

    const nuevaActividad = await Actividad.create({
      nombre,
      tipo,
      porcentaje,
      id_curso,
    });

    return res.json(nuevaActividad);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear actividad", error });
  }
};

// Actualizar actividad
export const updateActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);

    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    await actividad.update(req.body);

    return res.json({ message: "Actividad actualizada", actividad });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar actividad", error });
  }
};

// Eliminar actividad
export const deleteActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);

    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    await actividad.destroy();

    return res.json({ message: "Actividad eliminada" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar actividad", error });
  }
};
