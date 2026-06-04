import {
  getUserToken,
  getUserByUsername,
  getUserCourses,
  getCourseEnrolledUsers,
  getSiteInfo,
} from "../services/moodle.service.js";
import { MOODLE_ADMIN_TOKEN } from "../config/moodle.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TTL_SEC,
  REFRESH_TTL_SEC,
} from "../config/jwt.js";
import {
  storeRefresh,
  isRefreshActive,
  revokeRefresh,
} from "../services/tokenStore.js";

// Genera access + refresh tokens para un usuario y registra el refresh en el store.
const issueTokens = async (user) => {
  const payload = {
    sub: user.id,
    role: user.tipo_usuario,
    username: user.username,
    nombre: user.nombre,
  };
  const accessToken = signToken(payload, JWT_ACCESS_SECRET, ACCESS_TTL_SEC);
  const refreshToken = signToken(
    { sub: user.id, role: user.tipo_usuario },
    JWT_REFRESH_SECRET,
    REFRESH_TTL_SEC
  );
  // Registrar el jti del refresh para poder invalidarlo luego
  const decoded = verifyToken(refreshToken, JWT_REFRESH_SECRET);
  await storeRefresh(user.id, decoded.jti, REFRESH_TTL_SEC);
  return { accessToken, refreshToken };
};

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

    // ── Usuario centinela: Jefe de Departamento (no existe en Moodle) ────────
    if (username === "jefedepsistema" && password === "jefe123*") {
      const user = {
        id: 0,
        nombre: "Jefe",
        apellido: "de Departamento",
        correo: "jefedep@sistema.local",
        tipo_usuario: "jefe",
        username: "jefedepsistema",
        avatar: null,
      };
      const tokens = await issueTokens(user);
      return res.json({
        ok: true,
        msg: "Login exitoso",
        moodleToken: null,
        ...tokens,
        user,
      });
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

    const user = {
      id: userProfile?.id ?? null,
      nombre: userProfile?.firstname ?? username,
      apellido: userProfile?.lastname ?? "",
      correo: userProfile?.email ?? "",
      tipo_usuario,
      username,
      avatar: userProfile?.profileimageurl ?? null,
    };

    const tokens = await issueTokens(user);

    return res.json({
      ok: true,
      msg: "Login exitoso",
      moodleToken,
      ...tokens,
      user,
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

// POST /api/auth/refresh
// Body: { refreshToken }. Devuelve un nuevo accessToken (rotando opcionalmente el refresh).
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, msg: "Falta refreshToken" });
    }

    let payload;
    try {
      payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        ok: false,
        msg: err.expired ? "Refresh token expirado" : "Refresh token inválido",
        code: err.expired ? "REFRESH_EXPIRED" : "REFRESH_INVALID",
      });
    }

    // El refresh debe seguir activo en el store (no revocado)
    const active = await isRefreshActive(payload.sub, payload.jti);
    if (!active) {
      return res
        .status(401)
        .json({ ok: false, msg: "Sesión revocada", code: "REFRESH_REVOKED" });
    }

    // Rotación: revocar el refresh usado y emitir uno nuevo
    await revokeRefresh(payload.sub, payload.jti);
    const newRefresh = signToken(
      { sub: payload.sub, role: payload.role },
      JWT_REFRESH_SECRET,
      REFRESH_TTL_SEC
    );
    const decoded = verifyToken(newRefresh, JWT_REFRESH_SECRET);
    await storeRefresh(payload.sub, decoded.jti, REFRESH_TTL_SEC);

    const accessToken = signToken(
      { sub: payload.sub, role: payload.role },
      JWT_ACCESS_SECRET,
      ACCESS_TTL_SEC
    );

    return res.json({ ok: true, accessToken, refreshToken: newRefresh });
  } catch (error) {
    console.error("❌ Error refresh:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al renovar el token" });
  }
};

// POST /api/auth/logout
// Body: { refreshToken }. Revoca el refresh token (cierra la sesión).
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const payload = verifyToken(refreshToken, JWT_REFRESH_SECRET);
        await revokeRefresh(payload.sub, payload.jti);
      } catch {
        // token ya inválido/expirado → nada que revocar
      }
    }
    return res.json({ ok: true, msg: "Sesión cerrada" });
  } catch (error) {
    console.error("❌ Error logout:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al cerrar sesión" });
  }
};

// GET /api/auth/me  (requiere verifyJWT) → devuelve el payload del token actual
export const me = async (req, res) => {
  return res.json({ ok: true, user: req.user });
};
