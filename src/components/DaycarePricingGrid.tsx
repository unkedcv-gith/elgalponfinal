import React, { useState, useEffect } from 'react';
import { Table, Calendar, Clock, DollarSign, MessageCircle, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { getPricingSettings, listenToPricingSettings } from '../services/storage';
import { BRAND_INFO, INITIAL_DAYCARE_OPTIONS } from '../data/initialData';
import { PricingSettings, DaycarePricingOption } from '../types';

export const DaycarePricingGrid: React.FC = () => {
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings);
  const [selectedFilterDay, setSelectedFilterDay] = useState<number | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    const handleUpdate = () => {
      setPricing(getPricingSettings());
    };
    window.addEventListener('storageUpdate', handleUpdate);
    window.addEventListener('pricingUpdate', handleUpdate);
    const unsub = listenToPricingSettings((updated) => setPricing(updated));

    return () => {
      window.removeEventListener('storageUpdate', handleUpdate);
      window.removeEventListener('pricingUpdate', handleUpdate);
      unsub();
    };
  }, []);

  const options: DaycarePricingOption[] = (pricing.daycare.options && pricing.daycare.options.length > 0)
    ? pricing.daycare.options
    : INITIAL_DAYCARE_OPTIONS;

  // Filter options
  const filteredOptions = selectedFilterDay === 'all'
    ? options
    : options.filter(opt => opt.days === selectedFilterDay);

  // Sort by days descending (5 to 1), then hours ascending (1 to 9.5)
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    if (b.days !== a.days) return b.days - a.days;
    return a.hours - b.hours;
  });

  const formatGridPrice = (price: number): string => {
    return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatHoursDisplay = (hours: number): string => {
    if (hours === 9.5) return '9 1/2hs';
    return `${hours}hs`;
  };

  const getWhatsAppLink = (opt: DaycarePricingOption) => {
    const hoursText = opt.hours === 9.5 ? '9 horas y media' : `${opt.hours} ${opt.hours === 1 ? 'hora' : 'horas'}`;
    const daysText = opt.days === 1 ? '1 día' : `${opt.days} días`;
    const message = `¡Hola! 👋 Consulto por el plan mensual de Espacio UP para ${daysText} por semana, ${hoursText} por día (${formatGridPrice(opt.price)}/mes). ¿Tienen vacantes disponibles?`;
    return `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div id="grilla-aranceles-up" className="space-y-4 pt-8 border-t border-white/15">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#9333EA] text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>Grilla Oficial de Tarifas Mensuales</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#10B981] text-black">
                Actualizada
              </span>
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Consulta de días semanales, permanencia diaria y cuota mensual en Espacio UP
            </p>
          </div>
        </div>

        {/* Toggle Collapse */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>{isExpanded ? 'Ocultar grilla' : 'Ver grilla completa'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Day Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#F2C700]" /> Filtrar por días:
            </span>
            <button
              type="button"
              onClick={() => setSelectedFilterDay('all')}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                selectedFilterDay === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              Todos (27 tarifas)
            </button>
            {[5, 4, 3, 2, 1].map((d) => (
              <button
                key={`filter-day-${d}`}
                type="button"
                onClick={() => setSelectedFilterDay(d)}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                  selectedFilterDay === d
                    ? 'bg-[#9333EA] text-white shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {d} {d === 1 ? 'Día' : 'Días'}
              </button>
            ))}
          </div>

          {/* SPREADSHEET STYLE TABLE (Exact Match with Uploaded Sheet) */}
          <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl bg-white text-black font-sans">
            {/* Top Green Accent Bar */}
            <div className="h-2 bg-[#00D000] w-full" />

            {/* Grey Title Bar */}
            <div className="bg-[#595959] text-white text-center py-2.5 px-4 font-heading font-black text-base sm:text-lg tracking-wider uppercase">
              MENSUAL
            </div>

            {/* Purple Column Headers */}
            <div className="grid grid-cols-12 bg-[#8000FF] text-white font-heading font-black text-sm sm:text-base tracking-wide uppercase text-center py-2.5 border-b border-zinc-300">
              <div className="col-span-3 border-r border-white/20">DÍAS</div>
              <div className="col-span-4 border-r border-white/20">HORAS</div>
              <div className="col-span-5">PRECIO</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-zinc-200 max-h-[600px] overflow-y-auto">
              {sortedOptions.map((opt, index) => {
                const isHalfHour = opt.hours === 9.5;
                const isSelectedRow = selectedFilterDay === opt.days;

                return (
                  <div
                    key={`grid-row-${opt.days}-${opt.hours}`}
                    className={`grid grid-cols-12 items-center text-center text-sm sm:text-base font-bold transition-colors py-2 px-1 hover:bg-purple-50 group cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'
                    }`}
                    title="Hacé clic para consultar este plan por WhatsApp"
                    onClick={() => {
                      window.open(getWhatsAppLink(opt), '_blank');
                    }}
                  >
                    {/* DÍAS */}
                    <div className="col-span-3 font-black text-black border-r border-zinc-200 py-1">
                      <span className="text-base sm:text-lg font-black">{opt.days}</span>
                    </div>

                    {/* HORAS */}
                    <div className="col-span-4 font-black text-black border-r border-zinc-200 py-1">
                      <span className={`inline-block ${isHalfHour ? 'text-purple-700 font-extrabold' : ''}`}>
                        {formatHoursDisplay(opt.hours)}
                      </span>
                    </div>

                    {/* PRECIO */}
                    <div className="col-span-5 font-black text-black py-1 px-2 flex items-center justify-between">
                      <span className="text-base sm:text-lg tracking-tight font-black pl-2 sm:pl-4">
                        {formatGridPrice(opt.price)}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#25D366] shrink-0 pr-1">
                        <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Note */}
            <div className="bg-zinc-100 border-t border-zinc-300 p-3 text-center text-xs text-zinc-600 font-medium flex items-center justify-between gap-2 flex-wrap">
              <span>Hacé clic en cualquier fila para consultar por WhatsApp</span>
              <a
                href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent('Hola! Quisiera consultar por los planes y vacantes de Espacio UP.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-purple-700 hover:text-purple-900 uppercase text-[11px]"
              >
                <span>Consultar vacante</span>
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
