import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-6">
            <Search className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-gray-900 mb-4">404 - Página No Encontrada</h1>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver Atrás
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </Button>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">¿Necesitas ayuda?</p>
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
            Contacta con soporte técnico
          </a>
        </div>
      </div>
    </div>
  );
}
