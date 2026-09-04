// ============================================================================
// SALARYPULSE — ANDROID HOME-SCREEN WIDGET (PWA / TWA COMPATIBLE)
// Compact financial & productivity widget with live pacing and quick actions
// Obsidian + Metallic Gold + Emerald Live Indicator (Strict HH:MM:SS timing)
// ============================================================================

import React, { useMemo } from 'react';
import { 
  Play, 
  Coffee, 
  PlayCircle, 
  Square, 
  Zap, 
  TrendingUp, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { formatCurrency } from '../../utils/formatters';

interface HomeScreenWidgetProps {
  compact?: boolean;
  onOpenFullApp?: () => void;
  className?: string;
  showCardHeader?: boolean;
}

export interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label: string;
  sublabel: string;
  icon?: React.ReactNode;
}

export const CircularProgressRing: React.FC<CircularProgressProps> = ({
  percentage,
  size = 64,
  strokeWidth = 5.5,
  color = '#D4AF37',
  bgColor = '#1F1F28',
  label,
  sublabel,
  icon
}) => {
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#111116]/90 border border-[#22222E]/80 shadow-sm relative group">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center percentage / icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold font-mono text-white tracking-tight leading-none">
            {Math.round(clampedPct)}%
          </span>
        </div>
      </div>

      <div className="mt-1.5 text-center leading-tight">
        <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#A0A0B0] font-semibold block">
          {label}
        </span>
        <span className="text-[8.5px] font-mono text-[#707080] block truncate max-w-[70px]">
          {sublabel}
        </span>
      </div>
    </div>
  );
};

