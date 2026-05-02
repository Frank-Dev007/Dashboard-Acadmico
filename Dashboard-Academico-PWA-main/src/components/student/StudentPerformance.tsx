import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function StudentPerformance() {
  const moduleData = [
    { module: 'Módulo 1', myGrade: 4.5, groupAvg: 3.8 },
    { module: 'Módulo 2', myGrade: 4.2, groupAvg: 3.9 },
    { module: 'Módulo 3', myGrade: 4.7, groupAvg: 4.0 },
    { module: 'Módulo 4', myGrade: 4.0, groupAvg: 3.7 },
    { module: 'Módulo 5', myGrade: 4.3, groupAvg: 3.8 },
  ];

  const progressData = [
    { month: 'Ago', grade: 3.8 },
    { month: 'Sep', grade: 4.0 },
    { month: 'Oct', grade: 4.2 },
    { month: 'Nov', grade: 4.2 },
  ];

  const competenciesData = [
    { competency: 'Análisis', value: 85 },
    { competency: 'Trabajo en Equipo', value: 90 },
    { competency: 'Comunicación', value: 75 },
    { competency: 'Creatividad', value: 80 },
    { competency: 'Pensamiento Crítico', value: 88 },
    { competency: 'Liderazgo', value: 70 },
  ];

  const coursePerformance = [
    { course: 'Matemáticas', grade: 4.2, trend: 'up', status: 'good' },
    { course: 'Programación', grade: 4.5, trend: 'up', status: 'excellent' },
    { course: 'Bases de Datos', grade: 3.5, trend: 'down', status: 'warning' },
    { course: 'Ing. Software', grade: 4.7, trend: 'up', status: 'excellent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Desempeño Académico</h1>
        <p className="text-gray-600">Análisis detallado de tu rendimiento y comparación con el grupo</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Promedio Actual</p>
                <p className="text-gray-900">4.2</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  +0.2 vs mes anterior
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Posición en el Grupo</p>
                <p className="text-gray-900">Top 15%</p>
                <p className="text-sm text-gray-500 mt-1">8 de 54 estudiantes</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Promedio del Grupo</p>
                <p className="text-gray-900">3.8</p>
                <p className="text-sm text-gray-500 mt-1">+0.4 por encima</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="myGrade" fill="#4F46E5" name="Mi Nota" radius={[8, 8, 0, 0]} />
              <Bar dataKey="groupAvg" fill="#94A3B8" name="Promedio Grupo" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución del Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="grade" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competencies Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Competencias Desarrolladas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={competenciesData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competency" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Nivel" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coursePerformance.map((course) => (
              <div key={course.course} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-gray-900">{course.course}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={
                    course.status === 'excellent' ? 'bg-green-100 text-green-700' :
                    course.status === 'good' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {course.status === 'excellent' && 'Excelente'}
                    {course.status === 'good' && 'Bueno'}
                    {course.status === 'warning' && 'Mejorar'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{course.grade}</span>
                    <TrendingUp className={`w-4 h-4 ${course.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
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
