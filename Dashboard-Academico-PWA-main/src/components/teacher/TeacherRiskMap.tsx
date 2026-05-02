import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, TrendingDown, Clock, MessageSquare, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

export default function TeacherRiskMap() {
  const students = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      riskLevel: 'high',
      grade: 2.5,
      attendance: 65,
      submissions: 45,
      participation: 30,
      lastActivity: 'Hace 5 días',
      alerts: ['Bajo rendimiento', 'Entregas tardías', 'Baja participación'],
      trend: 'down'
    },
    {
      id: 2,
      name: 'Pedro Sánchez',
      email: 'pedro.sanchez@email.com',
      riskLevel: 'high',
      grade: 2.8,
      attendance: 70,
      submissions: 50,
      participation: 40,
      lastActivity: 'Hace 3 días',
      alerts: ['Entregas incompletas', 'Calidad baja'],
      trend: 'stable'
    },
    {
      id: 3,
      name: 'Laura Gómez',
      email: 'laura.gomez@email.com',
      riskLevel: 'medium',
      grade: 3.2,
      attendance: 80,
      submissions: 70,
      participation: 55,
      lastActivity: 'Hace 1 día',
      alerts: ['Disminución en participación'],
      trend: 'down'
    },
    {
      id: 4,
      name: 'Roberto Díaz',
      email: 'roberto.diaz@email.com',
      riskLevel: 'medium',
      grade: 3.4,
      attendance: 75,
      submissions: 65,
      participation: 60,
      lastActivity: 'Hace 2 días',
      alerts: ['Inconsistencia en entregas'],
      trend: 'stable'
    },
    {
      id: 5,
      name: 'Carmen Ruiz',
      email: 'carmen.ruiz@email.com',
      riskLevel: 'medium',
      grade: 3.3,
      attendance: 78,
      submissions: 68,
      participation: 58,
      lastActivity: 'Hoy',
      alerts: ['Bajo rendimiento en evaluaciones'],
      trend: 'down'
    },
    {
      id: 6,
      name: 'Miguel Ángel',
      email: 'miguel.angel@email.com',
      riskLevel: 'low',
      grade: 3.7,
      attendance: 85,
      submissions: 80,
      participation: 70,
      lastActivity: 'Hoy',
      alerts: ['Mejorar participación en foros'],
      trend: 'up'
    },
  ];

  const riskStats = {
    high: students.filter(s => s.riskLevel === 'high').length,
    medium: students.filter(s => s.riskLevel === 'medium').length,
    low: students.filter(s => s.riskLevel === 'low').length,
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          badge: 'bg-red-100 text-red-700',
          text: 'text-red-700',
          dot: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          badge: 'bg-yellow-100 text-yellow-700',
          text: 'text-yellow-700',
          dot: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-300',
          badge: 'bg-green-100 text-green-700',
          text: 'text-green-700',
          dot: 'bg-green-500'
        };
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Alto Riesgo';
      case 'medium': return 'Riesgo Medio';
      default: return 'Bajo Riesgo';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Mapa de Riesgo Académico</h1>
        <p className="text-gray-600">Identificación temprana de estudiantes que requieren intervención</p>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Alto Riesgo</p>
                <p className="text-red-900">{riskStats.high} estudiantes</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Riesgo Medio</p>
                <p className="text-yellow-900">{riskStats.medium} estudiantes</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Bajo Riesgo</p>
                <p className="text-green-900">{riskStats.low} estudiantes</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-green-600 rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {students.map((student) => {
          const colors = getRiskColor(student.riskLevel);
          
          return (
            <Card key={student.id} className={`${colors.bg} border-2 ${colors.border}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-indigo-600 text-white">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg text-gray-900">{student.name}</h3>
                        <Badge className={colors.badge}>
                          {getRiskLabel(student.riskLevel)}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Promedio</p>
                          <p className={`${colors.text}`}>{student.grade}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Asistencia</p>
                          <p className={`${colors.text}`}>{student.attendance}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Entregas</p>
                          <p className={`${colors.text}`}>{student.submissions}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Participación</p>
                          <p className={`${colors.text}`}>{student.participation}%</p>
                        </div>
                      </div>

                      {/* Last Activity */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="w-4 h-4" />
                        <span>Última actividad: {student.lastActivity}</span>
                      </div>

                      {/* Alerts */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-2">Alertas activas:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.alerts.map((alert, idx) => (
                            <Badge key={idx} variant="outline" className={`${colors.badge} text-xs`}>
                              {alert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Mail className="w-3 h-3 mr-1" />
                          Enviar Email
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Mensaje
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Phone className="w-3 h-3 mr-1" />
                          Contactar
                        </Button>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                          Plan de Acción
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Recomendaciones de Intervención</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600">•</span>
              <span><strong>Alto Riesgo:</strong> Agendar reuniones individuales urgentes y crear planes de mejora personalizados</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span><strong>Riesgo Medio:</strong> Ofrecer tutorías grupales y monitoreo semanal del progreso</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">•</span>
              <span><strong>Bajo Riesgo:</strong> Mantener seguimiento regular y reforzar aspectos específicos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
