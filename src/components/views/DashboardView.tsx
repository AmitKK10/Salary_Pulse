import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Coins, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Zap,
  Sparkles,
  Square
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { formatCurrency, formatSecondsToClock, formatSecondsToDetailed, formatTimeDisplay, formatDurationHM, formatSecondsToHHMMSS } from '../../utils/formatters';
import { DashboardChartsSection } from '../dashboard/DashboardChartsSection';
import { CurrentMonthSummaryWidget } from '../dashboard/CurrentMonthSummaryWidget';
import { WeeklySummaryWidget } from '../dashboard/WeeklySummaryWidget';
import { WorkProgressPieWidget } from '../dashboard/WorkProgressPieWidget';
import { LifetimeStatsSection } from '../dashboard/LifetimeStatsSection';

export const DashboardView: React.FC = () => {
  const { 
    salaryCalculation, 
    selectedMonthProjection, 
    salaryConfig, 
    updateSalaryConfig,
    schedule, 
    isWorking,
    isCurrentlyWorking, 
    isOnBreak, 
    currentLiveSeconds, 
    currentDayAttendance, 
    todayAttendance,
    attendanceDays,
    todayRemainingActiveSeconds,
    todayEstimatedCompletion,
    projectedFinishTime,
    currentWorkdayStatus,
    startWork,
    punchIn, 
    punchOut, 
    endWork,
    reopenDay,
    startBreak, 
    endBreak,
    setActiveTab,
    selectedMonth,
    todayDate,
    clockTick
  } = useApp();

  const activeWorking = isWorking ?? isCurrentlyWorking;
  const isShiftComplete = 
    currentWorkdayStatus === 'COMPLETED' || 
    todayAttendance?.workdayStatus === 'COMPLETED' || 
    currentDayAttendance?.workdayStatus === 'COMPLETED' ||
    !!(todayAttendance?.finishedAt || currentDayAttendance?.finishedAt) ||
    (!activeWorking && !isOnBreak && !!(todayAttendance?.lastPunchOut || currentDayAttendance?.lastPunchOut));
    
  const shiftFinishedTime = todayAttendance?.finishedAt || currentDayAttendance?.finishedAt || todayAttendance?.lastPunchOut || currentDayAttendance?.lastPunchOut;

  const todayIntervals = useMemo(() => {
    if (!currentDayAttendance) return [];
    const workItems = (currentDayAttendance.workSessions || []).map((ws, idx) => {
      const isRunning = !ws.endTime && isCurrentlyWorking;
      const duration = ws.endTime 
        ? (ws.durationSeconds || 0)
        : Math.max(0, currentLiveSeconds);
      return {
        id: ws.id,
        isBreak: false,
        title: ws.note || `Session ${idx + 1}`,
        startTime: ws.startTime,
        endTime: ws.endTime,
        duration,
        isOpen: isRunning,
        earnings: duration * salaryCalculation.perSecondRate,
      };
    });

    const breakItems = (currentDayAttendance.breakSessions || []).map((bs) => {
      const isRunning = !bs.endTime && isOnBreak;
      return {
        id: bs.id,
        isBreak: true,
        title: bs.note || `${bs.type.toUpperCase()} Break`,
        startTime: bs.startTime,
        endTime: bs.endTime,
        duration: bs.durationSeconds || 0,
        isOpen: isRunning,
        earnings: 0,
      };
    });

    return [...workItems, ...breakItems].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [currentDayAttendance, isCurrentlyWorking, isOnBreak, currentLiveSeconds, salaryCalculation.perSecondRate]);

  const hoursProgress = Math.min(100, (salaryCalculation.totalActiveHoursWorked / Math.max(1, salaryCalculation.totalRequiredHours)) * 100);
  const bonusProgress = Math.min(100, (salaryCalculation.actualPresentDays / (salaryConfig.attendanceBonusEligibleDays || 26)) * 100);
  const effectiveOt = salaryCalculation.overtimePay;

  // Dynamic weekly bars based on current week's real attendance
  const weeklyBars = useMemo(() => {
    const [y, m, d] = (todayDate || '2026-08-15').split('-').map(Number);
    const refDate = new Date(y, m - 1, d);
    const dayOfWeek = refDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(y, m - 1, d + diffToMonday);

    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const targetHours = schedule?.requiredActiveHoursPerDay || 8.0;

    return dayLabels.map((dayLabel, idx) => {
      const dayDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      const yStr = dayDate.getFullYear();
      const mStr = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(dayDate.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      const isSun = dayDate.getDay() === 0;
      const isTod = dateStr === todayDate;

      const rec = attendanceDays.find((att) => att.date === dateStr);
      let sec = 0;
      if (isTod) {
        sec = isCurrentlyWorking ? Math.max(rec?.totalActiveSeconds || 0, currentLiveSeconds) : (rec?.totalActiveSeconds || 0);
      } else if (rec) {
        sec = rec.totalActiveSeconds || 0;
      }

      const hrs = sec / 3600;
      if (isSun) {
        return { day: dayLabel, height: '0%', color: '', isOff: true, hours: 'OFF' };
      }

      const percent = Math.min(100, Math.round((hrs / targetHours) * 100));
      const isOt = hrs > targetHours;
      const color = isTod
        ? 'bg-[#10B981]'
        : isOt
        ? 'bg-[#10B981]'
        : hrs > 0
        ? 'bg-[#D4AF37]/80'
        : 'bg-[#262626]';

      return {
        day: dayLabel,
        height: `${Math.max(10, percent)}%`,
        color,
        isHighlight: isTod,
        hours: `${hrs.toFixed(1)}h`,
      };
    });
  }, [todayDate, attendanceDays, isCurrentlyWorking, currentLiveSeconds, schedule]);

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 animate-fadeIn">
      {/* 0. FORMULA SELECTION / RECONCILIATION QUICK BAR */}
      <div className="bg-[#141414] border border-[#222222] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A0A0A0] font-semibold">
            Calculation Engine:
          </span>
          <span className="text-[11px] text-[#D4AF37] font-medium">
            🏢 Authoritative Company / Boss Payroll Engine (Calendar Days, Daily Rate ÷ 8 Shortfall, ₹75/hr Overtime)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400">
            Base ₹15,000 · 8h/day · Sandwich Sunday Applied
          </span>
        </div>
      </div>

      {/* 1. SOPHISTICATED DARK FINANCIAL HERO */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 pb-2 border-b border-[#1A1A1A]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="text-[10.5px] sm:text-xs uppercase font-mono tracking-[0.2em] text-[#888892] font-bold">
              {salaryCalculation.isRunningMonth 
                ? `Earned to Date (${salaryCalculation.actualPresentDays} Days Worked) · ${selectedMonth}` 
                : `Estimated Monthly Earnings · ${selectedMonth}`}
            </p>
            {isCurrentlyWorking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                LIVE ACCRUING
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-4">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tighter text-[#D4AF37] font-serif-display leading-none">
              {formatCurrency(salaryCalculation.realtimeEarnedSoFar)}
            </span>
            <span className="text-base sm:text-xl text-[#10B981] font-medium tracking-tight font-mono">
              +{formatCurrency(effectiveOt)} OT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9A9AA6] mt-2 italic font-serif-display">
            {salaryCalculation.isRunningMonth ? (
              <span>
                Earned Base ({salaryCalculation.actualPresentDays} days): {formatCurrency(salaryCalculation.baseSalary)} | Overtime: +{formatCurrency(salaryCalculation.overtimePay)} | Projected Full Month: {formatCurrency(salaryCalculation.projectedMonthEndSalary || salaryConfig.monthlyBaseSalary)}
              </span>
            ) : (
              <span>
                Base Salary: {formatCurrency(salaryConfig.monthlyBaseSalary)} | Projected Bonus: {formatCurrency(salaryConfig.attendanceBonusAmount)} {salaryCalculation.attendanceBonusApproved ? 'approved' : 'pending'}
              </span>
            )}
          </p>
        </div>

        {/* Right Metric Pill Cards */}
        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl w-full sm:w-44 shadow-lg">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1 font-semibold">Overtime</p>
            <p className="text-xl sm:text-2xl font-semibold text-white font-mono">
              {formatSecondsToHHMMSS(salaryCalculation.overtimeSeconds)}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
              +{formatCurrency(salaryCalculation.overtimePay)} OT pay
            </p>
          </div>
          <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl w-full sm:w-44 shadow-lg">
            <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1 font-semibold">Attendance</p>
            <p className="text-2xl font-semibold text-white font-mono">
              {salaryCalculation.actualPresentDays} <span className="text-sm text-[#737373]">/ {salaryCalculation.workingDays || 25}</span>
            </p>
            <p className="text-[10px] text-sky-400 font-mono mt-0.5">
              Scheduled Days
            </p>
          </div>
        </div>
      </div>

      {/* 1.4 CURRENT MONTH SUMMARY WIDGET (WORKED, REQUIRED, REMAINING, EARNED, OT, ATTENDANCE) */}
      <CurrentMonthSummaryWidget />

      {/* 1.5 WEEKLY SUMMARY WIDGET (HIGH-LEVEL BREAKDOWN: HOURS WORKED & ESTIMATED EARNINGS) */}
      <WeeklySummaryWidget />

      {/* 1.6 WORK COMPLETED VS REMAINING PIE / DONUT DASHBOARDS (DAILY, WEEKLY, MONTHLY) */}
      <WorkProgressPieWidget />

      {/* 1.7 LIFETIME STATS SECTION (CUMULATIVE INCOME, MONTHS WORKED, HOURS LOGGED, AVG MONTHLY EARNINGS) */}
      <LifetimeStatsSection />

      {/* 2. WEEKLY EFFICIENCY & LIVE PULSE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Efficiency Card (Col-span-2) */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#1A1A1A] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase italic font-serif-display">
              Weekly Efficiency
            </h3>
            <span className="text-xs uppercase tracking-wider text-[#737373] font-mono">
              DAILY TARGET: {schedule.requiredActiveHoursPerDay || 8}h 00m
            </span>
          </div>

          {/* Bar columns */}
          <div className="h-44 flex items-end justify-between gap-3 md:gap-4 px-2 pb-2">
            {weeklyBars.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                {bar.isOff ? (
                  <div className="w-full bg-[#1A1A1A] rounded-t-sm h-[80%] border border-dashed border-[#333333] flex items-center justify-center">
                    <span className="text-[9px] text-[#555] font-mono">OFF</span>
                  </div>
                ) : (
                  <div className="w-full bg-[#1A1A1A] rounded-t-sm relative flex flex-col justify-end overflow-hidden h-[80%]">
                    <div 
                      className={`w-full ${bar.color} transition-all duration-500`} 
                      style={{ height: bar.height }}
                      title={`${bar.day}: ${bar.hours}`}
                    />
                  </div>
                )}
                <span className={`text-[10px] uppercase font-mono ${bar.isHighlight ? 'text-[#10B981] font-bold' : 'text-[#737373]'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Pulse Command Card (Col-span-1) */}
        <div className={`bg-[#0F0F0F] border rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl transition-all duration-300 ${
          isShiftComplete ? 'border-[#10B981]/30' : 'border-[#1A1A1A]'
        }`}>
          {/* Ambient glow: emerald when shift complete, gold during live shift */}
          <div className={`absolute top-0 right-0 w-44 h-44 blur-[60px] rounded-full translate-x-10 -translate-y-10 pointer-events-none transition-colors duration-300 ${
            isShiftComplete ? 'bg-[#10B981]/10' : 'bg-[#D4AF37]/5'
          }`} />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase italic font-serif-display">
              Live Pulse
            </h3>
            {isShiftComplete ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                SHIFT COMPLETE
              </span>
            ) : (
              <span className={`w-2 h-2 rounded-full ${activeWorking ? 'bg-[#10B981] animate-pulse' : 'bg-[#555555]'}`} />
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {isShiftComplete ? (
              /* Shift Complete State: replaces 'Remaining' and 'Projected Finish' labels with clean status indicator */
              <div className="w-full space-y-4 py-1">
                <div className="w-full p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex flex-col items-center justify-center space-y-2 text-center transition-all">
                  <div className="w-11 h-11 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Shift Complete
                    </h4>
                    <p className="text-xs font-mono text-[#10B981] font-semibold mt-0.5">
                      {shiftFinishedTime ? `Finished at ${formatTimeDisplay(shiftFinishedTime)}` : 'Workday Concluded'}
                    </p>
                  </div>
                  <p className="text-[11px] font-mono text-[#A3A3A3] pt-0.5">
                    Projections finalized · Worked {formatDurationHM(currentDayAttendance?.totalActiveSeconds || currentLiveSeconds)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Shift Entry</p>
                    <p className="text-xs font-mono font-medium text-white mt-0.5">
                      {formatTimeDisplay(currentDayAttendance?.firstPunchIn || '--:--')}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Actual Completion</p>
                    <p className="text-xs font-mono font-bold text-[#10B981] mt-0.5">
                      {formatTimeDisplay(shiftFinishedTime || '--:--')}
                    </p>
                  </div>
                </div>

                <button
                  id="dash-reopen-shift-btn"
                  onClick={() => reopenDay(todayDate, 'Reopened shift from Dashboard')}
                  className="w-full py-2.5 text-xs font-mono text-[#A3A3A3] hover:text-white bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Reopen Shift</span>
                </button>
              </div>
            ) : (
              /* Active / In-Progress State with Remaining time and Projected Finish */
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-1 font-semibold">
                  Current Session
                </p>
                <p className="text-4xl sm:text-5xl font-light tracking-tight text-white font-serif-display">
                  {formatSecondsToClock(currentLiveSeconds)}
                </p>

                <div className="mt-4 w-full h-[1px] bg-[#1A1A1A] mb-4" />

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Entry</p>
                    <p className="text-xs font-mono font-medium text-white mt-0.5">
                      {formatTimeDisplay(currentDayAttendance?.firstPunchIn || '09:00 AM')}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Break</p>
                    <p className="text-xs font-mono font-medium text-white mt-0.5">
                      {formatSecondsToDetailed(currentDayAttendance?.totalBreakSeconds || 0)}
                    </p>
                  </div>
                </div>

                {/* Remaining Time and Projected Finish labels */}
                <div className="grid grid-cols-2 gap-3 w-full mt-3">
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Remaining</p>
                    <p className="text-xs font-mono font-bold text-[#3B82F6] mt-0.5 tabular-nums">
                      {formatSecondsToDetailed(todayRemainingActiveSeconds)}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded bg-[#141414] border border-[#1F1F1F]">
                    <p className="text-[9px] text-[#737373] uppercase tracking-wider font-semibold">Projected Finish</p>
                    <p className="text-xs font-mono font-bold text-[#D4AF37] mt-0.5">
                      {projectedFinishTime || (activeWorking ? 'Estimating...' : '--:--')}
                    </p>
                  </div>
                </div>

                {activeWorking ? (
                  <div className="grid grid-cols-2 gap-2 w-full mt-5">
                    <button
                      id="dash-break-btn"
                      onClick={() => (isOnBreak ? endBreak() : startBreak('lunch'))}
                      className="py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>{isOnBreak ? 'Resume' : 'Break'}</span>
                    </button>
                    <button
                      id="dash-end-work-btn"
                      onClick={() => endWork('Shift ended from Dashboard')}
                      className="py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5 text-rose-400" />
                      <span>End Work</span>
                    </button>
                  </div>
                ) : (
                  <button
                    id="dash-clock-btn"
                    onClick={() => (startWork ? startWork('Started work from Dashboard') : punchIn())}
                    className="mt-5 w-full py-3 text-xs font-bold uppercase tracking-widest rounded-lg bg-[#10B981] text-black hover:bg-[#0ea571] transition shadow-md cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Start Work</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2.5 RECHARTS ANALYTICS: MONTHLY INCOME TRENDS & HOUR DISTRIBUTION */}
      <DashboardChartsSection />

      {/* 3. MULTI-SESSION TIMELINE & MONTH-END FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Multi-Sessions */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#1A1A1A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase italic font-serif-display">
                Today's Intervals
              </h3>
              <p className="text-xs text-[#737373]">{currentDayAttendance?.date || todayDate} · Multi-Session Engine</p>
            </div>
            <div className="flex items-center gap-2">
              {isCurrentlyWorking && (
                <button
                  onClick={() => (isOnBreak ? endBreak() : startBreak('lunch'))}
                  className="px-3 py-1 bg-[#1A1A1A] border border-[#333333] hover:border-[#555555] text-[11px] text-[#D4AF37] font-semibold rounded uppercase tracking-wider transition flex items-center gap-1.5"
                >
                  <Coffee className="w-3 h-3" />
                  <span>{isOnBreak ? 'Resume' : 'Lunch Break'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {todayIntervals.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#161616] border border-[#222222] text-center text-xs text-[#737373] font-mono">
                No punch intervals recorded yet today. Clock in to begin your shift.
              </div>
            ) : (
              todayIntervals.map((interval) => {
                if (interval.isBreak) {
                  return (
                    <div
                      key={interval.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#0E0E0E] border border-dashed border-[#262626] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-[#D4AF37] ${interval.isOpen ? 'animate-pulse' : ''}`} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#A3A3A3]">{interval.title}</span>
                            {interval.isOpen && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                ON BREAK
                              </span>
                            )}
                          </div>
                          <div className="text-[#555555] text-[11px]">
                            {formatTimeDisplay(interval.startTime)} → {interval.endTime ? formatTimeDisplay(interval.endTime) : 'Now'}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-[#737373] text-xs">
                        {formatDurationHM(interval.duration)}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={interval.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#161616] border border-[#262626] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-[#10B981] ${interval.isOpen ? 'animate-pulse' : ''}`} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{interval.title}</span>
                          {interval.isOpen && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981]">
                              RUNNING
                            </span>
                          )}
                        </div>
                        <div className="text-[#737373] text-[11px]">
                          {formatTimeDisplay(interval.startTime)} → {interval.endTime ? formatTimeDisplay(interval.endTime) : 'Now'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className={`font-bold ${interval.isOpen ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {formatDurationHM(interval.duration)}
                      </div>
                      <div className="text-[10px] text-[#10B981] font-semibold">
                        +{formatCurrency(interval.earnings)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Month-End Forecast Card */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#1A1A1A] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase italic font-serif-display">
              Month-End Projection
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
              {selectedMonthProjection.confidenceLabel}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#262626]">
              <span className="text-xs uppercase tracking-wider text-[#737373] font-semibold">Projected Net Payout</span>
              <span className="text-2xl font-light font-serif-display text-[#D4AF37]">
                {formatCurrency(selectedMonthProjection.projectedMonthEndTotal)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Base Wage ({selectedMonthProjection.actualWorkingDays + selectedMonthProjection.futureWorkingDays} days)</span>
                <span className="font-mono text-white">
                  {formatCurrency(selectedMonthProjection.actualEarnings + selectedMonthProjection.projectedFutureNormalEarnings)}
                </span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Projected Overtime</span>
                <span className="font-mono text-[#10B981]">
                  +{formatCurrency(selectedMonthProjection.actualOTEarnings + selectedMonthProjection.projectedFutureOTEarnings)}
                </span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Attendance Bonus</span>
                <span className="font-mono text-[#D4AF37]">
                  {selectedMonthProjection.projectedBonus > 0 ? `+${formatCurrency(selectedMonthProjection.projectedBonus)}` : '₹0'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full mt-2 py-2.5 px-3 rounded bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              <span>Explore Running-Month Prediction Suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
