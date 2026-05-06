import {
  getUserCourses,
  getCourseAssignments,
  getAssignmentStatus,
  getCourseQuizzes,
  getQuizUserAttempts,
  getCourseForums,
  getForumDiscussions,
  getDiscussionPosts,
} from "../services/moodle.service.js";

// GET /api/moodle/student/participation?userId=X
//
// Estrategia por tipo de actividad:
//   - Assignments : getCourseAssignments + getAssignmentStatus  → detecta entregas y tardías
//   - Quizzes     : getCourseQuizzes + getQuizUserAttempts      → detecta intentos terminados
//   - Foros       : getCourseForums + getForumDiscussions + getDiscussionPosts
//                   Cuenta como participación si el estudiante creó un debate o
//                   escribió cualquier post dentro de un debate existente.
export const getStudentParticipation = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);

    const cursosDetalle = [];
    const timelineItems = [];

    let totalEntregas = 0;
    let totalForos = 0;
    let entregasATiempo = 0;
    let entregasTardias = 0;
    let noEntregadas = 0;

    const now = Math.floor(Date.now() / 1000);

    for (const course of courses) {
      const courseName = course.fullname || course.shortname;

      let courseEntregas = 0;
      let courseForos = 0;
      let courseEvaluaciones = 0;

      // ── ASSIGNMENTS ────────────────────────────────────────────────────────
      try {
        const assignCourses = await getCourseAssignments([course.id]);
        const assignments = assignCourses[0]?.assignments ?? [];

        for (const assign of assignments) {
          try {
            const statusRes = await getAssignmentStatus(assign.id, uid);
            const submission = statusRes?.lastattempt?.submission;

            // "submitted" o "graded" significan que el estudiante entregó
            const submitted =
              submission?.status === "submitted" ||
              submission?.status === "graded";

            if (!submitted) {
              // No entregada: si la fecha límite ya venció, cuenta como "No entregada"
              const duedate = assign.duedate ?? 0;
              if (duedate > 0 && now > duedate) {
                noEntregadas++;
                timelineItems.push({
                  tipo: "assignment",
                  titulo: assign.name || "Tarea",
                  curso: courseName,
                  fecha: duedate * 1000,
                  estado: "missed",
                });
              }
              continue;
            }

            courseEntregas++;
            totalEntregas++;

            const submitTime =
              submission.timemodified || submission.timecreated || 0;
            const duedate = assign.duedate ?? 0;
            const isLate =
              duedate > 0 && submitTime > 0 && submitTime > duedate;

            if (isLate) entregasTardias++;
            else entregasATiempo++;

            if (submitTime > 0) {
              timelineItems.push({
                tipo: "assignment",
                titulo: assign.name || "Tarea",
                curso: courseName,
                fecha: submitTime * 1000,
                estado: isLate ? "late" : "completed",
              });
            }
          } catch {
            // La assignment puede no tener entrega de este usuario — normal
          }
        }
      } catch (err) {
        console.warn(`⚠️ Assignments curso ${course.id}:`, err.message);
      }

      // ── QUIZZES ────────────────────────────────────────────────────────────
      try {
        const quizzes = await getCourseQuizzes([course.id]);

        for (const quiz of quizzes) {
          try {
            const attempts = await getQuizUserAttempts(quiz.id, uid);
            // Un intento está terminado si state === "finished"
            const finished = attempts.filter((a) => a.state === "finished");

            if (finished.length === 0) {
              // No realizado: si la fecha de cierre ya pasó, cuenta como "No entregada"
              const timeclose = quiz.timeclose ?? 0;
              if (timeclose > 0 && now > timeclose) {
                noEntregadas++;
                timelineItems.push({
                  tipo: "quiz",
                  titulo: quiz.name || "Evaluación",
                  curso: courseName,
                  fecha: timeclose * 1000,
                  estado: "missed",
                });
              }
              continue;
            }

            courseEvaluaciones++;

            // Último intento terminado
            const last = finished[finished.length - 1];
            const finishTime = last.timefinish ?? 0;

            if (finishTime > 0) {
              timelineItems.push({
                tipo: "quiz",
                titulo: quiz.name || "Evaluación",
                curso: courseName,
                fecha: finishTime * 1000,
                estado: "completed",
              });
            }
          } catch {
            // El quiz puede no tener intentos — normal
          }
        }
      } catch (err) {
        console.warn(`⚠️ Quizzes curso ${course.id}:`, err.message);
      }

      // ── FOROS ──────────────────────────────────────────────────────────────
      // Para cada foro del curso revisamos los debates y los posts.
      // Se cuenta como participado si el usuario creó un debate o escribió un post.
      try {
        const forums = await getCourseForums([course.id]);
        console.log(`📋 [${courseName}] foros encontrados: ${forums.length}`);

        for (const forum of forums) {
          const forumName = forum.name || "Foro";
          let participated = false;
          let firstParticipationTime = 0;

          try {
            const discussions = await getForumDiscussions(forum.id);
            console.log(`   ├─ Foro "${forumName}" (id=${forum.id}): ${discussions.length} debates`);

            for (const disc of discussions) {
              // Normalizar el id del debate y el id del autor (pueden venir como string)
              const discAuthorId = Number(disc.userid);
              const discId = Number(disc.discussion ?? disc.id);

              if (discAuthorId === uid) {
                participated = true;
                const t = Number(disc.created || disc.timemodified || 0);
                console.log(`   │  ✅ debate creado por uid=${uid} (disc=${discId}, t=${t})`);
                if (t > 0 && (firstParticipationTime === 0 || t < firstParticipationTime)) {
                  firstParticipationTime = t;
                }
              }

              // Revisar también los posts (respuestas) del debate
              try {
                const posts = await getDiscussionPosts(discId);
                for (const post of posts) {
                  const postAuthorId = Number(post.userid ?? post.author?.id ?? 0);
                  if (postAuthorId === uid) {
                    participated = true;
                    const t = Number(post.timecreated || post.created || 0);
                    if (t > 0 && (firstParticipationTime === 0 || t < firstParticipationTime)) {
                      firstParticipationTime = t;
                    }
                  }
                }
              } catch (errPosts) {
                console.warn(`   │  ⚠️ posts disc=${discId}:`, errPosts.message);
              }
            }
          } catch (errDisc) {
            console.warn(`   ├─ ⚠️ debates foro=${forum.id}:`, errDisc.message);
          }

          if (participated) {
            courseForos++;
            totalForos++;
            console.log(`   └─ ✅ "${forumName}" contado para uid=${uid}`);

            if (firstParticipationTime > 0) {
              timelineItems.push({
                tipo: "forum",
                titulo: forumName,
                curso: courseName,
                fecha: firstParticipationTime * 1000,
                estado: "completed",
              });
            }
          }
        }
      } catch (err) {
        console.warn(`⚠️ Foros curso ${course.id}:`, err.message);
      }

      // El total son las actividades que el estudiante REALMENTE hizo
      // (suma de entregas + foros + evaluaciones), para que los números cuadren.
      const courseTotalActividades =
        courseEntregas + courseForos + courseEvaluaciones;

      cursosDetalle.push({
        id: course.id,
        nombre: courseName,
        entregas: courseEntregas,
        foros: courseForos,
        evaluaciones: courseEvaluaciones,
        completadas: courseTotalActividades,
        totalActividades: courseTotalActividades,
      });
    }

    timelineItems.sort((a, b) => b.fecha - a.fecha);

    return res.json({
      ok: true,
      totalEntregas,
      totalForos,
      entregasATiempo,
      entregasTardias,
      noEntregadas,
      cursos: cursosDetalle,
      timeline: timelineItems.slice(0, 20),
    });
  } catch (error) {
    console.error("❌ Error participation:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al obtener participación" });
  }
};
