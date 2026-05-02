import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Award, TrendingUp, Users, FileCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

export default function TeacherEvaluations() {
  const gradeDistribution = [
    { range: '0-1.9', count: 2, percentage: 4 },
    { range: '2.0-2.9', count: 5, percentage: 9 },
    { range: '3.0-3.9', count: 18, percentage: 33 },
    { range: '4.0-4.5', count: 22, percentage: 41 },
    { range: '4.6-5.0', count: 7, percentage: 13 },
  ];

  const gradesByPeriod = [
    { period: 'Corte 1', average: 3.8, highest: 4.9, lowest: 2.5 },
    { period: 'Corte 2', average: 3.9, highest: 5.0, lowest: 2.8 },
    { period: 'Corte 3', average: 4.0, highest: 5.0, lowest: 3.0 },
  ];

  const topStudents = [
    { rank: 1, name: 'María Torres', grade: 4.9, improvement: '+0.3' },
    { rank: 2, name: 'Carlos López', grade: 4.8, improvement: '+0.2' },
    { rank: 3, name: 'Ana García', grade: 4.7, improvement: '+0.4' },
    { rank: 4, name: 'Luis Martínez', grade: 4.6, improvement: '+0.1' },
    { rank: 5, name: 'Sofia Ramírez', grade: 4.6, improvement: '+0.2' },
  ];

  const needsAttention = [
    { name: 'Juan Pérez', grade: 2.5, trend: 'down', issue: 'Bajo rendimiento constante' },
    { name: 'Pedro Sánchez', grade: 2.8, trend: 'stable', issue: 'Entregas incompletas' },
    { name: 'Laura Gómez', grade: 3.0, trend: 'down', issue: 'Disminución en participación' },
  ];

  const stats = [
    { label: 'Promedio General', value: '3.9', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+0.2 vs anterior' },
    { label: 'Tasa de Aprobación', value: '87%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', change: '+5% vs anterior' },
    { label: 'Evaluaciones Realizadas', value: '12', icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50', change: 'Este semestre' },
    { label: 'Estudiantes Evaluados', value: '54', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '100% cobertura' },
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#94A3B8', '#10B981', '#4F46E5'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Evaluaciones</h1>
        <p className="text-gray-600">Análisis de calificaciones y desempeño académico</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-5 gap-2 text-center">
              {gradeDistribution.map((item, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs text-gray-600">{item.range}</p>
                  <p className="text-sm text-indigo-600">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Rango</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.range}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Period */}
      <Card>
        <CardHeader>
          <CardTitle>Calificaciones por Corte</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradesByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#4F46E5" name="Promedio" radius={[8, 8, 0, 0]} />
              <Bar dataKey="highest" fill="#10B981" name="Más alta" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lowest" fill="#EF4444" name="Más baja" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Mejores Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((student) => (
                <div key={student.rank} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0">
                      {student.rank}
                    </div>
                    <div>
                      <p className="text-gray-900">{student.name}</p>
                      <p className="text-sm text-green-600">{student.improvement} mejora</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-indigo-600">{student.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />
              Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.map((student, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.issue}</p>
                    </div>
                    <Badge className={student.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                      {student.grade}
                    </Badge>
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">
                    Ver detalles →
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
