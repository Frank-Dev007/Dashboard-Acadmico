import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, FileCheck } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function TeacherReports() {
  const reportTemplates = [
    {
      id: 1,
      name: 'Reporte de Desempeño General',
      description: 'Análisis completo del rendimiento de todos los estudiantes',
      icon: TrendingUp,
      format: ['PDF', 'Excel'],
      color: 'bg-blue-50 text-blue-600',
      lastGenerated: '02 Nov 2025'
    },
    {
      id: 2,
      name: 'Reporte de Asistencia',
      description: 'Registro detallado de asistencia y participación',
      icon: Users,
      format: ['PDF', 'CSV'],
      color: 'bg-green-50 text-green-600',
      lastGenerated: '01 Nov 2025'
    },
    {
      id: 3,
      name: 'Reporte de Evaluaciones',
      description: 'Estadísticas de calificaciones por periodo',
      icon: FileCheck,
      format: ['PDF', 'Excel'],
      color: 'bg-purple-50 text-purple-600',
      lastGenerated: '30 Oct 2025'
    },
    {
      id: 4,
      name: 'Reporte de Entregas',
      description: 'Estado de tareas y proyectos entregados',
      icon: FileText,
      format: ['PDF', 'Excel', 'CSV'],
      color: 'bg-orange-50 text-orange-600',
      lastGenerated: '03 Nov 2025'
    },
    {
      id: 5,
      name: 'Reporte de Riesgo Académico',
      description: 'Identificación de estudiantes en riesgo',
      icon: TrendingUp,
      format: ['PDF'],
      color: 'bg-red-50 text-red-600',
      lastGenerated: '04 Nov 2025'
    },
    {
      id: 6,
      name: 'Reporte por Estudiante',
      description: 'Análisis individual detallado por estudiante',
      icon: Users,
      format: ['PDF'],
      color: 'bg-indigo-50 text-indigo-600',
      lastGenerated: '31 Oct 2025'
    },
  ];

  const recentReports = [
    { name: 'Desempeño_General_Nov_2025.pdf', date: '04 Nov 2025', size: '2.3 MB', downloads: 3 },
    { name: 'Asistencia_Octubre_2025.xlsx', date: '01 Nov 2025', size: '856 KB', downloads: 5 },
    { name: 'Evaluaciones_Corte3_2025.pdf', date: '30 Oct 2025', size: '1.8 MB', downloads: 8 },
    { name: 'Entregas_Semanales.csv', date: '28 Oct 2025', size: '124 KB', downloads: 2 },
  ];

  const quickFilters = [
    { label: 'Último mes', value: '30d' },
    { label: 'Último trimestre', value: '90d' },
    { label: 'Semestre actual', value: 'semester' },
    { label: 'Año académico', value: 'year' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Reportes y Exportación</h1>
        <p className="text-gray-600">Genera y descarga reportes detallados en múltiples formatos</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reportes Generados</p>
                <p className="text-gray-900">127</p>
              </div>
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                <p className="text-gray-900">18</p>
              </div>
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Descargas</p>
                <p className="text-gray-900">342</p>
              </div>
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Formatos Disponibles</p>
                <p className="text-gray-900">3</p>
              </div>
              <FileCheck className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Filtros Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => (
              <Button key={filter.value} variant="outline" size="sm">
                {filter.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-600 border-indigo-200">
              <Calendar className="w-4 h-4 mr-2" />
              Rango Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div>
        <h2 className="text-gray-900 mb-4">Plantillas de Reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${template.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1">
                      {template.format.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Último: {template.lastGenerated}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Generar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reportes Recientes</CardTitle>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{report.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{report.date}</span>
                      <span>{report.size}</span>
                      <span>{report.downloads} descargas</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle>Opciones de Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-gray-900">PDF</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Formato ideal para reportes formales y presentaciones</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Gráficos de alta calidad</li>
                <li>• Tablas formateadas</li>
                <li>• Listo para imprimir</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-gray-900">Excel</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Perfecto para análisis avanzado de datos</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Datos estructurados</li>
                <li>• Filtros y ordenamiento</li>
                <li>• Cálculos personalizados</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-gray-900">CSV</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Óptimo para importar a otros sistemas</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Compatible universal</li>
                <li>• Ligero y rápido</li>
                <li>• Fácil integración</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
