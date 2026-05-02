import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, FileText, Users, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

export default function StudentParticipation() {
  const activities = [
    { 
      date: '04 Nov 2025', 
      type: 'assignment', 
      title: 'Entrega Proyecto Base de Datos', 
      course: 'Bases de Datos',
      status: 'completed',
      time: '14:30'
    },
    { 
      date: '03 Nov 2025', 
      type: 'forum', 
      title: 'Participación en Foro: Arquitecturas Web', 
      course: 'Programación Web',
      status: 'completed',
      time: '10:15'
    },
    { 
      date: '02 Nov 2025', 
      type: 'assignment', 
      title: 'Tarea Capítulo 4', 
      course: 'Matemáticas',
      status: 'completed',
      time: '16:45'
    },
    { 
      date: '01 Nov 2025', 
      type: 'forum', 
      title: 'Comentario en Discusión: Scrum vs Kanban', 
      course: 'Ing. Software',
      status: 'completed',
      time: '09:20'
    },
    { 
      date: '31 Oct 2025', 
      type: 'quiz', 
      title: 'Quiz Módulo 3', 
      course: 'Programación Web',
      status: 'completed',
      time: '11:00'
    },
    { 
      date: '30 Oct 2025', 
      type: 'assignment', 
      title: 'Ejercicios Prácticos SQL', 
      course: 'Bases de Datos',
      status: 'late',
      time: '18:30'
    },
  ];

  const stats = [
    { label: 'Entregas Totales', value: 24, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Participaciones en Foros', value: 18, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Trabajos en Grupo', value: 6, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Entregas a Tiempo', value: '95%', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const participationByCourse = [
    { course: 'Programación Web', assignments: 8, forums: 6, quizzes: 4, total: 18 },
    { course: 'Bases de Datos', assignments: 6, forums: 4, quizzes: 3, total: 13 },
    { course: 'Matemáticas', assignments: 7, forums: 2, quizzes: 5, total: 14 },
    { course: 'Ing. Software', assignments: 5, forums: 6, quizzes: 2, total: 13 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'forum': return MessageSquare;
      case 'quiz': return CheckCircle;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-700';
      case 'forum': return 'bg-green-100 text-green-700';
      case 'quiz': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Participación Académica</h1>
        <p className="text-gray-600">Registro de tu actividad y participación en cursos</p>
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

      {/* Participation by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Participación por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {participationByCourse.map((course) => (
              <div key={course.course}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-900">{course.course}</span>
                  <span className="text-sm text-gray-600">{course.total} actividades</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Entregas</p>
                    <p className="text-blue-600">{course.assignments}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Foros</p>
                    <p className="text-green-600">{course.forums}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Evaluaciones</p>
                    <p className="text-purple-600">{course.quizzes}</p>
                  </div>
                </div>
                <Progress value={(course.total / 20) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Línea de Tiempo de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={index} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white" />
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 mb-1">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.course}</p>
                        </div>
                      </div>
                      <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {activity.status === 'completed' ? 'Completado' : 'Entrega tardía'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-11">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{activity.time}</span>
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
