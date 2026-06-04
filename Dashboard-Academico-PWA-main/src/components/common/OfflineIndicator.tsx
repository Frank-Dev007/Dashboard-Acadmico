import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

// Banner fijo que aparece cuando el navegador pierde conexión.
// Cuando vuelve la conexión muestra un aviso breve verde y se oculta.
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      // Ocultar el aviso de "reconectado" después de 3s
      setTimeout(() => setJustReconnected(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-sm py-2 px-4 flex items-center justify-center gap-2 shadow-md">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Estás sin conexión — mostrando los últimos datos disponibles</span>
      </div>
    );
  }

  if (justReconnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white text-sm py-2 px-4 flex items-center justify-center gap-2 shadow-md">
        <Wifi className="w-4 h-4 shrink-0" />
        <span>Conexión restablecida</span>
      </div>
    );
  }

  return null;
}
