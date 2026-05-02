import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TeacherActivities() {
  const activities = [
    { 
      id: 1,
      name: 'Proyecto Final - Bases de Datos',
      type: 'Proyecto',
      dueDate: '05 Nov 2025',
      submitted: 47,
      total: 54,
      graded: 12,
      pending: 35,
      late: 7
    },
    { 
      id: 2,
      name: 'Quiz Capítulo 5',
      type: 'Evaluación',
      dueDate: '07 Nov 2025',
      submitted: 42,
      total: 54,
      graded: 42,
      pending: 0,
      late: 0
    },
    { 
      id: 3,
      name: 'Tarea Práctica React',
      type: 'Tarea',
      dueDate: '09 Nov 2025',
      submitted: 38,
      total: 54,
      graded: 30,
      pending: 8,
      late: 16
    },
    { 
      id: 4,
      name: 'Foro: Arquitecturas de Software',
      type: 'Foro',
      dueDate: '10 Nov 2025',
      submitted: 51,
      total: 54,
      graded: 51,
      pending: 0,
      late: 3
    },
    { 
      id: 5,
      name: 'Lectura Capítulo 6',
      type: 'Lectura',
      dueDate: '12 Nov 2025',
      submitted: 29,
      total: 54,
      graded: 0,
      pending: 29,
      late: 25
    },
  ];

  const punctualityData = [
    { activity: 'Proyecto BD', onTime: 40, late: 7, notSubmitted: 7 },
    { activity: 'Quiz Cap 5', onTime: 42, late: 0, notSubmitted: 12 },
    { activity: 'Tarea React', onTime: 22, late: 16, notSubmitted: 16 },
    { activity: 'Foro Arq.', onTime: 48, late: 3, notSubmitted: 3 },
    { activity: 'Lectura 6', onTime: 4, late: 25, notSubmitted: 25 },
  ];

  const getCompletionPercentage = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Actividades y Entregas</h1>
        <p className="text-gray-600">Gestión y seguimiento de tareas, proyectos y evaluaciones</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Actividades Activas</p>
                <p className="text-gray-900">5</p>
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
                <p className="text-gray-900">72</p>
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
                <p className="text-gray-900">156</p>
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
                <p className="text-gray-900">51</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Punctuality Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Puntualidad en Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={punctualityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="onTime" fill="#10B981" name="A tiempo" radius={[8, 8, 0, 0]} />
              <Bar dataKey="late" fill="#F59E0B" name="Tardías" radius={[8, 8, 0, 0]} />
              <Bar dataKey="notSubmitted" fill="#EF4444" name="Sin entregar" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Actividades</CardTitle>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              + Nueva Actividad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => {
                  const completionPercentage = getCompletionPercentage(activity.submitted, activity.total);
                  
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <p className="text-gray-900">{activity.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50">
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {activity.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">{activity.submitted}/{activity.total}</p>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getStatusColor(completionPercentage)}`}
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={activity.pending > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}>
                          {activity.pending}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={activity.late > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                          {activity.late}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {completionPercentage >= 80 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : completionPercentage >= 60 ? (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            Calificar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
