// Componente independiente del perfil "Jefe de Departamento".
// Inicialmente es una copia de AdminUsers. Cualquier cambio aquí
// NO afecta a /admin y viceversa.
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Plus, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function JefeDepartamentoUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const users = [
    { id: 1, name: 'Ana García', email: 'ana.garcia@email.com', role: 'student', program: 'Ing. Sistemas', status: 'active', lastLogin: 'Hoy' },
    { id: 2, name: 'Carlos López', email: 'carlos.lopez@email.com', role: 'teacher', program: 'Ing. Software', status: 'active', lastLogin: 'Hace 2h' },
    { id: 3, name: 'María Torres', email: 'maria.torres@email.com', role: 'student', program: 'Ciencia Datos', status: 'active', lastLogin: 'Ayer' },
    { id: 4, name: 'Juan Pérez', email: 'juan.perez@email.com', role: 'student', program: 'Ing. Sistemas', status: 'inactive', lastLogin: 'Hace 15 días' },
    { id: 5, name: 'Dr. Roberto Díaz', email: 'roberto.diaz@email.com', role: 'teacher', program: 'Matemáticas', status: 'active', lastLogin: 'Hoy' },
    { id: 6, name: 'Laura Gómez', email: 'laura.gomez@email.com', role: 'student', program: 'Ing. Industrial', status: 'active', lastLogin: 'Hace 3h' },
    { id: 7, name: 'Jefe Principal', email: 'jefedep@sistema.com', role: 'admin', program: 'Departamento', status: 'active', lastLogin: 'Hace 1h' },
    { id: 8, name: 'Sofia Ramírez', email: 'sofia.ramirez@email.com', role: 'student', program: 'Administración', status: 'active', lastLogin: 'Hoy' },
  ];

  const stats = [
    { label: 'Total Usuarios', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Estudiantes', value: users.filter(u => u.role === 'student').length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Profesores', value: users.filter(u => u.role === 'teacher').length, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Jefes de Departamento', value: users.filter(u => u.role === 'admin').length, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getRoleBadge = (role: string) => {
    const badges = {
      student: 'bg-blue-100 text-blue-700',
      teacher: 'bg-green-100 text-green-700',
      admin: 'bg-orange-100 text-orange-700'
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      student: 'Estudiante',
      teacher: 'Profesor',
      admin: 'Jefe de Departamento'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const handleDelete = (_userId: number) => {
    toast.success(`Usuario eliminado correctamente`);
  };

  const handleEdit = (userId: number) => {
    toast.info(`Editando usuario ${userId}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra estudiantes, profesores y jefes de departamento</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="usuario@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="teacher">Profesor</SelectItem>
                    <SelectItem value="admin">Jefe de Departamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Programa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sistemas">Ing. Sistemas</SelectItem>
                    <SelectItem value="software">Ing. Software</SelectItem>
                    <SelectItem value="datos">Ciencia de Datos</SelectItem>
                    <SelectItem value="industrial">Ing. Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-gray-900 ${stat.color}`}>{stat.value}</p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="text-gray-900">{user.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{user.program}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user.status)}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{user.lastLogin}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
