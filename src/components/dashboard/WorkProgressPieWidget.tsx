import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  Droplet, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkSessionEngine } from '../../engine/workSessionEngine';

interface GlassVesselProps {
  fillPercent: number; // e.g. 50, 108, 20
  workedSeconds: number;
  targetSeconds: number;
  overtimeSeconds: number;
  remainingSeconds: number;
  isLive: boolean;
  unitLabel: string;
}

const GlassVessel: React.FC<GlassVesselProps> = ({
  fillPercent,
  workedSeconds,
  targetSeconds,
  overtimeSeconds,
  remainingSeconds,
  isLive,
}) => {
  // Clamped visual liquid level between 0% and 100%
  const liquidLevel = Math.min(100, Math.max(workedSeconds > 0 ? 4 : 0, fillPercent));
  const isOvertime = overtimeSeconds > 0;
  const isHalfFilled = Math.abs(fillPercent - 50) <= 5;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      {/* Glass Vessel Beaker Container */}
      <div 
        className="relative w-32 h-44 rounded-b-[28px] rounded-t-xl border-2 border-white/20 bg-slate-950/60 backdrop-blur-md overflow-hidden shadow-[inset_0_4px_16px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.7)] group transition-all duration-300 hover:border-white/35"
        title={`${fillPercent.toFixed(1)}% completed (${(workedSeconds / 3600).toFixed(1)}h / ${(targetSeconds / 3600).toFixed(1)}h)`}
      >
        {/* Glass Rim Top Lip */}
        <div className="absolute top-1 inset-x-2 h-2 rounded-full border border-white/25 bg-white/10 z-30 pointer-events-none" />

        {/* Volume Calibration Ticks (Right Side) */}
        <div className="absolute right-1 inset-y-2 flex flex-col justify-between items-end z-20 pointer-events-none py-2 text-[8px] font-mono text-white/40">
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] text-emerald-300/70">100%</span>
            <div className="w-2.5 h-[1.5px] bg-emerald-400/60" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-[1px] bg-white/30" />
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[7.5px] font-bold ${isHalfFilled ? 'text-cyan-300' : 'text-white/60'}`}>50%</span>
            <div className="w-3 h-[1.5px] bg-cyan-400/80" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-[1px] bg-white/30" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] text-white/30">0%</span>
            <div className="w-2 h-[1px] bg-white/30" />
          </div>
        </div>

        {/* 50% Mid-Level Reference Horizon (Subtle Dashed Guide) */}
        <div className="absolute top-1/2 inset-x-2 border-b border-dashed border-cyan-400/20 z-10 pointer-events-none" />

        {/* Left Specular Glass Reflection Streak */}
        <div className="absolute top-2 left-2 bottom-3 w-1 rounded-full bg-gradient-to-b from-white/40 via-white/15 to-transparent z-25 pointer-events-none" />

        {/* Right Corner Subtle Glare */}
        <div className="absolute top-3 right-2 bottom-6 w-0.5 rounded-full bg-gradient-to-b from-white/20 to-transparent z-25 pointer-events-none" />

        {/* Liquid Column with Smooth Real-time Transition */}
        <div 
          className="absolute bottom-0 inset-x-0 transition-all duration-1000 ease-out z-10"
          style={{ height: `${liquidLevel}%` }}
        >
          {/* Animated Liquid Wave Meniscus */}
          {liquidLevel > 0 && (
            <div className="absolute -top-3 inset-x-0 h-4 overflow-hidden pointer-events-none">
              <svg 
                className="w-[200%] h-full animate-liquid-wave opacity-80" 
                viewBox="0 0 800 60" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M0,25 C100,5 200,45 300,25 C400,5 500,45 600,25 C700,5 800,45 900,25 L900,60 L0,60 Z" 
                  fill={isOvertime ? '#F59E0B' : '#34D399'} 
                />
              </svg>
              <svg 
                className="w-[200%] h-full absolute top-0 left-0 animate-liquid-wave-rev opacity-50" 
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
                ? 'bg-gradient-to-t from-emerald-800 via-amber-600/90 to-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.5)]' 
                : 'bg-gradient-to-t from-emerald-800 via-emerald-500/85 to-teal-400/90 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          >
            {/* Specular fluid vertical shine */}
            <div className="absolute inset-y-0 left-3 w-1 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

            {/* Micro Rising Fluid Bubbles */}
            {liquidLevel > 15 && (
              <>
                <div className="absolute bottom-2 left-6 w-1.5 h-1.5 rounded-full bg-white/60 animate-bubble-1 pointer-events-none" />
                <div className="absolute bottom-1 left-12 w-1 h-1 rounded-full bg-white/70 animate-bubble-2 pointer-events-none" />
                <div className="absolute bottom-4 left-18 w-2 h-2 rounded-full bg-white/50 animate-bubble-3 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        {/* Center Percentage Display Overlay (Guaranteed High Contrast Floating Pill) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none px-2">
          <div className="bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {Math.floor(fillPercent)}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300">
                .{(fillPercent % 1).toFixed(3).substring(2)}%
              </span>
            </div>
            <span className={`text-[8.5px] font-mono uppercase tracking-widest font-bold mt-0.5 ${
              isOvertime 
                ? 'text-[#F59E0B]' 
                : fillPercent >= 100 
                  ? 'text-emerald-400' 
                  : fillPercent >= 50 
                    ? 'text-cyan-300' 
                    : 'text-slate-300'
            }`}>
              {isOvertime ? 'Exceeded' : fillPercent >= 100 ? 'Target Met' : fillPercent >= 50 ? 'Half+' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Pill Label beneath the Glass */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {isOvertime ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            +{(overtimeSeconds / 3600).toFixed(1)}h Overtime
          </span>
        ) : fillPercent >= 100 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5" />
            100% Full
          </span>
        ) : isHalfFilled ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 animate-pulse">
            <Droplet className="w-2.5 h-2.5 text-cyan-400" />
            Half Filled (50%)
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-400">
            {liquidLevel.toFixed(0)}% of glass
          </span>
        )}
      </div>
    </div>
  );
};

interface RadialPieChartProps {
  fillPercent: number;
  workedSeconds: number;
  targetSeconds: number;
  overtimeSeconds: number;
  remainingSeconds: number;
}

const RadialPieChart: React.FC<RadialPieChartProps> = ({
  fillPercent,
  workedSeconds,
  targetSeconds,
  overtimeSeconds,
  remainingSeconds,
}) => {
  const isOvertime = overtimeSeconds > 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const normalClampedPct = Math.min(100, fillPercent);
  const strokeDashoffset = circumference - (circumference * normalClampedPct) / 100;

  // Overtime extra progress arc (up to another full circle)
  const otPct = Math.min(100, Math.max(0, fillPercent - 100));
  const otStrokeDashoffset = circumference - (circumference * otPct) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <defs>
            {/* Emerald Gradient for Normal Progress */}
            <linearGradient id="normalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            {/* Gold Gradient for Overtime */}
            <linearGradient id="otGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1C1C1C"
            strokeWidth="13"
            fill="transparent"
          />

          {/* Normal Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#normalGrad)"
            strokeWidth="13"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />

          {/* Overtime Ring (if exceeded 100%) */}
          {isOvertime && (
            <circle
              cx="80"
              cy="80"
              r={radius - 12}
              stroke="url(#otGrad)"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={otStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center Percentage Display Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex items-baseline justify-center">
            <span className="text-2xl font-extrabold font-mono tracking-tight text-white">
              {Math.floor(fillPercent)}
            </span>
            <span className="text-sm font-mono font-bold text-emerald-300">
              .{(fillPercent % 1).toFixed(3).substring(2)}%
            </span>
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${
            isOvertime ? 'text-[#D4AF37]' : fillPercent >= 100 ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {isOvertime ? 'Exceeded' : fillPercent >= 100 ? 'Complete' : 'Pacing'}
          </span>
          {isOvertime && (
            <span className="text-[9px] font-mono text-[#F59E0B] mt-0.5">
              +{(overtimeSeconds / 3600).toFixed(1)}h OT
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const WorkProgressPieWidget: React.FC = () => {
  const {
    selectedMonth,
    schedule,
    salaryCalculation,
    todayAttendance,
    todayLiveActiveSeconds,
    todayDate,
    isCurrentlyWorking,
    monthlyDaysDetails,
    monthlyRunningSummary,
  } = useApp();

  // Mode switcher: 'glass' (Liquid Filling Beaker) vs 'pie' (Radial Donut Gauge)
  const [visualMode, setVisualMode] = useState<'glass' | 'pie'>('glass');

  const requiredDailySeconds = (schedule.requiredActiveHoursPerDay || 8) * 3600;

  // 1. DAILY STATS
  const isShiftComplete = todayAttendance?.workdayStatus === 'COMPLETED' || !!todayAttendance?.finishedAt;
  const rawDailyWorked = todayAttendance?.date === todayDate
    ? (isCurrentlyWorking ? todayLiveActiveSeconds : Math.max(todayLiveActiveSeconds, todayAttendance?.totalActiveSeconds || 0))
    : 0;
  const dailyWorkedSeconds = rawDailyWorked;
  const dailyRemainingSeconds = Math.max(0, requiredDailySeconds - dailyWorkedSeconds);
  const dailyOvertimeSeconds = Math.max(0, dailyWorkedSeconds - requiredDailySeconds);
  const dailyPct = requiredDailySeconds > 0 ? (dailyWorkedSeconds / requiredDailySeconds) * 100 : 0;

  // 2. WEEKLY STATS
  const targetDateObj = new Date(`${todayDate}T12:00:00`);
  const dayOfWeek = targetDateObj.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayObj = new Date(targetDateObj);
  mondayObj.setDate(mondayObj.getDate() + distanceToMonday);

  const sundayObj = new Date(mondayObj);
  sundayObj.setDate(sundayObj.getDate() + 6);

  const mondayStr = mondayObj.toISOString().split('T')[0];
  const sundayStr = sundayObj.toISOString().split('T')[0];

  const weekDays = (monthlyDaysDetails || []).filter((d) => d.date >= mondayStr && d.date <= sundayStr);

  let weekWorked = 0;
  let weekTarget = 0;

  if (weekDays.length > 0) {
    weekDays.forEach((d) => {
      if (d.date === todayDate) {
        weekWorked += dailyWorkedSeconds;
      } else {
        weekWorked += d.actualActiveSeconds || 0;
      }
      weekTarget += d.requiredNormalSeconds || (d.isWeeklyOff || d.isHoliday ? 0 : requiredDailySeconds);
    });
  } else {
    weekWorked = dailyWorkedSeconds;
    weekTarget = (schedule.workingDays?.length || 6) * requiredDailySeconds;
  }

  if (weekTarget === 0) {
    weekTarget = (schedule.workingDays?.length || 6) * requiredDailySeconds;
  }

  const weeklyRemainingSeconds = Math.max(0, weekTarget - weekWorked);
  const weeklyOvertimeSeconds = Math.max(0, weekWorked - weekTarget);
  const weeklyPct = weekTarget > 0 ? (weekWorked / weekTarget) * 100 : 0;

  // 3. MONTHLY STATS
  const isSelectedMonthCurrent = selectedMonth === todayDate.slice(0, 7);
  const baseMonthWorked = monthlyRunningSummary?.actualWorkSeconds || (salaryCalculation?.totalActiveSecondsWorked || 0);
  const liveMonthDelta = isSelectedMonthCurrent && todayAttendance?.date === todayDate
    ? Math.max(0, dailyWorkedSeconds - (todayAttendance?.totalActiveSeconds || 0))
    : 0;
  const monthWorkedSeconds = baseMonthWorked + liveMonthDelta;

  const monthTargetSeconds =
    monthlyRunningSummary?.requiredNormalSeconds ||
    (salaryCalculation?.workingDays || 25) * requiredDailySeconds;

  const monthRemainingSeconds = Math.max(0, monthTargetSeconds - monthWorkedSeconds);
  const monthOvertimeSeconds = Math.max(0, monthWorkedSeconds - monthTargetSeconds);
  const monthlyPct = monthTargetSeconds > 0 ? (monthWorkedSeconds / monthTargetSeconds) * 100 : 0;

  const formatHoursShort = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div
      id="work-progress-visual-widget"
      className="bg-[#121212] border border-[#1A1A1A] rounded-2xl p-5 md:p-6 shadow-xl space-y-5"
    >
      {/* Header with Title, Mode Switcher & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E1E] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {visualMode === 'glass' ? <Droplet className="w-4 h-4" /> : <PieChartIcon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase italic font-serif-display">
              Work Completed vs. Remaining
            </h3>
            <p className="text-xs text-[#888892] font-mono">
              Visual pacing progress: 50% work fills half the glass, gradually filling up with real-time work
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Visual Style Toggle: Glass Fill vs Radial Pie */}
          <div className="inline-flex rounded-lg bg-[#181818] border border-[#282828] p-0.5">
            <button
              type="button"
              onClick={() => setVisualMode('glass')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                visualMode === 'glass'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-[#888892] hover:text-white'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Glass Fill</span>
            </button>
            <button
              type="button"
              onClick={() => setVisualMode('pie')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                visualMode === 'pie'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-[#888892] hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Radial Pie</span>
            </button>
          </div>

          {/* Live Work Status Pill */}
          {isCurrentlyWorking ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              LIVE GRADUALLY FILLING
            </span>
          ) : isShiftComplete ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              SHIFT COMPLETED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#1A1A1A] text-[#888892] border border-[#262626]">
              <Activity className="w-3 h-3" />
              SCHEDULED METRICS
            </span>
          )}
        </div>
      </div>

      {/* 3 Progress Columns: Daily, Weekly, Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. DAILY WORK */}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between hover:border-[#333333] transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Daily Work</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              8H TARGET
            </span>
          </div>

          {/* Visual Display (Glass Filling Vessel OR Radial Pie) */}
          <div className="my-1">
            {visualMode === 'glass' ? (
              <GlassVessel
                fillPercent={dailyPct}
                workedSeconds={dailyWorkedSeconds}
                targetSeconds={requiredDailySeconds}
                overtimeSeconds={dailyOvertimeSeconds}
                remainingSeconds={dailyRemainingSeconds}
                isLive={isCurrentlyWorking}
                unitLabel="8h Target"
              />
            ) : (
              <RadialPieChart
                fillPercent={dailyPct}
                workedSeconds={dailyWorkedSeconds}
                targetSeconds={requiredDailySeconds}
                overtimeSeconds={dailyOvertimeSeconds}
                remainingSeconds={dailyRemainingSeconds}
              />
            )}
          </div>

          {/* Card Footer Breakdown */}
          <div className="pt-3 border-t border-[#222222] grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-[#737373] block text-[10px]">Completed:</span>
              <span className="text-emerald-400 font-bold">{formatHoursShort(dailyWorkedSeconds)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#737373] block text-[10px]">
                {dailyRemainingSeconds > 0 ? 'Remaining:' : 'Overtime:'}
              </span>
              <span className={dailyRemainingSeconds > 0 ? 'text-slate-300 font-semibold' : 'text-[#D4AF37] font-bold'}>
                {dailyRemainingSeconds > 0
                  ? formatHoursShort(dailyRemainingSeconds)
                  : `+${formatHoursShort(dailyOvertimeSeconds)}`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. WEEKLY WORK */}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between hover:border-[#333333] transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">Weekly Work</span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/20">
              {(weekTarget / 3600).toFixed(0)}H TARGET
            </span>
          </div>

          {/* Visual Display */}
          <div className="my-1">
            {visualMode === 'glass' ? (
              <GlassVessel
                fillPercent={weeklyPct}
                workedSeconds={weekWorked}
                targetSeconds={weekTarget}
                overtimeSeconds={weeklyOvertimeSeconds}
                remainingSeconds={weeklyRemainingSeconds}
                isLive={isCurrentlyWorking}
                unitLabel={`${(weekTarget / 3600).toFixed(0)}h Target`}
              />
            ) : (
              <RadialPieChart
                fillPercent={weeklyPct}
                workedSeconds={weekWorked}
                targetSeconds={weekTarget}
                overtimeSeconds={weeklyOvertimeSeconds}
                remainingSeconds={weeklyRemainingSeconds}
              />
            )}
          </div>

          {/* Card Footer Breakdown */}
          <div className="pt-3 border-t border-[#222222] grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-[#737373] block text-[10px]">Completed:</span>
              <span className="text-emerald-400 font-bold">{formatHoursShort(weekWorked)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#737373] block text-[10px]">
                {weeklyRemainingSeconds > 0 ? 'Remaining:' : 'Overtime:'}
              </span>
              <span className={weeklyRemainingSeconds > 0 ? 'text-slate-300 font-semibold' : 'text-[#D4AF37] font-bold'}>
                {weeklyRemainingSeconds > 0
                  ? formatHoursShort(weeklyRemainingSeconds)
                  : `+${formatHoursShort(weeklyOvertimeSeconds)}`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. MONTHLY WORK */}
        <div className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between hover:border-[#333333] transition-colors shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Monthly ({selectedMonth})
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
              {(monthTargetSeconds / 3600).toFixed(0)}H TARGET
            </span>
          </div>

          {/* Visual Display */}
          <div className="my-1">
            {visualMode === 'glass' ? (
              <GlassVessel
                fillPercent={monthlyPct}
                workedSeconds={monthWorkedSeconds}
                targetSeconds={monthTargetSeconds}
                overtimeSeconds={monthOvertimeSeconds}
                remainingSeconds={monthRemainingSeconds}
                isLive={isCurrentlyWorking}
                unitLabel={`${(monthTargetSeconds / 3600).toFixed(0)}h Target`}
              />
            ) : (
              <RadialPieChart
                fillPercent={monthlyPct}
                workedSeconds={monthWorkedSeconds}
                targetSeconds={monthTargetSeconds}
                overtimeSeconds={monthOvertimeSeconds}
                remainingSeconds={monthRemainingSeconds}
              />
            )}
          </div>

          {/* Card Footer Breakdown */}
          <div className="pt-3 border-t border-[#222222] grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-[#737373] block text-[10px]">Completed:</span>
              <span className="text-emerald-400 font-bold">{formatHoursShort(monthWorkedSeconds)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#737373] block text-[10px]">
                {monthRemainingSeconds > 0 ? 'Remaining:' : 'Overtime:'}
              </span>
              <span className={monthRemainingSeconds > 0 ? 'text-slate-300 font-semibold' : 'text-[#D4AF37] font-bold'}>
                {monthRemainingSeconds > 0
                  ? formatHoursShort(monthRemainingSeconds)
                  : `+${formatHoursShort(monthOvertimeSeconds)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Visual Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-[11px] font-mono border-t border-[#1E1E1E]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-slate-300">Target Work (Rising Liquid / Arc)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300">50% Mid-Level Reference</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          <span className="text-amber-300">Overtime Crest Surpassed (&gt;100%)</span>
        </div>
      </div>
    </div>
  );
};
