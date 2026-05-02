import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Calendar, TrendingUp, Monitor } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentHabits() {
  const weeklyData = [
    { day: 'Lun', hours: 4.5 },
    { day: 'Mar', hours: 3.2 },
    { day: 'Mié', hours: 5.1 },
    { day: 'Jue', hours: 2.8 },
    { day: 'Vie', hours: 4.0 },
    { day: 'Sáb', hours: 6.2 },
    { day: 'Dom', hours: 3.5 },
  ];

  const heatmapData = [
    { day: 'Lun', hours: [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 0, 0] },
    { day: 'Mar', hours: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0] },
    { day: 'Mié', hours: [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 1, 0, 0, 0] },
    { day: 'Jue', hours: [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0] },
    { day: 'Vie', hours: [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0] },
    { day: 'Sáb', hours: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 2, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0] },
    { day: 'Dom', hours: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0] },
  ];

  const stats = [
    { label: 'Promedio Semanal', value: '28.5h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', change: '+2.3h' },
    { label: 'Días Activos', value: '7/7', icon: Calendar, color: 'text-green-600', bg: 'bg-green-50', change: 'Constante' },
    { label: 'Mejor Día', value: 'Sábado', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', change: '6.2h' },
    { label: 'Sesiones', value: '42', icon: Monitor, color: 'text-orange-600', bg: 'bg-orange-50', change: '+5 vs semana ant.' },
  ];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value === 1) return 'bg-indigo-200';
    if (value === 2) return 'bg-indigo-400';
    if (value === 3) return 'bg-indigo-600';
    return 'bg-indigo-800';
  };

  const peakHours = [
    { time: '08:00 - 10:00', activity: 'Alta', percentage: 85 },
    { time: '14:00 - 17:00', activity: 'Muy Alta', percentage: 95 },
    { time: '19:00 - 21:00', activity: 'Media', percentage: 60 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Hábitos de Estudio</h1>
        <p className="text-gray-600">Análisis de tus patrones de estudio y tiempo de conexión</p>
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

      {/* Weekly Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Horas de Estudio por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor Semanal (Días × Horas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 overflow-x-auto">
            <div className="flex gap-2 mb-4">
              <div className="w-12"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="w-6 text-xs text-gray-500 text-center">
                  {i}
                </div>
              ))}
            </div>
            {heatmapData.map((row) => (
              <div key={row.day} className="flex gap-2 items-center">
                <div className="w-12 text-sm text-gray-700">{row.day}</div>
                {row.hours.map((value, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded ${getHeatmapColor(value)} transition-all hover:scale-110 cursor-pointer`}
                    title={`${row.day} ${idx}:00 - ${value > 0 ? 'Activo' : 'Inactivo'}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-600">
            <span>Menos</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <div className="w-4 h-4 bg-indigo-200 rounded" />
              <div className="w-4 h-4 bg-indigo-400 rounded" />
              <div className="w-4 h-4 bg-indigo-600 rounded" />
              <div className="w-4 h-4 bg-indigo-800 rounded" />
            </div>
            <span>Más</span>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios Pico de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peakHours.map((peak, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-900">{peak.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{peak.activity}</span>
                    <span className="text-sm text-indigo-600">{peak.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${peak.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Excelente consistencia en tu rutina de estudio semanal</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Tus mejores horas son entre 14:00 - 17:00, aprovecha este horario para tareas complejas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Considera tomar descansos cada 2 horas para mantener la concentración</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
