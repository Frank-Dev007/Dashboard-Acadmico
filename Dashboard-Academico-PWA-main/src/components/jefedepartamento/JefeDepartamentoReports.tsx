// Componente independiente del perfil "Jefe de Departamento".
// Inicialmente es una copia de AdminReports. Cualquier cambio aquí
// NO afecta a /admin y viceversa.
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../ui/button';

export default function JefeDepartamentoReports() {
  const performanceComparison = [
    { program: 'Ing. Sistemas', current: 4.2, previous: 3.9 },
    { program: 'Ing. Software', current: 4.3, previous: 4.1 },
    { program: 'Ciencia Datos', current: 4.0, previous: 3.8 },
    { program: 'Ing. Industrial', current: 4.1, previous: 4.0 },
    { program: 'Administración', current: 3.9, previous: 3.7 },
  ];

  const enrollmentTrend = [
    { period: 'Ene', enrolled: 980, graduated: 120 },
    { period: 'Feb', enrolled: 1020, graduated: 0 },
    { period: 'Mar', enrolled: 1050, graduated: 0 },
    { period: 'Abr', enrolled: 1080, graduated: 0 },
    { period: 'May', enrolled: 1100, graduated: 150 },
    { period: 'Jun', enrolled: 1150, graduated: 0 },
    { period: 'Jul', enrolled: 1180, graduated: 0 },
    { period: 'Ago', enrolled: 1210, graduated: 0 },
    { period: 'Sep', enrolled: 1234, graduated: 0 },
  ];

  const riskDistribution = [
    { name: 'Bajo Riesgo', value: 892, color: '#10B981' },
    { name: 'Riesgo Medio', value: 200, color: '#F59E0B' },
    { name: 'Alto Riesgo', value: 142, color: '#EF4444' },
  ];

  const teacherPerformance = [
    { teacher: 'Dr. García', students: 54, average: 4.3, satisfaction: 4.8 },
    { teacher: 'Dra. López', students: 48, average: 4.2, satisfaction: 4.6 },
    { teacher: 'Prof. Martínez', students: 42, average: 4.1, satisfaction: 4.5 },
    { teacher: 'Prof. Torres', students: 51, average: 4.0, satisfaction: 4.3 },
    { teacher: 'Dr. Ramírez', students: 39, average: 3.9, satisfaction: 4.2 },
  ];

  const kpis = [
    { label: 'Tasa de Retención', value: '92%', change: '+3% vs año anterior', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tasa de Graduación', value: '85%', change: '+2% vs año anterior', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Satisfacción Estudiantil', value: '4.5/5', change: '+0.3 vs anterior', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Deserción', value: '8%', change: '-2% vs año anterior', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Reportes Departamentales</h1>
          <p className="text-gray-600">Análisis comparativo y métricas globales del departamento</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte Completo
        </Button>
      </div>

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
                <p className="text-sm text-green-600">{kpi.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparación de Desempeño por Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="program" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#4F46E5" name="Período Actual" radius={[8, 8, 0, 0]} />
              <Bar dataKey="previous" fill="#94A3B8" name="Período Anterior" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Matrícula y Graduación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrolled" stroke="#4F46E5" strokeWidth={3} name="Matriculados" />
                <Line type="monotone" dataKey="graduated" stroke="#10B981" strokeWidth={3} name="Graduados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo Estudiantil</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-gray-900">{((item.value / 1234) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempeño de Profesores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Profesor</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Estudiantes</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Promedio Curso</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Satisfacción</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Desempeño</th>
                </tr>
              </thead>
              <tbody>
                {teacherPerformance.map((teacher, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{teacher.teacher}</td>
                    <td className="py-3 px-4 text-gray-600">{teacher.students}</td>
                    <td className="py-3 px-4">
                      <span className={`${teacher.average >= 4.0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {teacher.average}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-indigo-600">{teacher.satisfaction}/5</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${teacher.average >= 4.2 ? 'bg-green-500' : teacher.average >= 4.0 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${(teacher.average / 5) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
