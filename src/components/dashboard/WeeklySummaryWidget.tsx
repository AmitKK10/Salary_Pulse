// ============================================================================
// SALARYPULSE — WEEKLY SUMMARY WIDGET
// High-level breakdown of hours worked and estimated earnings for current week
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Coins, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Coffee,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SalaryEngine } from '../../engine/salaryEngine';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { 
  formatCurrency, 
  formatDurationHM, 
  formatSecondsToDetailed,
  formatSecondsToHHMMSS,
} from '../../utils/formatters';
import { AttendanceDay } from '../../types';

interface DaySummary {
  dateStr: string;
  dayName: string;
  shortDate: string;
  dayNum: number;
  isToday: boolean;
  isSunday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  activeSeconds: number;
  normalSeconds: number;
  otSeconds: number;
  estimatedEarnings: number;
  status: 'worked' | 'in_progress' | 'holiday' | 'off' | 'absent';
  attendanceRecord?: AttendanceDay;
}

export const WeeklySummaryWidget: React.FC = () => {
  const {
    attendanceDays,
    salaryConfig,
    schedule,
    holidays,
    todayDate,
    selectedMonth,
    todayLiveActiveSeconds,
    todayLiveEarned,
    isCurrentlyWorking,
    rateDerivation,
  } = useApp();

  // weekOffset: 0 = current week, -1 = previous week, +1 = next week
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Compute Monday of the selected week based on todayDate and weekOffset
  const { mondayDate, weekDays, weekRangeLabel, isCurrentWeek } = useMemo(() => {
    const [y, m, d] = (todayDate || '2026-08-15').split('-').map(Number);
    const refDate = new Date(y, m - 1, d);

    // Standard business week: Monday = 1, Sunday = 0
    const dayOfWeek = refDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const baseMonday = new Date(y, m - 1, d + diffToMonday);

    // Apply week offset
    const targetMonday = new Date(
      baseMonday.getFullYear(),
      baseMonday.getMonth(),
      baseMonday.getDate() + weekOffset * 7
    );

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        new Date(
          targetMonday.getFullYear(),
          targetMonday.getMonth(),
          targetMonday.getDate() + i
        )
      );
    }

    const sundayDate = days[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startMonth = monthNames[targetMonday.getMonth()];
    const endMonth = monthNames[sundayDate.getMonth()];
    const startDay = targetMonday.getDate();
    const endDay = sundayDate.getDate();
    const year = targetMonday.getFullYear();

    const rangeLabel = startMonth === endMonth
      ? `${startMonth} ${startDay} – ${endDay}, ${year}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;

    return {
      mondayDate: targetMonday,
      weekDays: days,
      weekRangeLabel: rangeLabel,
      isCurrentWeek: weekOffset === 0,
    };
  }, [todayDate, weekOffset]);

  // Derive daily breakdown and weekly aggregations
  const {
    dailySummaries,
    totalWeeklyActiveSeconds,
    totalWeeklyHours,
    totalWeeklyNormalSeconds,
    totalWeeklyOtSeconds,
    totalWeeklyEarnings,
    totalWeeklyRegularPay,
    totalWeeklyOtPay,
    totalWeeklyTargetSeconds,
    totalWeeklyRemainingSeconds,
    daysWorkedCount,
    scheduledDaysCount,
    weeklyTargetHours,
    weeklyProgressPercent,
  } = useMemo(() => {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const requiredDailyHours = schedule?.requiredActiveHoursPerDay || 8.0;
    const standardDailyTargetSec = Math.round(requiredDailyHours * 3600);

    let totalActiveSec = 0;
    let totalNormalSec = 0;
    let totalOtSec = 0;
    let totalEarnings = 0;
    let daysWorked = 0;
    let scheduledDays = 0;

    const summaries: DaySummary[] = weekDays.map((dateObj) => {
      const yStr = dateObj.getFullYear();
      const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dStr = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;
      const yearMonth = `${yStr}-${mStr}`;

      const isSunday = dateObj.getDay() === 0;
      const isToday = dateStr === todayDate;
      const dayNum = dateObj.getDate();
      const dayName = dayNames[dateObj.getDay()];
      const shortDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${dayNum}`;

      // Derive rates for the month of this specific day
      const dayRates = yearMonth === selectedMonth
        ? rateDerivation
        : SalaryEngine.deriveRates(yearMonth, salaryConfig, schedule, holidays);

      // Check holiday
      const holidayMatch = holidays.find((h) => h.date === dateStr);
      const isHoliday = !!holidayMatch;

      // Find attendance record
      const record = attendanceDays.find((d) => d.date === dateStr);

      let activeSec = 0;
      if (isToday) {
        if (isCurrentlyWorking) {
          activeSec = Math.max(record?.totalActiveSeconds || 0, todayLiveActiveSeconds);
        } else {
          activeSec = record?.totalActiveSeconds || 0;
        }
      } else if (record) {
        activeSec = record.totalActiveSeconds || 0;
      }

      // Normal vs Overtime partition
      const targetSec = isSunday ? 0 : standardDailyTargetSec;
      const normalSec = Math.min(activeSec, targetSec);
      const otSec = Math.max(0, activeSec - targetSec);

      // Calculate Day Earnings
      let dayEarned = 0;
      if (isToday && isCurrentlyWorking && todayLiveEarned > 0) {
        dayEarned = todayLiveEarned;
      } else if (activeSec > 0) {
        // Daily rate partitioned by active hours vs 8h, plus ₹75/hr overtime
        const normalPay = (normalSec / 3600) * dayRates.hourlyShortfallRate;
        const otPay = (otSec / 3600) * dayRates.overtimeHourlyRate;
        dayEarned = Number((normalPay + otPay).toFixed(2));
      }

      // If recognized paid holiday and 0 active work logged, add holiday pay
      if (isHoliday && activeSec === 0) {
        dayEarned += dayRates.dailyRate;
      }

      // Status classification
      let status: DaySummary['status'] = 'absent';
      if (isToday && isCurrentlyWorking) {
        status = 'in_progress';
      } else if (activeSec > 0) {
        status = 'worked';
      } else if (isHoliday) {
        status = 'holiday';
      } else if (isSunday) {
        status = 'off';
      }

      if (!isSunday) {
        scheduledDays++;
      }
      if (activeSec > 0) {
        daysWorked++;
      }

      totalActiveSec += activeSec;
      totalNormalSec += normalSec;
      totalOtSec += otSec;
      totalEarnings += dayEarned;

      return {
        dateStr,
        dayName,
        shortDate,
        dayNum,
        isToday,
        isSunday,
        isHoliday,
        holidayName: holidayMatch?.name,
        activeSeconds: activeSec,
        normalSeconds: normalSec,
        otSeconds: otSec,
        estimatedEarnings: dayEarned,
        status,
        attendanceRecord: record,
      };
    });

    const targetWeeklyHours = scheduledDays * requiredDailyHours;
    const targetWeeklySeconds = Math.round(targetWeeklyHours * 3600);
    const remainingWeeklySeconds = Math.max(0, targetWeeklySeconds - totalActiveSec);
    const weeklyProgress = targetWeeklyHours > 0
      ? Math.min(100, Math.round(((totalActiveSec / 3600) / targetWeeklyHours) * 100))
      : 0;

    const weeklyOtPay = Number(((totalOtSec / 3600) * (rateDerivation?.overtimeHourlyRate || 75)).toFixed(2));
    const weeklyRegularPay = Math.max(0, Number((totalEarnings - weeklyOtPay).toFixed(2)));

    return {
      dailySummaries: summaries,
      totalWeeklyActiveSeconds: totalActiveSec,
      totalWeeklyHours: totalActiveSec / 3600,
      totalWeeklyNormalSeconds: totalNormalSec,
      totalWeeklyOtSeconds: totalOtSec,
      totalWeeklyTargetSeconds: targetWeeklySeconds,
      totalWeeklyRemainingSeconds: remainingWeeklySeconds,
      totalWeeklyEarnings: Number(totalEarnings.toFixed(2)),
      totalWeeklyRegularPay: weeklyRegularPay,
      totalWeeklyOtPay: weeklyOtPay,
      daysWorkedCount: daysWorked,
      scheduledDaysCount: scheduledDays,
      weeklyTargetHours: targetWeeklyHours,
      weeklyProgressPercent: weeklyProgress,
    };
  }, [
    weekDays,
    todayDate,
    selectedMonth,
    attendanceDays,
    holidays,
    schedule,
    salaryConfig,
    rateDerivation,
    isCurrentlyWorking,
    todayLiveActiveSeconds,
    todayLiveEarned,
  ]);

  return (
    <section
      id="weekly-summary-widget"
      className="bg-[#121212] border border-[#1E1E24] rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl transition-all"
    >
      {/* 1. WIDGET HEADER & WEEK NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C1C22]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono uppercase">
                Weekly Summary
              </h3>
              {isCurrentWeek ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  CURRENT WEEK
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#A3A3A3] bg-[#1E1E24] border border-[#2D2D35]">
                  HISTORICAL
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] font-mono mt-0.5">
              {weekRangeLabel} · 8h Standard Day · ₹75/hr OT
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            id="weekly-prev-btn"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-lg bg-[#18181D] hover:bg-[#22222A] text-[#A3A3A3] hover:text-white border border-[#262630] transition cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isCurrentWeek && (
            <button
              id="weekly-current-btn"
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition cursor-pointer"
            >
              Current Week
            </button>
          )}

          <button
            id="weekly-next-btn"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-lg bg-[#18181D] hover:bg-[#22222A] text-[#A3A3A3] hover:text-white border border-[#262630] transition cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HIGH-LEVEL BREAKDOWN CARDS (SIMPLE CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* CARD 1: HOURS WORKED */}
        <div
          id="card-weekly-hours"
          className="p-4 rounded-xl bg-[#16161C] border border-[#24242E] flex flex-col justify-between shadow-md hover:border-[#D4AF37]/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Hours Worked
            </span>
            <div className="p-1.5 rounded-md bg-[#1C1C24] border border-[#2B2B38] text-[#D4AF37]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2.5">
            <p className="text-2xl sm:text-3xl font-light font-mono text-white tracking-tight">
              {formatSecondsToHHMMSS(totalWeeklyActiveSeconds)}
            </p>
            <div className="w-full bg-[#202028] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] pt-1 border-t border-[#20202A]">
            <span>Target: {formatSecondsToHHMMSS(totalWeeklyTargetSeconds)}</span>
            <span className={weeklyProgressPercent >= 100 ? 'text-[#10B981] font-bold' : 'text-[#D4AF37]'}>
              Remaining: {formatSecondsToHHMMSS(totalWeeklyRemainingSeconds)}
            </span>
          </div>
        </div>

        {/* CARD 2: ESTIMATED EARNINGS */}
        <div
          id="card-weekly-earnings"
          className="p-4 rounded-xl bg-[#16161C] border border-[#24242E] flex flex-col justify-between shadow-md hover:border-[#10B981]/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Estimated Earnings
            </span>
            <div className="p-1.5 rounded-md bg-[#1C1C24] border border-[#2B2B38] text-[#10B981]">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2.5">
            <p className="text-2xl sm:text-3xl font-light font-serif-display text-[#D4AF37] tracking-tight">
              {formatCurrency(totalWeeklyEarnings)}
            </p>
            <p className="text-[11px] font-mono text-[#10B981] mt-1">
              Base: {formatCurrency(totalWeeklyRegularPay)} · OT: +{formatCurrency(totalWeeklyOtPay)}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] pt-1 border-t border-[#20202A]">
            <span>Daily Rate:</span>
            <span className="text-white font-medium">
              ~{formatCurrency(rateDerivation?.dailyRate || 483.87)}/day
            </span>
          </div>
        </div>

        {/* CARD 3: OVERTIME */}
        <div
          id="card-weekly-overtime"
          className="p-4 rounded-xl bg-[#16161C] border border-[#24242E] flex flex-col justify-between shadow-md hover:border-emerald-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Overtime Logged
            </span>
            <div className="p-1.5 rounded-md bg-[#1C1C24] border border-[#2B2B38] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2.5">
            <p className="text-2xl sm:text-3xl font-light font-mono text-emerald-400 tracking-tight">
              {formatSecondsToHHMMSS(totalWeeklyOtSeconds)}
            </p>
            <p className="text-[11px] font-mono text-emerald-300 mt-1">
              +{formatCurrency(totalWeeklyOtPay)} accrued OT pay
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] pt-1 border-t border-[#20202A]">
            <span>Rate:</span>
            <span className="text-white font-medium">₹75.00 / hr flat</span>
          </div>
        </div>

        {/* CARD 4: DAYS ACTIVE */}
        <div
          id="card-weekly-days"
          className="p-4 rounded-xl bg-[#16161C] border border-[#24242E] flex flex-col justify-between shadow-md hover:border-[#D4AF37]/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9A] font-semibold">
              Days Active
            </span>
            <div className="p-1.5 rounded-md bg-[#1C1C24] border border-[#2B2B38] text-[#D4AF37]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-light font-mono text-white tracking-tight">
                {daysWorkedCount}
              </span>
              <span className="text-sm font-mono text-[#737373]">
                / {scheduledDaysCount} Working Days
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#A3A3A3] mt-1">
              {daysWorkedCount >= scheduledDaysCount ? 'Full Week Completed' : `${scheduledDaysCount - daysWorkedCount} remaining`}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] pt-1 border-t border-[#20202A]">
            <span>Status:</span>
            <span className={daysWorkedCount >= (scheduledDaysCount * 0.8) ? 'text-[#10B981] font-semibold' : 'text-amber-400'}>
              {daysWorkedCount >= scheduledDaysCount ? 'Perfect' : 'On Track'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. DAILY BREAKDOWN MINI CARDS (MON – SUN) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#A0A0B0] font-semibold">
            Daily Breakdown
          </h4>
          <span className="text-[11px] font-mono text-[#737373]">
            {dailySummaries.filter(d => d.activeSeconds > 0).length} shifts logged this week
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {dailySummaries.map((day) => {
            const hasHours = day.activeSeconds > 0;
            const targetSec = day.isSunday ? 0 : 8 * 3600;
            const progress = targetSec > 0 ? Math.min(100, (day.activeSeconds / targetSec) * 100) : 0;
            const isOt = day.otSeconds > 0;

            return (
              <div
                key={day.dateStr}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                  day.isToday
                    ? 'bg-[#181820] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.08)] ring-1 ring-[#D4AF37]/30'
                    : hasHours
                    ? 'bg-[#141418] border-[#25252E] hover:border-[#353542]'
                    : day.isSunday
                    ? 'bg-[#0F0F12] border-[#1A1A20] opacity-70'
                    : 'bg-[#111114] border-[#1D1D24]'
                }`}
              >
                {/* Top: Day and Badge */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <span className={`text-[10px] font-mono font-bold tracking-wider ${
                      day.isToday ? 'text-[#D4AF37]' : 'text-white'
                    }`}>
                      {day.dayName}
                    </span>
                    <p className="text-[10px] font-mono text-[#737373]">{day.shortDate}</p>
                  </div>

                  {day.isToday ? (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 animate-pulse">
                      TODAY
                    </span>
                  ) : day.isHoliday ? (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 truncate max-w-[55px]" title={day.holidayName || 'Holiday'}>
                      HOLIDAY
                    </span>
                  ) : day.isSunday ? (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono text-[#737373] bg-[#1A1A20]">
                      OFF
                    </span>
                  ) : hasHours ? (
                    <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-mono font-semibold ${
                      isOt 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-[#1A1A20] text-[#A3A3A3]'
                    }`}>
                      {isOt ? '+OT' : 'DONE'}
                    </span>
                  ) : null}
                </div>

                {/* Middle: Hours Worked */}
                <div className="my-2">
                  <p className={`text-base font-mono font-semibold tracking-tight ${
                    hasHours 
                      ? 'text-white' 
                      : day.isSunday || day.isHoliday 
                      ? 'text-[#555555]' 
                      : 'text-[#444444]'
                  }`}>
                    {hasHours ? formatDurationHM(day.activeSeconds) : day.isSunday ? '0h (Off)' : '0h'}
                  </p>

                  {/* Progress towards 8h */}
                  {!day.isSunday && (
                    <div className="w-full bg-[#1F1F26] h-1 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOt ? 'bg-[#10B981]' : 'bg-[#D4AF37]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom: Estimated Day Earnings */}
                <div className="pt-1.5 border-t border-[#1C1C24] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#737373]">Earned:</span>
                  <span className={day.estimatedEarnings > 0 ? 'text-[#10B981] font-semibold' : 'text-[#555555]'}>
                    {formatCurrency(day.estimatedEarnings)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
