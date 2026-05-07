import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, FileCheck, FileText, MessageSquare, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getTeacherDashboard, TeacherDashboardData } from '@/service/api';

// ─── Helpers de tiempo y fecha ───────────────────────────────────────────────

const formatTimeAgo = (ms: number): string => {
  const diff = Date.now() - ms;
  if (diff < 0) return 'Ahora';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} día${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months === 1 ? '' : 'es'}`;
};

const formatShortDate = (ms: number): string => {
  const d = new Date(ms);
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]}`;
};

const activityIcon = (tipo: string) => {
  switch (tipo) {
    case 'submission': return FileText;
    case 'quiz':       return CheckCircle;
    case 'forum':      return MessageSquare;
    case 'alert':      return AlertTriangle;
    default:           return FileText;
  }
};

const activityColors = (tipo: string) => {
  switch (tipo) {
    case 'submission': return { bg: 'bg-blue-100',   icon: 'text-blue-600' };
    case 'quiz':       return { bg: 'bg-purple-100', icon: 'text-purple-600' };
    case 'forum':      return { bg: 'bg-green-100',  icon: 'text-green-600' };
    case 'alert':      return { bg: 'bg-red-100',    icon: 'text-red-600' };
    default:           return { bg: 'bg-gray-100',   icon: 'text-gray-600' };
  }
};

export default function TeacherDashboard() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTeacherDashboard(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const fmt = (v: number | null | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const kpis = [
    {
      label: 'Estudiantes Inscritos',
      value: fmt(data?.estudiantesInscritos),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: null,
    },
    {
      label: 'Entregas Recibidas',
      value: loading
        ? '...'
        : data
        ? `${data.entregasRecibidas}/${data.entregasEsperadas}`
        : '—',
      icon: FileCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: data ? `${data.completitudPercent}% completitud` : null,
    },
    {
      label: 'Promedio General',
      value: loading
        ? '...'
        : data?.promedioGeneral != null
        ? data.promedioGeneral.toFixed(2)
        : '—',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: null,
    },
    {
      label: 'Estudiantes en Riesgo',
      value: fmt(data?.estudiantesEnRiesgo),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      change: !loading && (data?.estudiantesEnRiesgo ?? 0) > 0 ? 'Requiere atención' : null,
    },
  ];

  const courseProgress = [
    { module: 'Módulo 1', completed: 100, inProgress: 0, notStarted: 0 },
    { module: 'Módulo 2', completed: 95, inProgress: 5, notStarted: 0 },
    { module: 'Módulo 3', completed: 78, inProgress: 15, notStarted: 7 },
    { module: 'Módulo 4', completed: 45, inProgress: 35, notStarted: 20 },
    { module: 'Módulo 5', completed: 12, inProgress: 20, notStarted: 68 },
  ];

  const performanceTrend = [
    { month: 'Ago', average: 3.6 },
    { month: 'Sep', average: 3.7 },
    { month: 'Oct', average: 3.8 },
    { month: 'Nov', average: 3.9 },
  ];

  const actividadReciente = data?.actividadReciente ?? [];
  const tareasPorCalificar = data?.tareasPorCalificar ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Panel del Profesor</h1>
        <p className="text-gray-600">Vista general del desempeño de tus cursos y estudiantes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="module" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completado" />
                <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="En progreso" />
                <Bar dataKey="notStarted" stackId="a" fill="#94A3B8" name="No iniciado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Promedio General</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando actividad...</p>}
            {!loading && actividadReciente.length === 0 && (
              <p className="text-sm text-gray-500">No hay actividad reciente.</p>
            )}
            <div className="space-y-3">
              {actividadReciente.map((act, index) => {
                const Icon = activityIcon(act.tipo);
                const colors = activityColors(act.tipo);
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{act.estudiante}</p>
                      <p className="text-sm text-gray-600 truncate">{act.accion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {act.curso} · {formatTimeAgo(act.fecha)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tareas por Calificar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              Tareas por Calificar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando tareas...</p>}
            {!loading && tareasPorCalificar.length === 0 && (
              <p className="text-sm text-gray-500">No hay entregas pendientes de calificar.</p>
            )}
            <div className="space-y-4">
              {tareasPorCalificar.map((task, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">{task.actividad}</p>
                      <p className="text-sm text-gray-600 truncate">{task.curso}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {task.fecha != null && (
                        <p className="text-sm text-gray-900">{formatShortDate(task.fecha)}</p>
                      )}
                      <p className="text-xs text-gray-500">{task.count} items</p>
                    </div>
                  </div>
                  {index < tareasPorCalificar.length - 1 && (
                    <div className="border-b border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <FileCheck className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-gray-900 text-sm">Revisar Entregas</p>
              <p className="text-xs text-gray-500">7 pendientes</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-gray-900 text-sm">Ver Estudiantes</p>
              <p className="text-xs text-gray-500">54 activos</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-gray-900 text-sm">Mapa de Riesgo</p>
              <p className="text-xs text-gray-500">8 en riesgo</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
