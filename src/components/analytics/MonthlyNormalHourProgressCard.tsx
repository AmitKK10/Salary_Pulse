import React, { useState } from 'react';
import { MonthlyNormalHourProgress } from '../../types';
import { formatDurationHM } from '../../utils/formatters';
import { 
  Target, 
  Clock, 
  Zap, 
  Droplet, 
  PieChart as PieChartIcon, 
  CheckCircle2, 
  Sparkles, 
  Activity,
  Flame,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkSessionEngine } from '../../engine/workSessionEngine';

interface MonthlyNormalHourProgressCardProps {
  progress: MonthlyNormalHourProgress;
}

export const MonthlyNormalHourProgressCard: React.FC<MonthlyNormalHourProgressCardProps> = ({
  progress,
}) => {
  const {
    selectedMonth,
    todayDate,
    todayAttendance,
    todayLiveActiveSeconds,
    isCurrentlyWorking,
    salaryCalculation,
    monthlyRunningSummary,
  } = useApp();

  // Mode switcher: 'glass-pie' (Glass-filling Circular Pie Chart - DEFAULT), 'beaker' (Glass Beaker), 'donut' (Radial Arc)
  const [visualMode, setVisualMode] = useState<'glass-pie' | 'beaker' | 'donut'>('glass-pie');

  // Month target calculations (e.g. 26 days * 8h = 208 hours standard)
  const targetSeconds = progress.targetSeconds || (26 * 8 * 3600);
  const targetHours = targetSeconds / 3600;

  // Active month live synchronization
  const isSelectedMonthCurrent = (progress.month || selectedMonth) === todayDate.slice(0, 7);
  const liveDelta = isSelectedMonthCurrent && isCurrentlyWorking && todayAttendance?.date === todayDate
    ? Math.max(0, todayLiveActiveSeconds - (todayAttendance?.totalActiveSeconds || 0))
    : 0;

  // Base worked seconds from engine or salary calculation + live ticking delta
  const baseEligibleSeconds = progress.eligibleSeconds || (monthlyRunningSummary?.actualWorkSeconds) || (salaryCalculation?.totalActiveSecondsWorked) || 0;
  const currentWorkedSeconds = baseEligibleSeconds + liveDelta;
  const currentWorkedHours = currentWorkedSeconds / 3600;

  // Normal work up to target threshold
  const normalSeconds = Math.min(targetSeconds, currentWorkedSeconds);
  const remainingSeconds = Math.max(0, targetSeconds - currentWorkedSeconds);
  const remainingHours = remainingSeconds / 3600;

  // Overtime beyond target threshold
  const overtimeSeconds = Math.max(0, currentWorkedSeconds - targetSeconds);
  const overtimeHours = overtimeSeconds / 3600;

  // High-precision percentage: Increases every second in fractions during active work
  const fillPercentage = targetSeconds > 0 ? (currentWorkedSeconds / targetSeconds) * 100 : 0;
  const isOvertime = overtimeSeconds > 0;
  const isComplete = currentWorkedSeconds >= targetSeconds;
  const isHalfFilled = Math.abs(fillPercentage - 50) <= 5;

  // Clamped visual liquid level between 0% and 100%
  const liquidLevel = Math.min(100, Math.max(currentWorkedSeconds > 0 ? 3 : 0, fillPercentage));

  // Circular Pie Chart SVG parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const normalClampedPct = Math.min(100, fillPercentage);
  const strokeDashoffset = circumference - (circumference * normalClampedPct) / 100;
  const otPct = Math.min(100, Math.max(0, fillPercentage - 100));
  const otStrokeDashoffset = circumference - (circumference * otPct) / 100;

  // Fractional percentage formatting: 4 decimal places ensures every second actively increments
  // 1 second / 748,800 seconds = ~0.000133% increase every single second
  const integerPart = Math.floor(fillPercentage);
  const fractionPart = (fillPercentage % 1).toFixed(4).substring(2);
  const fractionRatePerSec = targetSeconds > 0 ? ((1 / targetSeconds) * 100).toFixed(5) : '0.00013';

  return (
    <div 
      id="analytics-monthly-work-progress-card" 
      className="bg-[#121824] border border-[#1e293b] rounded-2xl p-5 md:p-6 shadow-xl space-y-5"
    >
      {/* Header with Title, Mode Switcher & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {visualMode === 'glass-pie' ? (
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
            ) : visualMode === 'beaker' ? (
              <Droplet className="w-4 h-4 text-cyan-400" />
            ) : (
              <Layers className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Monthly Work Progress</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                {progress.month || selectedMonth}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Current vs. Total monthly scheduled target ({targetHours.toFixed(0)}h required standard)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Visual Style Toggle: Glass-Filling Pie vs Beaker vs Donut */}
          <div className="inline-flex rounded-lg bg-[#0a0e17] border border-[#1e293b] p-0.5 shadow-inner">
            <button
              type="button"
              id="analytics-progress-mode-glass-pie"
              onClick={() => setVisualMode('glass-pie')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                visualMode === 'glass-pie'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Circular Glass-Filling Pie Chart"
            >
              <PieChartIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Glass Pie</span>
            </button>
            <button
              type="button"
              id="analytics-progress-mode-beaker"
              onClick={() => setVisualMode('beaker')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                visualMode === 'beaker'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Graduated Glass Beaker"
            >
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Beaker</span>
            </button>
            <button
              type="button"
              id="analytics-progress-mode-donut"
              onClick={() => setVisualMode('donut')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                visualMode === 'donut'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Minimal Radial Donut Arc"
            >
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>Donut</span>
            </button>
          </div>

          {/* Real-time Work Status Badge */}
          {isCurrentlyWorking ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              LIVE TICKING (+{fractionRatePerSec}%/s)
            </span>
          ) : isComplete ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              TARGET SATISFIED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#0a0e17] text-slate-400 border border-[#1e293b]">
              <Activity className="w-3 h-3" />
              RECORDED PACING
            </span>
          )}
        </div>
      </div>

      {/* Main Visual Display Section: Glass-Filling Pie Chart or Variants */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Visual Graphic Column (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 bg-[#0a0e17]/60 rounded-xl border border-[#1e293b]/60">
          {visualMode === 'glass-pie' ? (
            /* ======================================================== */
            /* SIGNATURE COMPONENT: CIRCULAR GLASS-FILLING PIE CHART   */
            /* ======================================================== */
            <div className="relative flex flex-col items-center justify-center py-2">
              <div 
                className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center"
                title={`${fillPercentage.toFixed(4)}% completed (${currentWorkedHours.toFixed(2)}h / ${targetHours.toFixed(1)}h)`}
              >
                {/* 1. Concentric Radial Pie Chart Ring Gauge (Outer Rim) */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 z-20 pointer-events-none" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="glassPieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="glassPieOtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>

                  {/* Dark Track Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#1a2333"
                    strokeWidth="8"
                    fill="transparent"
                  />

                  {/* Outer Radial Pie Progress Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#glassPieGrad)"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Overtime Ring (when > 100%) */}
                  {isOvertime && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius + 6}
                      stroke="url(#glassPieOtGrad)"
                      strokeWidth="3.5"
                      strokeDasharray={circumference + 37.7}
                      strokeDashoffset={otStrokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>

                {/* 2. Glass Vessel Orb (Circular Lens with Liquid Inside) */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-white/25 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-[inset_0_4px_24px_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.85)] transition-all">
                  {/* Outer Glass Bezel Highlights */}
                  <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none z-30" />
                  
                  {/* Top Specular Arc Reflection */}
                  <div className="absolute top-1 inset-x-5 h-3 rounded-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none z-30" />

                  {/* 50% Mid-Level Horizon Line */}
                  <div className="absolute top-1/2 inset-x-2 border-b border-dashed border-cyan-400/35 z-20 pointer-events-none" />

                  {/* Left Specular Glare Rim */}
                  <div className="absolute top-4 left-2 bottom-4 w-1.5 rounded-full bg-gradient-to-b from-white/40 via-white/15 to-transparent z-30 pointer-events-none" />

                  {/* Radial Calibration Markers on Glass Wall */}
                  <div className="absolute right-1.5 inset-y-2 flex flex-col justify-between items-end z-25 pointer-events-none py-2 text-[7.5px] font-mono text-white/50">
                    <span className="text-emerald-300 font-bold">100%</span>
                    <span className="text-white/40">75%</span>
                    <span className={`font-bold ${isHalfFilled ? 'text-cyan-300 animate-pulse' : 'text-cyan-400/90'}`}>50%</span>
                    <span className="text-white/40">25%</span>
                    <span className="text-white/40">0%</span>
                  </div>

                  {/* Fluid Rising Column inside Circular Lens */}
                  <div 
                    className="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-out z-10"
                    style={{ height: `${liquidLevel}%` }}
                  >
                    {/* Undulating Fluid Meniscus Wave */}
                    {liquidLevel > 0 && (
                      <div className="absolute -top-3 inset-x-0 h-3.5 overflow-hidden pointer-events-none">
                        <svg 
                          className="w-[200%] h-full animate-liquid-wave opacity-85" 
                          viewBox="0 0 800 60" 
                          preserveAspectRatio="none"
                        >
                          <path 
                            d="M0,25 C100,5 200,45 300,25 C400,5 500,45 600,25 C700,5 800,45 900,25 L900,60 L0,60 Z" 
                            fill={isOvertime ? '#F59E0B' : '#34D399'} 
                          />
                        </svg>
                        <svg 
                          className="w-[200%] h-full absolute top-0 left-0 animate-liquid-wave-rev opacity-60" 
                          viewBox="0 0 800 60" 
                          preserveAspectRatio="none"
                        >
                          <path 
                            d="M0,35 C120,45 220,15 320,35 C420,45 520,15 620,35 C720,45 820,15 920,35 L920,60 L0,60 Z" 
                            fill={isOvertime ? '#D4AF37' : '#06B6D4'} 
                          />
                        </svg>
                      </div>
                    )}

                    {/* Liquid Body Gradient */}
                    <div 
                      className={`w-full h-full relative ${
                        isOvertime 
                          ? 'bg-gradient-to-t from-emerald-950 via-amber-600/90 to-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.5)]' 
                          : 'bg-gradient-to-t from-emerald-950 via-emerald-500/85 to-teal-400/90 shadow-[0_0_22px_rgba(16,185,129,0.4)]'
                      }`}
                    >
                      {/* Rising Fluid Bubbles */}
                      {liquidLevel > 15 && (
                        <>
                          <div className="absolute bottom-2 left-6 w-1.5 h-1.5 rounded-full bg-white/60 animate-bubble-1 pointer-events-none" />
                          <div className="absolute bottom-3 left-16 w-1 h-1 rounded-full bg-white/70 animate-bubble-2 pointer-events-none" />
                          <div className="absolute bottom-5 left-24 w-1.5 h-1.5 rounded-full bg-white/50 animate-bubble-3 pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* 3. Floating Center Pill with REAL-TIME FRACTIONAL INCREMENT */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none px-2">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center">
                      <div className="flex items-baseline justify-center">
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {integerPart}
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                          .{fractionPart}%
                        </span>
                      </div>
                      <span className={`text-[8px] font-mono uppercase tracking-widest font-bold mt-0.5 ${
                        isOvertime 
                          ? 'text-[#F59E0B]' 
                          : isComplete 
                            ? 'text-emerald-400' 
                            : fillPercentage >= 50 
                              ? 'text-cyan-300' 
                              : 'text-slate-300'
                      }`}>
                        {isOvertime ? 'Surpassed' : isComplete ? 'Complete' : fillPercentage >= 50 ? 'Half+' : 'Pacing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Pill below Circular Glass Pie */}
              <div className="mt-3 flex items-center gap-1.5">
                {isOvertime ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold text-amber-400 bg-amber-950/50 px-2.5 py-0.5 rounded border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    +{(overtimeSeconds / 3600).toFixed(1)}h Overtime Accrued
                  </span>
                ) : isComplete ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    100% Target Met
                  </span>
                ) : isHalfFilled ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold text-cyan-300 bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    <Droplet className="w-3 h-3 text-cyan-400" />
                    Half-way Point Reached
                  </span>
                ) : (
                  <span className="text-[10.5px] font-mono text-slate-400">
                    {fillPercentage.toFixed(4)}% of monthly glass pie
                  </span>
                )}
              </div>
            </div>
          ) : visualMode === 'beaker' ? (
            /* ======================================================== */
            /* GLASS TUMBLER / BEAKER MODE                              */
            /* ======================================================== */
            <div className="relative flex flex-col items-center justify-center py-2">
              <div 
                className="relative w-36 h-48 rounded-b-[30px] rounded-t-xl border-2 border-white/20 bg-slate-950/70 backdrop-blur-md overflow-hidden shadow-[inset_0_4px_20px_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.8)] transition-all"
                title={`${fillPercentage.toFixed(4)}% completed (${currentWorkedHours.toFixed(2)}h / ${targetHours.toFixed(1)}h)`}
              >
                {/* Glass Rim Top Lip */}
                <div className="absolute top-1 inset-x-2 h-2.5 rounded-full border border-white/25 bg-white/10 z-30 pointer-events-none" />

                {/* Calibration Ticks */}
                <div className="absolute right-1 inset-y-2 flex flex-col justify-between items-end z-20 pointer-events-none py-2 text-[8px] font-mono text-white/40">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-emerald-300 font-bold">100%</span>
                    <div className="w-3 h-[1.5px] bg-emerald-400/80" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-white/40">75%</span>
                    <div className="w-2 h-[1px] bg-white/30" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[8px] font-bold ${isHalfFilled ? 'text-cyan-300 animate-pulse' : 'text-cyan-400/90'}`}>50%</span>
                    <div className="w-3.5 h-[1.5px] bg-cyan-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-white/40">25%</span>
                    <div className="w-2 h-[1px] bg-white/30" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-white/40">0%</span>
                    <div className="w-2.5 h-[1px] bg-white/30" />
                  </div>
                </div>

                {/* 50% Horizon */}
                <div className="absolute top-1/2 inset-x-2 border-b border-dashed border-cyan-400/30 z-10 pointer-events-none" />

                {/* Liquid Rising */}
                <div 
                  className="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-out z-10"
                  style={{ height: `${liquidLevel}%` }}
                >
                  {liquidLevel > 0 && (
                    <div className="absolute -top-3.5 inset-x-0 h-4 overflow-hidden pointer-events-none">
                      <svg className="w-[200%] h-full animate-liquid-wave opacity-85" viewBox="0 0 800 60" preserveAspectRatio="none">
                        <path d="M0,25 C100,5 200,45 300,25 C400,5 500,45 600,25 C700,5 800,45 900,25 L900,60 L0,60 Z" fill={isOvertime ? '#F59E0B' : '#34D399'} />
                      </svg>
                    </div>
                  )}

                  <div className={`w-full h-full relative ${
                    isOvertime 
                      ? 'bg-gradient-to-t from-emerald-900 via-amber-600/90 to-amber-400 shadow-[0_0_26px_rgba(245,158,11,0.5)]' 
                      : 'bg-gradient-to-t from-emerald-900 via-emerald-500/85 to-teal-400/90 shadow-[0_0_22px_rgba(16,185,129,0.4)]'
                  }`} />
                </div>

                {/* Center Percentage Display Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none px-2">
                  <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center">
                    <div className="flex items-baseline">
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                        {integerPart}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                        .{fractionPart}%
                      </span>
                    </div>
                    <span className="text-[8.5px] font-mono uppercase tracking-widest font-bold mt-0.5 text-slate-300">
                      {isOvertime ? 'Exceeded' : isComplete ? 'Target Met' : fillPercentage >= 50 ? 'Half+' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 text-[10.5px] font-mono text-slate-400">
                Beaker Vessel Mode
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* CIRCULAR / RADIAL PIE DONUT GAUGE                        */
            /* ======================================================== */
            <div className="relative flex flex-col items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="monthCircleGradD" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="monthOtGradD" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>

                  <circle cx="80" cy="80" r={radius} stroke="#162032" strokeWidth="13" fill="transparent" />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#monthCircleGradD)"
                    strokeWidth="13"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />

                  {isOvertime && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius - 12}
                      stroke="url(#monthOtGradD)"
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={otStrokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>

                {/* Central Stat Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-extrabold font-mono tracking-tight text-white">
                      {integerPart}
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-300">
                      .{fractionPart}%
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-widest font-bold mt-0.5 ${
                    isOvertime ? 'text-[#D4AF37]' : isComplete ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {isOvertime ? 'Exceeded' : isComplete ? 'Complete' : 'Pacing'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[10.5px] font-mono text-slate-400">
                Radial Gauge Mode
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metrics Breakdown Column (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Current vs Total Monthly Hours Highlight Box */}
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Active Monthly Progress:</span>
              <span className="font-mono font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm">{currentWorkedHours.toFixed(1)}h</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">{targetHours.toFixed(1)}h Required</span>
                <span className="text-emerald-300 font-mono text-xs">
                  ({fillPercentage.toFixed(2)}%)
                </span>
              </span>
            </div>

            {/* Live Accruing Duration Counter */}
            <div className="bg-[#121824] rounded-lg p-2.5 border border-[#1e293b] flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Exact Logged Work:</span>
              </div>
              <span className="font-bold text-emerald-300">
                {WorkSessionEngine.formatSecondsToHMS(currentWorkedSeconds)}
              </span>
            </div>

            {/* Target Breakdown Bar with Overtime Spillover */}
            <div className="w-full h-3.5 bg-[#121824] rounded-full border border-[#1e293b] overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, fillPercentage)}%` }}
              />
              {overtimeSeconds > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 animate-pulse"
                  style={{ width: `${Math.min(25, (overtimeSeconds / targetSeconds) * 100)}%` }}
                />
              )}
            </div>
          </div>

          {/* 3 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Normal Work Completed */}
            <div className="bg-[#0a0e17] border border-emerald-500/20 rounded-xl p-3 hover:border-emerald-500/40 transition-colors">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Normal Work</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
                {(normalSeconds / 3600).toFixed(1)}h
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {formatDurationHM(normalSeconds)}
              </div>
            </div>

            {/* 2. Remaining to Threshold */}
            <div className="bg-[#0a0e17] border border-[#1e293b] rounded-xl p-3 hover:border-slate-700 transition-colors">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-400" />
                <span>Remaining</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-200 mt-1">
                {remainingHours.toFixed(1)}h
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {isComplete ? 'Target Satisfied' : `${formatDurationHM(remainingSeconds)} needed`}
              </div>
            </div>

            {/* 3. Overtime Overflow */}
            <div className="bg-[#0a0e17] border border-amber-500/20 rounded-xl p-3 hover:border-amber-500/40 transition-colors">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Overtime Surplus</span>
              </div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                {overtimeHours > 0 ? `+${overtimeHours.toFixed(1)}h` : '0.0h'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {overtimeHours > 0 ? 'Surpassed 100%' : 'Threshold at 100%'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Guide Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-[11px] font-mono border-t border-[#1e293b]/70">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-slate-300">Required Target Hours ({targetHours.toFixed(0)}h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300">50% Mid-Point Target ({(targetHours * 0.5).toFixed(0)}h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          <span className="text-amber-300">Overtime Surpassed (&gt;{targetHours.toFixed(0)}h)</span>
        </div>
      </div>
    </div>
  );
};
