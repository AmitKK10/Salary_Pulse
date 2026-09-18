// ============================================================================
// SALARYPULSE — CURRENT MONTH SUMMARY WIDGET
// Authoritative monthly working-time, required targets, shortfall/surplus,
// and real-time accrued earnings display for the selected month.
// ============================================================================

import React, { useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Hourglass,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatSecondsToHHMMSS } from '../../utils/formatters';

export const CurrentMonthSummaryWidget: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    todayDate,
    salaryCalculation,
    rateDerivation,
    isCurrentlyWorking,
  } = useApp();

  const isCurrentRunningMonth = useMemo(() => {
    return todayDate ? todayDate.startsWith(selectedMonth) : selectedMonth === '2026-09';
  }, [todayDate, selectedMonth]);

  const monthLabel = useMemo(() => {
    const [year, mStr] = (selectedMonth || '2026-09').split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIdx = parseInt(mStr, 10) - 1;
    return `${monthNames[monthIdx] || mStr} ${year}`;
  }, [selectedMonth]);

  // Derived target and active work metrics
  const totalRequiredSeconds = salaryCalculation?.totalRequiredSeconds || 0;
  const totalWorkedSeconds = salaryCalculation?.totalActiveSecondsWorked || 0;
  const isShortfall = totalWorkedSeconds < totalRequiredSeconds;
  const differenceSeconds = Math.abs(totalRequiredSeconds - totalWorkedSeconds);

  // Completion progress percentage
  const progressPercent = totalRequiredSeconds > 0
    ? Math.min(100, Math.round((totalWorkedSeconds / totalRequiredSeconds) * 1000) / 10)
    : 0;

  // Attendance ratio
  const presentDays = salaryCalculation?.actualPresentDays || 0;
  const scheduledDays = salaryCalculation?.workingDays || 26;
  const calendarDays = salaryCalculation?.calendarDays || 30;

  return (
    <section
      id="current-month-summary-widget"
      aria-label="Current Month Summary"
      className="bg-[#121215] border border-[#1E1E24] hover:border-[#2B2B36] rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-200"
    >
      {/* 1. Header & Context Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1C1C22]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono uppercase">
                Current Month Summary
              </h3>
              {isCurrentRunningMonth ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  ACTIVE ACCRUAL
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#8E8E9E] bg-[#1A1A22] border border-[#282834]">
                  HISTORICAL ARCHIVE
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] font-mono mt-0.5">
              {monthLabel} · {calendarDays} Calendar Days · {scheduledDays} Scheduled Working Days
            </p>
          </div>
        </div>

        {/* Month Quick Badge / Target Info */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-mono text-[#A3A3A3] bg-[#16161C] border border-[#24242E] px-2.5 py-1 rounded-lg">
            Daily Standard: <strong className="text-white">8h 00m</strong>
          </span>
          <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-1 rounded-lg">
            Rate: <strong className="text-white">~{formatCurrency(rateDerivation?.dailyRate || 500)}/day</strong>
          </span>
        </div>
      </div>

      {/* 2. Prominent Monthly Work Progress Hero Banner */}
      <div 
        id="monthly-work-prominent-banner"
        className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#16161D] via-[#141419] to-[#16161D] border border-[#262632] flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
              Monthly Work
            </span>
            <span className="text-[10px] font-mono text-[#737373]">
              (Actual vs Required Target)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light font-mono text-white tracking-tight">
              {formatSecondsToHHMMSS(totalWorkedSeconds)}
            </span>
            <span className="text-sm sm:text-base font-mono text-[#8E8E9E]">
              / {formatSecondsToHHMMSS(totalRequiredSeconds)}
            </span>
          </div>
        </div>

        {/* Progress bar and delta indicator */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#A3A3A3]">Completion</span>
            <span className={progressPercent >= 100 ? 'text-[#10B981] font-bold' : 'text-[#D4AF37] font-bold'}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#202028] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100
                  ? 'bg-gradient-to-r from-[#10B981] to-emerald-400'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#10B981]'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#737373]">
            <span>{isShortfall ? 'Shortfall to Target:' : 'Surplus Logged:'}</span>
            <span className={isShortfall ? 'text-[#F59E0B] font-semibold' : 'text-[#10B981] font-semibold'}>
              {formatSecondsToHHMMSS(differenceSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Compact 6-Card Grid: Worked, Required, Remaining, Earned, Overtime, Attendance */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-3.5 mt-4">
        {/* Card 1: WORKED */}
        <div
          id="card-month-worked"
          className="p-3.5 rounded-xl bg-[#16161C] border border-[#24242E] hover:border-[#D4AF37]/40 flex flex-col justify-between shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Worked
            </span>
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <p className="text-lg sm:text-xl font-mono text-white font-semibold tracking-tight">
              {formatSecondsToHHMMSS(totalWorkedSeconds)}
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#737373] truncate">
            {salaryCalculation?.totalActiveHoursWorked?.toFixed(1) || '0.0'} hrs logged
          </p>
        </div>

        {/* Card 2: REQUIRED */}
        <div
          id="card-month-required"
          className="p-3.5 rounded-xl bg-[#16161C] border border-[#24242E] hover:border-[#33333F] flex flex-col justify-between shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Required
            </span>
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2">
            <p className="text-lg sm:text-xl font-mono text-white font-semibold tracking-tight">
              {formatSecondsToHHMMSS(totalRequiredSeconds)}
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#737373] truncate">
            {scheduledDays} days × 8h
          </p>
        </div>

        {/* Card 3: REMAINING / SHORTFALL */}
        <div
          id="card-month-remaining"
          className={`p-3.5 rounded-xl bg-[#16161C] border ${
            isShortfall ? 'border-[#24242E] hover:border-[#F59E0B]/40' : 'border-[#24242E] hover:border-[#10B981]/40'
          } flex flex-col justify-between shadow-md transition`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              {isShortfall ? 'Remaining' : 'Surplus'}
            </span>
            <Hourglass className={`w-3.5 h-3.5 ${isShortfall ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} />
          </div>
          <div className="my-2">
            <p className={`text-lg sm:text-xl font-mono font-semibold tracking-tight ${
              isShortfall ? 'text-[#F59E0B]' : 'text-[#10B981]'
            }`}>
              {formatSecondsToHHMMSS(differenceSeconds)}
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#737373] truncate">
            {isShortfall ? 'Target deficit' : 'Extra hours worked'}
          </p>
        </div>

        {/* Card 4: CURRENT EARNINGS */}
        <div
          id="card-month-earned"
          className="p-3.5 rounded-xl bg-[#16161C] border border-[#24242E] hover:border-[#D4AF37]/50 flex flex-col justify-between shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
              Earned To Date
            </span>
            <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="my-2">
            <p className="text-lg sm:text-xl font-serif-display font-light text-[#D4AF37] tracking-tight truncate">
              {formatCurrency(salaryCalculation?.realtimeEarnedSoFar || 0)}
            </p>
          </div>
          <p className="text-[10px] font-mono text-[#10B981] truncate">
            {isCurrentRunningMonth ? 'Live accruing' : 'Closed month'}
          </p>
        </div>

        {/* Card 5: OVERTIME */}
        <div
          id="card-month-overtime"
          className="p-3.5 rounded-xl bg-[#16161C] border border-[#24242E] hover:border-emerald-500/40 flex flex-col justify-between shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Overtime
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-2">
            <p className="text-lg sm:text-xl font-mono font-semibold text-emerald-400 tracking-tight">
              {formatSecondsToHHMMSS(salaryCalculation?.overtimeSeconds || 0)}
            </p>
          </div>
          <p className="text-[10px] font-mono text-emerald-300 truncate">
            OT: +{formatCurrency(salaryCalculation?.overtimePay || 0)}
          </p>
        </div>

        {/* Card 6: ATTENDANCE */}
        <div
          id="card-month-attendance"
          className="p-3.5 rounded-xl bg-[#16161C] border border-[#24242E] hover:border-sky-500/40 flex flex-col justify-between shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Attendance
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2">
            <p className="text-lg sm:text-xl font-mono font-semibold text-white tracking-tight">
              {presentDays} / {scheduledDays}
            </p>
          </div>
          <p className="text-[10px] font-mono text-sky-300 truncate">
            {Math.round((presentDays / (scheduledDays || 1)) * 100)}% attendance
          </p>
        </div>
      </div>
    </section>
  );
};
