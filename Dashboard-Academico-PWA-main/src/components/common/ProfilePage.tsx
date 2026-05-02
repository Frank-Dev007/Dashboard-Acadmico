import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Edit, LogOut, Shield } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ProfilePageProps {
  role: 'student' | 'teacher' | 'admin';
  onLogout: () => void;
}

export default function ProfilePage({ role, onLogout }: ProfilePageProps) {
  const profiles = {
    student: {
      name: 'Ana María García',
      email: 'ana.garcia@email.com',
      phone: '+57 300 123 4567',
      location: 'Bogotá, Colombia',
      joined: '15 Ago 2023',
      program: 'Ingeniería de Sistemas',
      semester: '6to Semestre',
      code: 'EST-2023-0145',
      color: 'bg-blue-500'
    },
    teacher: {
      name: 'Dr. Carlos López Martínez',
      email: 'carlos.lopez@email.com',
      phone: '+57 301 234 5678',
      location: 'Medellín, Colombia',
      joined: '10 Feb 2020',
      program: 'Facultad de Ingeniería',
      department: 'Ciencias de la Computación',
      code: 'PROF-2020-0023',
      color: 'bg-green-500'
    },
    admin: {
      name: 'María Torres Administradora',
      email: 'admin@sistema.com',
      phone: '+57 302 345 6789',
      location: 'Cali, Colombia',
      joined: '01 Ene 2019',
      program: 'Administración del Sistema',
      department: 'Tecnología',
      code: 'ADM-2019-0001',
      color: 'bg-purple-500'
    }
  };

  const profile = profiles[role];

  const roleLabels = {
    student: 'Estudiante',
    teacher: 'Profesor',
    admin: 'Administrador'
  };

  const stats = role === 'student' ? [
    { label: 'Promedio General', value: '4.2' },
    { label: 'Créditos Completados', value: '96' },
    { label: 'Cursos Activos', value: '5' },
    { label: 'Posición en Grupo', value: 'Top 15%' },
  ] : role === 'teacher' ? [
    { label: 'Estudiantes', value: '54' },
    { label: 'Cursos Activos', value: '3' },
    { label: 'Promedio Curso', value: '3.9' },
    { label: 'Satisfacción', value: '4.6/5' },
  ] : [
    { label: 'Total Usuarios', value: '1,321' },
    { label: 'Cursos Activos', value: '42' },
    { label: 'Profesores', value: '87' },
    { label: 'Estudiantes', value: '1,234' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <AvatarFallback className={`${profile.color} text-white text-3xl`}>
                  {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Badge className={`${profile.color} text-white mb-2`}>
                {roleLabels[role]}
              </Badge>
              <p className="text-sm text-gray-600">{profile.code}</p>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 mb-1">{profile.name}</h2>
                  <p className="text-gray-600">{profile.program}</p>
                  {role === 'student' && <p className="text-sm text-gray-500">{profile.semester}</p>}
                  {(role === 'teacher' || role === 'admin') && <p className="text-sm text-gray-500">{profile.department}</p>}
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ubicación</p>
                    <p className="text-sm text-gray-900">{profile.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Miembro desde</p>
                    <p className="text-sm text-gray-900">{profile.joined}</p>
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
              <Input id="firstName" defaultValue={profile.name.split(' ')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" defaultValue={profile.name.split(' ').slice(1).join(' ')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" defaultValue={profile.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" type="tel" defaultValue={profile.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" defaultValue={profile.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
              <Input id="birthdate" type="date" />
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
              <p className="text-sm text-gray-600 mb-4">Actualiza tu contraseña regularmente para mantener tu cuenta segura</p>
              <Button variant="outline">
                Cambiar Contraseña
              </Button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-gray-900 mb-2">Autenticación de Dos Factores</h3>
              <p className="text-sm text-gray-600 mb-4">Agrega una capa adicional de seguridad a tu cuenta</p>
              <Button variant="outline">
                Configurar 2FA
              </Button>
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
