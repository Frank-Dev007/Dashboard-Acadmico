import { Button } from '../ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <WifiOff className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-gray-900 mb-4">Sin Conexión a Internet</h1>
          <p className="text-gray-600 mb-8">
            Parece que no tienes conexión a internet. Verifica tu conexión y vuelve a intentarlo.
          </p>
        </div>

        <Button 
          onClick={handleRetry}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar Conexión
        </Button>

        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-4">Mientras tanto, puedes intentar:</p>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Verificar tu conexión Wi-Fi o datos móviles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Revisar que el modo avión esté desactivado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Reiniciar tu router si estás en casa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Contactar a tu proveedor de internet si el problema persiste</span>
            </li>
          </ul>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Esta aplicación requiere conexión a internet para funcionar correctamente.
        </p>
      </div>
    </div>
  );
}