export const HomeScreenWidget: React.FC<HomeScreenWidgetProps> = ({
  compact = false,
  onOpenFullApp,
  className = '',
  showCardHeader = true
}) => {
  const {
    salaryConfig,
    schedule,
    todayDate,
    todayAttendance,
    isCurrentlyWorking,
    isOnBreak,
    todayLiveActiveSeconds,
    todayLiveEarned,
    monthlyDaysDetails,
    monthlyRunningSummary,
    liveOtInfo,
    startWork,
    startBreak,
    resumeWork,
    endDay,
    setActiveTab
  } = useApp();

  // Daily Calculations (Target = 8h default)
  const requiredDailyHours = schedule.requiredActiveHoursPerDay || 8.0;
  const todayTargetSeconds = Math.round(requiredDailyHours * 3600);
  const todayWorkSeconds = todayLiveActiveSeconds || 0;
  const todayRemainingSeconds = Math.max(0, todayTargetSeconds - todayWorkSeconds);
  const todayProgressPct = todayTargetSeconds > 0 ? (todayWorkSeconds / todayTargetSeconds) * 100 : 0;

  // Weekly Calculations (Monday to Sunday)
  const weeklyStats = useMemo(() => {
    try {
      const todayObj = new Date(todayDate + 'T00:00:00');
      const dayOfWeek = todayObj.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mondayObj = new Date(todayObj);
      mondayObj.setDate(mondayObj.getDate() + diffToMonday);

      const sundayObj = new Date(mondayObj);
      sundayObj.setDate(sundayObj.getDate() + 6);

      const mondayStr = mondayObj.toISOString().split('T')[0];
      const sundayStr = sundayObj.toISOString().split('T')[0];

      const weekDays = (monthlyDaysDetails || []).filter(d => d.date >= mondayStr && d.date <= sundayStr);

      let weekWorked = 0;
      let weekTarget = 0;

      if (weekDays.length > 0) {
        weekDays.forEach(d => {
          if (d.date === todayDate) {
            weekWorked += todayLiveActiveSeconds;
          } else {
            weekWorked += d.actualActiveSeconds || 0;
          }
          weekTarget += (d.requiredNormalSeconds || (d.isWeeklyOff || d.isHoliday ? 0 : todayTargetSeconds));
        });
      } else {
        weekWorked = todayLiveActiveSeconds;
        weekTarget = (schedule.workingDays?.length || 6) * todayTargetSeconds;
      }

      if (weekTarget === 0) {
        weekTarget = (schedule.workingDays?.length || 6) * todayTargetSeconds;
      }

      const weekPct = weekTarget > 0 ? (weekWorked / weekTarget) * 100 : 0;

      return {
        weekWorkedSeconds: weekWorked,
        weekTargetSeconds: weekTarget,
        weekPct
      };
    } catch {
      return {
        weekWorkedSeconds: todayLiveActiveSeconds,
        weekTargetSeconds: 48 * 3600,
        weekPct: (todayLiveActiveSeconds / (48 * 3600)) * 100
      };
    }
  }, [todayDate, monthlyDaysDetails, todayLiveActiveSeconds, schedule, todayTargetSeconds]);

  // Monthly Calculations
  const monthlyStats = useMemo(() => {
    const monthWorked = (monthlyRunningSummary.actualWorkSeconds || 0) + (todayAttendance?.workSessions?.length && todayAttendance.date === todayDate ? Math.max(0, todayLiveActiveSeconds - (todayAttendance.totalActiveSeconds || 0)) : 0);
    const monthTarget = monthlyRunningSummary.requiredNormalSeconds || (26 * todayTargetSeconds);
    const monthPct = monthTarget > 0 ? (monthWorked / monthTarget) * 100 : 0;

    return {
      monthWorkedSeconds: monthWorked,
      monthTargetSeconds: monthTarget,
      monthPct
    };
  }, [monthlyRunningSummary, todayAttendance, todayDate, todayLiveActiveSeconds, todayTargetSeconds]);

  // Overtime (Daily / Live OT strictly in HH:MM:SS)
  const overtimeSeconds = liveOtInfo?.overtimeSecondsToday || 0;

  // Strict HH:MM:SS Formatted Strings
  const formattedWorkString = `${WorkSessionEngine.formatSecondsToHMS(todayWorkSeconds)} / ${WorkSessionEngine.formatSecondsToHMS(todayTargetSeconds)}`;
  const formattedRemainingString = WorkSessionEngine.formatSecondsToHMS(todayRemainingSeconds);
  const formattedWeekString = `${WorkSessionEngine.formatSecondsToHMS(weeklyStats.weekWorkedSeconds)} / ${WorkSessionEngine.formatSecondsToHMS(weeklyStats.weekTargetSeconds)}`;
  const formattedMonthString = `${WorkSessionEngine.formatSecondsToHMS(monthlyStats.monthWorkedSeconds)} / ${WorkSessionEngine.formatSecondsToHMS(monthlyStats.monthTargetSeconds)}`;
  const formattedOTString = WorkSessionEngine.formatSecondsToHMS(overtimeSeconds);
  const formattedEarnedString = `${formatCurrency(todayLiveEarned || 0, '₹')} earned`;

  // Action Button Handlers (Bound strictly to AppContext)
  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    startWork('Widget Quick Start');
  };

  const handleBreak = (e: React.MouseEvent) => {
    e.stopPropagation();
    startBreak('lunch', 'Widget Quick Break');
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    resumeWork('Widget Quick Resume');
  };

  const handleEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    endDay('Widget Quick Clock Out');
  };

  return (
    <div
      id="salarypulse-android-widget"
      className={`relative w-full max-w-[420px] bg-gradient-to-b from-[#131318] via-[#0E0E12] to-[#0A0A0D] border border-[#2B2B38] rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] select-none text-[#F5F5F7] font-sans overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#10B981]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header Bar */}
      {showCardHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-[#22222C] mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#D4AF37] to-[#997A1E] flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.3)]">
              <Zap className="w-3 h-3 text-[#0A0A0D] fill-current" />
            </div>
            <span className="text-xs font-extrabold tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-[#F5E5A4] via-[#D4AF37] to-[#B38F22] uppercase font-mono">
              SALARYPULSE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Emerald / Amber status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181822] border border-[#2A2A3A] text-[10px] font-mono shadow-inner">
              <span className="relative flex h-2 w-2">
                {isCurrentlyWorking && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isCurrentlyWorking ? 'bg-[#10B981]' : isOnBreak ? 'bg-amber-400' : 'bg-[#555566]'
                }`} />
              </span>
              <span className={`uppercase font-bold tracking-wider ${
                isCurrentlyWorking ? 'text-[#10B981]' : isOnBreak ? 'text-amber-400' : 'text-[#7E7E90]'
              }`}>
                {isCurrentlyWorking ? 'LIVE' : isOnBreak ? 'BREAK' : 'IDLE'}
              </span>
            </div>

            {onOpenFullApp && (
              <button
                onClick={onOpenFullApp}
                className="p-1 rounded-lg text-[#888898] hover:text-white hover:bg-[#20202C] transition cursor-pointer"
                title="Open Full Dashboard"
                aria-label="Open Full Dashboard"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TODAY EARNINGS HERO */}
      <div className="p-3 bg-gradient-to-r from-[#171720] to-[#121217] border border-[#2A2A38] rounded-2xl mb-3 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9E9EB0] font-semibold block">
            TODAY
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D0] via-[#D4AF37] to-[#F3E5AB]">
            {formattedEarnedString}
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-[9px] uppercase tracking-wider text-[#7A7A8C] block">
            OT TODAY
          </span>
          <span className={`text-xs font-bold ${overtimeSeconds > 0 ? 'text-[#10B981]' : 'text-[#8E8E9F]'}`}>
            {formattedOTString}
          </span>
        </div>
      </div>

      {/* PRIMARY METRICS GRID (Strict HH:MM:SS values) */}
      <div className="grid grid-cols-2 gap-2 mb-3.5 text-xs font-mono">
        {/* WORK */}
        <div className="p-2.5 bg-[#121218] border border-[#22222E] rounded-xl">
          <span className="text-[9.5px] uppercase tracking-wider text-[#8A8A9C] block font-semibold">
            WORK
          </span>
          <div className="text-xs sm:text-[13px] font-bold text-white tracking-tight mt-0.5 truncate">
            {formattedWorkString}
          </div>
        </div>

        {/* REMAINING */}
        <div className="p-2.5 bg-[#121218] border border-[#22222E] rounded-xl">
          <span className="text-[9.5px] uppercase tracking-wider text-[#8A8A9C] block font-semibold">
            REMAINING
          </span>
          <div className={`text-xs sm:text-[13px] font-bold tracking-tight mt-0.5 truncate ${
            todayRemainingSeconds === 0 ? 'text-[#10B981]' : 'text-[#D4AF37]'
          }`}>
            {formattedRemainingString}
          </div>
        </div>

        {/* WEEK */}
        <div className="p-2.5 bg-[#121218] border border-[#22222E] rounded-xl">
          <span className="text-[9.5px] uppercase tracking-wider text-[#8A8A9C] block font-semibold">
            WEEK
          </span>
          <div className="text-xs sm:text-[13px] font-bold text-[#E5E5EB] tracking-tight mt-0.5 truncate">
            {formattedWeekString}
          </div>
        </div>

        {/* MONTH */}
        <div className="p-2.5 bg-[#121218] border border-[#22222E] rounded-xl">
          <span className="text-[9.5px] uppercase tracking-wider text-[#8A8A9C] block font-semibold">
            MONTH
          </span>
          <div className="text-xs sm:text-[13px] font-bold text-[#E5E5EB] tracking-tight mt-0.5 truncate">
            {formattedMonthString}
          </div>
        </div>
      </div>

      {/* CIRCULAR / PIE PROGRESS VISUALIZATIONS */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E9F] uppercase tracking-wider mb-2 px-1">
          <span>PROGRESS PACING</span>
          <span className="text-[#D4AF37]">LIVE METERS</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Daily Completion */}
          <CircularProgressRing
            percentage={todayProgressPct}
            label="DAILY"
            sublabel={WorkSessionEngine.formatSecondsToHMS(todayWorkSeconds)}
            color="#10B981"
          />

          {/* Weekly Completion */}
          <CircularProgressRing
            percentage={weeklyStats.weekPct}
            label="WEEKLY"
            sublabel={WorkSessionEngine.formatSecondsToHMS(weeklyStats.weekWorkedSeconds)}
            color="#D4AF37"
          />

          {/* Monthly Completion */}
          <CircularProgressRing
            percentage={monthlyStats.monthPct}
            label="MONTHLY"
            sublabel={WorkSessionEngine.formatSecondsToHMS(monthlyStats.monthWorkedSeconds)}
            color="#38BDF8"
          />
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="pt-2 border-t border-[#20202B]">
        <div className="text-[9.5px] font-mono text-[#7A7A8C] uppercase tracking-widest text-center mb-2">
          QUICK ACTIONS
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 font-mono">
          {/* [ START ] */}
          <button
            id="widget-btn-start"
            onClick={handleStart}
            disabled={isCurrentlyWorking || isOnBreak}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm ${
              !isCurrentlyWorking && !isOnBreak
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29B27] text-[#0A0A0D] border border-[#F3E5AB]/40 shadow-[0_2px_12px_rgba(212,175,55,0.3)] hover:brightness-110'
                : 'bg-[#15151C] text-[#555566] border border-[#22222E] cursor-not-allowed opacity-50'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START</span>
          </button>

          {/* [ BREAK ] */}
          <button
            id="widget-btn-break"
            onClick={handleBreak}
            disabled={!isCurrentlyWorking || isOnBreak}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm ${
              isCurrentlyWorking && !isOnBreak
                ? 'bg-[#1C1814] text-amber-300 border border-amber-500/50 hover:bg-[#28201A] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-[#15151C] text-[#555566] border border-[#22222E] cursor-not-allowed opacity-50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>BREAK</span>
          </button>

          {/* [ RESUME ] */}
          <button
            id="widget-btn-resume"
            onClick={handleResume}
            disabled={!isOnBreak}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm ${
              isOnBreak
                ? 'bg-[#10241A] text-[#10B981] border border-[#10B981]/50 hover:bg-[#163324] shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-pulse'
                : 'bg-[#15151C] text-[#555566] border border-[#22222E] cursor-not-allowed opacity-50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </button>

          {/* [ END ] */}
          <button
            id="widget-btn-end"
            onClick={handleEnd}
            disabled={!isCurrentlyWorking && !isOnBreak}
            className={`py-2 sm:py-2.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm ${
              isCurrentlyWorking || isOnBreak
                ? 'bg-[#221014] text-rose-300 border border-rose-500/50 hover:bg-[#30141A] shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-[#15151C] text-[#555566] border border-[#22222E] cursor-not-allowed opacity-50'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>END</span>
          </button>
        </div>
      </div>
    </div>
  );
};
