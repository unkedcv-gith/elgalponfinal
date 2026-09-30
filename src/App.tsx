import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BirthdaysSection } from './components/BirthdaysSection';
import { BranchVideosSection } from './components/BranchVideosSection';
import { WorkshopsSection } from './components/WorkshopsSection';
import { DaycareSection } from './components/DaycareSection';
import { FaqSection } from './components/FaqSection';
import { BookingCalendar } from './components/BookingCalendar';
import { ContactFooter } from './components/ContactFooter';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LiabilityWaiverFormModal } from './components/LiabilityWaiverFormModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import { MobileAppNavBar } from './components/MobileAppNavBar';
import { MobileAppInstallPrompt } from './components/MobileAppInstallPrompt';
import { isAdminAuthenticated, syncWithRemoteFirestore, logoutUser } from './services/storage';

export default function App() {
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Liability Waiver Direct URL Link State
  const [activeWaiverReservationId, setActiveWaiverReservationId] = useState<string | null>(null);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [followUpBanner, setFollowUpBanner] = useState<{ show: boolean; childName?: string } | null>(null);

  useEffect(() => {
    setIsAdminLoggedIn(isAdminAuthenticated());
    
    // Sync with Firebase in the background
    syncWithRemoteFirestore().catch(e => console.warn('Background sync failed:', e));

    const checkForWaiverParam = () => {
      try {
        const fullHref = window.location.href;
        
        // 1. Check standard URLSearchParams (?waiver=...)
        const urlParams = new URLSearchParams(window.location.search);
        const fromSearch = urlParams.get('waiver') || urlParams.get('deslinde');
        if (fromSearch) {
          setActiveWaiverReservationId(fromSearch);
          setIsWaiverModalOpen(true);
          return;
        }

        // 2. Check hash string (#waiver=... or #?waiver=...)
        if (window.location.hash) {
          const hash = window.location.hash;
          const hashIdx = hash.indexOf('?');
          if (hashIdx !== -1) {
            const hashParams = new URLSearchParams(hash.substring(hashIdx));
            const fromHash = hashParams.get('waiver') || hashParams.get('deslinde');
            if (fromHash) {
              setActiveWaiverReservationId(fromHash);
              setIsWaiverModalOpen(true);
              return;
            }
          }
          if (hash.includes('waiver=')) {
            const parts = hash.split('waiver=');
            if (parts[1]) {
              const cleanId = parts[1].split('&')[0];
              setActiveWaiverReservationId(decodeURIComponent(cleanId));
              setIsWaiverModalOpen(true);
              return;
            }
          }
        }

        // 3. Fallback regex on full URL
        const match = fullHref.match(/[?&#](?:waiver|deslinde)=([^&#]+)/i);
        if (match && match[1]) {
          setActiveWaiverReservationId(decodeURIComponent(match[1]));
          setIsWaiverModalOpen(true);
        }
      } catch (e) {
        console.warn('Waiver URL check error:', e);
      }
    };

    checkForWaiverParam();

    window.addEventListener('popstate', checkForWaiverParam);
    window.addEventListener('hashchange', checkForWaiverParam);

    return () => {
      window.removeEventListener('popstate', checkForWaiverParam);
      window.removeEventListener('hashchange', checkForWaiverParam);
    };
  }, []);

  // 10-Minute Admin Inactivity Session Auto-Logout
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let lastActivity = Date.now();
    const resetTimer = () => {
      lastActivity = Date.now();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= 10 * 60 * 1000) {
        clearInterval(interval);
        activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
        logoutUser();
        setIsAdminLoggedIn(false);
        setIsAdminDashboardOpen(false);
        alert('Tu sesión administrativa ha finalizado por inactividad (10 minutos). Por motivos de seguridad se ha cerrado la sesión.');
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isAdminLoggedIn]);

  const handleOpenBooking = () => {
    const calendarElement = document.getElementById('reservar');
    if (calendarElement) {
      calendarElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated()) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminDashboardOpen(true);
  };

  const handleOpenGeneralWaiver = () => {
    setActiveWaiverReservationId(null);
    setIsWaiverModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ED3078] selection:text-white antialiased relative">
      
      {/* Mobile App Install Prompt Card */}
      <MobileAppInstallPrompt />

      {/* Main Header */}
      <Header
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenWaiver={handleOpenGeneralWaiver}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections with bottom space for mobile app nav bar */}
      <main className="pb-16 md:pb-0">
        <Hero
          onOpenBooking={handleOpenBooking}
        />

        <BirthdaysSection
          onOpenBooking={handleOpenBooking}
        />

        <BranchVideosSection />

        <WorkshopsSection />

        <DaycareSection />

        <FaqSection />

        <BookingCalendar
          onReservationCreated={() => {
            // Callback when a booking is created
          }}
        />
      </main>

      {/* Footer */}
      <div className="pb-14 md:pb-0">
        <ContactFooter
          onOpenBooking={handleOpenBooking}
          onOpenAdmin={handleOpenAdminTrigger}
          onOpenWaiver={handleOpenGeneralWaiver}
        />
      </div>

      {/* Mobile Native-Style App Bottom Navigation Bar */}
      <MobileAppNavBar onOpenBooking={handleOpenBooking} />

      <FloatingChatbot />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Full Screen Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          onCloseAdmin={() => {
            setIsAdminDashboardOpen(false);
            setIsAdminLoggedIn(isAdminAuthenticated());
          }}
        />
      )}

      {/* Client-Facing Liability Waiver Form Modal (Accessible via WhatsApp Link) */}
      <LiabilityWaiverFormModal
        isOpen={isWaiverModalOpen}
        reservationId={activeWaiverReservationId}
        onWaiverCompleted={(childName) => {
          setFollowUpBanner({ show: true, childName });
        }}
        onClose={() => {
          setIsWaiverModalOpen(false);
          setActiveWaiverReservationId(null);
          // Clean URL parameter without reloading page
          if (window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }}
      />

      {/* Floating Reassurance Notification Banner */}
      {followUpBanner?.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-zinc-950/95 border-2 border-[#1EB8BF] rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(30,184,191,0.35)] backdrop-blur-md flex items-start justify-between gap-3 text-white">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1EB8BF]/20 border border-[#1EB8BF] text-[#1EB8BF] flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1EB8BF] block">
                  Solicitud Recibida
                </span>
                <h4 className="font-heading font-black text-sm uppercase text-white">
                  A la brevedad nos ponemos en contacto con vos y te estaremos enviando la tarjetita virtual para tus invitados
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {followUpBanner.childName
                    ? `Hemos recibido los datos para el cumple de ${followUpBanner.childName}. Te escribiremos por WhatsApp para confirmar los detalles y enviarte la tarjetita virtual para tus invitados.`
                    : 'Hemos recibido tu formulario. Nos comunicaremos con vos por WhatsApp a la brevedad para coordinar todos los detalles y enviarte la tarjetita virtual para tus invitados.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFollowUpBanner(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 cursor-pointer transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
