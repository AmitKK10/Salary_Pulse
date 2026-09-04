// ============================================================================
// SALARYPULSE — WEEKLY & MONTHLY STATUS CARDS
// Section 4: THIS WEEK Card & Section 5: THIS MONTH Card
// ============================================================================

import React from 'react';
import { Calendar, BarChart3 } from 'lucide-react';
import { formatSecondsToHMS } from '../../../utils/formatters';

interface WeeklyMonthlyCardsProps {
  // Weekly metrics
  weekWorkedSeconds: number;
  weekTargetSeconds: number;
  weekRemainingSeconds: number;
  weekProgressPct: number;

  // Monthly metrics
  monthWorkedSeconds: number;
  monthTargetSeconds: number;
  monthRemainingSeconds: number;
  monthAttendanceRatio: string;
  monthBonusProgress: string;
}

export const WeeklyMonthlyCards: React.FC<WeeklyMonthlyCardsProps> = ({
  weekWorkedSeconds,
  weekTargetSeconds,
  weekRemainingSeconds,
  weekProgressPct,
  monthWorkedSeconds,
  monthTargetSeconds,
  monthRemainingSeconds,
  monthAttendanceRatio,
  monthBonusProgress,
}) => {
  const monthProgressPct = monthTargetSeconds > 0 
    ? Math.min(100, (monthWorkedSeconds / monthTargetSeconds) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* =====================================================================
          SECTION 4: THIS WEEK
          ===================================================================== */}
      <div 
        id="this-week-card" 
        className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4 font-mono"
      >
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              THIS WEEK
            </span>
          </div>
          <span className="text-xs font-bold text-[#10B981]">
            {weekProgressPct.toFixed(1)}%
          </span>
        </div>

        {/* Weekly Stats List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Worked:</span>
            <span className="font-bold text-white tabular-nums">
              {formatSecondsToHMS(weekWorkedSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Target:</span>
            <span className="font-semibold text-[#A3A3A3] tabular-nums">
              {formatSecondsToHMS(weekTargetSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Remaining:</span>
            <span className="font-bold text-[#3B82F6] tabular-nums">
              {formatSecondsToHMS(weekRemainingSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Progress:</span>
            <span className="font-bold text-[#10B981] tabular-nums">
              {weekProgressPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#1C1C1C] overflow-hidden">
          <div 
            className="h-full bg-[#10B981] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, weekProgressPct)}%` }}
          />
        </div>
      </div>

      {/* =====================================================================
          SECTION 5: THIS MONTH
          ===================================================================== */}
      <div 
        id="this-month-card" 
        className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4 font-mono"
      >
        <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              THIS MONTH
            </span>
          </div>
          <span className="text-xs font-bold text-[#D4AF37]">
            {monthProgressPct.toFixed(1)}%
          </span>
        </div>

        {/* Monthly Stats List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Worked:</span>
            <span className="font-bold text-white tabular-nums">
              {formatSecondsToHMS(monthWorkedSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Target:</span>
            <span className="font-semibold text-[#A3A3A3] tabular-nums">
              {formatSecondsToHMS(monthTargetSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Remaining:</span>
            <span className="font-bold text-[#3B82F6] tabular-nums">
              {formatSecondsToHMS(monthRemainingSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Attendance:</span>
            <span className="font-bold text-[#D4AF37] tabular-nums">
              {monthAttendanceRatio}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#737373]">Bonus Progress:</span>
            <span className="font-bold text-[#10B981] tabular-nums">
              {monthBonusProgress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#1C1C1C] overflow-hidden">
          <div 
            className="h-full bg-[#D4AF37] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, monthProgressPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
