import React, { useState, useEffect } from 'react';
import { Home, Cake, Sun, CalendarCheck, MessageCircle } from 'lucide-react';
import { BRAND_INFO } from '../data/initialData';

interface MobileAppNavBarProps {
  onOpenBooking: () => void;
}

export const MobileAppNavBar: React.FC<MobileAppNavBarProps> = ({ onOpenBooking }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'cumples' | 'up' | 'reservar' | 'whatsapp'>('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom reached -> Booking or WhatsApp
      if (window.scrollY + windowHeight >= docHeight - 80) {
        setActiveTab('reservar');
        return;
      }

      const reservarEl = document.getElementById('reservar');
      const upEl = document.getElementById('up-espacio');
      const cumplesEl = document.getElementById('cumpleanos');

      if (reservarEl && scrollPos >= reservarEl.offsetTop) {
        setActiveTab('reservar');
      } else if (upEl && scrollPos >= upEl.offsetTop) {
        setActiveTab('up');
      } else if (cumplesEl && scrollPos >= cumplesEl.offsetTop) {
        setActiveTab('cumples');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  };

  const scrollTo = (id: string, tab: 'home' | 'cumples' | 'up' | 'reservar' | 'whatsapp') => {
    triggerHaptic();
    setActiveTab(tab);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsApp = () => {
    triggerHaptic();
    setActiveTab('whatsapp');
    window.open(BRAND_INFO.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBooking = () => {
    triggerHaptic();
    setActiveTab('reservar');
    onOpenBooking();
  };

  return (
    <nav 
      aria-label="Navegación tipo App" 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.9)] pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 transition-all"
    >
      <div className="max-w-md mx-auto px-2 grid grid-cols-5 items-center justify-around">
        
        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => scrollTo('top', 'home')}
          className="flex flex-col items-center justify-center py-1 px-1 group cursor-pointer"
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'bg-white/15 text-[#1EB8BF] scale-110 shadow-[0_0_12px_rgba(30,184,191,0.4)]'
              : 'text-zinc-400 group-hover:text-zinc-200'
          }`}>
            <Home className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-heading font-black tracking-tight mt-0.5 ${
            activeTab === 'home' ? 'text-white' : 'text-zinc-400'
          }`}>
            Inicio
          </span>
          {activeTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1EB8BF] mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Tab 2: Cumples */}
        <button
          type="button"
          onClick={() => scrollTo('cumpleanos', 'cumples')}
          className="flex flex-col items-center justify-center py-1 px-1 group cursor-pointer"
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'cumples'
              ? 'bg-[#ED3078]/20 text-[#ED3078] scale-110 shadow-[0_0_12px_rgba(237,48,120,0.4)]'
              : 'text-zinc-400 group-hover:text-zinc-200'
          }`}>
            <Cake className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-heading font-black tracking-tight mt-0.5 ${
            activeTab === 'cumples' ? 'text-[#ED3078]' : 'text-zinc-400'
          }`}>
            Cumples
          </span>
          {activeTab === 'cumples' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ED3078] mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Tab 3: Reservar (Destacado Central estilo App) */}
        <button
          type="button"
          onClick={handleBooking}
          className="flex flex-col items-center justify-center -mt-4 py-0 px-1 group cursor-pointer relative"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F2C700] via-[#F2C700] to-[#A3BA13] text-black font-black flex items-center justify-center shadow-[0_0_20px_rgba(242,199,0,0.6)] border-2 border-black scale-105 active:scale-95 transition-all">
            <CalendarCheck className="w-6 h-6 text-black" />
          </div>
          <span className="text-[10px] font-heading font-black tracking-tight mt-1 text-[#F2C700] uppercase">
            Reservar
          </span>
        </button>

        {/* Tab 4: UP Espacio */}
        <button
          type="button"
          onClick={() => scrollTo('up-espacio', 'up')}
          className="flex flex-col items-center justify-center py-1 px-1 group cursor-pointer"
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'up'
              ? 'bg-[#A3BA13]/20 text-[#A3BA13] scale-110 shadow-[0_0_12px_rgba(163,186,19,0.4)]'
              : 'text-zinc-400 group-hover:text-zinc-200'
          }`}>
            <Sun className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-heading font-black tracking-tight mt-0.5 ${
            activeTab === 'up' ? 'text-[#A3BA13]' : 'text-zinc-400'
          }`}>
            UP Espacio
          </span>
          {activeTab === 'up' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3BA13] mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Tab 5: WhatsApp Directo */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center py-1 px-1 group cursor-pointer"
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-[#25D366]/20 text-[#25D366] scale-110 shadow-[0_0_12px_rgba(37,211,102,0.4)]'
              : 'text-zinc-400 group-hover:text-zinc-200'
          }`}>
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
          <span className={`text-[10px] font-heading font-black tracking-tight mt-0.5 ${
            activeTab === 'whatsapp' ? 'text-[#25D366]' : 'text-zinc-400'
          }`}>
            WhatsApp
          </span>
          {activeTab === 'whatsapp' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] mt-0.5 animate-pulse" />
          )}
        </button>

      </div>
    </nav>
  );
};
