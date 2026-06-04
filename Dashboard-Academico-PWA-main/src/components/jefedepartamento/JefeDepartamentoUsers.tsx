// Componente independiente del perfil "Jefe de Departamento".
// Muestra los usuarios reales del departamento (categoría de Moodle).
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Mail } from 'lucide-react';
import {
  getJefeDepartamentoStats,
  getJefeDepartamentoUsers,
  JefeDepartamentoStats,
  JefeDepartamentoUsersData,
} from '@/service/api';

const DEPARTAMENTO = 'Ingenieria de sistemas';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatLastAccess = (ts: number): string => {
  if (!ts || ts <= 0) return 'Nunca';
  const diff = Date.now() - ts * 1000;
  if (diff < 0) return 'Ahora';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semana(s)`;
  if (days < 365) return `Hace ${Math.floor(days / 30)} mes(es)`;
  return `Hace ${Math.floor(days / 365)} año(s)`;
};

// Formatea horas decimales como "1h 30min" o "45 min" o "2h"
const formatSessionDuration = (hours: number | undefined): string => {
  if (hours == null || hours <= 0) return '—';
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'student': return 'bg-blue-100 text-blue-700';
    case 'teacher': return 'bg-green-100 text-green-700';
    case 'admin':   return 'bg-orange-100 text-orange-700';
    default:        return 'bg-gray-100 text-gray-700';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'student': return 'Estudiante';
    case 'teacher': return 'Profesor';
    case 'admin':   return 'Jefe de Departamento';
    default:        return role;
  }
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function JefeDepartamentoUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [statsData, setStatsData] = useState<JefeDepartamentoStats | null>(null);
  const [usersData, setUsersData] = useState<JefeDepartamentoUsersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getJefeDepartamentoStats(DEPARTAMENTO),
      getJefeDepartamentoUsers(DEPARTAMENTO),
    ])
      .then(([s, u]) => {
        setStatsData(s);
        setUsersData(u);
      })
      .catch(() => {
        setStatsData(null);
        setUsersData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Inyectar al jefe de departamento (sentinela actual) como primera fila
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const jefeRow = storedUser
    ? {
        id: storedUser.id ?? 0,
        nombre: `${storedUser.nombre ?? ''} ${storedUser.apellido ?? ''}`.trim() || storedUser.username || 'Jefe',
        correo: storedUser.correo ?? '',
        role: 'admin' as const,
        lastaccess: Math.floor(Date.now() / 1000),
        avgSessionHours: undefined as number | undefined,
      }
    : null;

  const baseUsers = usersData?.users ?? [];
  const allUsers = jefeRow ? [jefeRow, ...baseUsers] : baseUsers;

  // Filtrado por búsqueda + rol
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.correo ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Stats: total = estudiantes + profesores + 1 (jefe)
  const totalEstudiantes = statsData?.totalEstudiantes ?? 0;
  const totalProfesores = statsData?.totalProfesores ?? 0;
  const jefes = 1;
  const totalUsuarios = totalEstudiantes + totalProfesores + jefes;

  const fmt = (v: number | undefined) =>
    loading ? '...' : v != null ? String(v) : '—';

  const stats = [
    { label: 'Total Usuarios',         value: loading ? '...' : String(totalUsuarios), color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Estudiantes',            value: fmt(totalEstudiantes),                    color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Profesores',             value: fmt(totalProfesores),                     color: 'text-purple-600',bg: 'bg-purple-50' },
    { label: 'Jefes de Departamento',  value: loading ? '...' : String(jefes),          color: 'text-orange-600',bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administra estudiantes, profesores y jefes de departamento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`font-semibold text-2xl ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="student">Estudiantes</SelectItem>
                <SelectItem value="teacher">Profesores</SelectItem>
                <SelectItem value="admin">Jefes de Departamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-gray-500">Cargando usuarios...</p>}
          {!loading && filteredUsers.length === 0 && (
            <p className="text-sm text-gray-500">No hay usuarios que coincidan.</p>
          )}
          {filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-center">Tiempo Promedio (sesión)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={`${user.role}-${user.id}`}>
                      <TableCell>
                        <p className="text-gray-900">{user.nombre}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.correo || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadge(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {usersData?.categoryName ?? DEPARTAMENTO}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{formatLastAccess(user.lastaccess)}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.avgSessionHours != null && user.avgSessionHours > 0 ? (
                          <span className="text-indigo-600 font-semibold">
                            {formatSessionDuration(user.avgSessionHours)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nota explicativa de la columna calculada */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-6 text-sm text-gray-700 space-y-3">
          <p className="font-semibold text-gray-800">Notas sobre las columnas calculadas:</p>

          <div>
            <p><strong>Último Acceso:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Para profesores y estudiantes: timestamp del último <em>movimiento significativo</em> dentro de los cursos del departamento (no cuenta solo entrar al curso).</li>
              <li>Para el jefe de departamento: marca la sesión actual del propio usuario logueado.</li>
            </ul>
          </div>

          <div>
            <p><strong>Tiempo Promedio (sesión):</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
              <li>Duración promedio de las sesiones productivas del usuario en los cursos del departamento, en formato <code className="bg-white px-1 rounded">Xh Ymin</code>.</li>
              <li>Una <em>sesión</em> arranca cada vez que el usuario entra al curso (evento <code className="bg-white px-1 rounded">course_viewed</code>) y termina cuando vuelve a entrar.</li>
              <li>
                <strong>Cómo se mide la duración:</strong> desde el inicio de la sesión (entrada al curso) hasta el <strong>último movimiento productivo</strong> realizado en esa sesión.
                <br />
                <span className="text-gray-500">
                  Ejemplo: si el usuario entra a la 1:00 y su último movimiento productivo es a la 1:30, la sesión dura <strong>30 min</strong>. No importa cuánto tiempo deje la pestaña abierta después — lo que no se hace, no cuenta.
                </span>
              </li>
              <li>Los <em>redirects automáticos</em> de Moodle (cuando después de una acción te devuelve al curso) NO cuentan como nueva sesión si ocurren ≤ 30 segundos después del evento anterior.</li>
              <li>El promedio se calcula <strong>solo sobre sesiones que tuvieron al menos un movimiento productivo</strong>. Las sesiones donde el usuario solo entró y se fue (sin hacer nada) NO se promedian.</li>
              <li>Para sesiones con un solo movimiento (sin nada después) se asume una duración mínima de 5 minutos.</li>
              <li>Los criterios de <em>movimiento productivo</em> dependen del rol:</li>
              <li className="ml-4">
                <strong>Profesor:</strong> crear/modificar/eliminar foros, quizzes o tareas; calificar entregas; descargar plantillas; publicar materiales. <strong>NO cuenta</strong> solo entrar al curso o abrir actividades sin tocar nada.
              </li>
              <li className="ml-4">
                <strong>Estudiante:</strong> entregar una tarea, terminar un quiz, postear en un foro, hacer clic en un recurso o material (PDF, libro, página, URL, etc). <strong>NO cuenta</strong> abrir una tarea o quiz sin completarlo.
              </li>
              <li className="ml-4">
                <strong>Jefe de Departamento:</strong> no se calcula (muestra <code className="bg-white px-1 rounded">—</code>) ya que es el usuario logueado en este momento.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
