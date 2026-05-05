import {
  getUserToken,
  getUserByUsername,
  getUserCourses,
  getCourseEnrolledUsers,
} from "../services/moodle.service.js";

// Detecta el rol buscando al usuario en la lista de inscritos del primer
// curso que tenga. core_enrol_get_enrolled_users sí devuelve roles[] por usuario.
const detectRole = async (userid, courses) => {
  if (!courses.length) return "estudiante";

  const courseid = courses[0].id;
  const enrolledUsers = await getCourseEnrolledUsers(courseid);
  const me = enrolledUsers.find((u) => u.id === userid);
  const myRoles = (me?.roles ?? []).map((r) => r.shortname);

  console.log("🎭 Mis roles en el curso:", myRoles);

  if (myRoles.some((r) => ["manager", "coursecreator"].includes(r)))
    return "admin";
  if (myRoles.some((r) => ["editingteacher", "teacher"].includes(r)))
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
    const moodleToken = await getUserToken(username, password);

    // Paso 2: perfil con token de admin (nombre, email, id)
    let userProfile = null;
    try {
      userProfile = await getUserByUsername(username);
      console.log("✅ Perfil:", userProfile?.id, userProfile?.email);
    } catch (err) {
      console.warn("⚠️ Perfil no disponible:", err.message);
    }

    // Paso 3: detectar rol real a partir de los cursos del usuario
    let tipo_usuario = "estudiante";
    if (userProfile?.id) {
      try {
        const courses = await getUserCourses(userProfile.id);
        console.log(`📚 Cursos: ${courses.length}`);
        tipo_usuario = await detectRole(userProfile.id, courses);
      } catch (err) {
        console.warn("⚠️ No se pudo detectar rol:", err.message);
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
    console.error("❌ ERROR LOGIN:", error.message, "| errorcode:", error.errorcode);

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
