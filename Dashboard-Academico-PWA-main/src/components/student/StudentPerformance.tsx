import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { TrendingUp, TrendingDown, Award, Target, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getStudentPerformance, StudentPerformanceData } from '@/service/api';

// ─── Historial mensual en localStorage ───────────────────────────────────────

const HISTORY_KEY = 'performanceHistory';
type HistoryEntry = { date: number; avg: number };

const saveToHistory = (avg: number): HistoryEntry[] => {
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
  history.push({ date: Date.now(), avg });
  const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000; // 6 meses
  const trimmed = history.filter((e) => e.date > cutoff);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
};

const groupByMonth = (history: HistoryEntry[]) => {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const buckets: Record<string, number[]> = {};
  for (const e of history) {
    const d = new Date(e.date);
    const key = `${meses[d.getMonth()]} ${d.getFullYear()}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(e.avg);
  }
  return Object.entries(buckets).map(([key, avgs]) => ({
    month: key.split(' ')[0],
    grade: Number((avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2)),
  }));
};

// ─── Helpers de UI ───────────────────────────────────────────────────────────

const statusFor = (avg: number | null) => {
  if (avg === null) return { label: '—', cls: 'bg-gray-100 text-gray-600' };
  if (avg >= 4.5) return { label: 'Excelente', cls: 'bg-green-100 text-green-700' };
  if (avg >= 3.5) return { label: 'Bueno', cls: 'bg-blue-100 text-blue-700' };
  return { label: 'Mejorar', cls: 'bg-yellow-100 text-yellow-700' };
};

const rankColors = (topPercent: number | null) => {
  if (topPercent === null) return { icon: 'text-gray-500', bg: 'bg-gray-50' };
  if (topPercent <= 10) return { icon: 'text-green-600', bg: 'bg-green-50' };
  if (topPercent <= 25) return { icon: 'text-blue-600', bg: 'bg-blue-50' };
  if (topPercent <= 50) return { icon: 'text-orange-500', bg: 'bg-orange-50' };
  return { icon: 'text-red-500', bg: 'bg-red-50' };
};

// ─── Competencias (sin datos de Moodle — se mantienen ilustrativas) ──────────

const competenciesData = [
  { competency: 'Análisis', value: 85 },
  { competency: 'Trabajo en Equipo', value: 90 },
  { competency: 'Comunicación', value: 75 },
  { competency: 'Creatividad', value: 80 },
  { competency: 'Pensamiento Crítico', value: 88 },
  { competency: 'Liderazgo', value: 70 },
];

// ─── Componente ──────────────────────────────────────────────────────────────

export default function StudentPerformance() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<{ month: string; grade: number }[]>([]);
  const [monthDiff, setMonthDiff] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getStudentPerformance(userId)
      .then((d) => {
        setData(d);
        if (d.promedioActual !== null) {
          const history = saveToHistory(d.promedioActual);
          setEvolutionData(groupByMonth(history));
          const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const lastMonth = history.filter((e) => e.date < oneMonthAgo).pop();
          if (lastMonth) {
            setMonthDiff(Number((d.promedioActual - lastMonth.avg).toFixed(2)));
          }
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const promedioActual = data?.promedioActual ?? null;

  // Datos para el gráfico de barras
  const barData = (data?.cursos ?? []).map((c) => ({
    course: c.nombre.length > 18 ? c.nombre.slice(0, 18) + '…' : c.nombre,
    'Mi Nota': c.miPromedio ?? 0,
    'Prom. Grupo': c.promedioGrupo ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Desempeño Académico</h1>
        <p className="text-gray-600">Análisis detallado de tu rendimiento y comparación con el grupo</p>
      </div>

      {/* ── Fila de tarjetas: Promedio Actual + una por curso ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Promedio Actual */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Promedio Actual</p>
                <p className="text-gray-900 font-semibold text-2xl">
                  {loading ? '...' : promedioActual != null ? promedioActual.toFixed(2) : '—'}
                </p>
                {!loading && monthDiff !== null ? (
                  <p className={`text-sm flex items-center gap-1 mt-1 ${monthDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthDiff >= 0
                      ? <TrendingUp className="w-4 h-4" />
                      : <TrendingDown className="w-4 h-4" />}
                    {monthDiff >= 0 ? '+' : ''}{monthDiff} vs mes anterior
                  </p>
                ) : !loading ? (
                  <p className="text-sm text-gray-400 mt-1">Primer registro</p>
                ) : null}
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Una tarjeta por curso */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Calculando rankings...</p>
            </CardContent>
          </Card>
        )}
        {(data?.cursos ?? []).map((course) => {
          const colors = rankColors(course.topPercent);
          return (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Posición en el Grupo</p>
                    <p className="text-gray-900 font-semibold">{course.nombre}</p>
                    <p className={`text-xl font-bold mt-1 ${colors.icon}`}>
                      {course.topPercent != null ? `Top ${course.topPercent}%` : '—'}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Users className="w-3 h-3 shrink-0" />
                      <span>
                        {course.miPuesto != null
                          ? `Puesto ${course.miPuesto} de ${course.totalEstudiantes} estudiantes`
                          : 'Sin datos de ranking'}
                      </span>
                    </div>
                  </div>
                  <div className={`${colors.bg} p-3 rounded-lg`}>
                    <Target className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Rendimiento por Curso (barras) ── */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}
          {!loading && barData.length === 0 && (
            <p className="text-sm text-gray-500">No hay datos de cursos disponibles.</p>
          )}
          {barData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tickCount={6} />
                <Tooltip formatter={(v: number) => v.toFixed(2)} />
                <Legend />
                <Bar dataKey="Mi Nota" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Prom. Grupo" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Evolución + Competencias ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            {evolutionData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-gray-400 text-center">
                  Los datos de evolución se acumularán<br />con el tiempo al visitar esta página.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} tickCount={6} />
                  <Tooltip formatter={(v: number) => v.toFixed(2)} />
                  <Line
                    type="monotone"
                    dataKey="grade"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    name="Promedio"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competencias Desarrolladas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={competenciesData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Nivel" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Desempeño por Curso (tabla) ── */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando...</p>}
          <div className="space-y-3">
            {(data?.cursos ?? []).map((course) => {
              const status = statusFor(course.miPromedio);
              const diff =
                course.miPromedio != null && course.promedioGrupo != null
                  ? course.miPromedio - course.promedioGrupo
                  : null;
              return (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{course.nombre}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={status.cls}>{status.label}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">
                        {course.miPromedio != null ? course.miPromedio.toFixed(2) : '—'}
                      </span>
                      {diff !== null && (
                        diff >= 0
                          ? <TrendingUp className="w-4 h-4 text-green-600" />
                          : <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
