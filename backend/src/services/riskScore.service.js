// Cálculo del score de riesgo de deserción por estudiante.
//
// Cada variable se normaliza a una "contribución de riesgo" entre 0 y 1
// (0 = sin riesgo, 1 = riesgo máximo) y se pondera. El score final es la
// suma ponderada, también entre 0 y 1.
//
// Pesos (perfil "académico primero"). Deben sumar 1.0
export const RISK_WEIGHTS = {
  promedio: 0.35,            // promedio bajo
  entregasIncompletas: 0.25, // actividades vencidas no entregadas
  diasSinAcceso: 0.20,       // inactividad
  participacionForos: 0.10,  // poca participación en foros
  horasDedicacion: 0.10,     // pocas horas de dedicación
};

// Umbrales de clasificación por score
export const RISK_THRESHOLDS = { high: 0.7, medium: 0.4 };

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// ── Normalizadores (cada uno devuelve 0..1 de riesgo) ────────────────────────

// Promedio 0-5: 5→0 riesgo, 0→1 riesgo (lineal)
const riskFromPromedio = (promedio) => {
  if (promedio == null) return 0.5; // sin datos → riesgo medio neutro
  return clamp01((5 - promedio) / 5);
};

// Entregas incompletas: ratio no_entregadas / total_vencidas
const riskFromEntregas = (noEntregadas, totalVencidas) => {
  if (!totalVencidas || totalVencidas <= 0) return 0;
  return clamp01(noEntregadas / totalVencidas);
};

// Días sin acceso: 0 días→0, ≥14 días→1. Sin acceso nunca → 1
const DIAS_TOPE = 14;
const riskFromDiasSinAcceso = (diasSinAcceso) => {
  if (diasSinAcceso == null) return 1;
  return clamp01(diasSinAcceso / DIAS_TOPE);
};

// Participación en foros: si hay foros disponibles, riesgo = 1 - participados/disponibles
const riskFromForos = (participados, disponibles) => {
  if (!disponibles || disponibles <= 0) return 0; // no hay foros → no penalizar
  return clamp01(1 - participados / disponibles);
};

// Horas de dedicación: ≥ UMBRAL horas → 0 riesgo, 0 horas → 1
const HORAS_UMBRAL = 5;
const riskFromHoras = (totalHoras) => {
  if (totalHoras == null) return 1;
  return clamp01(1 - totalHoras / HORAS_UMBRAL);
};

// ── Cálculo principal ────────────────────────────────────────────────────────
// inputs: { promedio, noEntregadas, totalVencidas, diasSinAcceso,
//           forosParticipados, forosDisponibles, totalHoras }
export const computeRiskScore = (inputs) => {
  const signals = {
    promedio: riskFromPromedio(inputs.promedio),
    entregasIncompletas: riskFromEntregas(inputs.noEntregadas, inputs.totalVencidas),
    diasSinAcceso: riskFromDiasSinAcceso(inputs.diasSinAcceso),
    participacionForos: riskFromForos(inputs.forosParticipados, inputs.forosDisponibles),
    horasDedicacion: riskFromHoras(inputs.totalHoras),
  };

  const score =
    signals.promedio * RISK_WEIGHTS.promedio +
    signals.entregasIncompletas * RISK_WEIGHTS.entregasIncompletas +
    signals.diasSinAcceso * RISK_WEIGHTS.diasSinAcceso +
    signals.participacionForos * RISK_WEIGHTS.participacionForos +
    signals.horasDedicacion * RISK_WEIGHTS.horasDedicacion;

  const scoreRounded = Number(score.toFixed(3));

  let level;
  if (scoreRounded >= RISK_THRESHOLDS.high) level = "high";
  else if (scoreRounded >= RISK_THRESHOLDS.medium) level = "medium";
  else level = "low";

  // Aporte ponderado de cada señal (para explicar el score en el frontend)
  const breakdown = {
    promedio: Number((signals.promedio * RISK_WEIGHTS.promedio).toFixed(3)),
    entregasIncompletas: Number((signals.entregasIncompletas * RISK_WEIGHTS.entregasIncompletas).toFixed(3)),
    diasSinAcceso: Number((signals.diasSinAcceso * RISK_WEIGHTS.diasSinAcceso).toFixed(3)),
    participacionForos: Number((signals.participacionForos * RISK_WEIGHTS.participacionForos).toFixed(3)),
    horasDedicacion: Number((signals.horasDedicacion * RISK_WEIGHTS.horasDedicacion).toFixed(3)),
  };

  return { score: scoreRounded, level, signals, breakdown };
};
