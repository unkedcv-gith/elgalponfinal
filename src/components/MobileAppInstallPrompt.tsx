import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import logoBlanca from '../assets/images/marca_el_galpon_blanca.svg';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const MobileAppInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isApp = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    // Check if already dismissed in session or localStorage
    const dismissed = localStorage.getItem('el_galpon_app_prompt_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('el_galpon_app_prompt_dismissed', 'true');
    } catch {}
  };

  // Don't show if desktop, standalone, dismissed, or unsupported
  if (isStandalone || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Mobile App Install Card Floating Banner */}
      <aside aria-label="Instalar App" className="fixed top-20 left-3 right-3 z-40 md:hidden animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="bg-zinc-950/95 border-2 border-[#1EB8BF] rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(30,184,191,0.3)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-black border border-white/20 p-1.5 flex items-center justify-center shrink-0">
              <img src={logoBlanca} alt="El Galpón" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="font-heading font-black text-xs uppercase text-white truncate flex items-center gap-1.5">
                <span>Instalar como App</span>
                <span className="text-[9px] font-black bg-[#1EB8BF] text-black px-1.5 py-0.2 rounded-md">
                  Rápido
                </span>
              </h4>
              <p className="text-[11px] text-zinc-300 truncate">
                Accedé directo desde tu pantalla de inicio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-[#1EB8BF] to-[#25D366] text-black font-heading font-black text-xs uppercase px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Instalar</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-950 border-2 border-[#1EB8BF] rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Share className="w-5 h-5 text-[#1EB8BF]" />
                <h3 className="font-heading font-black text-sm uppercase text-white">
                  Instalar en iPhone / iPad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1EB8BF] text-black font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Tocá el botón <strong className="text-white">Compartir</strong> de la barra de Safari (el ícono de un cuadrado con una flecha hacia arriba).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1EB8BF] text-black font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="flex items-center gap-1.5 flex-wrap">
                  Deslizá y elegí <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold border border-white/20"><PlusSquare className="w-3.5 h-3.5" /> Agregar al inicio</span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1EB8BF] text-black font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Confirmá tocando <strong className="text-[#1EB8BF]">Agregar</strong> arriba a la derecha. ¡Listo! Se abrirá como app a pantalla completa.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1EB8BF] text-black font-heading font-black text-xs uppercase hover:brightness-105 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
