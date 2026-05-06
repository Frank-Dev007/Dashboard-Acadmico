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

// Devuelve las calificaciones finales del usuario en cada curso inscrito.
// Usado como fallback; no incluye grademax.
export const getUserGradesOverview = async (userid) => {
  const result = await callWS("gradereport_overview_get_course_grades", { userid });
  return result?.grades ?? [];
};

// Devuelve los ítems de calificación de un usuario en un curso específico.
// El ítem con itemtype="course" es el total del curso e incluye grademax.
export const getUserGradeItemsInCourse = async (userid, courseid) => {
  const result = await callWS("gradereport_user_get_grade_items", { userid, courseid });
  return result?.usergrades?.[0]?.gradeitems ?? [];
};

// Devuelve todas las assignments (tareas) de los cursos pasados con sus
// fechas de entrega (duedate, allowsubmissionsfromdate, etc.)
export const getCourseAssignments = async (courseids = []) => {
  const params = {};
  courseids.forEach((id, i) => {
    params[`courseids[${i}]`] = id;
  });
  const result = await callWS("mod_assign_get_assignments", params);
  return result?.courses ?? [];
};

// Estado de entrega del usuario en una assignment específica
// Devuelve { lastattempt, feedback, ... } y submission con su status
export const getAssignmentStatus = async (assignid, userid) => {
  return callWS("mod_assign_get_submission_status", { assignid, userid });
};

// Devuelve los quizzes de los cursos dados con su fecha límite (timeclose).
// timeclose = 0 significa sin límite de tiempo.
export const getCourseQuizzes = async (courseids = []) => {
  const params = {};
  courseids.forEach((id, i) => {
    params[`courseids[${i}]`] = id;
  });
  const result = await callWS("mod_quiz_get_quizzes_by_courses", params);
  return result?.quizzes ?? [];
};

// Devuelve los intentos de un usuario en un quiz específico.
// status: "all" | "finished" | "unfinished"
export const getQuizUserAttempts = async (quizid, userid, status = "all") => {
  const result = await callWS("mod_quiz_get_user_attempts", {
    quizid,
    userid,
    status,
    includepreviews: 0,
  });
  return result?.attempts ?? [];
};

// Devuelve los foros de los cursos dados.
export const getCourseForums = async (courseids = []) => {
  const params = {};
  courseids.forEach((id, i) => {
    params[`courseids[${i}]`] = id;
  });
  const result = await callWS("mod_forum_get_forums_by_courses", params);
  return Array.isArray(result) ? result : [];
};

// Devuelve los debates de un foro. Intenta primero la versión nueva
// (Moodle 4.0+) y cae a la paginada (Moodle 3.x) si la primera no existe.
export const getForumDiscussions = async (forumid) => {
  try {
    const result = await callWS("mod_forum_get_forum_discussions", {
      forumid,
      sortorder: -1,
      page: 0,
      perpage: 0,
    });
    return result?.discussions ?? [];
  } catch (err) {
    if (err.errorcode === "invalidrecord" || err.errorcode === "accessexception" || /not exist|función|function/i.test(err.message ?? "")) {
      const result = await callWS("mod_forum_get_forum_discussions_paginated", {
        forumid,
        sortby: "timemodified",
        sortdirection: "DESC",
        page: 0,
        perpage: 0,
      });
      return result?.discussions ?? [];
    }
    throw err;
  }
};

// Devuelve los posts de un debate específico.
export const getDiscussionPosts = async (discussionid) => {
  const result = await callWS("mod_forum_get_discussion_posts", { discussionid });
  return result?.posts ?? [];
};
