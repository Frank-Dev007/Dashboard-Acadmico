import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTeacherNotifications, markTeacherNotificationsRead, RiskAlert } from '@/service/api';
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
  TrendingUp,
  ClipboardList,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'teacher' | 'admin' | 'jefedepartamento';
  onLogout: () => void;
}

export default function DashboardLayout({ children, role, onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // ── Notificaciones de riesgo (solo profesor) ──────────────────────────────
  const [notifs, setNotifs] = useState<RiskAlert[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (role !== 'teacher' || !notifUserId) return;
    let active = true;
    const load = () =>
      getTeacherNotifications(notifUserId)
        .then((d) => {
          if (active && d.ok) setNotifs(d.alerts || []);
        })
        .catch(() => {});
    load();
    const iv = setInterval(load, 5 * 60 * 1000); // refrescar cada 5 min
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [role, notifUserId]);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifOpen]);

  const handleToggleNotifs = () => {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    // Al abrir, marcar como leídas en el backend (se mantienen visibles en el panel)
    if (willOpen && role === 'teacher' && notifUserId && notifs.length > 0) {
      markTeacherNotificationsRead(notifUserId).catch(() => {});
    }
  };

  const fmtAlertDate = (ms: number) => {
    const diff = Date.now() - ms;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h}h`;
    return `Hace ${Math.floor(h / 24)}d`;
  };

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

  const jefeNav = [
    { icon: Home, label: 'Dashboard', path: '/jefedepartamento' },
    { icon: Users, label: 'Gestión de Usuarios', path: '/jefedepartamento/users' },
    { icon: ClipboardList, label: 'Gestión Docente', path: '/jefedepartamento/gestion-docente' },
    { icon: Activity, label: 'Movimientos Docentes', path: '/jefedepartamento/movimientos' },
    { icon: Upload, label: 'Carga Masiva', path: '/jefedepartamento/bulk-upload' },
    { icon: Settings, label: 'Configuración', path: '/jefedepartamento/settings' },
    { icon: FileText, label: 'Reportes Ejecutivos', path: '/jefedepartamento/reports' },
  ];

  const navigation =
    role === 'student' ? studentNav :
    role === 'teacher' ? teacherNav :
    role === 'admin'   ? adminNav   :
    jefeNav;

  const roleNames = {
    student: 'Estudiante',
    teacher: 'Profesor',
    admin: 'Administrador',
    jefedepartamento: 'Jefe de Departamento'
  };

  const roleColors = {
    student: 'bg-blue-500',
    teacher: 'bg-green-500',
    admin: 'bg-purple-500',
    jefedepartamento: 'bg-orange-500'
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
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleToggleNotifs}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {notifs.length > 9 ? '9+' : notifs.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-gray-900">Alertas de riesgo</p>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">
                        No hay alertas nuevas.
                      </p>
                    ) : (
                      notifs.map((a) => (
                        <Link
                          key={`${a.studentId}-${a.date}`}
                          to="/teacher/risk-map"
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                          <div className="bg-red-100 p-2 rounded-lg shrink-0">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <strong>{a.nombre}</strong> pasó a riesgo alto
                            </p>
                            <p className="text-xs text-gray-500">
                              Score {Math.round(a.score * 100)}% · {fmtAlertDate(a.date)}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  {notifs.length > 0 && (
                    <Link
                      to="/teacher/risk-map"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm text-indigo-600 hover:bg-indigo-50 border-t border-gray-100"
                    >
                      Ver mapa de riesgo
                    </Link>
                  )}
                </div>
              )}
            </div>

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
