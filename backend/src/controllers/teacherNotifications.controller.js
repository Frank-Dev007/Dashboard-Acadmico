import { computeRiskStudents } from "./teacherRiskMap.controller.js";
import {
  getTeacherSnapshot,
  saveTeacherSnapshot,
  clearUnread,
} from "../services/riskSnapshot.store.js";

// GET /api/moodle/teacher/notifications?userId=X
//
// Detecta transiciones a riesgo ALTO comparando el estado actual con el último
// snapshot guardado. Genera una alerta cuando un estudiante pasa de
// BAJO/MEDIO → ALTO. Devuelve las alertas no leídas para la campana del header.
export const getTeacherNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });
    const uid = parseInt(userId);

    const { students } = await computeRiskStudents(uid);
    const snapshot = await getTeacherSnapshot(uid);

    const prevLevels = snapshot.levels || {};
    const unread = snapshot.unread || [];
    const isFirstRun = Object.keys(prevLevels).length === 0;

    const newLevels = {};
    const nuevasAlertas = [];

    for (const s of students) {
      newLevels[s.id] = s.level;
      const prev = prevLevels[s.id];

      // Transición a ALTO desde un nivel anterior distinto de ALTO
      const subioAAlto = s.level === "high" && prev !== "high";

      // En el primer run solo establecemos la línea base (sin disparar alertas)
      if (subioAAlto && !isFirstRun) {
        // Evitar duplicar si ya hay una alerta no leída para ese estudiante
        const yaExiste = unread.some((a) => a.studentId === s.id);
        if (!yaExiste) {
          nuevasAlertas.push({
            studentId: s.id,
            nombre: s.nombre,
            score: s.score,
            level: s.level,
            promedio: s.promedio,
            date: Date.now(),
          });
        }
      }
    }

    const updatedUnread = [...unread, ...nuevasAlertas].slice(-50); // máx 50

    await saveTeacherSnapshot(uid, {
      levels: newLevels,
      unread: updatedUnread,
    });

    return res.json({
      ok: true,
      unreadCount: updatedUnread.length,
      alerts: updatedUnread.sort((a, b) => b.date - a.date),
      isFirstRun,
    });
  } catch (error) {
    console.error("❌ Error teacher notifications:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener notificaciones" });
  }
};

// POST /api/moodle/teacher/notifications/read?userId=X
// Marca todas las notificaciones como leídas (vacía la lista).
export const markNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });
    await clearUnread(parseInt(userId));
    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error marcar leídas:", error.message);
    return res.status(500).json({ ok: false, msg: "Error" });
  }
};
