// ============================================================================
// SALARYPULSE — TODAY PROGRESS CARD
// Section 2: Today's Target, Circular Progress Ring, Remaining & Expected Finish
// ============================================================================

import React from 'react';
import { Target, Hourglass, CheckCircle2, Clock } from 'lucide-react';
import { formatSecondsToHMS, formatTimeDisplay } from '../../../utils/formatters';

interface TodayProgressCardProps {
  todayLiveActiveSeconds: number;
  requiredDailySeconds: number;
  todayRemainingActiveSeconds: number;
  expectedFinishTime: string;
  finishedAt?: string;
  isCurrentlyWorking?: boolean;
  isOnBreak?: boolean;
  isTargetCompleted?: boolean;
  isWorkdayConcluded?: boolean;
}

export const TodayProgressCard: React.FC<TodayProgressCardProps> = ({
  todayLiveActiveSeconds,
  requiredDailySeconds,
  todayRemainingActiveSeconds,
  expectedFinishTime,
  finishedAt,
  isCurrentlyWorking,
  isOnBreak,
  isTargetCompleted,
  isWorkdayConcluded,
}) => {
  const percentage = requiredDailySeconds > 0 
    ? Math.min(100, (todayLiveActiveSeconds / requiredDailySeconds) * 100) 
    : 0;

  // SVG Circular progress ring calculations
  // Radius = 40, Circumference = 2 * PI * 40 = 251.327
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      id="today-progress-card" 
      className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A3A3A3]">
            TODAY'S TARGET
          </span>
        </div>
        <span className="text-xs font-mono text-[#D4AF37] font-bold">
          {percentage.toFixed(2)}%
        </span>
      </div>

      {/* Main Content with Circular Progress Ring */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Left Stats */}
        <div className="space-y-3 flex-1 w-full text-left font-mono">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight tabular-nums">
              {formatSecondsToHMS(todayLiveActiveSeconds)} <span className="text-sm text-[#737373] font-normal">/ {formatSecondsToHMS(requiredDailySeconds)}</span>
            </div>
            <div className="text-[11px] text-[#737373] uppercase tracking-wider">
              Shift Target Accumulation
            </div>
          </div>

          {isWorkdayConcluded ? (
            <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <span className="text-[10px] text-[#10B981] font-mono uppercase font-bold tracking-wider block">
                    Shift Complete
                  </span>
                  <span className="text-xs text-white font-mono font-medium">
                    {finishedAt ? `Finished at ${formatTimeDisplay(finishedAt)}` : 'Workday concluded'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/30 shrink-0">
                LOCKED
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-[#161616] border border-[#222222]">
                <span className="text-[10px] text-[#737373] uppercase block font-semibold">Remaining</span>
                <span className="text-xs sm:text-sm font-bold text-[#3B82F6] tabular-nums">
                  {formatSecondsToHMS(todayRemainingActiveSeconds)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#161616] border border-[#222222]">
                <span className="text-[10px] text-[#737373] uppercase block font-semibold flex items-center gap-1">
                  {isTargetCompleted ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[#10B981]">Daily Target</span>
                    </>
                  ) : (
                    <>
                      <Hourglass className="w-3 h-3 text-[#D4AF37]" />
                      <span>Projected Finish</span>
                    </>
                  )}
                </span>
                <span className={`text-xs sm:text-sm font-bold tabular-nums ${
                  isTargetCompleted ? 'text-[#10B981]' : 'text-[#D4AF37]'
                }`}>
                  {isTargetCompleted 
                    ? 'Target Met (8h+)' 
                    : (expectedFinishTime && expectedFinishTime !== '--:--' && expectedFinishTime !== 'Target Completed' && expectedFinishTime !== 'Workday Concluded' ? expectedFinishTime : '--:--')
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Circular Progress Ring (Gold Progress, Dark Background) */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1C1C1C"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Gold Progress Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#D4AF37"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Centered Percentage Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
            <span className="text-base font-bold text-white tracking-tight">
              {percentage.toFixed(1)}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#737373]">
              DONE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
