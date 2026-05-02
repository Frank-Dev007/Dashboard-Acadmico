import User from "../models/User.js";

// --------------------------------------------
// LOGIN SIN BCRYPT (contraseñas en texto plano)
// --------------------------------------------
export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { correo } });

    if (!user) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Comparación REAL según tu BD
    if (user.password.trim() !== password.trim()) {
      return res.status(400).json({ ok: false, msg: "Contraseña incorrecta" });
    }

    // Respuesta final
    return res.json({
      ok: true,
      msg: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario,
        correo: user.correo,
      },
    });

  } catch (error) {
    console.error("🔥 ERROR LOGIN:", error);
    return res.status(500).json({ ok: false, msg: "Error en el servidor" });
  }
};
