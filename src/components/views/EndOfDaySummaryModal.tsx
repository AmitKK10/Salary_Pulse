// ============================================================================
// SALARYPULSE — END OF DAY SUMMARY MODAL (STEP 10)
// Comprehensive financial & attendance breakdown shown upon ending the workday
// ============================================================================

import React from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  Clock, 
  Coffee, 
  TrendingUp, 
  Coins, 
  Award, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  X, 
  Eye 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatSecondsToClock, formatSecondsToDetailed } from '../../utils/formatters';

interface EndOfDaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDay?: () => void;
}

export const EndOfDaySummaryModal: React.FC<EndOfDaySummaryModalProps> = ({
  isOpen,
  onClose,
  onViewDay,
}) => {
  const { 
    todayAttendance, 
    todayLiveActiveSeconds, 
    todayLiveBreakSeconds, 
    todayLiveEarned, 
    liveOtInfo, 
    salaryCalculation, 
    salaryConfig, 
    schedule,
    setActiveTab,
    selectedMonth
  } = useApp();

  if (!isOpen) return null;

  const requiredDailySec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
  const normalSeconds = Math.min(todayLiveActiveSeconds, requiredDailySec);
  const overtimeSeconds = Math.max(0, todayLiveActiveSeconds - requiredDailySec);
  const bonusPresent = salaryCalculation.actualPresentDays;
  const bonusTarget = salaryConfig.attendanceBonusEligibleDays || 26;

  const handleGoCalendar = () => {
    setActiveTab('calendar');
    onClose();
  };

  const handleGoDashboard = () => {
    setActiveTab('dashboard');
    onClose();
  };

  const modalContent = (
    <div
      id="end-of-day-summary-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden"
    >
      <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scaleUp max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
        {/* Subtle gold ambient backdrop glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold">
                  TODAY COMPLETE
                </span>
                <span className="text-xs text-[#737373] font-mono">{todayAttendance.date}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1 font-serif-display">
                Workday Wrap-Up Summary
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Today's Financial Accrual Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-[#2A2A2A] mb-6 shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-[#737373] font-mono font-semibold">
            Today's Total Compensation
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl sm:text-5xl font-light tracking-tight text-[#D4AF37] font-serif-display">
              {formatCurrency(todayLiveEarned)}
            </span>
            {overtimeSeconds > 0 && (
              <span className="text-xs font-mono font-semibold text-[#10B981]">
                (incl. {formatSecondsToClock(overtimeSeconds)} OT)
              </span>
            )}
          </div>
        </div>

        {/* 4-Stat Work Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#161616] border border-[#242424]">
            <p className="text-[9px] uppercase tracking-wider text-[#737373] font-mono">Active Work</p>
            <p className="text-sm font-bold text-white font-mono mt-1">
              {formatSecondsToDetailed(todayLiveActiveSeconds)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#161616] border border-[#242424]">
            <p className="text-[9px] uppercase tracking-wider text-[#737373] font-mono">Total Breaks</p>
            <p className="text-sm font-bold text-[#A3A3A3] font-mono mt-1">
              {formatSecondsToDetailed(todayLiveBreakSeconds)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#161616] border border-[#242424]">
            <p className="text-[9px] uppercase tracking-wider text-[#737373] font-mono">Normal Hours</p>
            <p className="text-sm font-bold text-white font-mono mt-1">
              {formatSecondsToDetailed(normalSeconds)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#161616] border border-[#242424]">
            <p className="text-[9px] uppercase tracking-wider text-[#737373] font-mono">Today's OT</p>
            <p className="text-sm font-bold text-[#10B981] font-mono mt-1">
              {overtimeSeconds > 0 ? formatSecondsToDetailed(overtimeSeconds) : '0h 00m'}
            </p>
          </div>
        </div>

        {/* Running Monthly Context */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] mb-6 text-xs">
          <div className="flex justify-between items-center text-[#A3A3A3]">
            <span>Running Monthly Earnings ({selectedMonth}):</span>
            <span className="font-bold text-[#D4AF37] font-mono">
              {formatCurrency(salaryCalculation.realtimeEarnedSoFar)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[#A3A3A3]">
            <span>Accumulated Monthly Overtime:</span>
            <span className="font-bold text-[#10B981] font-mono">
              {(salaryCalculation.overtimeSeconds / 3600).toFixed(1)} hrs
            </span>
          </div>

          <div className="flex justify-between items-center text-[#A3A3A3]">
            <span>Attendance Bonus Progress:</span>
            <span className="font-bold text-white font-mono">
              {bonusPresent} / {bonusTarget} Days {bonusPresent >= bonusTarget ? '(Eligible)' : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onViewDay && (
              <button
                onClick={() => {
                  onViewDay();
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Day</span>
              </button>
            )}

            <button
              onClick={handleGoCalendar}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-lg"
          >
            <span>Done</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
