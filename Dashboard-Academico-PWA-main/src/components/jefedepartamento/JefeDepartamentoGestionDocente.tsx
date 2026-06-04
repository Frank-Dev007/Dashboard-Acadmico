// Componente independiente del perfil "Jefe de Departamento".
// Muestra una tabla con UNA fila por cada (profesor × curso) del departamento.
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Mail, Calendar } from 'lucide-react';
import {
  getJefeDepartamentoTeachers,
  JefeDepartamentoTeachersData,
} from '@/service/api';

const DEPARTAMENTO = 'Ingenieria de sistemas';

// Fecha por defecto: últimos 30 días
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const promedioBadge = (avg: number | null) => {
  if (avg === null) return 'bg-gray-100 text-gray-600';
  if (avg >= 4.0) return 'bg-green-100 text-green-700';
  if (avg >= 3.4) return 'bg-blue-100 text-blue-700';
  if (avg >= 3.0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const riesgoBadge = (count: number) => {
  if (count === 0) return 'bg-green-100 text-green-700';
  if (count <= 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// Color del badge de frecuencia de sesión productiva
const frecuenciaBadge = (pct: number, totalSesiones: number) => {
  if (totalSesiones === 0) return 'bg-gray-100 text-gray-600';
  if (pct >= 70) return 'bg-green-100 text-green-700';
  if (pct >= 40) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function JefeDepartamentoGestionDocente() {
  const [data, setData] = useState<JefeDepartamentoTeachersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(daysAgo(30));
  const [toDate, setToDate] = useState(today());

  const fetchData = (from: string, to: string) => {
    setLoading(true);
    getJefeDepartamentoTeachers(DEPARTAMENTO, from, to)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => fetchData(fromDate, toDate);

  const rows = data?.rows ?? [];
  const filtered = rows.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.teacherName.toLowerCase().includes(term) ||
      r.teacherEmail.toLowerCase().includes(term) ||
      r.courseName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Gestión Docente</h1>
        <p className="text-gray-600">
          Profesores por curso del departamento{data?.categoryName ? `: ${data.categoryName}` : ''}
        </p>
      </div>

      {/* Filtros: búsqueda + rango de fechas */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <Label className="text-sm text-gray-600 mb-2 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Profesor, email o curso..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="fromDate" className="text-sm text-gray-600 mb-2 block">
                <Calendar className="w-3 h-3 inline mr-1" />
                Desde
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="toDate" className="text-sm text-gray-600 mb-2 block">
                <Calendar className="w-3 h-3 inline mr-1" />
                Hasta
              </Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleApply}
                disabled={loading}
              >
                {loading ? '...' : 'Aplicar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Docentes ({filtered.length})</CardTitle>
        </CardHeader>
        {/* Nota: el bloque explicativo está debajo de la tabla */}
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando docentes...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-gray-500">No hay docentes que coincidan.</p>
          )}
          {filtered.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-center">Total Actividades</TableHead>
                    <TableHead className="text-center">Promedio del Curso</TableHead>
                    <TableHead className="text-center">Estudiantes en Riesgo</TableHead>
                    <TableHead className="text-center">Total Accesos</TableHead>
                    <TableHead className="text-center">Recursos Publicados</TableHead>
                    <TableHead className="text-center">Frecuencia de Sesión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={`${r.teacherId}-${r.courseId}`}>
                      <TableCell>
                        <p className="text-gray-900">{r.teacherName}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {r.teacherEmail || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700">{r.courseName}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-gray-900 font-medium">{r.totalActividades}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={promedioBadge(r.promedio)}>
                          {r.promedio != null ? r.promedio.toFixed(2) : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={riesgoBadge(r.estudiantesEnRiesgo)}>
                          {r.estudiantesEnRiesgo} / {r.totalEstudiantes}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-indigo-600 font-semibold">{r.totalAccesos}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-purple-600 font-semibold">{r.recursosPublicados}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={frecuenciaBadge(r.frecuenciaSesion, r.totalSesiones)}>
                          {r.totalSesiones === 0
                            ? '—'
                            : `${r.frecuenciaSesion}% (${r.sesionesConMovimiento}/${r.totalSesiones})`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas explicativas de las columnas */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-6 text-sm text-gray-700 space-y-3">
          <p className="font-semibold text-gray-800">Notas sobre las columnas calculadas:</p>

          <div>
            <p><strong>Promedio del Curso:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Es el promedio de los promedios de todos los estudiantes inscritos en ese curso (escala 0–5).</li>
              <li>Las actividades calificadas se normalizan a la escala 0–5.</li>
              <li>Si una actividad no fue entregada y su fecha límite ya venció, cuenta como <strong>0.0</strong> en el promedio del estudiante.</li>
              <li>Si la actividad aún no vence o no tiene fecha, queda como pendiente y no afecta el promedio.</li>
            </ul>
          </div>

          <div>
            <p><strong>Estudiantes en Riesgo:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Cuenta los estudiantes con promedio en el curso <strong>≤ 3.3</strong> (riesgo medio + alto combinados).</li>
              <li>Formato <code className="bg-white px-1 rounded">X / Y</code> donde X es el número en riesgo y Y el total de estudiantes inscritos.</li>
            </ul>
          </div>

          <div>
            <p><strong>Total Accesos:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Cantidad de <strong>movimientos productivos</strong> del profesor en el curso dentro del rango de fechas seleccionado.</li>
              <li>Cuenta acciones reales: crear/modificar/eliminar foros, quizzes, tareas o recursos; calificar entregas; descargar plantillas.</li>
              <li><strong>NO cuenta</strong> entrar al curso ni abrir actividades sin hacer cambios (vistas pasivas).</li>
            </ul>
          </div>

          <div>
            <p><strong>Recursos Publicados:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Número de nuevos materiales publicados en el curso durante el rango de fechas.</li>
              <li>Incluye: archivos, libros, páginas, URLs/enlaces, carpetas y cualquier recurso del tipo módulo de curso.</li>
            </ul>
          </div>

          <div>
            <p><strong>Frecuencia de Sesión:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Porcentaje de sesiones (ingresos al curso) en las que el profesor realizó al menos un movimiento productivo.</li>
              <li>Una <em>sesión</em> arranca cada vez que el profesor entra al curso (evento <code className="bg-white px-1 rounded">course_viewed</code>) y termina cuando vuelve a entrar.</li>
              <li>Los <em>redirects automáticos</em> de Moodle (cuando después de una acción te devuelve a la página del curso) NO cuentan como nueva sesión. Se filtran si ocurren ≤ 30 segundos después del evento anterior.</li>
              <li>Si entró por bookmark directo a una actividad (sin pasar por la página principal), también cuenta como una sesión.</li>
              <li>Formato <code className="bg-white px-1 rounded">X% (productivas / totales)</code>.</li>
              <li>Ejemplo: <code className="bg-white px-1 rounded">50% (1/2)</code> → entró 2 veces y solo en 1 hizo cambios reales.</li>
              <li>🟢 ≥ 70% buena · 🟡 40–69% media · 🔴 &lt; 40% baja.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
