import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, UserX } from 'lucide-react';
import { getTeacherActivities, TeacherActivitiesData } from '@/service/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatDate = (ms: number | null): string => {
  if (ms == null) return '—';
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
};

const tipoLabel = (tipo: string) => {
  switch (tipo) {
    case 'assignment': return 'Tarea';
    case 'quiz':       return 'Evaluación';
    case 'forum':      return 'Foro';
    default:           return tipo;
  }
};

// Color de la barra de progreso de entregas según %
const barColor = (pct: number) => {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 15) return 'bg-orange-500';
  return 'bg-red-500';
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function TeacherActivities() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<TeacherActivitiesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTeacherActivities(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const fmt = (v: number | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const resumen = data?.resumen;
  const actividades = data?.actividades ?? [];
  const puntualidad = data?.puntualidadPorCurso ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Actividades y Entregas</h1>
        <p className="text-gray-600">Gestión y seguimiento de tareas, proyectos y evaluaciones</p>
      </div>

      {/* ── Tarjetas resumen (5) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actividades Activas</p>
                <p className="text-gray-900 font-semibold text-2xl">{fmt(resumen?.actividadesActivas)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Por Calificar</p>
                <p className="text-gray-900 font-semibold text-2xl">{fmt(resumen?.porCalificar)}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Entregas a Tiempo</p>
                <p className="text-gray-900 font-semibold text-2xl">{fmt(resumen?.entregasATiempo)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Entregas Tardías</p>
                <p className="text-gray-900 font-semibold text-2xl">{fmt(resumen?.entregasTardias)}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sin Entregar</p>
                <p className="text-gray-900 font-semibold text-2xl">{fmt(resumen?.sinEntregar)}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Puntualidad de Entregas por Curso ── */}
      <Card>
        <CardHeader>
          <CardTitle>Puntualidad de Entregas por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}
          {!loading && puntualidad.length === 0 && (
            <p className="text-sm text-gray-500">No hay datos disponibles.</p>
          )}
          {puntualidad.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={puntualidad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="curso" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTime" fill="#10B981" name="A tiempo" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" name="Tardías" radius={[8, 8, 0, 0]} />
                <Bar dataKey="notSubmitted" fill="#EF4444" name="Sin entregar" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Lista de Actividades ── */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando actividades...</p>}
          {!loading && actividades.length === 0 && (
            <p className="text-sm text-gray-500">No hay actividades registradas.</p>
          )}
          {actividades.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Por Calificar</TableHead>
                    <TableHead>Tardías</TableHead>
                    <TableHead>Sin Entregar</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actividades.map((act) => {
                    const total = act.totalEstudiantes;
                    const pct = total > 0 ? Math.round((act.entregas / total) * 100) : 0;

                    return (
                      <TableRow key={act.id}>
                        <TableCell>
                          <p className="text-gray-900">
                            {act.nombre} - {act.curso}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50">
                            {tipoLabel(act.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(act.fechaLimite)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900">
                              {act.entregas}/{total}
                            </p>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barColor(pct)}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              act.porCalificar > 0
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }
                          >
                            {act.porCalificar}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              act.tardias > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {act.tardias}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              act.sinEntregar > 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {act.sinEntregar}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pct >= 75 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : pct >= 15 ? (
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
