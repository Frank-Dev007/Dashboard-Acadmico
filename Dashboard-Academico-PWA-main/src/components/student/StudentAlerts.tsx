import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, AlertCircle, Info, TrendingDown, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function StudentAlerts() {
  const alerts = [
    {
      id: 1,
      level: 'high',
      title: 'Riesgo de Reprobación - Bases de Datos',
      description: 'Tu promedio actual (3.5) está por debajo del mínimo requerido. Se recomienda atención urgente.',
      course: 'Bases de Datos',
      date: '04 Nov 2025',
      recommendations: [
        'Asistir a tutorías los martes y jueves',
        'Revisar material del Módulo 3',
        'Completar ejercicios de práctica adicionales'
      ]
    },
    {
      id: 2,
      level: 'medium',
      title: 'Baja Participación en Foros',
      description: 'No has participado en los últimos 3 foros de discusión.',
      course: 'Matemáticas Avanzadas',
      date: '03 Nov 2025',
      recommendations: [
        'Participar al menos 2 veces por semana',
        'Leer y comentar las publicaciones de compañeros'
      ]
    },
    {
      id: 3,
      level: 'medium',
      title: 'Entregas Pendientes',
      description: 'Tienes 2 tareas próximas a vencer en las siguientes 48 horas.',
      course: 'Múltiples cursos',
      date: '04 Nov 2025',
      recommendations: [
        'Priorizar Proyecto Final de Bases de Datos (vence mañana)',
        'Organizar tiempo para Quiz de Matemáticas'
      ]
    },
    {
      id: 4,
      level: 'low',
      title: 'Disminución en Tiempo de Estudio',
      description: 'Tu promedio de horas semanales ha bajado 15% en la última semana.',
      course: 'General',
      date: '02 Nov 2025',
      recommendations: [
        'Retomar rutina de estudio regular',
        'Identificar y eliminar distractores'
      ]
    },
  ];

  const performanceIndicators = [
    { course: 'Matemáticas Avanzadas', status: 'green', grade: 4.2, trend: 'stable' },
    { course: 'Programación Web', status: 'green', grade: 4.5, trend: 'up' },
    { course: 'Bases de Datos', status: 'red', grade: 3.5, trend: 'down' },
    { course: 'Ing. Software', status: 'green', grade: 4.7, trend: 'up' },
  ];

  const upcomingDeadlines = [
    { task: 'Proyecto Final BD', course: 'Bases de Datos', dueDate: '05 Nov', urgent: true },
    { task: 'Quiz Capítulo 5', course: 'Matemáticas', dueDate: '07 Nov', urgent: false },
    { task: 'Tarea Práctica React', course: 'Programación Web', dueDate: '09 Nov', urgent: false },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      default: return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      };
      case 'medium': return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700'
      };
      default: return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Alertas Tempranas</h1>
        <p className="text-gray-600">Indicadores y recomendaciones personalizadas para mejorar tu desempeño</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Alertas Críticas</p>
                <p className="text-red-900">1</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Atención Necesaria</p>
                <p className="text-yellow-900">2</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Información</p>
                <p className="text-blue-900">1</p>
              </div>
              <Info className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators - Semáforo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-indigo-600" />
            Indicadores de Desempeño por Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceIndicators.map((indicator) => (
              <div key={indicator.course} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(indicator.status)}`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{indicator.course}</p>
                    <p className="text-sm text-gray-600">
                      Promedio: {indicator.grade} | 
                      {indicator.trend === 'up' && ' Tendencia positiva ↗'}
                      {indicator.trend === 'down' && ' Tendencia negativa ↘'}
                      {indicator.trend === 'stable' && ' Estable →'}
                    </p>
                  </div>
                </div>
                <Badge className={
                  indicator.status === 'green' ? 'bg-green-100 text-green-700' : 
                  indicator.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }>
                  {indicator.status === 'green' && 'Excelente'}
                  {indicator.status === 'yellow' && 'Atención'}
                  {indicator.status === 'red' && 'Riesgo'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = getLevelIcon(alert.level);
          const colors = getLevelColor(alert.level);
          
          return (
            <Card key={alert.id} className={`${colors.bg} ${colors.border} border-2`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-6 h-6 ${colors.icon} mt-1`} />
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${colors.text} mb-2`}>
                        {alert.title}
                      </CardTitle>
                      <p className={`text-sm ${colors.text} mb-2`}>{alert.description}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className={colors.badge}>
                          {alert.course}
                        </Badge>
                        <span className={`flex items-center gap-1 ${colors.text}`}>
                          <Calendar className="w-4 h-4" />
                          {alert.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`bg-white/50 rounded-lg p-4`}>
                  <p className={`text-sm ${colors.text} mb-3`}>
                    <strong>Recomendaciones:</strong>
                  </p>
                  <ul className="space-y-2">
                    {alert.recommendations.map((rec, idx) => (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${colors.text}`}>
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                  {alert.level === 'high' && (
                    <Button className="mt-4 w-full sm:w-auto bg-red-600 hover:bg-red-700">
                      Agendar Tutoría
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Próximas Entregas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${deadline.urgent ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-5 h-5 ${deadline.urgent ? 'text-red-600' : 'text-gray-600'}`} />
                  <div>
                    <p className={deadline.urgent ? 'text-red-900' : 'text-gray-900'}>
                      {deadline.task}
                    </p>
                    <p className="text-sm text-gray-600">{deadline.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={deadline.urgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                    {deadline.dueDate}
                  </Badge>
                  {deadline.urgent && (
                    <p className="text-xs text-red-600 mt-1">Urgente</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
