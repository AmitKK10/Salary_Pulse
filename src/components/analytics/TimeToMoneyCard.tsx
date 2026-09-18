import React, { useState } from 'react';
import { TimeMoneyConversionData } from '../../types';
import { formatCurrency, formatDurationHM } from '../../utils/formatters';
import { 
  DollarSign, 
  Clock, 
  Zap, 
  Calendar, 
  Timer, 
  Activity, 
  Calculator, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TimeToMoneyCardProps {
  conversionData: TimeMoneyConversionData;
}

export const TimeToMoneyCard: React.FC<TimeToMoneyCardProps> = ({ conversionData }) => {
  const {
    salaryCalculation,
    salaryConfig,
    isCurrentlyWorking,
    todayLiveActiveSeconds,
    selectedMonth,
    todayAttendance,
    todayDate,
  } = useApp();

  // Selected or active month display label
  const activeMonthString = selectedMonth || conversionData.monthLabel || '2026-09';
  const monthDate = new Date(`${activeMonthString}-01T00:00:00`);
  const monthName = !isNaN(monthDate.getTime())
    ? monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : activeMonthString;

  // Exact figures from calculation engine
  const baseSalary = salaryCalculation?.baseSalary || salaryConfig.monthlyBaseSalary || 15000;
  const calendarDays = conversionData.calendarDays || salaryCalculation?.calendarDays || 30;
  const workingDays = conversionData.workingDays || salaryCalculation?.workingDays || 25;

  // Exact per-unit rates based on active month's calculation data
  const dailyRate = conversionData.dailySalary || (baseSalary / calendarDays);
  const hourlyRate = conversionData.normalHourlyRate || (dailyRate / 8);
  const minuteRate = conversionData.normalMinuteRate || (hourlyRate / 60);
  const secondRate = conversionData.normalSecondRate || (minuteRate / 60);

  // Overtime rates
  const otHourlyRate = conversionData.otHourlyRate || salaryConfig.customOtHourlyRate || 75;
  const otMinuteRate = conversionData.otMinuteRate || (otHourlyRate / 60);
  const otSecondRate = conversionData.otSecondRate || (otMinuteRate / 60);

  // Real-time active accrual today
  const activeTodaySeconds = todayAttendance?.date === todayDate
    ? (isCurrentlyWorking ? todayLiveActiveSeconds : Math.max(todayLiveActiveSeconds, todayAttendance?.totalActiveSeconds || 0))
    : (isCurrentlyWorking ? todayLiveActiveSeconds : 0);
  
  const liveEarnedToday = activeTodaySeconds * secondRate;

  // Interactive Quick Calculator state
  const [calcHours, setCalcHours] = useState<number>(8);
  const [calcMinutes, setCalcMinutes] = useState<number>(0);
  const totalCalcMinutes = (calcHours * 60) + calcMinutes;
  const simulatedEarnings = totalCalcMinutes * minuteRate;

  return (
    <div 
      id="analytics-time-to-money-card" 
      className="bg-[#121824] border border-[#1e293b] rounded-2xl p-5 md:p-6 shadow-xl space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Active Month Earnings Rate Engine</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                {activeMonthString}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Deterministic per-day, per-hour, per-minute, and per-second conversions for {monthName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0a0e17] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
            <span className="text-slate-400">Base Salary:</span>
            <span className="font-bold text-emerald-400">₹{baseSalary.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0a0e17] border border-[#1e293b] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
            <span className="text-slate-400">Calendar Days:</span>
            <span className="font-bold text-slate-200">{calendarDays} Days</span>
          </div>
        </div>
      </div>

      {/* Live Working Accrual Bar (Visible during active work or with logged work) */}
      {isCurrentlyWorking && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a0e17] to-cyan-950/30 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Live Accrual In Progress</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Earning +₹{secondRate.toFixed(5)} every single second of active shift
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Today's Active Time:</span>
              <span className="text-sm font-bold font-mono text-slate-200">
                {formatDurationHM(activeTodaySeconds)}
              </span>
            </div>
            <div className="h-8 w-px bg-[#1e293b]" />
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 block font-mono font-semibold">Live Earned Today:</span>
              <span className="text-lg font-black font-mono text-emerald-300">
                ₹{liveEarnedToday.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary 4-Metric Grid: Per-Day, Per-Hour, Per-Minute, Per-Second */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Month Standard Shift Breakdown</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Divisor: {calendarDays} calendar days • 8.0h shift
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. PER DAY EARNINGS */}
          <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Per Day</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                1 SHIFT
              </span>
            </div>

            <div className="mt-2.5">
              <div className="text-2xl font-black font-mono text-emerald-300 tracking-tight">
                ₹{dailyRate.toFixed(2)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <span>Base ÷ {calendarDays} days</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1e293b]/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Half Day (4h):</span>
              <span className="text-slate-300 font-bold">₹{(dailyRate / 2).toFixed(2)}</span>
            </div>
          </div>

          {/* 2. PER HOUR EARNINGS */}
          <div className="bg-[#0a0e17] border border-sky-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-sky-500/60 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-sky-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Per Hour</span>
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.5 rounded font-bold">
                60 MINS
              </span>
            </div>

            <div className="mt-2.5">
              <div className="text-2xl font-black font-mono text-sky-300 tracking-tight">
                {formatCurrency(hourlyRate)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <span>Daily ÷ 8.0 hours</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1e293b]/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>2 Hours Work:</span>
              <span className="text-slate-300 font-bold">₹{(hourlyRate * 2).toFixed(2)}</span>
            </div>
          </div>

          {/* 3. PER MINUTE EARNINGS */}
          <div className="bg-[#0a0e17] border border-amber-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-amber-300">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>Per Minute</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                60 SECS
              </span>
            </div>

            <div className="mt-2.5">
              <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
                ₹{minuteRate.toFixed(4)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <span>Hourly ÷ 60 mins</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1e293b]/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>30-Min Lunch:</span>
              <span className="text-slate-300 font-bold">₹{(minuteRate * 30).toFixed(2)}</span>
            </div>
          </div>

          {/* 4. PER SECOND EARNINGS */}
          <div className="bg-[#0a0e17] border border-purple-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-purple-500/60 transition-all shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-purple-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Per Second</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                1000 MS
              </span>
            </div>

            <div className="mt-2.5">
              <div className="text-2xl font-black font-mono text-purple-300 tracking-tight">
                ₹{secondRate.toFixed(5)}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <span>Minute ÷ 60 secs</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#1e293b]/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Drift-Free Precision:</span>
              <span className="text-slate-300 font-bold">₹{(secondRate).toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Overtime Rates & Interactive Quick Time-to-Money Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Overtime Comparison Cards (6 cols) */}
        <div className="lg:col-span-6 bg-[#0a0e17] border border-[#1e293b] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Overtime Earnings Multipliers
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
              APPROVED OT
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block font-mono">1 Hour OT</span>
              <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                ₹{otHourlyRate.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Fixed Rate</span>
            </div>

            <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block font-mono">1 Min OT</span>
              <span className="text-base font-bold font-mono text-amber-300 mt-0.5 block">
                ₹{otMinuteRate.toFixed(4)}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">₹75 ÷ 60</span>
            </div>

            <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block font-mono">1 Sec OT</span>
              <span className="text-base font-bold font-mono text-amber-200 mt-0.5 block">
                ₹{otSecondRate.toFixed(5)}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">₹75 ÷ 3600</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-[#121824]/60 p-2 rounded-lg flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Overtime accrues at flat ₹75/hr after satisfying the 208h normal work benchmark.</span>
          </div>
        </div>

        {/* Quick Earnings Calculator (6 cols) */}
        <div className="lg:col-span-6 bg-[#0a0e17] border border-[#1e293b] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Quick Shift Earning Simulator
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              Active Month Rate
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => { setCalcHours(1); setCalcMinutes(0); }}
              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                calcHours === 1 && calcMinutes === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#121824] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              1 Hour
            </button>
            <button
              type="button"
              onClick={() => { setCalcHours(4); setCalcMinutes(0); }}
              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                calcHours === 4 && calcMinutes === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#121824] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              Half Day (4h)
            </button>
            <button
              type="button"
              onClick={() => { setCalcHours(8); setCalcMinutes(0); }}
              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                calcHours === 8 && calcMinutes === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#121824] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              Full Day (8h)
            </button>
            <button
              type="button"
              onClick={() => { setCalcHours(9); setCalcMinutes(0); }}
              className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors ${
                calcHours === 9 && calcMinutes === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#121824] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              9 Hours
            </button>
          </div>

          {/* Simulated result box */}
          <div className="bg-[#121824] border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Estimated Normal Earnings for {calcHours}h {calcMinutes > 0 ? `${calcMinutes}m` : ''}:
              </span>
              <span className="text-xl font-black font-mono text-emerald-300 mt-0.5 block">
                ₹{simulatedEarnings.toFixed(2)}
              </span>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-400">
              <div>{totalCalcMinutes} total minutes</div>
              <div className="text-emerald-400">@ ₹{minuteRate.toFixed(4)}/min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
