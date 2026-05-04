import {
  getUserToken,
  getUserByUsername,
} from "../services/moodle.service.js";

const resolveRole = (moodleUser) => {
  const customField = moodleUser?.customfields?.find(
    (f) => f.shortname === "tipo_usuario"
  );
  if (customField?.value) return customField.value;

  const roles = (moodleUser?.roles ?? []).map((r) => r.shortname);
  if (roles.some((r) => ["manager", "coursecreator"].includes(r)))
    return "admin";
  if (roles.some((r) => ["editingteacher", "teacher"].includes(r)))
    return "docente";

  return "estudiante";
};

// POST /api/auth/login
// Body: { username, password }
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, msg: "Faltan datos" });
    }

    // Paso 1: validar credenciales contra Moodle → obtener token personal
    console.log("🔐 Autenticando usuario:", username);
    const moodleToken = await getUserToken(username, password);
    console.log("✅ Token obtenido");

    // Paso 2: obtener perfil completo con token de admin
    console.log("🔍 Obteniendo perfil de:", username);
    let userProfile = null;
    try {
      userProfile = await getUserByUsername(username);
      console.log("✅ Perfil obtenido:", userProfile?.id, userProfile?.email);
    } catch (profileError) {
      console.warn("⚠️ No se pudo obtener perfil completo:", profileError.message);
    }

    return res.json({
      ok: true,
      msg: "Login exitoso",
      moodleToken,
      user: {
        id: userProfile?.id ?? null,
        nombre: userProfile?.firstname ?? username,
        apellido: userProfile?.lastname ?? "",
        correo: userProfile?.email ?? "",
        tipo_usuario: resolveRole(userProfile),
        username,
        avatar: userProfile?.profileimageurl ?? null,
      },
    });
  } catch (error) {
    console.error("❌ ERROR LOGIN MOODLE:", error.message, "| errorcode:", error.errorcode);

    const isInvalidLogin =
      error.errorcode === "invalidlogin" ||
      error.message?.toLowerCase().includes("invalid login");

    return res.status(isInvalidLogin ? 401 : 500).json({
      ok: false,
      msg: isInvalidLogin
        ? "Usuario o contraseña incorrectos"
        : "Error al conectar con Moodle",
    });
  }
};
