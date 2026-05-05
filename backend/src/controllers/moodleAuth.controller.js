import {
  getUserToken,
  getUserByUsername,
  getUserCourses,
} from "../services/moodle.service.js";

// Determina el rol buscando en los roles de sus cursos inscritos.
// En Moodle los roles son por curso, no por sitio, por eso usamos
// core_enrol_get_users_courses que devuelve roles[] por cada curso.
const resolveRoleFromCourses = (courses) => {
  const allRoles = (courses ?? []).flatMap((c) =>
    (c.roles ?? []).map((r) => r.shortname)
  );
  console.log("🎭 Roles en cursos:", allRoles);

  if (allRoles.some((r) => ["manager", "coursecreator"].includes(r)))
    return "admin";
  if (allRoles.some((r) => ["editingteacher", "teacher"].includes(r)))
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

    // Paso 1: validar credenciales → token personal
    console.log("🔐 Autenticando usuario:", username);
    const moodleToken = await getUserToken(username, password);
    console.log("✅ Token obtenido");

    // Paso 2: perfil básico con token de admin (email, nombre, id)
    let userProfile = null;
    try {
      userProfile = await getUserByUsername(username);
      console.log("✅ Perfil:", userProfile?.id, userProfile?.email);
    } catch (err) {
      console.warn("⚠️ Perfil no disponible:", err.message);
    }

    // Paso 3: cursos del usuario para detectar su rol real
    let tipo_usuario = "estudiante";
    if (userProfile?.id) {
      try {
        const courses = await getUserCourses(userProfile.id);
        console.log(`📚 Cursos encontrados: ${courses.length}`);
        tipo_usuario = resolveRoleFromCourses(courses);
      } catch (err) {
        console.warn("⚠️ No se pudieron obtener cursos:", err.message);
      }
    }

    console.log("✅ Rol detectado:", tipo_usuario);

    return res.json({
      ok: true,
      msg: "Login exitoso",
      moodleToken,
      user: {
        id: userProfile?.id ?? null,
        nombre: userProfile?.firstname ?? username,
        apellido: userProfile?.lastname ?? "",
        correo: userProfile?.email ?? "",
        tipo_usuario,
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
