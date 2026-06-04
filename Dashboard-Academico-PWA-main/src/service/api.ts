const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ─── Gestión de tokens JWT ──────────────────────────────────────────────────
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Renueva el access token usando el refresh token. Devuelve true si lo logró.
let refreshingPromise: Promise<boolean> | null = null;
export const refreshAccessToken = async (): Promise<boolean> => {
  // Evitar múltiples refresh simultáneos
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
};

// Cierra sesión: limpia todo y redirige al login.
const forceLogout = () => {
  clearTokens();
  localStorage.removeItem("auth");
  localStorage.removeItem("userRole");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// fetch autenticado: agrega el Authorization, y ante un 401 por token expirado
// intenta renovar el access token una vez y reintenta la petición.
export const authFetch = async (
  input: string,
  init: RequestInit = {}
): Promise<Response> => {
  const withAuth = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let res = await fetch(input, withAuth(getAccessToken()));

  if (res.status === 401) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      res = await fetch(input, withAuth(getAccessToken()));
      if (res.status !== 401) return res;
    }
    // No se pudo renovar → cerrar sesión
    forceLogout();
  }

  return res;
};

// ─── Tipos de respuesta ────────────────────────────────────────────────────────

export interface MoodleUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipo_usuario: "estudiante" | "docente" | "admin" | "jefe";
  username: string;
  avatar: string | null;
}

export interface LoginResponse {
  ok: boolean;
  msg: string;
  moodleToken?: string;
  accessToken?: string;
  refreshToken?: string;
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
  const data: LoginResponse = await res.json();
  if (data.ok) {
    setTokens(data.accessToken, data.refreshToken);
  }
  return data;
};

// Cierra sesión en el backend (revoca el refresh token) y limpia los tokens locales.
export const logoutRequest = async (): Promise<void> => {
  const refreshToken = getRefreshToken();
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // ignorar errores de red en logout
  }
  clearTokens();
};

