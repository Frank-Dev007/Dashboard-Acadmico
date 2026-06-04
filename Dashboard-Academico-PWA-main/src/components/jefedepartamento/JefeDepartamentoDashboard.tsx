// Componente independiente del perfil "Jefe de Departamento".
// Inicialmente es una copia del Admin Dashboard. Cualquier cambio aquí
// NO afecta a /admin y viceversa.
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, BookOpen, TrendingUp, AlertTriangle, School, GraduationCap, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getJefeDepartamentoStats, JefeDepartamentoStats } from '@/service/api';

// Por ahora hardcodeado al departamento del jefe (Ingenieria de sistemas).
// Cuando movamos la auth a BD, este valor vendrá del usuario logueado.
const DEPARTAMENTO = 'Ingenieria de sistemas';

export default function JefeDepartamentoDashboard() {
  const [deptStats, setDeptStats] = useState<JefeDepartamentoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getJefeDepartamentoStats(DEPARTAMENTO)
      .then((d) => setDeptStats(d))
      .catch(() => setDeptStats(null))
      .finally(() => setLoading(false));
  }, []);

  const fmtInt = (v: number | null | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const fmtAvg = (v: number | null | undefined) =>
    loading ? '...' : v != null ? v.toFixed(2) : '—';

  const fmtPct = (v: number | null | undefined) =>
    loading ? '...' : v != null ? `${v}%` : '—';

  const departamentoLabel = deptStats?.categoryName ?? null;

  const kpis = [
    { label: 'Total Estudiantes',     value: fmtInt(deptStats?.totalEstudiantes),     icon: Users,         color: 'text-blue-600',     bg: 'bg-blue-50',     change: departamentoLabel },
    { label: 'Total Profesores',      value: fmtInt(deptStats?.totalProfesores),      icon: GraduationCap, color: 'text-green-600',    bg: 'bg-green-50',    change: departamentoLabel },
    { label: 'Cursos Activos',        value: fmtInt(deptStats?.cursosActivos),        icon: BookOpen,      color: 'text-purple-600',   bg: 'bg-purple-50',   change: deptStats?.totalCursos != null ? `${deptStats.totalCursos} en total` : null },
    { label: 'Promedio Institucional',value: fmtAvg(deptStats?.promedioInstitucional),icon: TrendingUp,    color: 'text-indigo-600',   bg: 'bg-indigo-50',   change: 'Promedio de promedios' },
    { label: 'Tasa de Aprobación',    value: fmtPct(deptStats?.tasaAprobacion),       icon: School,        color: 'text-emerald-600',  bg: 'bg-emerald-50',  change: null },
    { label: 'Estudiantes en Riesgo', value: fmtInt(deptStats?.estudiantesEnRiesgo),  icon: AlertTriangle, color: 'text-red-600',      bg: 'bg-red-50',      change: null },
  ];

  const enrollmentTrend = [
    { month: 'Jun', students: 1050 },
    { month: 'Jul', students: 1100 },
    { month: 'Ago', students: 1150 },
    { month: 'Sep', students: 1180 },
    { month: 'Oct', students: 1210 },
    { month: 'Nov', students: 1234 },
  ];

  // ── Cursos del departamento + selección (máximo 5) ──────────────────────
  const allCourses = deptStats?.courses ?? [];

  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Inicializa la selección con los primeros 5 cursos cuando cargan los datos
  useEffect(() => {
    if (allCourses.length > 0 && selectedCourseIds.size === 0) {
      setSelectedCourseIds(new Set(allCourses.slice(0, 5).map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptStats]);

  // Cerrar el dropdown cuando se hace click fuera
  useEffect(() => {
    if (!selectorOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectorOpen]);

  const MAX_COURSES = 5;
  const toggleCourse = (id: number) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COURSES) next.add(id);
      return next;
    });
  };

  const performanceByCourse = allCourses
    .filter((c) => selectedCourseIds.has(c.id))
    .map((c) => ({
      curso: c.shortname || c.nombre,
      nombreCompleto: c.nombre,
      promedio: c.promedio ?? 0,
      estudiantes: c.estudiantes,
    }));

  const studentsByLevel = [
    { name: 'Primer Año', value: 420 },
    { name: 'Segundo Año', value: 380 },
    { name: 'Tercer Año', value: 290 },
    { name: 'Cuarto Año', value: 144 },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Dashboard del Jefe de Departamento</h1>
        <p className="text-gray-600">Métricas departamentales y análisis del desempeño académico</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${kpi.bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                <p className="text-gray-900 font-semibold text-2xl mb-1">{kpi.value}</p>
                {kpi.change && (
                  <p className="text-sm text-gray-500">{kpi.change}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Matrícula</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} name="Estudiantes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Students by Level */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentsByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentsByLevel.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Desempeño por Curso */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-2">
            <CardTitle>Desempeño por Curso</CardTitle>
            <span className="text-xs text-gray-500">
              {selectedCourseIds.size}/{MAX_COURSES} cursos seleccionados (máx. {MAX_COURSES})
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Selector de cursos (dropdown estilo "select" con checkboxes) */}
          {allCourses.length > 0 && (
            <div className="mb-4 relative" ref={selectorRef}>
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectorOpen((v) => !v)}
                className="w-full justify-between text-left font-normal"
              >
                <span className="truncate">
                  {selectedCourseIds.size === 0
                    ? 'Seleccionar cursos...'
                    : `${selectedCourseIds.size} de ${allCourses.length} cursos seleccionados`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 shrink-0 transition-transform ${
                    selectorOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {selectorOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 max-h-64 overflow-auto">
                  <p className="px-3 py-1 text-xs text-gray-500">
                    Selecciona hasta {MAX_COURSES} cursos
                  </p>
                  {allCourses.map((c) => {
                    const checked = selectedCourseIds.has(c.id);
                    const disabled = !checked && selectedCourseIds.size >= MAX_COURSES;
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                          disabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'cursor-pointer hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleCourse(c.id)}
                          className="accent-indigo-600"
                        />
                        <span className={checked ? 'text-indigo-700 font-medium' : ''}>
                          {c.nombre}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}
          {!loading && performanceByCourse.length === 0 && (
            <p className="text-sm text-gray-500">No hay cursos seleccionados.</p>
          )}
          {performanceByCourse.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceByCourse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="curso" />
                <YAxis yAxisId="left" orientation="left" domain={[0, 5]} />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Promedio') return [value.toFixed(2), name];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const full = payload?.[0]?.payload?.nombreCompleto;
                    return full ?? label;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="promedio" fill="#4F46E5" name="Promedio" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="estudiantes" fill="#10B981" name="Estudiantes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-gray-900 text-sm">Gestionar Usuarios</p>
              <p className="text-xs text-gray-500">1,321 usuarios</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <BookOpen className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-gray-900 text-sm">Ver Cursos</p>
              <p className="text-xs text-gray-500">42 activos</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-gray-900 text-sm">Reportes</p>
              <p className="text-xs text-gray-500">Generar reportes</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-gray-900 text-sm">Alertas</p>
              <p className="text-xs text-gray-500">142 en riesgo</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
