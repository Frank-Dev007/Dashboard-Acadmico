// Configuración de semestres académicos
// SEM-I:  1 de febrero al 6 de junio
// SEM-II: 1 de agosto al 6 de diciembre
//
// Formato: "YYYY-I" o "YYYY-II" (ej: "2025-I", "2026-II")

// Devuelve el semestre de una fecha (Date o ms): "2025-I", "2026-II" o null
// si está fuera de los rangos de semestre (vacaciones).
export const getSemesterForDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const m = d.getMonth(); // 0-indexed: Feb=1, Jun=5, Ago=7, Dic=11
  const day = d.getDate();
  const y = d.getFullYear();

  // SEM-I: Feb 1 — Jun 6
  if (m >= 1 && m <= 4) return `${y}-I`;
  if (m === 5 && day <= 6) return `${y}-I`;

  // SEM-II: Ago 1 — Dic 6
  if (m >= 7 && m <= 10) return `${y}-II`;
  if (m === 11 && day <= 6) return `${y}-II`;

  return null;
};

// Devuelve { startTs, endTs } en segundos Unix para un string "YYYY-I" o "YYYY-II"
export const getSemesterRange = (semesterStr) => {
  const parts = String(semesterStr).split("-");
  if (parts.length !== 2) return null;
  const year = parseInt(parts[0], 10);
  const roman = parts[1];
  if (!year || (roman !== "I" && roman !== "II")) return null;

  let start, end;
  if (roman === "I") {
    start = new Date(year, 1, 1, 0, 0, 0);      // Feb 1, 00:00:00
    end = new Date(year, 5, 6, 23, 59, 59);     // Jun 6, 23:59:59
  } else {
    start = new Date(year, 7, 1, 0, 0, 0);      // Ago 1, 00:00:00
    end = new Date(year, 11, 6, 23, 59, 59);    // Dic 6, 23:59:59
  }

  return {
    startTs: Math.floor(start.getTime() / 1000),
    endTs: Math.floor(end.getTime() / 1000),
  };
};

// Genera todos los semestres entre dos timestamps Unix.
// Devuelve un array ordenado: ["2024-I", "2024-II", "2025-I", ...]
export const getSemestersBetween = (fromTs, toTs) => {
  if (!fromTs || !toTs || fromTs > toTs) return [];

  const fromYear = new Date(fromTs * 1000).getFullYear();
  const toYear = new Date(toTs * 1000).getFullYear();

  const semesters = [];
  for (let y = fromYear; y <= toYear; y++) {
    for (const roman of ["I", "II"]) {
      const sem = `${y}-${roman}`;
      const range = getSemesterRange(sem);
      // Incluir si el rango del semestre intersecta con [fromTs, toTs]
      if (range && range.endTs >= fromTs && range.startTs <= toTs) {
        semesters.push(sem);
      }
    }
  }

  return semesters;
};

// Semestre actual (basado en la fecha de hoy). Si hoy está fuera de un
// semestre (vacaciones), devuelve el semestre anterior más reciente.
export const getCurrentSemester = () => {
  const today = new Date();
  const current = getSemesterForDate(today);
  if (current) return current;

  // Estamos en vacaciones — buscar el último semestre cerrado
  const y = today.getFullYear();
  const m = today.getMonth();
  if (m < 1) {
    // Enero: anterior es SEM-II del año pasado
    return `${y - 1}-II`;
  } else if (m === 6 || m === 7) {
    // Jul o primera mitad de Ago (raro): anterior es SEM-I del año actual
    return `${y}-I`;
  } else {
    // Dic después del 6: anterior es SEM-II del año actual
    return `${y}-II`;
  }
};
