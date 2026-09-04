// ============================================================================
// SALARYPULSE — WORK STATUS GRID
// Section 3: 4 Compact KPI Cards (WORKED, REMAINING, BREAK, TODAY OT)
// All durations formatted strictly as HH:MM:SS
// ============================================================================

import React from 'react';
import { Clock, Hourglass, Coffee, Zap } from 'lucide-react';
import { formatSecondsToHMS } from '../../../utils/formatters';

interface WorkStatusGridProps {
  workedSeconds: number;
  remainingSeconds: number;
  breakSeconds: number;
  overtimeSeconds: number;
}

export const WorkStatusGrid: React.FC<WorkStatusGridProps> = ({
  workedSeconds,
  remainingSeconds,
  breakSeconds,
  overtimeSeconds,
}) => {
  return (
    <div 
      id="work-status-grid" 
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {/* 1. WORKED */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#121212] border border-[#222222] shadow-md space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#A3A3A3]">
            WORKED
          </span>
          <Clock className="w-3.5 h-3.5 text-[#10B981]" />
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-white tracking-tight tabular-nums">
          {formatSecondsToHMS(workedSeconds)}
        </div>
      </div>

      {/* 2. REMAINING */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#121212] border border-[#222222] shadow-md space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#A3A3A3]">
            REMAINING
          </span>
          <Hourglass className="w-3.5 h-3.5 text-[#3B82F6]" />
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-[#3B82F6] tracking-tight tabular-nums">
          {formatSecondsToHMS(remainingSeconds)}
        </div>
      </div>

      {/* 3. BREAK */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#121212] border border-[#222222] shadow-md space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#A3A3A3]">
            BREAK
          </span>
          <Coffee className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-[#D4AF37] tracking-tight tabular-nums">
          {formatSecondsToHMS(breakSeconds)}
        </div>
      </div>

      {/* 4. TODAY OT */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#121212] border border-[#222222] shadow-md space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#A3A3A3]">
            TODAY OT
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-amber-400 tracking-tight tabular-nums">
          {formatSecondsToHMS(overtimeSeconds)}
        </div>
      </div>
    </div>
  );
};
