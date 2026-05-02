import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, FileCheck, TrendingUp, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Progress } from '../ui/progress';

export default function TeacherDashboard() {
  const kpis = [
    { label: 'Estudiantes Inscritos', value: '54', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+3 vs mes ant.' },
    { label: 'Entregas Recibidas', value: '47/54', icon: FileCheck, color: 'text-green-600', bg: 'bg-green-50', change: '87% completitud' },
    { label: 'Promedio General', value: '3.9', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: '+0.2 vs anterior' },
    { label: 'Estudiantes en Riesgo', value: '8', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: 'Requiere atención' },
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

  const recentActivities = [
    { type: 'submission', student: 'Ana García', activity: 'Proyecto Final BD', time: 'Hace 15 min', status: 'pending' },
    { type: 'question', student: 'Carlos López', activity: 'Pregunta en Foro', time: 'Hace 1 hora', status: 'answered' },
    { type: 'submission', student: 'María Torres', activity: 'Tarea Capítulo 4', time: 'Hace 2 horas', status: 'graded' },
    { type: 'alert', student: 'Juan Pérez', activity: 'Alerta de riesgo', time: 'Hace 3 horas', status: 'active' },
  ];

  const upcomingDeadlines = [
    { activity: 'Calificar Proyecto Final', course: 'Bases de Datos', date: '06 Nov', count: 47 },
    { activity: 'Publicar Quiz Módulo 5', course: 'Programación Web', date: '08 Nov', count: 1 },
    { activity: 'Reunión con estudiantes en riesgo', course: 'General', date: '09 Nov', count: 8 },
  ];

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
                <p className="text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-sm text-gray-500">{kpi.change}</p>
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
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'submission' ? 'bg-blue-100' :
                    activity.type === 'question' ? 'bg-purple-100' :
                    'bg-red-100'
                  }`}>
                    {activity.type === 'submission' && <FileCheck className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'question' && <BookOpen className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{activity.student}</p>
                    <p className="text-sm text-gray-600">{activity.activity}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              Próximas Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900">{deadline.activity}</p>
                      <p className="text-sm text-gray-600">{deadline.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{deadline.date}</p>
                      <p className="text-xs text-gray-500">{deadline.count} items</p>
                    </div>
                  </div>
                  {index < upcomingDeadlines.length - 1 && (
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