export const getProfileStats = async (
  userId: number,
  role: string
): Promise<ProfileStats> => {
  const res = await authFetch(
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
  const res = await authFetch(
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
  const res = await authFetch(
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
  const res = await authFetch(
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
  const res = await authFetch(
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
  const res = await authFetch(
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
  const res = await authFetch(
    `${API_BASE}/api/moodle/teacher/evaluations?userId=${userId}`
  );
  return res.json();
};

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskBreakdown {
  promedio: number;
  entregasIncompletas: number;
  diasSinAcceso: number;
  participacionForos: number;
  horasDedicacion: number;
}

export interface RiskStudent {
  id: number;
  nombre: string;
  email: string;
  promedio: number | null;
  score: number;            // 0..1
  level: RiskLevel;
  breakdown: RiskBreakdown; // aporte ponderado de cada señal
  diasSinAcceso: number | null;
  totalHoras: number;
  notSubmitted: number;
  forosParticipados: number;
  forosDisponibles: number;
  lastActivity: number | null;
  alerts: string[];
}

export interface TeacherRiskMapData {
  ok: boolean;
  counts: { high: number; medium: number; low: number };
  students: RiskStudent[];
  weights: Record<string, number>;
  thresholds: { high: number; medium: number };
}

export const getTeacherRiskMap = async (
  userId: number
): Promise<TeacherRiskMapData> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/teacher/risk-map?userId=${userId}`
  );
  return res.json();
};

// ─── Notificaciones de riesgo (campana del header) ───────────────────────────

export interface RiskAlert {
  studentId: number;
  nombre: string;
  score: number;
  level: RiskLevel;
  promedio: number | null;
  date: number;
}

export interface TeacherNotificationsData {
  ok: boolean;
  unreadCount: number;
  alerts: RiskAlert[];
  isFirstRun?: boolean;
}

export const getTeacherNotifications = async (
  userId: number
): Promise<TeacherNotificationsData> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/teacher/notifications?userId=${userId}`
  );
  return res.json();
};

export const markTeacherNotificationsRead = async (
  userId: number
): Promise<{ ok: boolean }> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/teacher/notifications/read?userId=${userId}`,
    { method: 'POST' }
  );
  return res.json();
};

// ─── Jefe de Departamento ────────────────────────────────────────────────────

export interface DepartamentoCourse {
  id: number;
  nombre: string;
  shortname: string;
  visible: boolean;
  estudiantes: number;
  promedio: number | null;
}

export interface JefeDepartamentoStats {
  ok: boolean;
  categoryId?: number;
  categoryName?: string;
  totalCursos?: number;
  cursosActivos?: number;
  totalProfesores: number;
  totalEstudiantes?: number;
  promedioInstitucional?: number | null;
  tasaAprobacion?: number;
  estudiantesEnRiesgo?: number;
  courses?: DepartamentoCourse[];
  msg?: string;
}

export const getJefeDepartamentoStats = async (
  categoryName: string
): Promise<JefeDepartamentoStats> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/jefe-departamento/stats?categoryName=${encodeURIComponent(categoryName)}`
  );
  return res.json();
};

export interface JefeDepartamentoUser {
  id: number;
  nombre: string;
  correo: string;
  role: 'student' | 'teacher';
  lastaccess: number;
  avgSessionHours?: number;
}

export interface JefeDepartamentoUsersData {
  ok: boolean;
  categoryId?: number;
  categoryName?: string;
  users: JefeDepartamentoUser[];
  msg?: string;
}

export const getJefeDepartamentoUsers = async (
  categoryName: string
): Promise<JefeDepartamentoUsersData> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/jefe-departamento/users?categoryName=${encodeURIComponent(categoryName)}`
  );
  return res.json();
};

export interface JefeDepartamentoTeacherRow {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  courseId: number;
  courseName: string;
  totalActividades: number;
  promedio: number | null;
  estudiantesEnRiesgo: number;
  totalEstudiantes: number;
  totalAccesos: number;
  recursosPublicados: number;
  frecuenciaSesion: number;
  totalSesiones: number;
  sesionesConMovimiento: number;
}

export interface JefeDepartamentoTeachersData {
  ok: boolean;
  categoryId?: number;
  categoryName?: string;
  fromTs?: number;
  toTs?: number;
  rows: JefeDepartamentoTeacherRow[];
  msg?: string;
}

export const getJefeDepartamentoTeachers = async (
  categoryName: string,
  fromDate?: string,
  toDate?: string
): Promise<JefeDepartamentoTeachersData> => {
  const params = new URLSearchParams({ categoryName });
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const res = await authFetch(
    `${API_BASE}/api/moodle/jefe-departamento/teachers?${params.toString()}`
  );
  return res.json();
};

export interface JefeDepartamentoMovimientoRow {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  courseId: number;
  courseName: string;
  assignmentId: number;
  assignmentName: string;
  duedate: number | null;
  totalEntregas: number;
  calificadas: number;
  descargoPlantilla: boolean;
  totalEstudiantes: number;
}

export interface JefeDepartamentoMovimientosData {
  ok: boolean;
  categoryId?: number;
  categoryName?: string;
  semester?: string | null;
  semesterRange?: { startTs: number; endTs: number } | null;
  rows: JefeDepartamentoMovimientoRow[];
  teacherCourseAvgs: Record<string, number | null>;
  universityMax: number;
  msg?: string;
}

export const getJefeDepartamentoMovimientos = async (
  categoryName: string,
  semester?: string
): Promise<JefeDepartamentoMovimientosData> => {
  const params = new URLSearchParams({ categoryName });
  if (semester) params.append('semester', semester);
  const res = await authFetch(
    `${API_BASE}/api/moodle/jefe-departamento/movimientos?${params.toString()}`
  );
  return res.json();
};

export interface JefeDepartamentoSemestersData {
  ok: boolean;
  categoryName?: string;
  semesters: string[];
  currentSemester: string | null;
  msg?: string;
}

export const getJefeDepartamentoSemesters = async (
  categoryName: string
): Promise<JefeDepartamentoSemestersData> => {
  const res = await authFetch(
    `${API_BASE}/api/moodle/jefe-departamento/movimientos/semesters?categoryName=${encodeURIComponent(categoryName)}`
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

  const res = await authFetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(moodleToken ? { Authorization: `Bearer ${moodleToken}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  return res.json();
};
