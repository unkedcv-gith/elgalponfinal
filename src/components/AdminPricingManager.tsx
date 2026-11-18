import React, { useState, useEffect } from 'react';
import { 
  PricingSettings, 
  DaycarePricingOption, 
  DaycareDailyOption,
  BirthdayMonthPrice, 
  BirthdayAdditionalPrice 
} from '../types';
import { 
  getPricingSettings, 
  savePricingSettings, 
  formatCurrency, 
  listenToPricingSettings,
  calculateDiscountedPrice
} from '../services/storage';
import { INITIAL_PRICING_SETTINGS, INITIAL_CALLE5_ADDITIONALS, INITIAL_CALLE13_ADDITIONALS } from '../data/initialData';
import { 
  Tag, 
  Save, 
  RotateCcw, 
  Check, 
  Dumbbell, 
  Baby, 
  Cake, 
  Star, 
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';

interface AdminPricingManagerProps {
  isSuperAdmin: boolean;
}

const clampPercent = (value: string): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, Math.round(num)));
};

export const AdminPricingManager: React.FC<AdminPricingManagerProps> = ({ isSuperAdmin }) => {
  const [pricing, setPricing] = useState<PricingSettings>(getPricingSettings);
  const [activeSubSection, setActiveSubSection] = useState<'fitness' | 'daycare' | 'birthdays'>('birthdays');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(5);
  const [daycareConfigTab, setDaycareConfigTab] = useState<'daily' | 'monthly'>('daily');
  const [selectedPricingMonthIndex, setSelectedPricingMonthIndex] = useState<number>(0);
  const [bulkMonthDiscountInput, setBulkMonthDiscountInput] = useState<string>('20');

  useEffect(() => {
    const unsub = listenToPricingSettings((updated) => {
      setPricing(updated);
    });
    return () => {
      unsub();
    };
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="font-heading font-black text-white text-lg uppercase">Acceso Restringido</h3>
        <p className="text-sm text-zinc-300">
          La gestión de precios y tarifas está reservada exclusivamente para el usuario SuperAdmin.
        </p>
      </div>
    );
  }

  const handleFitnessChange = (
    key: 'onceAWeek' | 'twiceAWeek' | 'onceAWeekDiscount' | 'twiceAWeekDiscount',
    value: string
  ) => {
    const num = key.includes('Discount') ? clampPercent(value) : (parseInt(value, 10) || 0);
    setPricing((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        [key]: num,
      },
    }));
  };

  const handleDaycarePriceChange = (
    days: number,
    hours: number,
    field: 'price' | 'discountPercent',
    value: string
  ) => {
    const num = field === 'discountPercent' ? clampPercent(value) : (parseInt(value, 10) || 0);
    setPricing((prev) => {
      const exists = prev.daycare.options.some((o) => o.days === days && Math.abs(o.hours - hours) < 0.01);
      let updatedOptions: DaycarePricingOption[];
      if (exists) {
        updatedOptions = prev.daycare.options.map((o) =>
          o.days === days && Math.abs(o.hours - hours) < 0.01 ? { ...o, [field]: num } : o
        );
      } else {
        updatedOptions = [
          ...prev.daycare.options,
          { days, hours, price: field === 'price' ? num : 0, discountPercent: field === 'discountPercent' ? num : 0 },
        ];
      }
      return {
        ...prev,
        daycare: {
          ...prev.daycare,
          options: updatedOptions,
        },
      };
    });
  };

  const handleDaycareDailyRateChange = (
    hours: number,
    field: 'price' | 'discountPercent',
    value: string
  ) => {
    const num = field === 'discountPercent' ? clampPercent(value) : (parseInt(value, 10) || 0);
    setPricing((prev) => {
      const currentRates = prev.daycare.dailyRates && prev.daycare.dailyRates.length > 0
        ? prev.daycare.dailyRates
        : INITIAL_PRICING_SETTINGS.daycare.dailyRates;
      const exists = currentRates.some((r) => r.hours === hours);
      let updatedRates: DaycareDailyOption[];
      if (exists) {
        updatedRates = currentRates.map((r) =>
          r.hours === hours ? { ...r, [field]: num } : r
        );
      } else {
        updatedRates = [
          ...currentRates,
          { hours, price: field === 'price' ? num : 0, discountPercent: field === 'discountPercent' ? num : 0 },
        ];
      }
      return {
        ...prev,
        daycare: {
          ...prev.daycare,
          dailyRates: updatedRates,
        },
      };
    });
  };

  const handleBirthdayDepositChange = (value: string) => {
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        depositAmount: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleBirthdayMonthBasePriceChange = (
    monthIndex: number,
    field: 'basePrice' | 'basePriceCalle5' | 'basePriceCalle13' | 'discountCalle5' | 'discountCalle13',
    value: string
  ) => {
    const isDiscount = field === 'discountCalle5' || field === 'discountCalle13';
    const num = isDiscount ? clampPercent(value) : (parseInt(value, 10) || 0);
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        monthlyBasePrices: prev.birthdays.monthlyBasePrices.map((m) =>
          m.monthIndex === monthIndex
            ? { ...m, [field]: num, ...(field === 'basePriceCalle5' ? { basePrice: num } : {}) }
            : m
        ),
      },
    }));
  };

  const handleBranchMonthAdditionalChange = (
    monthIndex: number,
    branch: 'calle-5' | 'calle-13',
    additionalId: string,
    field: 'price' | 'description',
    value: any
  ) => {
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        monthlyBasePrices: prev.birthdays.monthlyBasePrices.map((m) => {
          if (m.monthIndex !== monthIndex) return m;
          const parsedVal = field === 'price' ? (parseInt(value, 10) || 0) : value;
          if (branch === 'calle-5') {
            const currentAdditions = m.additionalsCalle5 || INITIAL_CALLE5_ADDITIONALS;
            const updated = currentAdditions.map((a) =>
              a.id === additionalId ? { ...a, [field]: parsedVal } : a
            );
            return { ...m, additionalsCalle5: updated };
          } else {
            const currentAdditions = m.additionalsCalle13 || INITIAL_CALLE13_ADDITIONALS;
            const updated = currentAdditions.map((a) =>
              a.id === additionalId ? { ...a, [field]: parsedVal } : a
            );
            return { ...m, additionalsCalle13: updated };
          }
        }),
      },
    }));
  };

  const handleApplyMonthWideDiscount = (monthIndex: number, discountPct: number) => {
    const safePct = Math.min(100, Math.max(0, Math.round(discountPct)));
    setPricing((prev) => ({
      ...prev,
      birthdays: {
        ...prev.birthdays,
        monthlyBasePrices: prev.birthdays.monthlyBasePrices.map((m) => {
          if (m.monthIndex !== monthIndex) return m;
          return {
            ...m,
            discountCalle5: safePct,
            discountCalle13: safePct,
          };
        }),
      },
    }));
  };

  const handleSave = () => {
    savePricingSettings(pricing);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Estás seguro de restablecer todos los precios y tarifas a los valores iniciales por defecto?')) {
      setPricing(INITIAL_PRICING_SETTINGS);
      savePricingSettings(INITIAL_PRICING_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    }
  };

  const monthHasActivePromo = (m: BirthdayMonthPrice): boolean => {
    return (m.discountCalle5 || 0) > 0 || (m.discountCalle13 || 0) > 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-zinc-950/80 border-2 border-white/20 rounded-3xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A3BA13] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Módulo Exclusivo SuperAdmin
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Gestión de Precios & Descuentos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-2xl">
              Asigná el valor original y un % de descuento independiente para cada tarifa o mes. Cuando el descuento sea mayor a 0%, la web mostrará automáticamente el valor original tachado y el precio promocional final.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restablecer valores a los por defecto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Valores por Defecto</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#A3BA13] hover:bg-white text-black font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(163,186,19,0.5)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Precios</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="bg-[#A3BA13]/20 border-2 border-[#A3BA13] text-white px-4 py-3 rounded-2xl flex items-center gap-3 animate-fade-in shadow-lg">
            <div className="w-6 h-6 rounded-full bg-[#A3BA13] text-black flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
              ¡Precios y descuentos guardados y sincronizados en la nube y en la web!
            </span>
          </div>
        )}

        {/* Navigation Subtabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubSection('fitness')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'fitness'
                ? 'bg-[#1EB8BF] text-black shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>1. Fitness & Talleres</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('daycare')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'daycare'
                ? 'bg-[#A3BA13] text-black shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>2. Simulador Espacio UP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('birthdays')}
            className={`p-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'birthdays'
                ? 'bg-[#ED3078] text-white shadow-md'
                : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>3. Cumpleaños & Adicionales</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SECCIÓN FITNESS                                                        */}
      {/* ========================================================================= */}
      {activeSubSection === 'fitness' && (() => {
        const onceInfo = calculateDiscountedPrice(pricing.fitness.onceAWeek, pricing.fitness.onceAWeekDiscount);
        const twiceInfo = calculateDiscountedPrice(pricing.fitness.twiceAWeek, pricing.fitness.twiceAWeekDiscount);

        return (
          <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#1EB8BF]" /> Precios de la Sección Fitness
              </h3>
              <p className="text-xs text-zinc-300 font-medium">
                Estos aranceles se muestran en la tarjeta de actividades físicas y talleres del sitio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
              {/* 1 vez por semana */}
              <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-heading font-black text-sm text-white uppercase">1 vez por semana</span>
                  <div className="flex items-center gap-2">
                    {onceInfo.hasDiscount && (
                      <>
                        <span className="text-[10px] font-black bg-[#F2C700] text-black px-2 py-0.5 rounded-md">
                          {onceInfo.discountPercent}% OFF
                        </span>
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {formatCurrency(onceInfo.originalPrice)}
                        </span>
                      </>
                    )}
                    <span className="text-xs font-bold text-[#1EB8BF] bg-black/60 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                      {formatCurrency(onceInfo.finalPrice)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Cuota mensual por 1 clase semanal.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor Original ($):</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={pricing.fitness.onceAWeek}
                      onChange={(e) => handleFitnessChange('onceAWeek', e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3.5 py-2.5 text-white font-mono text-base font-bold focus:outline-hidden focus:border-[#1EB8BF]"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-bold text-[#F2C700] uppercase flex items-center gap-1">
                      <Percent className="w-3 h-3" /> Desc. %:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={pricing.fitness.onceAWeekDiscount ?? 0}
                      onChange={(e) => handleFitnessChange('onceAWeekDiscount', e.target.value)}
                      className="w-full bg-black/70 border border-[#F2C700]/40 rounded-xl px-3 py-2.5 text-[#F2C700] font-mono text-base font-bold focus:outline-hidden focus:border-[#F2C700]"
                    />
                  </div>
                </div>
              </div>

              {/* 2 veces por semana */}
              <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-heading font-black text-sm text-white uppercase">2 veces por semana</span>
                  <div className="flex items-center gap-2">
                    {twiceInfo.hasDiscount && (
                      <>
                        <span className="text-[10px] font-black bg-[#F2C700] text-black px-2 py-0.5 rounded-md">
                          {twiceInfo.discountPercent}% OFF
                        </span>
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {formatCurrency(twiceInfo.originalPrice)}
                        </span>
                      </>
                    )}
                    <span className="text-xs font-bold text-[#F2C700] bg-black/60 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                      {formatCurrency(twiceInfo.finalPrice)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400">Cuota mensual por 2 clases semanales.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Valor Original ($):</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={pricing.fitness.twiceAWeek}
                      onChange={(e) => handleFitnessChange('twiceAWeek', e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3.5 py-2.5 text-white font-mono text-base font-bold focus:outline-hidden focus:border-[#F2C700]"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <label className="text-[11px] font-bold text-[#F2C700] uppercase flex items-center gap-1">
                      <Percent className="w-3 h-3" /> Desc. %:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={pricing.fitness.twiceAWeekDiscount ?? 0}
                      onChange={(e) => handleFitnessChange('twiceAWeekDiscount', e.target.value)}
                      className="w-full bg-black/70 border border-[#F2C700]/40 rounded-xl px-3 py-2.5 text-[#F2C700] font-mono text-base font-bold focus:outline-hidden focus:border-[#F2C700]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 2. SECCIÓN ESPACIO UP (SIMULADOR)                                         */}
      {/* ========================================================================= */}
      {activeSubSection === 'daycare' && (
        <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-4 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <Baby className="w-5 h-5 text-[#A3BA13]" /> Configuración de Tarifas Espacio UP
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#F2C700] text-black self-start sm:self-auto">
                Por Día & Mensual
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium">
              Ajustá las tarifas originales y un % de descuento independiente para cada opción diaria o plan mensual.
            </p>
          </div>

          {/* Sub-selector: Por Día vs Mensual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-black/50 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => setDaycareConfigTab('daily')}
              className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                daycareConfigTab === 'daily'
                  ? 'bg-[#A3BA13] text-black shadow-lg scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Tarifas Por Día (Pase Ocasional)</span>
            </button>

            <button
              type="button"
              onClick={() => setDaycareConfigTab('monthly')}
              className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                daycareConfigTab === 'monthly'
                  ? 'bg-[#F2C700] text-black shadow-lg scale-[1.01]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>2. Tarifas Mensuales (Planes Fijos)</span>
            </button>
          </div>

          {/* TAB 1: TARIFAS POR DÍA */}
          {daycareConfigTab === 'daily' && (
            <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                <div>
                  <h4 className="font-heading font-black text-white text-base uppercase flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#A3BA13]" />
                    <span>Pase por Día Ocasional (Tarifa Diaria)</span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Aranceles para un solo día puntual según la cantidad de horas contratadas.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#A3BA13] bg-black/60 px-3 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
                  1 a 10 hs por día
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((hours) => {
                  const currentRates = pricing.daycare.dailyRates && pricing.daycare.dailyRates.length > 0
                    ? pricing.daycare.dailyRates
                    : INITIAL_PRICING_SETTINGS.daycare.dailyRates;
                  const rateItem = currentRates.find((r) => r.hours === hours);
                  const currentVal = rateItem ? rateItem.price : 0;
                  const currentDiscount = rateItem?.discountPercent ?? 0;
                  const priceInfo = calculateDiscountedPrice(currentVal, currentDiscount);

                  return (
                    <div
                      key={`daily-rate-${hours}`}
                      className={`bg-black/60 border rounded-xl p-3.5 space-y-2.5 transition-colors ${
                        priceInfo.hasDiscount ? 'border-[#F2C700]/50' : 'border-white/15 hover:border-[#A3BA13]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-heading font-black text-xs text-white uppercase">
                          {hours} hs
                        </span>
                        <div className="text-right">
                          {priceInfo.hasDiscount && (
                            <span className="text-[10px] text-zinc-500 line-through font-mono block leading-none">
                              {formatCurrency(priceInfo.originalPrice)}
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#A3BA13] font-mono">
                            {formatCurrency(priceInfo.finalPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] text-zinc-400 uppercase font-bold block">
                            Original ($):
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={currentVal}
                            onChange={(e) => handleDaycareDailyRateChange(hours, 'price', e.target.value)}
                            className="w-full bg-zinc-950 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono text-xs font-bold focus:outline-hidden focus:border-[#A3BA13]"
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="text-[9px] text-[#F2C700] uppercase font-bold block">
                            % Desc:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={currentDiscount}
                            onChange={(e) => handleDaycareDailyRateChange(hours, 'discountPercent', e.target.value)}
                            className="w-full bg-zinc-950 border border-[#F2C700]/40 rounded-lg px-1.5 py-1.5 text-[#F2C700] font-mono text-xs font-bold focus:outline-hidden focus:border-[#F2C700]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TARIFAS MENSUALES */}
          {daycareConfigTab === 'monthly' && (
            <div className="space-y-5">
              {/* Day selection tabs for matrix navigation */}
              <div className="space-y-2">
                <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#F2C700]" /> Seleccioná la cantidad de días por semana para editar:
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map((d) => (
                    <button
                      key={`day-tab-${d}`}
                      type="button"
                      onClick={() => setSelectedDayTab(d)}
                      className={`p-3 rounded-xl font-heading font-black text-xs sm:text-sm uppercase transition-all cursor-pointer ${
                        selectedDayTab === d
                          ? 'bg-[#F2C700] text-black shadow-lg scale-102 border-2 border-white'
                          : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 border border-white/10'
                      }`}
                    >
                      {d} {d === 1 ? 'Día' : 'Días'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs for currently selected day tab */}
              <div className="bg-zinc-900/80 border border-white/15 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-heading font-black text-white text-base uppercase flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F2C700]" />
                    <span>Plan Mensual para {selectedDayTab} {selectedDayTab === 1 ? 'día por semana' : 'días por semana'}</span>
                  </h4>
                  <span className="text-xs text-zinc-400 font-medium">
                    {selectedDayTab === 5 ? '10 opciones de permanencia (1 a 9 ½ hs)' : selectedDayTab === 1 ? '5 opciones de permanencia (1 a 5 hs)' : '4 opciones de permanencia (1 a 4 hs)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(selectedDayTab === 5 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 9.5] : selectedDayTab === 1 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4]).map((hours) => {
                    const opt = pricing.daycare.options.find(
                      (o) => o.days === selectedDayTab && Math.abs(o.hours - hours) < 0.01
                    );
                    const currentVal = opt ? opt.price : 0;
                    const currentDiscount = opt?.discountPercent ?? 0;
                    const priceInfo = calculateDiscountedPrice(currentVal, currentDiscount);
                    const hoursTitle = hours === 9.5 ? '9 ½ hs/día' : hours === 1 ? '1 hr/día' : `${hours} hs/día`;

                    return (
                      <div
                        key={`opt-${selectedDayTab}-${hours}`}
                        className={`bg-black/60 border rounded-xl p-4 space-y-2.5 transition-colors ${
                          priceInfo.hasDiscount ? 'border-[#F2C700]/50' : 'border-white/15 hover:border-[#F2C700]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-heading font-black text-xs text-white uppercase">
                            {hoursTitle}
                          </span>
                          <div className="text-right">
                            {priceInfo.hasDiscount && (
                              <span className="text-[10px] text-zinc-500 line-through font-mono block leading-none">
                                {formatCurrency(priceInfo.originalPrice)}
                              </span>
                            )}
                            <span className="text-xs font-bold text-[#F2C700] font-mono">
                              {formatCurrency(priceInfo.finalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold block">
                              Cuota ($):
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={currentVal}
                              onChange={(e) => handleDaycarePriceChange(selectedDayTab, hours, 'price', e.target.value)}
                              className="w-full bg-zinc-950 border border-white/20 rounded-lg px-2.5 py-2 text-white font-mono text-xs font-bold focus:outline-hidden focus:border-[#F2C700]"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="text-[10px] text-[#F2C700] uppercase font-bold block">
                              % Desc:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={currentDiscount}
                              onChange={(e) => handleDaycarePriceChange(selectedDayTab, hours, 'discountPercent', e.target.value)}
                              className="w-full bg-zinc-950 border border-[#F2C700]/40 rounded-lg px-2 py-2 text-[#F2C700] font-mono text-xs font-bold focus:outline-hidden focus:border-[#F2C700]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECCIÓN CUMPLEAÑOS & ADICIONALES                                       */}
      {/* ========================================================================= */}
      {activeSubSection === 'birthdays' && (
        <div className="bg-zinc-950/80 border-2 border-white/15 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Sub-block A: Configuración de Seña */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Valor de la Seña
              </h3>
              <p className="text-xs text-zinc-300 font-medium">
                Monto fijo requerido para confirmar la reserva y congelar la fecha.
              </p>
            </div>
            
            <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 max-w-sm">
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 uppercase font-bold flex items-center justify-between">
                  <span>Monto ($):</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(pricing.birthdays.depositAmount)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={pricing.birthdays.depositAmount}
                  onChange={(e) => handleBirthdayDepositChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-white font-mono text-base font-bold focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Sub-block B: Base Monthly Prices & Month-Specific Additionals */}
          <div className="space-y-6 pt-4 border-t border-white/5">
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="font-heading text-xl font-black text-white uppercase flex items-center gap-2">
                <Cake className="w-5 h-5 text-[#ED3078]" /> Tarifas y Descuentos por Mes
              </h3>
              <p className="text-xs text-zinc-300 font-medium">
                Elegí cada mes para definir su tarifa base original y un % de descuento independiente para Calle 5 y Calle 13 (los adicionales no llevan descuento). En los meses con descuento &gt; 0%, la web mostrará el valor base original tachado y el valor promocional final.
              </p>
            </div>

            {/* Month Selector Tabs */}
            <div className="flex flex-wrap gap-2 pb-2">
              {pricing.birthdays.monthlyBasePrices.map((m) => {
                const isSelected = selectedPricingMonthIndex === m.monthIndex;
                const hasPromo = monthHasActivePromo(m);
                return (
                  <button
                    key={`pricing-month-${m.monthIndex}`}
                    type="button"
                    onClick={() => setSelectedPricingMonthIndex(m.monthIndex)}
                    className={`px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#ED3078] text-white shadow-lg shadow-[#ED3078]/30 scale-105'
                        : hasPromo
                          ? 'bg-zinc-900 border-2 border-[#F2C700]/70 text-[#F2C700] hover:bg-zinc-800'
                          : 'bg-zinc-900 border border-white/15 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>{m.monthName}</span>
                    {hasPromo && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#F2C700] text-black' : 'bg-[#F2C700]/20 text-[#F2C700]'
                      }`}>
                        % OFF
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Month Configuration Panel */}
            {(() => {
              const currentMonth = pricing.birthdays.monthlyBasePrices.find((m) => m.monthIndex === selectedPricingMonthIndex) || pricing.birthdays.monthlyBasePrices[0];
              const base5Price = currentMonth.basePriceCalle5 ?? currentMonth.basePrice;
              const base13Price = currentMonth.basePriceCalle13 ?? currentMonth.basePrice;
              const base5Info = calculateDiscountedPrice(base5Price, currentMonth.discountCalle5);
              const base13Info = calculateDiscountedPrice(base13Price, currentMonth.discountCalle13);

              return (
                <div className="bg-zinc-900/90 border-2 border-[#ED3078]/40 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h4 className="font-heading font-black text-lg text-white uppercase flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#F2C700]" /> Configuración para <span className="text-[#F2C700]">{currentMonth.monthName}</span>
                      </h4>
                      <span className="text-xs font-bold text-zinc-400">Mes {currentMonth.monthIndex + 1} de 12 · El % de descuento aplica solo a tarifas base</span>
                    </div>

                    {/* Optional quick month-wide base discount setter */}
                    <div className="flex flex-wrap items-center gap-2 bg-black/60 border border-white/15 rounded-2xl p-2.5">
                      <span className="text-[11px] font-bold text-zinc-300 px-1">Aplicar a bases de {currentMonth.monthName}:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={bulkMonthDiscountInput}
                          onChange={(e) => setBulkMonthDiscountInput(e.target.value)}
                          className="w-16 bg-zinc-950 border border-[#F2C700]/50 rounded-lg px-2 py-1.5 text-[#F2C700] font-mono text-xs font-bold text-center"
                          aria-label="Porcentaje de descuento para todo el mes"
                        />
                        <span className="text-xs font-bold text-[#F2C700]">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyMonthWideDiscount(currentMonth.monthIndex, parseFloat(bulkMonthDiscountInput) || 0)}
                        className="px-3 py-1.5 rounded-lg bg-[#F2C700] hover:bg-white text-black font-heading font-black text-[11px] uppercase transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyMonthWideDiscount(currentMonth.monthIndex, 0)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Quitar (0%)
                      </button>
                    </div>
                  </div>

                  {/* Base Prices per Branch */}
                  <div className="space-y-3">
                    <h5 className="font-heading font-black text-sm text-zinc-200 uppercase">Tarifas Base del Mes por Sucursal</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Calle 5 Base */}
                      <div className={`bg-black/60 border rounded-2xl p-4 space-y-3 ${base5Info.hasDiscount ? 'border-[#F2C700]/60' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-[#ED3078] uppercase">Calle 5 — Base 20 chicos</span>
                          <div className="flex items-center gap-2">
                            {base5Info.hasDiscount && (
                              <>
                                <span className="text-[10px] font-black bg-[#F2C700] text-black px-2 py-0.5 rounded">
                                  -{base5Info.discountPercent}% OFF
                                </span>
                                <span className="text-xs text-zinc-400 line-through font-mono">
                                  {formatCurrency(base5Info.originalPrice)}
                                </span>
                              </>
                            )}
                            <span className="font-mono text-sm font-black text-white">
                              {formatCurrency(base5Info.finalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold block">Precio Original ($):</label>
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={base5Price}
                              onChange={(e) => handleBirthdayMonthBasePriceChange(currentMonth.monthIndex, 'basePriceCalle5', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm font-bold focus:border-[#ED3078]"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="text-[10px] text-[#F2C700] uppercase font-bold flex items-center gap-1">
                              <Percent className="w-3 h-3" /> Desc. %:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={currentMonth.discountCalle5 ?? 0}
                              onChange={(e) => handleBirthdayMonthBasePriceChange(currentMonth.monthIndex, 'discountCalle5', e.target.value)}
                              className="w-full bg-zinc-950 border border-[#F2C700]/40 rounded-xl px-3 py-2.5 text-[#F2C700] font-mono text-sm font-bold focus:border-[#F2C700]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Calle 13 Base */}
                      <div className={`bg-black/60 border rounded-2xl p-4 space-y-3 ${base13Info.hasDiscount ? 'border-[#F2C700]/60' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-black text-[#1EB8BF] uppercase">Calle 13 — Base 20 chicos</span>
                          <div className="flex items-center gap-2">
                            {base13Info.hasDiscount && (
                              <>
                                <span className="text-[10px] font-black bg-[#F2C700] text-black px-2 py-0.5 rounded">
                                  -{base13Info.discountPercent}% OFF
                                </span>
                                <span className="text-xs text-zinc-400 line-through font-mono">
                                  {formatCurrency(base13Info.originalPrice)}
                                </span>
                              </>
                            )}
                            <span className="font-mono text-sm font-black text-white">
                              {formatCurrency(base13Info.finalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] text-zinc-400 uppercase font-bold block">Precio Original ($):</label>
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={base13Price}
                              onChange={(e) => handleBirthdayMonthBasePriceChange(currentMonth.monthIndex, 'basePriceCalle13', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-white font-mono text-sm font-bold focus:border-[#1EB8BF]"
                            />
                          </div>
                          <div className="col-span-1 space-y-1">
                            <label className="text-[10px] text-[#F2C700] uppercase font-bold flex items-center gap-1">
                              <Percent className="w-3 h-3" /> Desc. %:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={currentMonth.discountCalle13 ?? 0}
                              onChange={(e) => handleBirthdayMonthBasePriceChange(currentMonth.monthIndex, 'discountCalle13', e.target.value)}
                              className="w-full bg-zinc-950 border border-[#F2C700]/40 rounded-xl px-3 py-2.5 text-[#F2C700] font-mono text-sm font-bold focus:border-[#F2C700]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Month-Specific Additionals Divided by Branch */}
                  <div className="space-y-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-black text-base text-white uppercase flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#1EB8BF]" /> Adicionales por Sucursal para {currentMonth.monthName}
                      </h5>
                      <span className="text-[10px] text-zinc-400 font-medium">Valores fijos sin descuento aplicado</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Calle 5 Additionals */}
                      <div className="bg-black/50 border border-[#ED3078]/30 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-heading font-black text-sm text-[#ED3078] uppercase">Sucursal Calle 5</span>
                          <span className="text-[10px] bg-[#ED3078]/20 text-[#ED3078] px-2 py-0.5 rounded font-bold">Exclusivo Calle 5</span>
                        </div>
                        <div className="space-y-3">
                          {(currentMonth.additionalsCalle5 || INITIAL_CALLE5_ADDITIONALS).map((add) => (
                            <div key={add.id} className="bg-zinc-900 border border-white/10 rounded-xl p-3 space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-heading font-black text-xs text-white uppercase">{add.name}</span>
                                <span className="text-xs font-bold text-[#1EB8BF] bg-black px-2 py-0.5 rounded border border-white/10 font-mono">
                                  +{formatCurrency(add.price)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-5 space-y-1">
                                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Precio ($):</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={add.price}
                                    onChange={(e) => handleBranchMonthAdditionalChange(currentMonth.monthIndex, 'calle-5', add.id, 'price', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold focus:border-[#ED3078]"
                                  />
                                </div>
                                <div className="sm:col-span-7 space-y-1">
                                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Descripción:</label>
                                  <input
                                    type="text"
                                    value={add.description}
                                    onChange={(e) => handleBranchMonthAdditionalChange(currentMonth.monthIndex, 'calle-5', add.id, 'description', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-[#ED3078]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calle 13 Additionals */}
                      <div className="bg-black/50 border border-[#1EB8BF]/30 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-heading font-black text-sm text-[#1EB8BF] uppercase">Sucursal Calle 13</span>
                          <span className="text-[10px] bg-[#1EB8BF]/20 text-[#1EB8BF] px-2 py-0.5 rounded font-bold">Exclusivo Calle 13</span>
                        </div>
                        <div className="space-y-3">
                          {(currentMonth.additionalsCalle13 || INITIAL_CALLE13_ADDITIONALS).map((add) => (
                            <div key={add.id} className="bg-zinc-900 border border-white/10 rounded-xl p-3 space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-heading font-black text-xs text-white uppercase">{add.name}</span>
                                <span className="text-xs font-bold text-[#1EB8BF] bg-black px-2 py-0.5 rounded border border-white/10 font-mono">
                                  +{formatCurrency(add.price)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-5 space-y-1">
                                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Precio ($):</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={add.price}
                                    onChange={(e) => handleBranchMonthAdditionalChange(currentMonth.monthIndex, 'calle-13', add.id, 'price', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-xs font-bold focus:border-[#1EB8BF]"
                                  />
                                </div>
                                <div className="sm:col-span-7 space-y-1">
                                  <label className="text-[10px] text-zinc-400 uppercase font-bold">Descripción:</label>
                                  <input
                                    type="text"
                                    value={add.description}
                                    onChange={(e) => handleBranchMonthAdditionalChange(currentMonth.monthIndex, 'calle-13', add.id, 'description', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-[#1EB8BF]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
