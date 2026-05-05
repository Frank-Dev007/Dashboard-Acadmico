import {
  MOODLE_BASE_URL,
  MOODLE_SERVICE,
  MOODLE_ADMIN_TOKEN,
} from "../config/moodle.js";

// ─────────────────────────────────────────────────
// Helper interno: llama a cualquier Web Service de Moodle
// ─────────────────────────────────────────────────
const callWS = async (wsfunction, params = {}, token = MOODLE_ADMIN_TOKEN) => {
  const url = new URL(`${MOODLE_BASE_URL}/webservice/rest/server.php`);
  url.searchParams.set("wstoken", token);
  url.searchParams.set("wsfunction", wsfunction);
  url.searchParams.set("moodlewsrestformat", "json");

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status} al llamar ${wsfunction}`);
  }

  const data = await res.json();

  if (data?.exception) {
    const err = new Error(data.message || data.exception);
    err.errorcode = data.errorcode;
    throw err;
  }

  return data;
};

// ─────────────────────────────────────────────────
// Autentica al usuario y devuelve su token personal
// Endpoint: /login/token.php
// ─────────────────────────────────────────────────
export const getUserToken = async (username, password) => {
  const body = new URLSearchParams({
    username,
    password,
    service: MOODLE_SERVICE,
  });

  console.log("🔐 Intentando login en Moodle:");
  console.log("   URL:", `${MOODLE_BASE_URL}/login/token.php`);
  console.log("   username:", username);
  console.log("   service:", MOODLE_SERVICE);

  const res = await fetch(`${MOODLE_BASE_URL}/login/token.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();

  console.log("📨 Respuesta de Moodle:", JSON.stringify(data));

  if (data.error) {
    const err = new Error(data.error);
    err.errorcode = data.errorcode || "invalidlogin";
    throw err;
  }

  return data.token;
};

// ─────────────────────────────────────────────────
// Obtiene info básica del sitio con el token del usuario
// Incluye: userid, username, firstname, lastname, userpictureurl
// ─────────────────────────────────────────────────
export const getSiteInfo = async (userToken) => {
  return callWS("core_webservice_get_site_info", {}, userToken);
};

// ─────────────────────────────────────────────────
// Obtiene el perfil completo del usuario con el token de admin
// ─────────────────────────────────────────────────
export const getUserByUsername = async (username) => {
  const result = await callWS("core_user_get_users_by_field", {
    field: "username",
    "values[0]": username,
  });

  return Array.isArray(result) ? result[0] ?? null : null;
};

// ─────────────────────────────────────────────────
// Obtiene los cursos en los que está inscrito el usuario.
// Cada curso incluye el array `roles` con el shortname del rol
// (editingteacher, teacher, student, etc.)
// ─────────────────────────────────────────────────
export const getUserCourses = async (userid) => {
  const result = await callWS("core_enrol_get_users_courses", { userid });
  return Array.isArray(result) ? result : [];
};

// Devuelve todos los usuarios inscritos en un curso con sus roles.
// Usamos esto para saber el rol exacto del usuario dentro del curso.
export const getCourseEnrolledUsers = async (courseid) => {
  const result = await callWS("core_enrol_get_enrolled_users", { courseid });
  return Array.isArray(result) ? result : [];
};
