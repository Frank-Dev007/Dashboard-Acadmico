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
