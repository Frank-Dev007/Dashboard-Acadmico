import { BookOpen, TrendingUp, Calendar, Clock, AlertCircle, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

export default function StudentDashboard() {
  const courses = [
    { 
      name: 'Matemáticas Avanzadas', 
      progress: 75, 
      grade: 4.2, 
      status: 'on-track',
      nextDelivery: '2 días',
      color: 'bg-blue-500'
    },
    { 
      name: 'Programación Web', 
      progress: 88, 
      grade: 4.5, 
      status: 'excellent',
      nextDelivery: '5 días',
      color: 'bg-green-500'
    },
    { 
      name: 'Bases de Datos', 
      progress: 45, 
      grade: 3.5, 
      status: 'at-risk',
      nextDelivery: '1 día',
      color: 'bg-yellow-500'
    },
    { 
      name: 'Ingeniería de Software', 
      progress: 92, 
      grade: 4.7, 
      status: 'excellent',
      nextDelivery: '7 días',
      color: 'bg-purple-500'
    },
  ];

  const upcomingTasks = [
    { title: 'Proyecto Final - Bases de Datos', course: 'Bases de Datos', dueDate: '05 Nov', priority: 'high' },
    { title: 'Quiz Capítulo 5', course: 'Matemáticas Avanzadas', dueDate: '07 Nov', priority: 'medium' },
    { title: 'Tarea Práctica React', course: 'Programación Web', dueDate: '09 Nov', priority: 'medium' },
    { title: 'Lectura Capítulo 3', course: 'Ingeniería de Software', dueDate: '11 Nov', priority: 'low' },
  ];

  const stats = [
    { label: 'Promedio General', value: '4.2', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cursos Activos', value: '4', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tareas Pendientes', value: '7', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Horas de Estudio', value: '28h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const statusColors = {
    'excellent': 'bg-green-500',
    'on-track': 'bg-blue-500',
    'at-risk': 'bg-red-500'
  };

  const priorityColors = {
    'high': 'bg-red-100 text-red-700',
    'medium': 'bg-yellow-100 text-yellow-700',
    'low': 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Bienvenido de nuevo 👋</h1>
        <p className="text-gray-600">Aquí está un resumen de tu progreso académico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-gray-900">{stat.value}</p>
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

      {/* Courses Grid */}
      <div>
        <h2 className="text-gray-900 mb-4">Mis Cursos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[course.status as keyof typeof statusColors]}`} />
                      <span className="text-sm text-gray-600">
                        {course.status === 'excellent' && 'Excelente'}
                        {course.status === 'on-track' && 'En progreso'}
                        {course.status === 'at-risk' && 'Requiere atención'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${course.color} text-white text-sm`}>
                      <Trophy className="w-3 h-3" />
                      <span>{course.grade}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progreso del curso</span>
                      <span className="text-gray-900">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Próxima entrega en {course.nextDelivery}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
          <div className="space-y-3">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.course}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority === 'high' && 'Alta'}
                    {task.priority === 'medium' && 'Media'}
                    {task.priority === 'low' && 'Baja'}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{task.dueDate}</p>
                    <p className="text-xs text-gray-500">2025</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
