import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { loginRequest } from "@/service/api";



interface LoginPageProps {
  onLogin: (role: 'student' | 'teacher' | 'admin' | 'jefedepartamento') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Usuario centinela: Jefe de Departamento (no existe en Moodle)
    if (username === 'jefedepsistema' && password === 'jefe123*') {
      const sentinelUser = {
        id: 0,
        nombre: 'Jefe',
        apellido: 'de Departamento',
        correo: 'jefedep@sistema.local',
        tipo_usuario: 'admin' as const,
        username: 'jefedepsistema',
        avatar: null,
      };
      localStorage.setItem('user', JSON.stringify(sentinelUser));
      onLogin('jefedepartamento');
      toast.success("Inicio de sesión exitoso");
      navigate('/jefedepartamento');
      setIsLoading(false);
      return;
    }

    try {
      const res = await loginRequest(username, password);

      if (!res.ok || !res.user) {
        toast.error(res.msg || "Credenciales incorrectas");
        setIsLoading(false);
        return;
      }

      // Mapear tipo Moodle → rol de la app
      const tipo = res.user.tipo_usuario;
      let role: 'student' | 'teacher' | 'admin' | 'jefedepartamento' = 'student';
      if (tipo === 'docente') role = 'teacher';
      else if (tipo === 'admin') role = 'admin';

      // Guardar usuario y token de Moodle
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.moodleToken) {
        localStorage.setItem('moodleToken', res.moodleToken);
      }

      onLogin(role);
      toast.success("Inicio de sesión exitoso");
      navigate(`/${role}`);
    } catch (error) {
      console.error("ERROR LOGIN FRONT:", error);
      toast.error("Error de conexión con el servidor");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-12 flex-col justify-center items-center text-white">
        <div className="max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
            <GraduationCap className="w-24 h-24 text-white" />
          </div>
          <h1 className="mb-4">Dashboard Académico PWA</h1>
          <p className="text-indigo-100 text-lg">
            Gestiona y visualiza el desempeño académico en tiempo real. 
            Plataforma integral para estudiantes, profesores, jefes de departamento y administradores.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-indigo-100">Seguimiento en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-indigo-100">Alertas tempranas personalizadas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-indigo-100">Análisis y reportes avanzados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-indigo-600 rounded-2xl p-6 mb-4">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-gray-900 text-center">Dashboard Académico PWA</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Iniciar Sesión</h2>
              <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="tu.usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda?{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                  Contacta soporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
