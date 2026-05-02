import User from "../models/User.js";
import bcrypt from "bcrypt";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("🔥 ERROR getUsers:", error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    console.error("🔥 ERROR getUserById:", error);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
};

// Crear usuario (DOCENTE O ESTUDIANTE)
export const createUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo,
      password,
      documento,
      tipo_usuario,
      facultad,
      programa,
      estado
    } = req.body;

    // Validación
    if (!correo || !password || !documento || !tipo_usuario) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Encriptar password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nombre,
      apellido,
      correo,
      password: hashed,
      documento,
      tipo_usuario,
      facultad,
      programa,
      estado: estado ?? false
    });

    res.json(newUser);
  } catch (error) {
    console.error("🔥 ERROR AL CREAR USUARIO:", error);
    res.status(500).json({
      error: "Error creando usuario",
      detalle: error.message
    });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await user.update(req.body);

    res.json({ mensaje: "Usuario actualizado", user });
  } catch (error) {
    console.error("🔥 ERROR updateUser:", error);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await user.destroy();

    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error("🔥 ERROR deleteUser:", error);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
};
