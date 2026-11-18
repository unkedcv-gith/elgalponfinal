import React, { useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import logoBlanca from '../assets/images/marca_el_galpon_blanca.svg';

interface PromoPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const PromoPopupModal: React.FC<PromoPopupModalProps> = ({
  isOpen,
  onClose,
  onAction,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-heading"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0B0D14] bg-retro-grid border-2 border-[#F2C700] rounded-3xl shadow-[8px_8px_0px_0px_#ED3078,0_24px_60px_rgba(0,0,0,0.92)] overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colorful brand bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#ED3078] via-[#F2C700] to-[#1EB8BF]" />

        {/* Subtle ambient radial highlights behind hero number */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#ED3078]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-[#1EB8BF]/15 blur-3xl"
        />

        <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Header Row: Brand logo + Close button */}
          <div className="w-full flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={logoBlanca}
                alt="El Galpón"
                className="h-7 sm:h-8 w-auto object-contain shrink-0"
              />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#1EB8BF] whitespace-nowrap">
                Beneficio Verano 2027
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar promoción"
              className="w-11 h-11 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-white/50 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C700]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Focal Hero Discount Statement */}
          <div className="my-2 sm:my-3 select-none">
            <div
              className="font-bangers text-7xl sm:text-8xl leading-none tracking-wide text-[#F2C700]"
              style={{
                textShadow: '4px 4px 0px #ED3078, 7px 7px 0px rgba(0,0,0,0.85)',
              }}
            >
              20% OFF
            </div>
          </div>

          {/* Primary User-Requested Headline */}
          <h2
            id="promo-popup-heading"
            className="font-heading font-black text-xl sm:text-2xl text-white leading-snug max-w-md mt-2"
            style={{ textWrap: 'balance' }}
          >
            Aprovechá el <span className="text-[#F2C700]">20% OFF</span> durante{' '}
            <span className="text-[#1EB8BF]">Enero y Febrero del 2027</span>
          </h2>

          {/* Supporting copy */}
          <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed max-w-md mt-3">
            Reservá tu cumpleaños activo con muro de escalada, tirolesa, camas elásticas y juegos guiados a precio promocional de verano.
          </p>

          {/* Hairline divider + clean unboxed metadata */}
          <div className="w-full border-t border-zinc-800/90 my-5 pt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs font-medium text-zinc-400">
            <span>Sucursal Calle 5</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Sucursal Calle 13</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-[#A3BA13] font-semibold">Válido Enero y Febrero 2027</span>
          </div>

          {/* Single Primary CTA + Secondary Text Dismiss */}
          <div className="w-full flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onAction}
              className="w-full sm:w-auto min-w-[260px] bg-[#F2C700] hover:bg-[#ffd51a] text-black font-heading font-black text-sm sm:text-base uppercase tracking-wide px-7 py-3.5 rounded-2xl shadow-[4px_4px_0px_0px_#ED3078] hover:shadow-[2px_2px_0px_0px_#ED3078] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Reservar Enero / Febrero 2027</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EB8BF] rounded-lg"
            >
              Seguir viendo la web
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
