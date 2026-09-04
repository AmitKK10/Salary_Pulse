// ============================================================================
// SALARYPULSE — LIVE HERO CARD
// Section 1: Live Active Session Hero & Section 7: Lunch Break Terminal
// Section 10: Streamlined Buttons
// ============================================================================

import React from 'react';
import { 
  Play, 
  Square, 
  Coffee, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Edit3 
} from 'lucide-react';
import { formatCurrency, formatSecondsToClock, formatSecondsToHMS, formatTimeDisplay } from '../../../utils/formatters';
import { WorkSession, BreakSession } from '../../../types';

interface LiveHeroCardProps {
  todayDate: string;
  isCurrentlyWorking: boolean;
  isOnBreak: boolean;
  currentWorkdayStatus: string;
  todayLiveActiveSeconds: number;
  todayCompletedActiveSeconds: number;
  todayRemainingActiveSeconds: number;
  todayLiveEarned: number;
  openWorkSession?: WorkSession;
  openBreakSession?: BreakSession;
  lunchStats: {
    remainingSeconds: number;
    configuredSeconds: number;
    isOverrun: boolean;
    overrunSeconds: number;
    elapsedSeconds: number;
  };
  rateDerivation: {
    perHourRate: number;
    perMinuteRate: number;
    perSecondRate: number;
  };
  auditLogsCount: number;
  formatHumanDate: (dateStr: string) => string;
  onClockIn: () => void;
  onTakeBreak: () => void;
  onResumeWork: () => void;
  onClockOut: () => void;
  onEditPunchIn: () => void;
  onOpenAudit: () => void;
}

