import { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

// Evento no estándar de Chrome/Edge/Android
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwaInstallDismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS
  (window.navigator as any).standalone === true;

const isIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
  !(window.navigator as any).standalone;

export default function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Si ya está instalada o el usuario la descartó antes, no mostrar
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === 'true') return;

    // Android / Chrome / Edge
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS no dispara beforeinstallprompt → mostramos instrucción manual
    if (isIOS()) {
      setShowIOSHint(true);
      setVisible(true);
    }

    // Cuando se instala, ocultar
    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md bg-white border border-indigo-200 rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
          <Download className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium text-sm">Instala la aplicación</p>
          {showIOSHint ? (
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 flex-wrap">
              Toca <Share className="w-3 h-3 inline" /> y luego
              <span className="font-medium">"Añadir a pantalla de inicio"</span>
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-1">
              Añádela a tu pantalla de inicio para acceso rápido y uso sin conexión.
            </p>
          )}

          {!showIOSHint && (
            <button
              onClick={handleInstall}
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Añadir a pantalla de inicio
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
