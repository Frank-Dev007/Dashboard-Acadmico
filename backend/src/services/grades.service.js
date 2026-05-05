import {
  getUserGradeItemsInCourse,
  getCourseAssignments,
  getCourseQuizzes,
} from "./moodle.service.js";

export const UNIVERSITY_MAX = 5;

const toUniversityScale = (raw, max) => {
  if (isNaN(raw) || isNaN(max) || max <= 0) return null;
  return Math.min(UNIVERSITY_MAX, Math.max(0, (raw / max) * UNIVERSITY_MAX));
};

// Calcula el promedio del curso para un usuario:
// - Items con nota → normalizados a escala 0-5
// - Items sin nota con fecha límite ya vencida → 0 (no entregado = cero)
// - Items sin nota con fecha límite futura o sin fecha → pendientes
//
// Aplica a: assignments, quizzes y cualquier módulo gradable.
// Devuelve { promedio, pendingCount }
export const computeCourseStats = async (userid, courseid) => {
  const items = await getUserGradeItemsInCourse(userid, courseid);
  const now = Math.floor(Date.now() / 1000);

  const gradableItems = items.filter(
    (it) => it.itemtype === "mod" && it.grademax != null && it.grademax > 0
  );

  // Mapa de deadlines por módulo: { assign: Map<id, duedate>, quiz: Map<id, timeclose> }
  const deadlineByModule = { assign: new Map(), quiz: new Map() };

  try {
    const assignCourses = await getCourseAssignments([courseid]);
    for (const a of assignCourses[0]?.assignments ?? []) {
      deadlineByModule.assign.set(a.id, a.duedate ?? 0);
    }
  } catch { /* sin assignments */ }

  try {
    const quizzes = await getCourseQuizzes([courseid]);
    for (const q of quizzes) {
      deadlineByModule.quiz.set(q.id, q.timeclose ?? 0);
    }
  } catch { /* sin quizzes o función no habilitada */ }

  const normalizedScores = [];
  let pendingCount = 0;

  for (const item of gradableItems) {
    const max = parseFloat(item.grademax);
    const raw = parseFloat(item.graderaw ?? item.grade);

    if (!isNaN(raw)) {
      const norm = toUniversityScale(raw, max);
      if (norm !== null) normalizedScores.push(norm);
      continue;
    }

    // Sin nota: buscar fecha límite según el tipo de módulo
    const moduleMap = deadlineByModule[item.itemmodule];
    const due = moduleMap ? (moduleMap.get(item.iteminstance) ?? 0) : 0;
    const deadlinePassed = due > 0 && now > due;

    if (deadlinePassed) {
      normalizedScores.push(0);
    } else {
      pendingCount++;
    }
  }

  const promedio =
    normalizedScores.length > 0
      ? normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length
      : null;

  return { promedio, pendingCount };
};
