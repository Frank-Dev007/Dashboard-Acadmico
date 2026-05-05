import {
  getUserToken,
  getUserByUsername,
  getUserCourses,
  getCourseEnrolledUsers,
  getSiteInfo,
} from "../services/moodle.service.js";
import { MOODLE_ADMIN_TOKEN } from "../config/moodle.js";

// ─── Paso A: detectar admin ───────────────────────────────────────────────────
// Estrategia 1: getSiteInfo con el token del propio usuario → siteadmin: 1
// Estrategia 2: getSiteInfo con el MOODLE_ADMIN_TOKEN → comparar userid
//   (funciona cuando el token de servicio pertenece al mismo usuario admin)
const detectAdmin = async (moodleToken, userId) => {
  // Estrategia 1
  try {
    const info = await getSiteInfo(moodleToken);
    console.log("🏠 siteadmin (user token):", info?.siteadmin, "| userid:", info?.userid);
    if (info?.siteadmin) return true;
  } catch (e) {
    console.log("ℹ️ getSiteInfo (user token) falló:", e.message);
  }

  // Estrategia 2
  try {
    const adminInfo = await getSiteInfo(MOODLE_ADMIN_TOKEN);
    console.log("🔑 Admin userid (service token):", adminInfo?.userid, "| User id:", userId);
    if (adminInfo?.userid && adminInfo.userid === userId) return true;
  } catch (e) {
    console.log("ℹ️ getSiteInfo (admin token) falló:", e.message);
  }

  return false;
};

// ─── Paso B: detectar docente por roles en cursos ────────────────────────────
const detectRoleFromCourses = async (userid, courses) => {
  if (!courses.length) return "estudiante";

  const courseid = courses[0].id;
  const enrolledUsers = await getCourseEnrolledUsers(courseid);
  const me = enrolledUsers.find((u) => u.id === userid);
  const myRoles = (me?.roles ?? []).map((r) => r.shortname);

  console.log("🎭 Roles en el curso:", myRoles);

  if (myRoles.some((r) => ["editingteacher", "teacher"].includes(r))) return "docente";
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

    // 1. Validar credenciales → token personal
    const moodleToken = await getUserToken(username, password);

    // 2. Perfil con token de admin (nombre, email, id)
    let userProfile = null;
    try {
      userProfile = await getUserByUsername(username);
      console.log("✅ Perfil:", userProfile?.id, userProfile?.email);
    } catch (err) {
      console.warn("⚠️ Perfil no disponible:", err.message);
    }

    // 3. Determinar rol
    let tipo_usuario = "estudiante";

    const isAdmin = await detectAdmin(moodleToken, userProfile?.id);
    if (isAdmin) {
      tipo_usuario = "admin";
    } else if (userProfile?.id) {
      try {
        const courses = await getUserCourses(userProfile.id);
        console.log(`📚 Cursos: ${courses.length}`);
        tipo_usuario = await detectRoleFromCourses(userProfile.id, courses);
      } catch (err) {
        console.warn("⚠️ No se pudo detectar rol por cursos:", err.message);
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
