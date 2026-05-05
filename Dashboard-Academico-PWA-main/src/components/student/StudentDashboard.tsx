import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, Calendar, Clock, AlertCircle, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { getStudentDashboard, StudentDashboardData } from '@/service/api';

const formatDate = (ms: number) => {
  const d = new Date(ms);
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return { day: String(d.getDate()).padStart(2, '0'), month: meses[d.getMonth()], year: d.getFullYear() };
};

const daysUntil = (ms: number) => {
  const diff = ms - Date.now();
  if (diff < 0) return 'Vencido';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'hoy';
  if (days === 1) return '1 día';
  return `${days} días`;
};

const priorityFor = (ms: number): 'high' | 'medium' | 'low' => {
  const days = (ms - Date.now()) / (1000 * 60 * 60 * 24);
  if (days <= 3) return 'high';
  if (days <= 7) return 'medium';
  return 'low';
};

const statusFor = (grade: number | null): 'excellent' | 'on-track' | 'at-risk' => {
  if (grade === null) return 'on-track';
  if (grade >= 4.5) return 'excellent';
  if (grade >= 3.5) return 'on-track';
  return 'at-risk';
};

const gradeColor = (grade: number | null): string => {
  if (grade === null) return 'bg-gray-400';
  if (grade >= 4.5) return 'bg-green-500';
  if (grade >= 4.0) return 'bg-blue-500';
  if (grade >= 3.0) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function StudentDashboard() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getStudentDashboard(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const fmt = (v: string | number | null | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const stats = [
    { label: 'Promedio General', value: fmt(data?.promedioGeneral), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cursos Activos',   value: fmt(data?.cursosActivos),    icon: BookOpen,   color: 'text-blue-600',  bg: 'bg-blue-50'  },
    { label: 'Tareas Pendientes',value: fmt(data?.tareasPendientes), icon: Calendar,   color: 'text-purple-600',bg: 'bg-purple-50'},
    { label: 'Horas de Estudio', value: '—',                          icon: Clock,      color: 'text-orange-600',bg: 'bg-orange-50'},
  ];

  const statusColors = { excellent: 'bg-green-500', 'on-track': 'bg-blue-500', 'at-risk': 'bg-red-500' };
  const priorityColors = {
    high:   'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low:    'bg-gray-100 text-gray-700',
  };
  const priorityLabel = { high: 'Alta', medium: 'Media', low: 'Baja' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Bienvenido de nuevo 👋</h1>
        <p className="text-gray-600">Aquí está un resumen de tu progreso académico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-gray-900 font-semibold">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-gray-900 mb-4">Mis Cursos</h2>
        {loading && <p className="text-sm text-gray-500">Cargando cursos...</p>}
        {!loading && (data?.cursos?.length ?? 0) === 0 && (
          <p className="text-sm text-gray-500">No estás inscrito en ningún curso.</p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data?.cursos.map((course) => {
            const status = statusFor(course.promedio);
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.nombre}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <span className="text-sm text-gray-600">
                          {status === 'excellent' && 'Excelente'}
                          {status === 'on-track' && 'En progreso'}
                          {status === 'at-risk' && 'Requiere atención'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${gradeColor(course.promedio)} text-white text-sm`}>
                        <Trophy className="w-3 h-3" />
                        <span>{course.promedio != null ? course.promedio.toFixed(1) : '—'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progreso del curso</span>
                        <span className="text-gray-900">{course.progreso != null ? `${course.progreso}%` : '—'}</span>
                      </div>
                      <Progress value={course.progreso ?? 0} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {course.proximaEntrega
                          ? `Próxima entrega en ${daysUntil(course.proximaEntrega.fecha)}`
                          : 'Sin entregas próximas'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            Próximas Entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!data || data.proximasEntregas.length === 0) && !loading && (
            <p className="text-sm text-gray-500">No tienes entregas próximas.</p>
          )}
          <div className="space-y-3">
            {data?.proximasEntregas.map((task) => {
              const p = priorityFor(task.fecha);
              const d = formatDate(task.fecha);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">{task.nombre}</p>
                    <p className="text-sm text-gray-600">{task.curso}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={priorityColors[p]}>{priorityLabel[p]}</Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{d.day} {d.month}</p>
                      <p className="text-xs text-gray-500">{d.year}</p>
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
