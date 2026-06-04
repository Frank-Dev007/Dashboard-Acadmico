// Componente independiente del perfil "Jefe de Departamento".
// Sección "Gestión de Movimientos Docentes": muestra cómo el profesor está
// gestionando las entregas de cada actividad (entregas recibidas, calificadas
// y si descargó la plantilla de entregas).
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Mail, Check, X, Calendar } from 'lucide-react';
import {
  getJefeDepartamentoMovimientos,
  getJefeDepartamentoSemesters,
  JefeDepartamentoMovimientosData,
} from '@/service/api';

const DEPARTAMENTO = 'Ingenieria de sistemas';

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const formatDate = (ms: number | null): string => {
  if (ms == null) return '—';
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
};

const promedioBadge = (avg: number | null) => {
  if (avg === null) return 'bg-gray-100 text-gray-600';
  if (avg >= 4.0) return 'bg-green-100 text-green-700';
  if (avg >= 3.4) return 'bg-blue-100 text-blue-700';
  if (avg >= 3.0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function JefeDepartamentoMovimientos() {
  const [data, setData] = useState<JefeDepartamentoMovimientosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesters, setSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  // Cargar lista de semestres disponibles al montar el componente
  useEffect(() => {
    getJefeDepartamentoSemesters(DEPARTAMENTO)
      .then((d) => {
        const list = d.semesters ?? [];
        setSemesters(list);
        // Default: semestre actual si está en la lista, sino el más reciente
        const initial =
          d.currentSemester && list.includes(d.currentSemester)
            ? d.currentSemester
            : list[0] ?? '';
        setSelectedSemester(initial);
      })
      .catch(() => {
        setSemesters([]);
        setSelectedSemester('');
      });
  }, []);

  // Refetch movimientos cada vez que cambia el semestre seleccionado
  useEffect(() => {
    if (!selectedSemester) return;
    setLoading(true);
    getJefeDepartamentoMovimientos(DEPARTAMENTO, selectedSemester)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedSemester]);

  const rows = data?.rows ?? [];
  const teacherCourseAvgs = data?.teacherCourseAvgs ?? {};

  const filtered = rows.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.teacherName.toLowerCase().includes(term) ||
      r.teacherEmail.toLowerCase().includes(term) ||
      r.courseName.toLowerCase().includes(term) ||
      r.assignmentName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Gestión de Movimientos Docentes</h1>
        <p className="text-gray-600">
          Entregas recibidas, calificadas y descarga de plantillas por actividad
          {data?.categoryName ? ` — ${data.categoryName}` : ''}
        </p>
      </div>

      {/* Filtros: semestre + buscador */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <Label htmlFor="semester" className="text-sm text-gray-600 mb-2 block">
                <Calendar className="w-3 h-3 inline mr-1" />
                Semestre
              </Label>
              <Select
                value={selectedSemester}
                onValueChange={(v: string) => setSelectedSemester(v)}
                disabled={semesters.length === 0}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Selecciona un semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-8">
              <Label className="text-sm text-gray-600 mb-2 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Profesor, email, curso o actividad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos por Actividad ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando movimientos...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-gray-500">No hay movimientos que coincidan.</p>
          )}
          {filtered.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead className="text-center">Entregas</TableHead>
                    <TableHead className="text-center">Calificadas en Plataforma</TableHead>
                    <TableHead className="text-center">¿Descargó Plantilla?</TableHead>
                    <TableHead className="text-center">Promedio Curso (ajustado)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const promCurso = teacherCourseAvgs[`${r.teacherId}-${r.courseId}`] ?? null;
                    return (
                      <TableRow key={`${r.teacherId}-${r.courseId}-${r.assignmentId}`}>
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
                        <TableCell>
                          <p className="text-sm text-gray-900">{r.assignmentName}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">{formatDate(r.duedate)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-gray-900 font-medium">
                            {r.totalEntregas}/{r.totalEstudiantes}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              r.calificadas === 0 && r.totalEntregas > 0
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }
                          >
                            {r.calificadas}/{r.totalEntregas}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.descargoPlantilla ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">
                              <Check className="w-3 h-3" />
                              Sí
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                              <X className="w-3 h-3" />
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={promedioBadge(promCurso)}>
                            {promCurso != null ? promCurso.toFixed(2) : '—'}
                          </Badge>
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

      {/* Leyenda explicativa */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-6 text-sm text-gray-700 space-y-2">
          <p><strong>Promedio Curso (ajustado):</strong> el promedio considera la siguiente regla:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Si el profesor <strong>descargó la plantilla</strong> de entregas y NO calificó nada en plataforma, el promedio NO se calcula (puede tener notas externas).</li>
            <li>Si calificó dentro de la plataforma, esas notas cuentan normalmente.</li>
            <li>Si la fecha límite pasó y un estudiante no entregó, ese 0.0 sí entra en el promedio.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
