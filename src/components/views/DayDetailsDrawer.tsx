// ============================================================================
// SALARYPULSE — COMPREHENSIVE DAY DETAILS DRAWER / MODAL
// Authoritative daily inspection: Work Timeline, Summary, Salary Breakdown,
// Deficit / Gap Analysis, Quality & Suspicious Issue Alerts, Audit Actions
// ============================================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Clock, 
  Calendar, 
  IndianRupee, 
  Coffee, 
  AlertTriangle, 
  Edit3, 
  CheckCircle2, 
  ArrowRight, 
  FileText,
  Info,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { DayCalculationDetails } from '../../types';
import { Badge } from '../common/Badge';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { DayEditModal } from './DayEditModal';

interface DayDetailsDrawerProps {
  dayDetails: DayCalculationDetails | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DayDetailsDrawer: React.FC<DayDetailsDrawerProps> = ({
  dayDetails,
  onClose,
  onRefresh,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (!dayDetails) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [dayDetails]);

  if (!dayDetails) return null;

  const dateObj = new Date(`${dayDetails.date}T12:00:00`);
  const formattedFullDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const classification = dayDetails.isToday
    ? 'TODAY (LIVE MONITORING)'
    : dayDetails.isPast
    ? 'PAST (RECORDED ACTUAL)'
    : 'FUTURE (SCHEDULED PROJECTION)';

  const classificationColor = dayDetails.isToday
    ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30'
    : dayDetails.isPast
    ? 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30'
    : 'text-sky-400 bg-sky-500/10 border-sky-500/30';

  const deficitSec = dayDetails.deficitSeconds;
  const surplusSec = Math.max(0, dayDetails.actualActiveSeconds - dayDetails.requiredNormalSeconds);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div 
        id="day-details-drawer"
        className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="bg-[#121212] border-t sm:border border-[#2E2E38] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono animate-in slide-in-from-bottom-5 sm:fade-in sm:zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden bg-[#141414] shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#444444]" />
          </div>
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#222222] flex items-start justify-between bg-[#141414] shrink-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${classificationColor}`}>
                  {classification}
                </span>
                <Badge status={dayDetails.status} label={dayDetails.statusLabel} size="sm" />
                {dayDetails.holidayInfo && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {dayDetails.holidayInfo.name}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {formattedFullDate}
              </h2>
              <p className="text-[11px] font-mono text-[#A3A3A3]">
                ISO DATE: {dayDetails.date} • WEEKDAY: {dayDetails.dayName}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit Day Record"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-[#737373] hover:text-white rounded-lg hover:bg-[#1F1F1F] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5">

            {/* Suspicious Alerts (if any) */}
            {dayDetails.isSuspicious && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Quality Audit Warning (Needs Review)</span>
                </div>
                <ul className="space-y-1 text-xs text-rose-300 list-disc list-inside">
                  {(dayDetails.suspiciousReasons || []).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div className="pt-2 text-[11px] text-[#A3A3A3] flex items-center gap-2">
                  <span>Action: Click 'Edit' above to correct timestamps or supply closure punches.</span>
                </div>
              </div>
            )}

            {/* 1. Key Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#171717] border border-[#262626] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Active Work</span>
                <span className="text-base font-bold font-mono text-white">
                  {WorkSessionEngine.formatSecondsToHMS(dayDetails.actualActiveSeconds)}
                </span>
                <span className="text-[10px] text-[#A3A3A3] block mt-0.5">
                  {(dayDetails.actualActiveSeconds / 3600).toFixed(2)} hrs
                </span>
              </div>

              <div className="p-3 bg-[#171717] border border-[#262626] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Break Time</span>
                <span className="text-base font-bold font-mono text-[#D4AF37]">
                  {WorkSessionEngine.formatSecondsToHMS(dayDetails.totalBreakSeconds)}
                </span>
                <span className="text-[10px] text-[#A3A3A3] block mt-0.5">
                  {(dayDetails.totalBreakSeconds / 3600).toFixed(2)} hrs
                </span>
              </div>

              <div className="p-3 bg-[#171717] border border-[#262626] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Overtime</span>
                <span className={`text-base font-bold font-mono ${dayDetails.overtimeSeconds > 0 ? 'text-[#10B981]' : 'text-[#737373]'}`}>
                  {WorkSessionEngine.formatSecondsToHMS(dayDetails.overtimeSeconds)}
                </span>
                <span className="text-[10px] text-[#A3A3A3] block mt-0.5">
                  {dayDetails.overtimeSeconds > 0 ? `+${(dayDetails.overtimeSeconds / 3600).toFixed(2)} hrs OT` : 'None'}
                </span>
              </div>

              <div className="p-3 bg-[#171717] border border-[#262626] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Daily Earning</span>
                <span className="text-base font-bold font-mono text-[#D4AF37]">
                  ₹{dayDetails.isFuture ? dayDetails.projectedDailyEarned.toFixed(2) : dayDetails.totalDailyEarned.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#A3A3A3] block mt-0.5">
                  {dayDetails.isFuture ? 'Projected' : 'Actual'}
                </span>
              </div>
            </div>

            {/* 2. Target vs Worked Comparison */}
            {(!dayDetails.isWeeklyOff || dayDetails.actualActiveSeconds > 0) && (!dayDetails.isHoliday || dayDetails.actualActiveSeconds > 0) && (
              <div className="p-4 bg-[#161616] border border-[#262626] rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A3A3A3] uppercase">Shift Target Pacing (8h Target)</span>
                  <span className="text-white font-semibold">
                    {WorkSessionEngine.formatSecondsToHMS(dayDetails.actualActiveSeconds)} / {WorkSessionEngine.formatSecondsToHMS(dayDetails.requiredNormalSeconds || 28800)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dayDetails.actualActiveSeconds >= (dayDetails.requiredNormalSeconds || 28800)
                        ? 'bg-[#10B981]'
                        : 'bg-[#D4AF37]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (dayDetails.requiredNormalSeconds || 28800) > 0
                          ? (dayDetails.actualActiveSeconds / (dayDetails.requiredNormalSeconds || 28800)) * 100
                          : 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                  {dayDetails.isFuture ? (
                    <div className="flex items-center gap-1.5 text-sky-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Scheduled: 8.0h shift planned</span>
                    </div>
                  ) : deficitSec > 0 ? (
                    <div className="flex items-center gap-1.5 text-rose-400 font-mono">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Deficit: {WorkSessionEngine.formatSecondsToHMS(deficitSec)} (Under 8h)</span>
                    </div>
                  ) : surplusSec > 0 ? (
                    <div className="flex items-center gap-1.5 text-[#10B981] font-mono">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Surplus / OT: {WorkSessionEngine.formatSecondsToHMS(surplusSec)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#10B981] font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>8-hour work target achieved</span>
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-[#737373]">
                    Required: {((dayDetails.requiredNormalSeconds || 28800) / 3600).toFixed(1)}h
                  </span>
                </div>
              </div>
            )}

            {/* 3. Office Timing & Punctuality Audit (9:00 AM to 6:00 PM) */}
            {(dayDetails.firstPunchIn || dayDetails.lastPunchOut || (dayDetails.lunchOverrunMinutes || 0) > 0 || dayDetails.actualActiveSeconds > 0) && (
              <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl space-y-2.5 text-xs font-mono">
                <div className="text-[10px] text-[#A3A3A3] uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>Shift Punctuality Audit (09:00 - 18:00)</span>
                  <span className="text-[#D4AF37]">8h Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Entry */}
                  <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] space-y-1">
                    <span className="text-[10px] text-[#737373] uppercase block">Shift Entry (09:00)</span>
                    <div className="font-semibold text-white">
                      {dayDetails.firstPunchIn ? dayDetails.firstPunchIn.split('T')[1]?.slice(0, 5) : '--:--'}
                    </div>
                    {dayDetails.entryLabel ? (
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        dayDetails.entryPunctuality === 'LATE_ENTRY'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      }`}>
                        {dayDetails.entryLabel}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#666666]">--</span>
                    )}
                  </div>

                  {/* Exit */}
                  <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] space-y-1">
                    <span className="text-[10px] text-[#737373] uppercase block">
                      {dayDetails.finishedAt ? 'Actual Finish' : 'Shift Exit (18:00)'}
                    </span>
                    <div className="font-semibold text-white">
                      {dayDetails.finishedAt 
                        ? dayDetails.finishedAt.split('T')[1]?.slice(0, 5) 
                        : dayDetails.lastPunchOut 
                        ? dayDetails.lastPunchOut.split('T')[1]?.slice(0, 5) 
                        : '--:--'}
                    </div>
                    {dayDetails.exitLabel ? (
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        dayDetails.exitPunctuality === 'EARLY_GOING'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      }`}>
                        {dayDetails.exitLabel}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#666666]">--</span>
                    )}
                  </div>

                  {/* Lunch Overrun */}
                  <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626] space-y-1">
                    <span className="text-[10px] text-[#737373] uppercase block">Lunch Break (1h limit)</span>
                    <div className="font-semibold text-white">
                      {WorkSessionEngine.formatSecondsToHMS(dayDetails.totalBreakSeconds)}
                    </div>
                    {dayDetails.lunchOverrunLabel ? (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {dayDetails.lunchOverrunLabel}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#10B981]">Within 1h allowance</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Work Sessions & Breaks Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-[#A3A3A3] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Work Timeline & Punches
                </h3>
                <span className="text-[11px] font-mono text-[#737373]">
                  Source: {dayDetails.source || 'DEVICE'}
                </span>
              </div>

              {dayDetails?.workSessions && dayDetails.workSessions.length > 0 ? (
                <div className="space-y-2">
                  {(dayDetails.workSessions || []).map((ws, index) => {
                    const startStr = ws.startTime ? ws.startTime.split('T')[1]?.slice(0, 8) : '--:--:--';
                    const endStr = ws.endTime ? ws.endTime.split('T')[1]?.slice(0, 8) : 'OPEN (Running)';
                    const durHms = WorkSessionEngine.formatSecondsToHMS(ws.durationSeconds || 0);

                    return (
                      <div
                        key={ws.id || index}
                        className="p-3 bg-[#171717] border border-[#262626] rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] font-mono text-[11px]">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-mono text-white">
                              <span>{startStr}</span>
                              <ArrowRight className="w-3 h-3 text-[#737373]" />
                              <span className={ws.endTime ? 'text-white' : 'text-[#10B981] font-semibold'}>{endStr}</span>
                            </div>
                            {ws.note && (
                              <span className="text-[11px] text-[#A3A3A3] block mt-0.5">{ws.note}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-semibold text-white block">{durHms}</span>
                          <span className="text-[10px] font-mono uppercase text-[#737373]">{ws.source || 'DEVICE'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#171717] border border-[#262626] rounded-lg text-center text-xs text-[#737373]">
                  No punch sessions recorded for this day.
                </div>
              )}

              {/* Break Sessions */}
              {dayDetails?.breakSessions && dayDetails.breakSessions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono uppercase text-[#737373] block">Break Intervals</span>
                  {(dayDetails.breakSessions || []).map((bs, index) => {
                    const startStr = bs.startTime ? bs.startTime.split('T')[1]?.slice(0, 8) : '--:--:--';
                    const endStr = bs.endTime ? bs.endTime.split('T')[1]?.slice(0, 8) : 'ACTIVE';
                    const durHms = WorkSessionEngine.formatSecondsToHMS(bs.durationSeconds || 0);

                    return (
                      <div
                        key={bs.id || index}
                        className="p-2.5 bg-[#141414] border border-[#222222] rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Coffee className="w-4 h-4 text-[#D4AF37]" />
                          <div>
                            <div className="flex items-center gap-1.5 font-mono text-[#E5E5E5]">
                              <span className="capitalize text-xs font-semibold">{bs.type}</span>
                              <span className="text-[#737373]">({startStr} → {endStr})</span>
                            </div>
                            <span className="text-[10px] text-[#737373] block">
                              {bs.isPaid ? 'Paid Break' : 'Unpaid Official Break'} {bs.note ? `• ${bs.note}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[#D4AF37] font-semibold">{durHms}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Daily Salary Breakdown Card */}
            <div className="p-4 bg-[#161616] border border-[#262626] rounded-xl space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#A3A3A3] flex items-center gap-2">
                <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" />
                Daily Compensation Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#222222]">
                  <span className="text-[#A3A3A3]">Base Active Work Earning</span>
                  <span className="font-mono text-white">₹{dayDetails.baseSalaryEarned.toFixed(2)}</span>
                </div>

                {dayDetails.overtimeEarned > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-[#222222]">
                    <span className="text-[#10B981]">Overtime Accrual ({WorkSessionEngine.formatSecondsToHMS(dayDetails.overtimeSeconds)})</span>
                    <span className="font-mono text-[#10B981] font-semibold">+₹{dayDetails.overtimeEarned.toFixed(2)}</span>
                  </div>
                )}

                {dayDetails.holidayCreditEarned > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-[#222222]">
                    <span className="text-purple-400">Paid Holiday Credit ({dayDetails.holidayInfo?.name || 'Holiday'})</span>
                    <span className="font-mono text-purple-400 font-semibold">+₹{dayDetails.holidayCreditEarned.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                  <span className="text-white">
                    {dayDetails.isFuture ? 'Projected Daily Total' : 'Actual Daily Total'}
                  </span>
                  <span className="font-mono text-[#D4AF37] text-base">
                    ₹{dayDetails.isFuture ? dayDetails.projectedDailyEarned.toFixed(2) : dayDetails.totalDailyEarned.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Salary Gap & Deficit Analysis */}
            {dayDetails.salaryGapReasons && dayDetails.salaryGapReasons.length > 0 && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D4AF37] uppercase font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Salary Gap Analysis
                  </span>
                  <span className="text-rose-400 font-semibold">
                    -₹{dayDetails.salaryGap.toFixed(2)} (Estimated Gap)
                  </span>
                </div>

                <p className="text-[11px] text-[#A3A3A3]">
                  Expected normal full day earning: ₹{dayDetails.expectedNormalDaySalary.toFixed(2)}. Itemized deficit breakdown:
                </p>

                <div className="space-y-1 pt-1">
                  {(dayDetails.salaryGapReasons || []).map((gap, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#CCCCCC] bg-[#141414] px-2.5 py-1.5 rounded border border-[#222222]">
                      <span className="font-mono text-[11px]">{gap.reason} ({WorkSessionEngine.formatSecondsToHMS(gap.durationSeconds)})</span>
                      <span className="font-mono text-rose-400">-₹{gap.estimatedImpact.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Notes & Metadata */}
            {dayDetails.notes && (
              <div className="p-3 bg-[#171717] border border-[#262626] rounded-lg space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#737373] flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> User Notes
                </span>
                <p className="text-xs text-white">{dayDetails.notes}</p>
              </div>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-[#222222] bg-[#141414] pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-[#737373] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden sm:inline">Deterministic SalaryPulse Core</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-[#1F1F1F] hover:bg-[#2B2B2B] text-white border border-[#333333] rounded-xl text-xs font-mono uppercase flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" /> Edit Day
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold rounded-xl text-xs font-mono uppercase transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Day Edit Modal */}
      {isEditing && (
        <DayEditModal
          dayDetails={dayDetails}
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            if (onRefresh) onRefresh();
            onClose();
          }}
        />
      )}
    </>,
    document.body
  );
};
