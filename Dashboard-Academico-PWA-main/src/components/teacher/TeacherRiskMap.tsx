import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertTriangle, TrendingDown, Clock, MessageSquare, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getTeacherRiskMap, TeacherRiskMapData, RiskLevel } from '@/service/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTimeAgo = (ms: number | null): string => {
  if (ms == null) return 'Sin actividad registrada';
  const diff = Date.now() - ms;
  if (diff < 0) return 'Ahora';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hace 1 día';
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
};

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const riskColors = (level: RiskLevel) => {
  switch (level) {
    case 'high':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-700',
        text: 'text-red-700',
        dot: 'bg-red-500',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        badge: 'bg-yellow-100 text-yellow-700',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500',
      };
    default:
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        badge: 'bg-green-100 text-green-700',
        text: 'text-green-700',
        dot: 'bg-green-500',
      };
  }
};

const riskLabel = (level: RiskLevel) => {
  switch (level) {
    case 'high':   return 'Alto Riesgo';
    case 'medium': return 'Riesgo Medio';
    default:       return 'Bajo Riesgo';
  }
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function TeacherRiskMap() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<TeacherRiskMapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTeacherRiskMap(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const counts = data?.counts ?? { high: 0, medium: 0, low: 0 };
  const students = data?.students ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Mapa de Riesgo Académico</h1>
        <p className="text-gray-600">Identificación temprana de estudiantes que requieren intervención</p>
      </div>

      {/* ── Resumen de riesgo (3 tarjetas) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Alto Riesgo</p>
                <p className="text-red-900 font-semibold text-xl">
                  {loading ? '...' : `${counts.high} estudiante${counts.high === 1 ? '' : 's'}`}
                </p>
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
                <p className="text-yellow-900 font-semibold text-xl">
                  {loading ? '...' : `${counts.medium} estudiante${counts.medium === 1 ? '' : 's'}`}
                </p>
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
                <p className="text-green-900 font-semibold text-xl">
                  {loading ? '...' : `${counts.low} estudiante${counts.low === 1 ? '' : 's'}`}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-green-600 rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Lista de estudiantes en riesgo ── */}
      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-gray-500">Calculando riesgos...</p>
        )}
        {!loading && students.length === 0 && (
          <p className="text-sm text-gray-500">No hay estudiantes en riesgo en este momento.</p>
        )}
        {students.map((student) => {
          const colors = riskColors(student.riskLevel);
          return (
            <Card key={student.id} className={`${colors.bg} border-2 ${colors.border}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {initials(student.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg text-gray-900 font-semibold">{student.nombre}</h3>
                      <Badge className={colors.badge}>
                        {riskLabel(student.riskLevel)}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    </div>
                    {student.email && (
                      <p className="text-sm text-gray-600 mb-3">{student.email}</p>
                    )}

                    {/* Solo Promedio */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">Promedio</p>
                      <p className={`${colors.text} font-semibold text-lg`}>
                        {student.promedio.toFixed(2)}
                      </p>
                    </div>

                    {/* Última actividad */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Última actividad: {formatTimeAgo(student.lastActivity)}</span>
                    </div>

                    {/* Alertas */}
                    {student.alerts.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-2">Alertas activas:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.alerts.map((alert, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={`${colors.badge} text-xs`}
                            >
                              {alert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
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
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
