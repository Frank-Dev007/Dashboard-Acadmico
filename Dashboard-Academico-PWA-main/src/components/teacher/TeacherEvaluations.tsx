import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Award, TrendingUp, FileCheck, TrendingDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getTeacherEvaluations, TeacherEvaluationsData } from '@/service/api';

const COLORS = ['#EF4444', '#F59E0B', '#94A3B8', '#10B981', '#4F46E5'];

export default function TeacherEvaluations() {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = storedUser?.id;

  const [data, setData] = useState<TeacherEvaluationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getTeacherEvaluations(userId)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const fmt = (v: number | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const distribucion = data?.distribucion ?? [];
  const mejores = data?.mejoresEstudiantes ?? [];
  const requierenAtencion = data?.requierenAtencion ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Evaluaciones</h1>
        <p className="text-gray-600">Análisis de calificaciones y desempeño académico</p>
      </div>

      {/* ── Tarjetas (2) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Tasa de Aprobación</p>
            <p className="text-gray-900 font-semibold text-2xl">
              {loading ? '...' : `${data?.tasaAprobacion ?? 0}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Evaluaciones Realizadas</p>
            <p className="text-gray-900 font-semibold text-2xl">{fmt(data?.evaluacionesRealizadas)}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Distribución de Calificaciones + Distribución por Rango ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}
            {!loading && distribucion.length > 0 && (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribucion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rango" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  {distribucion.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-xs text-gray-600">{item.rango}</p>
                      <p className="text-sm text-indigo-600 font-medium">{item.porcentaje}%</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Rango</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}
            {!loading && distribucion.some((d) => d.cantidad > 0) && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribucion.filter((d) => d.cantidad > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.rango}: ${entry.porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {distribucion
                      .filter((d) => d.cantidad > 0)
                      .map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && !distribucion.some((d) => d.cantidad > 0) && (
              <p className="text-sm text-gray-500">No hay calificaciones registradas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Mejores Estudiantes + Requieren Atención ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Mejores Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
            {!loading && mejores.length === 0 && (
              <p className="text-sm text-gray-500">No hay estudiantes con promedio mayor a 4.2.</p>
            )}
            <div className="space-y-3">
              {mejores.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900">{student.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-indigo-600 font-semibold">{student.promedio}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
            {!loading && requierenAtencion.length === 0 && (
              <p className="text-sm text-gray-500">No hay estudiantes con promedio menor a 3.1.</p>
            )}
            <div className="space-y-3">
              {requierenAtencion.map((student) => (
                <div
                  key={student.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900">{student.nombre}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">
                      {student.promedio}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
