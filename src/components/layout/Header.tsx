// ============================================================================
// SALARYPULSE — LUXURY FINANCIAL HEADER & REAL-TIME PUNCH CONTROLS
// Precision-engineered responsive header with Month Navigator & Status Controls
// ============================================================================

import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Power, 
  Coffee,
  Settings as SettingsIcon,
  WifiOff,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PwaService } from '../../services/pwaService';
import { PwaState } from '../../types';

export const Header: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    isCurrentlyWorking, 
    isOnBreak, 
    punchIn, 
    punchOut, 
    startBreak, 
    endBreak,
    setActiveTab
  } = useApp();

  const [pwaState, setPwaState] = useState<PwaState>(PwaService.getState());

  useEffect(() => {
    return PwaService.subscribe((state) => {
      setPwaState(state);
    });
  }, []);

  const handleMonthChange = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const formattedMonthLabel = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-[#0A0A0D]/90 backdrop-blur-xl border-b border-[#1E1E24] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.7)] select-none"
    >
      {/* Left: Luxury Month Navigator Capsule */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex flex-col">
          {/* Month Selector Capsule */}
          <div className="inline-flex items-center bg-[#131318] border border-[#262630] hover:border-[#383848] rounded-xl p-0.5 shadow-inner transition-colors">
            <button
              id="prev-month-btn"
              onClick={() => handleMonthChange(-1)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[#8A8A96] hover:text-white hover:bg-[#20202A] active:scale-95 transition cursor-pointer"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 sm:px-2.5 py-0.5 flex items-center gap-1.5 cursor-default">
              <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
              <span className="text-[11.5px] sm:text-xs font-semibold tracking-wider text-white whitespace-nowrap font-mono">
                {formattedMonthLabel()}
              </span>
            </div>

            <button
              id="next-month-btn"
              onClick={() => handleMonthChange(1)}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-[#8A8A96] hover:text-white hover:bg-[#20202A] active:scale-95 transition cursor-pointer"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real-time Status indicator below month */}
          <div className="flex items-center gap-1.5 mt-0.5 px-1">
            {pwaState.isOnline ? (
              <div className="inline-flex items-center gap-1 text-[9px] font-mono text-[#10B981]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
                </span>
                <span className="uppercase tracking-widest text-[#10B981] font-semibold">Live Sync</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400">
                <WifiOff className="w-2.5 h-2.5" />
                <span className="uppercase tracking-widest font-semibold">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: High-Precision Punch Controls & Session HUD */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Live Working Desktop Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131318] border border-[#22222C] text-xs font-mono shadow-sm">
          <div className={`w-2 h-2 rounded-full ${
            isCurrentlyWorking ? 'bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]' : isOnBreak ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-[#555560]'
          }`} />
          <span className={`text-[11px] uppercase tracking-wider font-semibold ${
            isCurrentlyWorking ? 'text-[#10B981]' : isOnBreak ? 'text-amber-400' : 'text-[#7A7A88]'
          }`}>
            {isOnBreak ? 'On Break' : isCurrentlyWorking ? 'Live Working' : 'Idle'}
          </span>
        </div>

        {/* Quick Break Button */}
        {isCurrentlyWorking && (
          <button
            id="quick-break-btn"
            onClick={() => (isOnBreak ? endBreak() : startBreak('lunch'))}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[38px] rounded-xl text-[11px] sm:text-xs font-mono uppercase tracking-wider font-semibold transition-all duration-200 active:scale-95 cursor-pointer border ${
              isOnBreak
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#141419] hover:bg-[#1C1C24] text-[#B8B8C4] border-[#252530] hover:border-[#353545] shadow-sm'
            }`}
          >
            <Coffee className={`w-3.5 h-3.5 ${isOnBreak ? 'text-amber-400 animate-bounce' : 'text-[#9E9EAA]'}`} />
            <span className="hidden xs:inline">{isOnBreak ? 'Resume' : 'Break'}</span>
          </button>
        )}

        {/* Primary Clock In / Clock Out Button */}
        <button
          id="quick-punch-btn"
          onClick={() => (isCurrentlyWorking ? punchOut() : punchIn())}
          className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[38px] rounded-xl text-[11px] sm:text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 active:scale-95 shadow-md cursor-pointer whitespace-nowrap ${
            isCurrentlyWorking
              ? 'bg-[#1A1014] hover:bg-[#24141A] text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
              : 'bg-gradient-to-r from-[#D4AF37] via-[#DFB843] to-[#D4AF37] hover:brightness-110 text-[#0A0A0C] border border-[#E5C158]/50 shadow-[0_2px_12px_rgba(212,175,55,0.25)]'
          }`}
        >
          <Power className={`w-3.5 h-3.5 ${isCurrentlyWorking ? 'text-rose-400' : 'text-[#0A0A0C]'}`} />
          <span>{isCurrentlyWorking ? 'Clock Out' : 'Clock In'}</span>
        </button>

        {/* Android Widget Shortcut Button */}
        <button
          onClick={() => setActiveTab('widget')}
          className="p-1.5 sm:p-2 min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] bg-[#131318] border border-[#252530] hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#F3E5AB] rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          title="Open Android Widget Studio"
          aria-label="Open Android Widget Studio"
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Settings Shortcut Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className="p-1.5 sm:p-2 min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] bg-[#131318] border border-[#252530] hover:border-[#383848] text-[#8A8A96] hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
          title="Open Settings"
          aria-label="Open Settings"
        >
          <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};

