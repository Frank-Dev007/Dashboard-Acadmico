const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

export interface MoodleUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_usuario: "estudiante" | "docente" | "admin";
  username: string;
  avatar: string | null;
}

export interface LoginResponse {
  ok: boolean;
  msg: string;
  moodleToken?: string;
  user?: MoodleUser;
}

export interface ProfileStats {
  ok: boolean;
  cursosActivos: number;
  totalEstudiantes?: number | null;
  promedioCurso?: string | null;
  satisfaccion?: null;
  promedioGeneral?: string | null;
  creditosCompletados?: null;
  posicionGrupo?: null;
}

// ─── Peticiones ───────────────────────────────────────────────────────────────

export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const getProfileStats = async (
  userId: number,
  role: string
): Promise<ProfileStats> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/stats?userId=${userId}&role=${role}`
  );
  return res.json();
};

export interface StudentCourse {
  id: number;
  nombre: string;
  promedio: number | null;
  progreso: number | null;
  proximaEntrega: { nombre: string; fecha: number } | null;
}

export interface UpcomingAssignment {
  id: number;
  nombre: string;
  curso: string;
  fecha: number;
}

export interface StudentDashboardData {
  ok: boolean;
  promedioGeneral: number | null;
  cursosActivos: number;
  tareasPendientes: number;
  cursos: StudentCourse[];
  proximasEntregas: UpcomingAssignment[];
}

export const getStudentDashboard = async (
  userId: number
): Promise<StudentDashboardData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/student/dashboard?userId=${userId}`
  );
  return res.json();
};

export interface CoursePerformanceData {
  id: number;
  nombre: string;
  miPromedio: number | null;
  promedioGrupo: number | null;
  miPuesto: number | null;
  totalEstudiantes: number;
  topPercent: number | null;
}

export interface StudentPerformanceData {
  ok: boolean;
  promedioActual: number | null;
  cursos: CoursePerformanceData[];
}

export const getStudentPerformance = async (
  userId: number
): Promise<StudentPerformanceData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/student/performance?userId=${userId}`
  );
  return res.json();
};

export interface CourseParticipationData {
  id: number;
  nombre: string;
  entregas: number;
  foros: number;
  evaluaciones: number;
  completadas: number;
  totalActividades: number;
}

export interface TimelineItem {
  tipo: 'assignment' | 'forum' | 'quiz';
  titulo: string;
  curso: string;
  fecha: number;
  estado: 'completed' | 'late' | 'missed';
}

export interface StudentParticipationData {
  ok: boolean;
  totalEntregas: number;
  totalForos: number;
  entregasATiempo: number;
  entregasTardias: number;
  noEntregadas: number;
  cursos: CourseParticipationData[];
  timeline: TimelineItem[];
}

export const getStudentParticipation = async (
  userId: number
): Promise<StudentParticipationData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/student/participation?userId=${userId}`
  );
  return res.json();
};

export interface TeacherActivity {
  tipo: 'submission' | 'quiz' | 'forum' | 'alert';
  estudiante: string;
  accion: string;
  curso: string;
  fecha: number;
}

export interface TeacherTask {
  actividad: string;
  curso: string;
  fecha: number | null;
  count: number;
}

export interface TeacherDashboardData {
  ok: boolean;
  estudiantesInscritos: number;
  entregasRecibidas: number;
  entregasEsperadas: number;
  completitudPercent: number;
  promedioGeneral: number | null;
  estudiantesEnRiesgo: number;
  actividadReciente: TeacherActivity[];
  tareasPorCalificar: TeacherTask[];
}

export const getTeacherDashboard = async (
  userId: number
): Promise<TeacherDashboardData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/teacher/dashboard?userId=${userId}`
  );
  return res.json();
};

export interface ActivityRow {
  id: string;
  nombre: string;
  curso: string;
  tipo: 'assignment' | 'quiz' | 'forum';
  fechaLimite: number | null;
  entregas: number;
  totalEstudiantes: number;
  porCalificar: number;
  tardias: number;
  sinEntregar: number;
}

export interface PuntualidadCurso {
  curso: string;
  onTime: number;
  late: number;
  notSubmitted: number;
}

export interface TeacherActivitiesData {
  ok: boolean;
  resumen: {
    actividadesActivas: number;
    porCalificar: number;
    entregasATiempo: number;
    entregasTardias: number;
    sinEntregar: number;
  };
  puntualidadPorCurso: PuntualidadCurso[];
  actividades: ActivityRow[];
}

export const getTeacherActivities = async (
  userId: number
): Promise<TeacherActivitiesData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/teacher/activities?userId=${userId}`
  );
  return res.json();
};

export interface GradeRange {
  rango: string;
  cantidad: number;
  porcentaje: number;
}

export interface RankedStudent {
  id: number;
  nombre: string;
  promedio: number;
}

export interface TeacherEvaluationsData {
  ok: boolean;
  tasaAprobacion: number;
  evaluacionesRealizadas: number;
  distribucion: GradeRange[];
  mejoresEstudiantes: RankedStudent[];
  requierenAtencion: RankedStudent[];
}

export const getTeacherEvaluations = async (
  userId: number
): Promise<TeacherEvaluationsData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/teacher/evaluations?userId=${userId}`
  );
  return res.json();
};

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskStudent {
  id: number;
  nombre: string;
  email: string;
  promedio: number;
  riskLevel: RiskLevel;
  lastActivity: number | null;
  alerts: string[];
}

export interface TeacherRiskMapData {
  ok: boolean;
  counts: {
    high: number;
    medium: number;
    low: number;
  };
  students: RiskStudent[];
}

export const getTeacherRiskMap = async (
  userId: number
): Promise<TeacherRiskMapData> => {
  const res = await fetch(
    `${API_BASE}/api/moodle/teacher/risk-map?userId=${userId}`
  );
  return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper para futuras llamadas autenticadas a través del backend.
// Incluye automáticamente el moodleToken guardado en localStorage.
// ─────────────────────────────────────────────────────────────────────────────
export const moodleRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const moodleToken = localStorage.getItem("moodleToken");

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(moodleToken ? { Authorization: `Bearer ${moodleToken}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  return res.json();
};
