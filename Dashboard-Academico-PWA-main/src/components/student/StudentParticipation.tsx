import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, FileText, CheckCircle, Clock, Calendar, AlertCircle, XCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { getStudentParticipation, StudentParticipationData } from '@/service/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatDateTime = (ms: number) => {
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, '0');
  const month = meses[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return { date: `${day} ${month} ${year}`, time: `${h}:${m}` };
};

const activityIcon = (tipo: string) => {
  switch (tipo) {
    case 'assignment': return FileText;
    case 'forum':      return MessageSquare;
    case 'quiz':       return CheckCircle;
    default:           return Calendar;
  }
};

const activityColor = (tipo: string) => {
  switch (tipo) {
    case 'assignment': return 'bg-blue-100 text-blue-700';
    case 'forum':      return 'bg-green-100 text-green-700';
    case 'quiz':       return 'bg-purple-100 text-purple-700';
    default:           return 'bg-gray-100 text-gray-700';
  }
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function StudentParticipation() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<StudentParticipationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getStudentParticipation(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const fmt = (v: number | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  // ── Estadísticas globales (4 tarjetas) ──
  const stats = [
    {
      label: 'Entregas Totales',
      value: fmt(data?.totalEntregas),
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Participaciones en Foros',
      value: fmt(data?.totalForos),
      icon: MessageSquare,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Entregas a Tiempo',
      value: fmt(data?.entregasATiempo),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Entregas Tardías',
      value: fmt(data?.entregasTardias),
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'No Entregadas',
      value: fmt(data?.noEntregadas),
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Participación Académica</h1>
        <p className="text-gray-600">Registro de tu actividad y participación en cursos</p>
      </div>

      {/* ── Tarjetas de resumen ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-gray-900 font-semibold text-xl">{stat.value}</p>
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

      {/* ── Participación por Curso ── */}
      <Card>
        <CardHeader>
          <CardTitle>Participación por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando cursos...</p>}
          {!loading && (data?.cursos?.length ?? 0) === 0 && (
            <p className="text-sm text-gray-500">No hay datos de participación disponibles.</p>
          )}
          <div className="space-y-6">
            {(data?.cursos ?? []).map((course) => {
              const progreso =
                course.totalActividades > 0
                  ? Math.round((course.completadas / course.totalActividades) * 100)
                  : 0;
              return (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-900 font-medium">{course.nombre}</span>
                    <span className="text-sm text-gray-600">{course.totalActividades} actividades</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Entregas</p>
                      <p className="text-blue-600 font-semibold">{course.entregas}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Foros</p>
                      <p className="text-green-600 font-semibold">{course.foros}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Evaluaciones</p>
                      <p className="text-purple-600 font-semibold">{course.evaluaciones}</p>
                    </div>
                  </div>
                  <Progress value={progreso} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Línea de Tiempo ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Línea de Tiempo de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando actividades...</p>}
          {!loading && (data?.timeline?.length ?? 0) === 0 && (
            <p className="text-sm text-gray-500">No hay actividades registradas con fecha de entrega.</p>
          )}
          <div className="space-y-4">
            {(data?.timeline ?? []).map((item, index) => {
              const Icon = activityIcon(item.tipo);
              const { date, time } = formatDateTime(item.fecha);
              return (
                <div
                  key={index}
                  className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0"
                >
                  <div className="absolute left-[-9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white" />
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${activityColor(item.tipo)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 mb-1">{item.titulo}</p>
                          <p className="text-sm text-gray-600">{item.curso}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          item.estado === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : item.estado === 'late'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {item.estado === 'completed'
                          ? 'Completado'
                          : item.estado === 'late'
                          ? 'Entrega tardía'
                          : 'No entregada'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-11">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
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
