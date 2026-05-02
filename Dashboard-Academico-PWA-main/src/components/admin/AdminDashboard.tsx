import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, BookOpen, TrendingUp, AlertTriangle, School, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const kpis = [
    { label: 'Total Estudiantes', value: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+48 este mes' },
    { label: 'Total Profesores', value: '87', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50', change: '+3 este mes' },
    { label: 'Cursos Activos', value: '42', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', change: '12 por iniciar' },
    { label: 'Promedio Institucional', value: '4.1', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+0.3 vs anterior' },
    { label: 'Tasa de Aprobación', value: '89%', icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+4% vs anterior' },
    { label: 'Estudiantes en Riesgo', value: '142', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', change: '-12 vs mes ant.' },
  ];

  const enrollmentTrend = [
    { month: 'Jun', students: 1050 },
    { month: 'Jul', students: 1100 },
    { month: 'Ago', students: 1150 },
    { month: 'Sep', students: 1180 },
    { month: 'Oct', students: 1210 },
    { month: 'Nov', students: 1234 },
  ];

  const performanceByProgram = [
    { program: 'Ing. Sistemas', average: 4.2, students: 345 },
    { program: 'Ing. Software', average: 4.3, students: 289 },
    { program: 'Ciencia Datos', average: 4.0, students: 234 },
    { program: 'Ing. Industrial', average: 4.1, students: 198 },
    { program: 'Administración', average: 3.9, students: 168 },
  ];

  const studentsByLevel = [
    { name: 'Primer Año', value: 420 },
    { name: 'Segundo Año', value: 380 },
    { name: 'Tercer Año', value: 290 },
    { name: 'Cuarto Año', value: 144 },
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Dashboard Ejecutivo</h1>
        <p className="text-gray-600">Métricas institucionales y análisis global del desempeño académico</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Matrícula</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} name="Estudiantes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Students by Level */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentsByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Program */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por Programa Académico</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceByProgram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" />
              <YAxis yAxisId="left" orientation="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="average" fill="#4F46E5" name="Promedio" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="students" fill="#10B981" name="Estudiantes" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-gray-900 text-sm">Gestionar Usuarios</p>
              <p className="text-xs text-gray-500">1,321 usuarios</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <BookOpen className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-gray-900 text-sm">Ver Cursos</p>
              <p className="text-xs text-gray-500">42 activos</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-gray-900 text-sm">Reportes</p>
              <p className="text-xs text-gray-500">Generar reportes</p>
            </button>
            <button className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-left">
              <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
              <p className="text-gray-900 text-sm">Alertas</p>
              <p className="text-xs text-gray-500">142 en riesgo</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