export const LiveHeroCard: React.FC<LiveHeroCardProps> = ({
  todayDate,
  isCurrentlyWorking,
  isOnBreak,
  currentWorkdayStatus,
  todayLiveActiveSeconds,
  todayCompletedActiveSeconds,
  todayRemainingActiveSeconds,
  todayLiveEarned,
  openWorkSession,
  openBreakSession,
  lunchStats,
  rateDerivation,
  auditLogsCount,
  formatHumanDate,
  onClockIn,
  onTakeBreak,
  onResumeWork,
  onClockOut,
  onEditPunchIn,
  onOpenAudit,
}) => {
  // ==========================================================================
  // SECTION 7: DEDICATED LUNCH / BREAK STATE
  // When on break, display the prominent Break Terminal as primary
  // ==========================================================================
  if (isOnBreak) {
    const isLunch = !openBreakSession?.type || openBreakSession.type === 'lunch';
    const breakStartTime = openBreakSession?.startTime;
    const startMs = breakStartTime ? new Date(breakStartTime).getTime() : NaN;
    const configuredSec = lunchStats.configuredSeconds || 3600;
    
    // Expected finish timestamp (e.g. startTime + 1 hour)
    const expectedFinishDate = !isNaN(startMs) ? new Date(startMs + configuredSec * 1000) : null;
    const expectedFinishStr = expectedFinishDate && !isNaN(expectedFinishDate.getTime())
      ? expectedFinishDate.toTimeString().slice(0, 8)
      : '--:--';
    const startTimeStr = !isNaN(startMs)
      ? new Date(startMs).toTimeString().slice(0, 8)
      : '--:--';

    const isOverrun = lunchStats.isOverrun || lunchStats.overrunSeconds > 0;

    return (
      <div 
        id="terminal-break-screen" 
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 text-center shadow-2xl space-y-5 transition-all ${
          isOverrun
            ? 'border-rose-500/50 bg-gradient-to-b from-[#220B0B] via-[#160808] to-[#0A0A0A]'
            : 'border-[#D4AF37]/30 bg-gradient-to-b from-[#18150B] via-[#121008] to-[#0A0A0A]'
        }`}
      >
        {/* Break Header Status Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest border animate-pulse ${
            isOverrun
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
          }`}>
            <Coffee className="w-3.5 h-3.5" />
            <span>{isLunch ? '1-HOUR LUNCH BREAK' : `${openBreakSession?.type?.toUpperCase()} BREAK`}</span>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#A3A3A3]">
              {formatHumanDate(todayDate)}
            </span>
            <button
              onClick={onOpenAudit}
              className="text-[10px] font-mono text-[#737373] hover:text-[#D4AF37] px-2 py-1 rounded bg-[#181818] border border-[#262626] transition flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Audit ({auditLogsCount})</span>
            </button>
          </div>
        </div>

        {/* Big Reverse Timer / Overrun Alarm */}
        <div className="space-y-2 py-2">
          {isOverrun ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider animate-bounce">
                <span>🚨 LUNCH TIME EXCEEDED (OVER 1 HOUR)</span>
              </div>
              <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight select-all tabular-nums text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                DELAY BY +{formatSecondsToHMS(lunchStats.overrunSeconds)}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#A3A3A3] font-mono flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-rose-300 font-semibold">Extra Time Spent: {formatSecondsToHMS(lunchStats.overrunSeconds)}</span>
                <span>·</span>
                <span className="text-[#888888]">Time Left: 00:00:00</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                Time Left (Reverse Countdown)
              </div>
              <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight select-all tabular-nums text-[#D4AF37]">
                {formatSecondsToHMS(lunchStats.remainingSeconds)}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#A3A3A3] font-mono flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[#10B981] font-semibold">Lunch till {expectedFinishStr}</span>
                <span>·</span>
                <span className="text-[#D4AF37]">Break Started: {startTimeStr}</span>
              </div>
            </div>
          )}
        </div>

        {/* Salary Growth Paused Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-[#242424] text-xs font-mono text-[#A3A3A3] shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Salary accrual paused at <strong className="text-white">{formatCurrency(todayLiveEarned)}</strong></span>
        </div>

        {/* Break Context Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-left text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222222]">
            <span className="text-[10px] text-[#737373] uppercase block font-semibold">Lunch Allowed</span>
            <span className="text-xs sm:text-sm font-bold text-white">01:00:00 (1h)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222222]">
            <span className="text-[10px] text-[#737373] uppercase block font-semibold">Elapsed Break</span>
            <span className={`text-xs sm:text-sm font-bold ${isOverrun ? 'text-rose-400' : 'text-[#D4AF37]'}`}>
              {formatSecondsToHMS(lunchStats.elapsedSeconds)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222222]">
            <span className="text-[10px] text-[#737373] uppercase block font-semibold">Work Done</span>
            <span className="text-xs sm:text-sm font-bold text-[#10B981]">{formatSecondsToHMS(todayCompletedActiveSeconds)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121212] border border-[#222222]">
            <span className="text-[10px] text-[#737373] uppercase block font-semibold">Work Remaining</span>
            <span className="text-xs sm:text-sm font-bold text-[#3B82F6]">{formatSecondsToHMS(todayRemainingActiveSeconds)}</span>
          </div>
        </div>

        {/* Section 10: Primary Resume Work & End Day Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="btn-resume-break"
            onClick={onResumeWork}
            className="flex-1 sm:flex-none px-7 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#0EA271] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME WORK</span>
          </button>

          <button
            id="btn-end-day-break"
            onClick={onClockOut}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-semibold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
            <span>END DAY</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // SECTION 1: LIVE ACTIVE SESSION HERO (Trading Terminal Style)
  // ==========================================================================
  return (
    <div 
      id="terminal-working-screen" 
      className="relative overflow-hidden rounded-2xl border border-[#222222] bg-[#121212] p-5 sm:p-7 shadow-2xl space-y-5"
    >
      {/* Top Meta Bar: Status Badge + Date + Audit */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1A1A1A] pb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
            isCurrentlyWorking 
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 animate-pulse' 
              : currentWorkdayStatus === 'COMPLETED'
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-[#1F1F1F] text-[#888888] border-[#333333]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isCurrentlyWorking ? 'bg-[#10B981]' : currentWorkdayStatus === 'COMPLETED' ? 'bg-blue-400' : 'bg-[#666666]'
            }`} />
            <span>
              {isCurrentlyWorking 
                ? 'LIVE SESSION ACTIVE' 
                : currentWorkdayStatus === 'COMPLETED'
                  ? 'WORKDAY COMPLETED'
                  : 'SESSION PAUSED'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#A3A3A3] uppercase tracking-wider">
            {formatHumanDate(todayDate)}
          </span>

          <button
            onClick={onOpenAudit}
            className="text-[10px] font-mono text-[#737373] hover:text-[#D4AF37] px-2 py-1 rounded bg-[#181818] border border-[#262626] transition flex items-center gap-1 cursor-pointer"
            title="View Audit Trail"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Audit</span>
            <span>({auditLogsCount})</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Timer Display */}
      <div className="text-center space-y-1">
        <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight text-white select-all tabular-nums">
          {formatSecondsToClock(todayLiveActiveSeconds)}
        </div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-[#737373] font-mono">
          Active Work
        </div>
      </div>

      {/* Earnings Accrual Ticker */}
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#161616] border border-[#242424] max-w-md mx-auto text-center space-y-1">
        <div className="text-2xl sm:text-3xl font-mono font-bold text-[#D4AF37] tracking-tight tabular-nums">
          {formatCurrency(todayLiveEarned)}
        </div>
        <div className="text-xs font-mono text-[#A3A3A3] flex items-center justify-center gap-2">
          <span>Today's Earnings</span>
          <span className="text-[#737373]">·</span>
          <span className="text-[#10B981] font-semibold">
            (+₹{rateDerivation.perMinuteRate.toFixed(2)}/min)
          </span>
        </div>
      </div>

      {/* Active Session Start Time Info & Punctuality Tag */}
      {openWorkSession && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 bg-[#171717] border border-[#242424] rounded-xl text-xs text-[#A3A3A3] max-w-md mx-auto font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Started at <strong className="text-white">{formatTimeDisplay(openWorkSession.startTime)}</strong></span>
            
            {/* Punctuality Pill (9:00 AM target) */}
            {(() => {
              const timePart = openWorkSession.startTime.includes('T') ? openWorkSession.startTime.split('T')[1].substring(0, 5) : openWorkSession.startTime.substring(0, 5);
              const [pH, pM] = timePart.split(':').map(Number);
              if (isNaN(pH) || isNaN(pM)) return null;
              const diff = (pH * 60 + pM) - 540; // 09:00 AM = 540 min
              if (diff > 0) {
                return (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    Late Entry by {diff}m
                  </span>
                );
              } else if (diff < 0) {
                return (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                    Early Entry by {Math.abs(diff)}m
                  </span>
                );
              } else {
                return (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                    On Time (09:00)
                  </span>
                );
              }
            })()}
          </div>
          <button
            onClick={onEditPunchIn}
            className="px-2 py-0.5 rounded bg-[#222222] hover:bg-[#2E2E2E] text-[#D4AF37] text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer self-end sm:self-auto"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
      )}

      {/* Section 10: Streamlined Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {!isCurrentlyWorking ? (
          <button
            id="btn-clock-in"
            onClick={onClockIn}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#0EA271] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 transition cursor-pointer transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START WORK</span>
          </button>
        ) : (
          <>
            <button
              id="btn-start-break"
              onClick={onTakeBreak}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Coffee className="w-4 h-4" />
              <span>TAKE BREAK</span>
            </button>

            <button
              id="btn-end-day"
              onClick={onClockOut}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Square className="w-4 h-4 text-rose-400" />
              <span>CLOCK OUT</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
