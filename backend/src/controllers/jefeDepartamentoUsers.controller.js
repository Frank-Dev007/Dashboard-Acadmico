import {
  getCategories,
  getCoursesByCategory,
  getCourseEnrolledUsers,
} from "../services/moodle.service.js";
import { getUserMeaningfulActivity } from "../services/moodleDb.service.js";

// GET /api/moodle/jefe-departamento/users?categoryName=Ingenieria%20de%20sistemas
//
// Devuelve la lista de usuarios únicos (estudiantes y profesores) del
// departamento, deduplicados por id. Si un usuario es profesor en algún curso
// y estudiante en otro, prevalece el rol de profesor.
export const getJefeDepartamentoUsers = async (req, res) => {
  try {
    const { categoryName } = req.query;
    if (!categoryName) {
      return res.status(400).json({ ok: false, msg: "categoryName requerido" });
    }

    const target = String(categoryName).toLowerCase().trim();
    const allCategories = await getCategories();
    const category = allCategories.find(
      (c) => (c.name ?? "").toLowerCase().trim() === target
    );

    if (!category) {
      return res
        .status(404)
        .json({ ok: false, msg: `Categoría "${categoryName}" no encontrada` });
    }

    const courses = await getCoursesByCategory(category.id);

    // userId → { id, nombre, correo, role, lastaccess }
    const userMap = new Map();

    for (const course of courses) {
      let users = [];
      try {
        users = await getCourseEnrolledUsers(course.id);
      } catch (err) {
        console.warn(`⚠️ Curso ${course.id}:`, err.message);
        continue;
      }

      for (const u of users) {
        const roles = u.roles ?? [];
        const isTeacher = roles.some(
          (r) => r.shortname === "editingteacher" || r.shortname === "teacher"
        );
        const isStudent = roles.some((r) => r.shortname === "student");

        if (!isTeacher && !isStudent) continue;

        const role = isTeacher ? "teacher" : "student";
        const existing = userMap.get(u.id);

        // Si ya está como profesor, no degradar a estudiante
        if (existing && existing.role === "teacher" && role === "student") {
          continue;
        }

        userMap.set(u.id, {
          id: u.id,
          nombre:
            u.fullname ||
            `${u.firstname ?? ""} ${u.lastname ?? ""}`.trim() ||
            `Usuario ${u.id}`,
          correo: u.email ?? "",
          role,
          lastaccess: Number(u.lastaccess) || 0,
        });
      }
    }

    const usersList = Array.from(userMap.values()).sort((a, b) => {
      // Profesores primero, luego estudiantes; alfabético dentro de cada grupo
      if (a.role !== b.role) return a.role === "teacher" ? -1 : 1;
      return a.nombre.localeCompare(b.nombre);
    });

    // Para cada usuario, calcular último acceso significativo y duración
    // promedio de sesión basado en los criterios por rol (BD de Moodle).
    const courseIds = courses.map((c) => c.id);

    for (const u of usersList) {
      try {
        const act = await getUserMeaningfulActivity(u.id, u.role, courseIds);

        // Sobrescribir lastaccess con el timestamp del último movimiento relevante
        u.lastaccess = act.lastAccess;

        // Duración promedio de sesión en horas
        u.avgSessionHours = act.avgSessionHours;
      } catch (err) {
        console.warn(`⚠️ Actividad usuario ${u.id}:`, err.message);
        u.avgSessionHours = 0;
      }
    }

    return res.json({
      ok: true,
      categoryId: category.id,
      categoryName: category.name,
      users: usersList,
    });
  } catch (error) {
    console.error("❌ Error jefe-departamento users:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener usuarios" });
  }
};
