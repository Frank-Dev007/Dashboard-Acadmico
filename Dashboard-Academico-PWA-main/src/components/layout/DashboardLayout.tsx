import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  BookOpen,
  FileCheck,
  Users,
  Settings,
  FileText,
  Upload,
  User,
  LogOut,
  Bell,
  Search,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'admin';
  onLogout: () => void;
}

export default function DashboardLayout({ children, role, onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const studentNav = [
    { icon: Home, label: 'Inicio', path: '/student' },
    { icon: BarChart3, label: 'Desempeño', path: '/student/performance' },
    { icon: MessageSquare, label: 'Participación', path: '/student/participation' },
    { icon: Clock, label: 'Hábitos de Estudio', path: '/student/habits' },
    { icon: AlertTriangle, label: 'Alertas', path: '/student/alerts' },
  ];

  const teacherNav = [
    { icon: Home, label: 'Inicio', path: '/teacher' },
    { icon: BookOpen, label: 'Actividades', path: '/teacher/activities' },
    { icon: FileCheck, label: 'Evaluaciones', path: '/teacher/evaluations' },
    { icon: TrendingUp, label: 'Mapa de Riesgo', path: '/teacher/risk-map' },
    { icon: FileText, label: 'Reportes', path: '/teacher/reports' },
  ];

  const adminNav = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Gestión de Usuarios', path: '/admin/users' },
    { icon: Upload, label: 'Carga Masiva', path: '/admin/bulk-upload' },
    { icon: Settings, label: 'Configuración', path: '/admin/settings' },
    { icon: FileText, label: 'Reportes Ejecutivos', path: '/admin/reports' },
  ];

  const navigation = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  const roleNames = {
    student: 'Estudiante',
    teacher: 'Profesor',
    admin: 'Administrador'
  };

  const roleColors = {
    student: 'bg-blue-500',
    teacher: 'bg-green-500',
    admin: 'bg-purple-500'
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const displayName = storedUser
    ? `${storedUser.nombre} ${storedUser.apellido}`.trim()
    : 'Usuario Demo';
  const initials = storedUser
    ? `${storedUser.nombre?.[0] ?? ''}${storedUser.apellido?.[0] ?? ''}`.toUpperCase()
    : roleNames[role][0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-lg p-2">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-gray-900">Dashboard Académico PWA</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm flex-1"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <Link to={`/${role}/profile`} className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className={roleColors[role]}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{roleNames[role]}</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200 
            transform transition-transform duration-200 ease-in-out z-30
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <Link
              to={`/${role}/profile`}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 mb-2"
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
