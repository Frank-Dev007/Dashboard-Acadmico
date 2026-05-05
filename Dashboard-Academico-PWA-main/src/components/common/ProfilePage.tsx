import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ProfilePageProps {
  role: 'student' | 'teacher' | 'admin';
  onLogout: () => void;
}

export default function ProfilePage({ role, onLogout }: ProfilePageProps) {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  const nombre = storedUser?.nombre ?? '';
  const apellido = storedUser?.apellido ?? '';
  const correo = storedUser?.correo ?? '';
  const username = storedUser?.username ?? '';
  const avatar = storedUser?.avatar ?? null;
  const fullName = `${nombre} ${apellido}`.trim() || username || 'Usuario';
  const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase() || 'U';

  const roleLabels = {
    student: 'Estudiante',
    teacher: 'Profesor',
    admin: 'Administrador',
  };

  const roleColors = {
    student: 'bg-blue-500',
    teacher: 'bg-green-500',
    admin: 'bg-purple-500',
  };

  const stats = role === 'student' ? [
    { label: 'Promedio General', value: '—' },
    { label: 'Créditos Completados', value: '—' },
    { label: 'Cursos Activos', value: '—' },
    { label: 'Posición en Grupo', value: '—' },
  ] : role === 'teacher' ? [
    { label: 'Estudiantes', value: '—' },
    { label: 'Cursos Activos', value: '—' },
    { label: 'Promedio Curso', value: '—' },
    { label: 'Satisfacción', value: '—' },
  ] : [
    { label: 'Total Usuarios', value: '—' },
    { label: 'Cursos Activos', value: '—' },
    { label: 'Profesores', value: '—' },
    { label: 'Estudiantes', value: '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Información personal y configuración de cuenta</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                {avatar && <AvatarImage src={avatar} alt={fullName} />}
                <AvatarFallback className={`${roleColors[role]} text-white text-3xl`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Badge className={`${roleColors[role]} text-white mb-2`}>
                {roleLabels[role]}
              </Badge>
              <p className="text-sm text-gray-600">@{username}</p>
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-gray-900 mb-1">{fullName}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{correo || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Usuario</p>
                    <p className="text-sm text-gray-900">{username || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" defaultValue={nombre} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" defaultValue={apellido} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue={correo} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usernameField">Usuario de Moodle</Label>
              <Input id="usernameField" defaultValue={username} disabled />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Guardar Cambios
            </Button>
            <Button variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-900 mb-2">Cambiar Contraseña</h3>
              <p className="text-sm text-gray-600 mb-4">
                La contraseña se gestiona desde Moodle
              </p>
              <Button variant="outline">Cambiar Contraseña en Moodle</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-900 mb-1">Cerrar Sesión</h3>
              <p className="text-sm text-red-700">Sal de tu cuenta en este dispositivo</p>
            </div>
            <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
