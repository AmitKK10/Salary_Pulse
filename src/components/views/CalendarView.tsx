// ============================================================================
// SALARYPULSE — BEAUTIFUL, RESPONSIVE CALENDAR & ATTENDANCE VIEW
// Mobile-first responsive calendar matrix, Agenda list view, status micro-chips,
// live earnings accrual, filter tabs, and seamless Day Details Drawer integration
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Coffee,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  Filter,
  List,
  Grid,
  Zap,
  PlayCircle,
  XCircle,
  Eye,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { DayCalculationDetails } from '../../types';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { DayDetailsDrawer } from './DayDetailsDrawer';

type ViewMode = 'grid' | 'agenda';
type FilterStatus = 'all' | 'present' | 'overtime' | 'off_holiday' | 'review';

export const CalendarView: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    monthlyDaysDetails,
    monthlyRunningSummary,
    getDayDetails,
    todayDate,
  } = useApp();

  const [inspectDay, setInspectDay] = useState<DayCalculationDetails | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDate);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const handleMonthShift = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedMonth(`${newYear}-${monthStr}`);
  };

  const handleMonthChange = (newMonth: number) => {
    const m = String(newMonth).padStart(2, '0');
    setSelectedMonth(`${year}-${m}`);
  };

  const handleSetTodayMonth = () => {
    const todayYm = todayDate.slice(0, 7);
    setSelectedMonth(todayYm);
    setSelectedDayDate(todayDate);
  };

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const weekDays = [
    { full: 'SUN', short: 'S', isSun: true },
    { full: 'MON', short: 'M', isSun: false },
    { full: 'TUE', short: 'T', isSun: false },
    { full: 'WED', short: 'W', isSun: false },
    { full: 'THU', short: 'T', isSun: false },
    { full: 'FRI', short: 'F', isSun: false },
    { full: 'SAT', short: 'S', isSun: false },
  ];

  // Build full list of days for current selected month
  const allMonthDays: DayCalculationDetails[] = useMemo(() => {
    const days: DayCalculationDetails[] = [];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(getDayDetails(dStr));
    }
    return days;
  }, [year, month, totalDaysInMonth, getDayDetails, selectedMonth]);

  // Calendar cells for 7-column grid
  const calendarCells: (DayCalculationDetails | null)[] = useMemo(() => {
    const cells: (DayCalculationDetails | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (const d of allMonthDays) {
      cells.push(d);
    }
    return cells;
  }, [firstDayOfMonth, allMonthDays]);

  // Selected Day Details for bottom quick-card
  const activeSelectedDay = useMemo(() => {
    return allMonthDays.find(d => d.date === selectedDayDate) || allMonthDays.find(d => d.date === todayDate) || allMonthDays[0] || null;
  }, [allMonthDays, selectedDayDate, todayDate]);

  // Filtered days for Agenda view or quick insights
  const filteredDays = useMemo(() => {
    if (statusFilter === 'all') return allMonthDays;
    if (statusFilter === 'present') return allMonthDays.filter(d => d.status === 'PRESENT' || d.status === 'WORKING');
    if (statusFilter === 'overtime') return allMonthDays.filter(d => d.overtimeSeconds > 0);
    if (statusFilter === 'off_holiday') return allMonthDays.filter(d => d.isWeeklyOff || d.isHoliday);
    if (statusFilter === 'review') return allMonthDays.filter(d => d.isSuspicious);
    return allMonthDays;
  }, [allMonthDays, statusFilter]);

  const isCurrentActiveMonth = todayDate.startsWith(selectedMonth);

  return (
    <div id="calendar-view" className="space-y-5 pb-16 animate-fadeIn max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* 1. Header & Navigation Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Attendance & Work Calendar</span>
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#A3A3A3]">
            {monthName} • Standard 26-day basis • ₹72.12/hr live derivation
          </p>
        </div>

        {/* View Toggle & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Grid / Agenda View Switcher */}
          <div className="flex items-center bg-[#181818] border border-[#2B2B2B] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-black font-bold shadow'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
              title="Calendar Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'agenda'
                  ? 'bg-[#D4AF37] text-black font-bold shadow'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
              title="Agenda List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Quick Jump Today Button */}
          <button
            onClick={handleSetTodayMonth}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors border ${
              isCurrentActiveMonth
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 font-semibold'
                : 'bg-[#1A1A1A] text-[#A3A3A3] hover:text-white border-[#333333]'
            }`}
          >
            Today
          </button>

          {/* Month Shift & Selectors */}
          <div className="flex items-center bg-[#181818] border border-[#2B2B2B] rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => handleMonthShift(-1)}
              className="p-1.5 rounded-lg text-[#737373] hover:text-white transition hover:bg-[#242424]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Select */}
            <select
              value={month}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white px-2 py-1 focus:outline-none cursor-pointer font-mono"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m} className="bg-[#181818] text-white">
                  {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'short' }).toUpperCase()}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#D4AF37] px-2 py-1 focus:outline-none cursor-pointer font-mono"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y} className="bg-[#181818] text-white">
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleMonthShift(1)}
              className="p-1.5 rounded-lg text-[#737373] hover:text-white transition hover:bg-[#242424]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Summary Header & Hours Tracker */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-4 shadow-xl">
        
        {/* Top Overview Row with Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase text-[#737373]">Summary:</span>
            <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-xs font-semibold">
              {monthName}
            </span>
            {monthlyRunningSummary.needsReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {monthlyRunningSummary.needsReviewCount} Needs Review
              </span>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'all'
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-[#181818] border-[#292929] text-[#A3A3A3] hover:text-white'
              }`}
            >
              All ({allMonthDays.length})
            </button>
            <button
              onClick={() => setStatusFilter('present')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'present'
                  ? 'bg-[#10B981] text-black font-bold border-[#10B981]'
                  : 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              }`}
            >
              Present ({monthlyRunningSummary.presentDaysCount})
            </button>
            {monthlyRunningSummary.overtimeSeconds > 0 && (
              <button
                onClick={() => setStatusFilter('overtime')}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  statusFilter === 'overtime'
                    ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37]'
                    : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                }`}
              >
                Overtime
              </button>
            )}
            <button
              onClick={() => setStatusFilter('off_holiday')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'off_holiday'
                  ? 'bg-purple-500 text-white font-bold border-purple-500'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              }`}
            >
              Off/Holiday ({monthlyRunningSummary.weeklyOffsCount + monthlyRunningSummary.paidHolidaysCount})
            </button>
            {monthlyRunningSummary.needsReviewCount > 0 && (
              <button
                onClick={() => setStatusFilter('review')}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  statusFilter === 'review'
                    ? 'bg-rose-500 text-white font-bold border-rose-500'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                Review ({monthlyRunningSummary.needsReviewCount})
              </button>
            )}
          </div>
        </div>

        {/* Hours Tracker Bar & Overtime Status */}
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#A3A3A3]">Work Target Progress:</span>
              <span className="text-white font-bold">
                {WorkSessionEngine.formatSecondsToHMS(monthlyRunningSummary.actualWorkSeconds)} / {WorkSessionEngine.formatSecondsToHMS(monthlyRunningSummary.requiredNormalSeconds)}
              </span>
              <span className="text-[#D4AF37]">({monthlyRunningSummary.normalHoursPercentage}%)</span>
            </div>

            <div>
              {monthlyRunningSummary.isThresholdReached ? (
                <span className="inline-flex items-center gap-1 text-[#10B981] font-semibold bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 text-[11px]">
                  <Sparkles className="w-3 h-3" /> NORMAL TARGET MET — OT ACTIVE
                </span>
              ) : (
                <span className="text-[#737373] text-[11px]">
                  {WorkSessionEngine.formatSecondsToHMS(monthlyRunningSummary.remainingNormalSeconds)} remaining to 208h target
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                monthlyRunningSummary.isThresholdReached ? 'bg-[#10B981]' : 'bg-[#D4AF37]'
              }`}
              style={{ width: `${monthlyRunningSummary.normalHoursPercentage}%` }}
            />
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* 1. Actual Confirmed */}
          <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#737373] block truncate">
              Confirmed (Past)
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-white">
              ₹{monthlyRunningSummary.actualEarnedSoFar.toFixed(2)}
            </div>
            <span className="text-[10px] text-[#A3A3A3] block truncate">
              {monthlyRunningSummary.presentDaysCount} shifts complete
            </span>
          </div>

          {/* 2. Today Live Accrual */}
          <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#10B981] block truncate">
              Today Live
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-[#10B981]">
              ₹{monthlyRunningSummary.liveEarnedToday.toFixed(2)}
            </div>
            <span className="text-[10px] text-[#A3A3A3] block truncate">
              Accruing per second
            </span>
          </div>

          {/* 3. Overtime Accrual */}
          <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#D4AF37] block truncate">
              Overtime Pay
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-[#D4AF37]">
              ₹{monthlyRunningSummary.otEarnedSoFar.toFixed(2)}
            </div>
            <span className="text-[10px] text-[#A3A3A3] block truncate">
              {WorkSessionEngine.formatSecondsToHMS(monthlyRunningSummary.overtimeSeconds)} OT
            </span>
          </div>

          {/* 4. Projected Total */}
          <div className="p-3 bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-xl space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#D4AF37] block truncate flex items-center justify-between">
              <span>Projected</span>
              <span className="text-[8px] bg-[#D4AF37]/20 text-[#D4AF37] px-1 py-0.2 rounded font-bold">EST</span>
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-[#D4AF37]">
              ₹{monthlyRunningSummary.projectedMonthEndTotal.toFixed(2)}
            </div>
            <span className="text-[10px] text-[#A3A3A3] block truncate">
              Month-end forecast
            </span>
          </div>
        </div>

      </div>

      {/* 3. CALENDAR VIEW MODES: GRID OR AGENDA */}
      {viewMode === 'grid' ? (
        <div className="rounded-2xl bg-[#121212] border border-[#222222] overflow-hidden shadow-2xl p-2 sm:p-4 md:p-6 space-y-3">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((wd) => (
              <div
                key={wd.full}
                className={`text-center py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider font-mono rounded-lg bg-[#181818] border border-[#242424] ${
                  wd.isSun ? 'text-rose-400 font-semibold' : 'text-[#A3A3A3]'
                }`}
              >
                <span className="hidden sm:inline">{wd.full}</span>
                <span className="sm:hidden">{wd.short}</span>
              </div>
            ))}
          </div>

          {/* 7-Column Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((day, cellIndex) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${cellIndex}`}
                    className="min-h-[70px] sm:min-h-[110px] rounded-xl bg-[#141414]/20 border border-dashed border-[#1E1E1E] opacity-25"
                  />
                );
              }

              const isToday = day.isToday;
              const isSelected = activeSelectedDay?.date === day.date;
              const isWeeklyOff = day.isWeeklyOff;
              const isHoliday = day.isHoliday && !day.isHolidayWorked;
              const isAbsent = day.status === 'ABSENT';
              const isPartial = day.status === 'PARTIAL' || (day.status as string) === 'HALF_DAY';
              const isPresent = day.status === 'PRESENT' || day.status === 'WORKING' || day.status === 'COMPLETED';
              const hasSuspicious = day.isSuspicious;

              // Format compact text for mobile
              let microLabel = '';
              let microBg = 'bg-[#1F1F1F] text-[#737373]';

              if (isToday) {
                microLabel = 'LIVE';
                microBg = 'bg-[#10B981] text-black font-bold';
              } else if (isPresent) {
                const h = Math.floor(day.actualActiveSeconds / 3600);
                microLabel = day.overtimeSeconds > 0 ? `${h}h+OT` : `${h || 8}h`;
                microBg = 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-semibold';
              } else if (isHoliday) {
                microLabel = 'HOL';
                microBg = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
              } else if (isWeeklyOff) {
                microLabel = 'OFF';
                microBg = 'bg-[#1A1A1A] text-[#666666]';
              } else if (isAbsent) {
                microLabel = 'ABS';
                microBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/40';
              } else if (isPartial) {
                microLabel = `${Math.floor(day.actualActiveSeconds / 3600)}h`;
                microBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
              } else if (day.isFuture) {
                microLabel = '8h';
                microBg = 'bg-[#1A1A1A] text-[#555555]';
              }

              return (
                <button
                  key={day.date}
                  id={`calendar-day-${day.date}`}
                  onClick={() => {
                    setSelectedDayDate(day.date);
                    setInspectDay(day);
                  }}
                  className={`text-left relative min-h-[72px] sm:min-h-[110px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'ring-2 ring-[#D4AF37] bg-[#1E1E1E] border-[#D4AF37] shadow-xl z-10'
                      : isToday
                      ? 'bg-[#122218] border-[#10B981]/60 ring-1 ring-[#10B981]/40'
                      : hasSuspicious
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : isHoliday
                      ? 'bg-purple-950/20 border-purple-500/30'
                      : isWeeklyOff
                      ? 'bg-[#121212] border-[#1E1E1E]'
                      : 'bg-[#151515] border-[#242424] hover:bg-[#1A1A1A] hover:border-[#383838]'
                  }`}
                >
                  {/* Row 1: Day Number & Status Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold ${
                        isToday
                          ? 'text-[#10B981]'
                          : isSelected
                          ? 'text-[#D4AF37]'
                          : isWeeklyOff
                          ? 'text-[#666666]'
                          : isHoliday
                          ? 'text-purple-300'
                          : 'text-white'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* Status indicator dot or pill */}
                    <div className="flex items-center gap-1">
                      {hasSuspicious && (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-pulse" title="Needs Review" />
                      )}
                      {isToday ? (
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping sm:hidden" />
                      ) : isPresent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] sm:hidden" />
                      ) : isHoliday ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 sm:hidden" />
                      ) : isAbsent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 sm:hidden" />
                      ) : null}

                      {/* Desktop badge */}
                      <span className="hidden sm:inline-block">
                        {isToday ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#10B981] text-black font-bold uppercase">
                            LIVE
                          </span>
                        ) : (
                          <Badge
                            status={day.status}
                            label={day.statusLabel}
                            size="xs"
                            showIcon={false}
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Micro pill on mobile / Full stats on desktop */}
                  <div className="my-0.5 sm:my-1 w-full">
                    {/* Mobile Micro Chip */}
                    <div className="sm:hidden flex items-center justify-center">
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${microBg} max-w-full truncate text-center block`}>
                        {microLabel}
                      </span>
                    </div>

                    {/* Desktop Stats */}
                    <div className="hidden sm:block space-y-0.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-[#A3A3A3]">
                        <span>Work</span>
                        <span className={`font-semibold ${day.isShortWorkDay ? 'text-amber-400' : 'text-white'}`}>
                          {day.actualActiveSeconds > 0
                            ? WorkSessionEngine.formatSecondsToHMS(day.actualActiveSeconds).slice(0, 5)
                            : day.isFuture && !isWeeklyOff && !isHoliday
                            ? '08:00'
                            : '--:--'}
                        </span>
                      </div>
                      {day.isShortWorkDay && (
                        <div className="flex items-center justify-between text-amber-400 text-[9px]">
                          <span>Short</span>
                          <span>&lt;8h ({Math.floor(day.actualActiveSeconds / 3600)}h)</span>
                        </div>
                      )}
                      {day.overtimeSeconds > 0 && (
                        <div className="flex items-center justify-between text-[#10B981]">
                          <span>OT</span>
                          <span>+{WorkSessionEngine.formatSecondsToHMS(day.overtimeSeconds).slice(0, 5)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Daily Earning Amount */}
                  <div className="pt-0.5 sm:pt-1 border-t border-[#222222] w-full flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
                    <span className="text-[#666666] hidden sm:inline">{day.isFuture ? 'Exp' : 'Earn'}</span>
                    <span className={`font-semibold ml-auto sm:ml-0 ${
                      isWeeklyOff && !day.isHoliday && day.totalDailyEarned === 0
                        ? 'text-[#555555]'
                        : isToday
                        ? 'text-[#10B981]'
                        : 'text-[#D4AF37]'
                    }`}>
                      {isWeeklyOff && day.totalDailyEarned === 0
                        ? '--'
                        : `₹${(day.isFuture ? day.projectedDailyEarned : day.totalDailyEarned).toFixed(0)}`}
                    </span>
                  </div>

                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* AGENDA LIST VIEW (Mobile Friendly Chronological Feed) */
        <div className="rounded-2xl bg-[#121212] border border-[#222222] overflow-hidden shadow-2xl p-3 sm:p-5 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <List className="w-4 h-4 text-[#D4AF37]" />
              <span>{monthName} Agenda & Day Timeline</span>
            </h3>
            <span className="text-xs font-mono text-[#737373]">
              {filteredDays.length} records shown
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredDays.map((day) => {
              const dateObj = new Date(`${day.date}T12:00:00`);
              const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = day.isToday;

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    setSelectedDayDate(day.date);
                    setInspectDay(day);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isToday
                      ? 'bg-[#13241A] border-[#10B981]/50'
                      : day.isWeeklyOff
                      ? 'bg-[#141414] border-[#222222]'
                      : 'bg-[#181818] border-[#262626] hover:bg-[#1F1F1F]'
                  }`}
                >
                  {/* Left: Date & Status */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="text-[10px] font-mono text-[#737373] uppercase block">{dayOfWeek}</span>
                      <span className={`text-base font-bold font-mono ${isToday ? 'text-[#10B981]' : 'text-white'}`}>
                        {day.dayNumber}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge status={day.status} label={day.statusLabel} size="xs" showIcon={true} />
                        {isToday && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#10B981] text-black font-bold">
                            LIVE
                          </span>
                        )}
                        {day.isSuspicious && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Issue
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#A3A3A3] font-mono flex items-center gap-3">
                        <span>Punches: {day.firstPunchIn ? day.firstPunchIn.slice(11, 16) : '--:--'} → {day.lastPunchOut ? day.lastPunchOut.slice(11, 16) : '--:--'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Hours & Earnings */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
                    <div className="text-left sm:text-right">
                      <span className="text-[#737373] block text-[10px]">Active Work</span>
                      <span className="text-white font-bold">
                        {WorkSessionEngine.formatSecondsToHMS(day.actualActiveSeconds)}
                      </span>
                      {day.overtimeSeconds > 0 && (
                        <span className="text-[#10B981] block text-[10px]">
                          +{WorkSessionEngine.formatSecondsToHMS(day.overtimeSeconds)} OT
                        </span>
                      )}
                    </div>

                    <div className="text-right pl-3 border-l border-[#292929]">
                      <span className="text-[#737373] block text-[10px]">{day.isFuture ? 'Projected' : 'Earned'}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">
                        ₹{(day.isFuture ? day.projectedDailyEarned : day.totalDailyEarned).toFixed(2)}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#737373] hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SELECTED DAY QUICK OVERVIEW CARD */}
      {activeSelectedDay && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] border border-[#2B2B2B] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-mono font-bold text-base shrink-0">
              {activeSelectedDay.dayNumber}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {new Date(`${activeSelectedDay.date}T12:00:00`).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <Badge status={activeSelectedDay.status} label={activeSelectedDay.statusLabel} size="xs" showIcon={true} />
                {activeSelectedDay.isToday && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#10B981] text-black font-bold">
                    LIVE SHIFT
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A3A3A3] font-mono">
                Work: <strong className="text-white">{WorkSessionEngine.formatSecondsToHMS(activeSelectedDay.actualActiveSeconds)}</strong>
                {activeSelectedDay.overtimeSeconds > 0 && (
                  <span className="text-[#10B981] ml-2 font-semibold">
                    (+{WorkSessionEngine.formatSecondsToHMS(activeSelectedDay.overtimeSeconds)} Overtime)
                  </span>
                )}
                <span className="text-[#737373] mx-2">•</span>
                Earned: <strong className="text-[#D4AF37]">₹{activeSelectedDay.totalDailyEarned.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setInspectDay(activeSelectedDay)}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-lg"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Full Details & Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Day Details Inspection Drawer */}
      <DayDetailsDrawer
        dayDetails={inspectDay}
        onClose={() => setInspectDay(null)}
        onRefresh={() => {
          if (inspectDay) {
            setInspectDay(getDayDetails(inspectDay.date));
          }
        }}
      />

    </div>
  );
};
