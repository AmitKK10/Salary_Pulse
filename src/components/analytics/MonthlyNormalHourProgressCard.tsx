import React from 'react';
import { MonthlyNormalHourProgress } from '../../types';
import { formatDurationHM } from '../../utils/formatters';
import { Target, CheckCircle, Zap, Clock } from 'lucide-react';

interface MonthlyNormalHourProgressCardProps {
  progress: MonthlyNormalHourProgress;
}

export const MonthlyNormalHourProgressCard: React.FC<MonthlyNormalHourProgressCardProps> = ({
  progress,
}) => {
  const isComplete = progress.progressPercentage >= 100;

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Monthly 208-Hour Normal Target Pace
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
          {progress.month}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-medium">Monthly Active Progress:</span>
          <span className="font-mono font-bold text-white">
            {progress.eligibleHours}h / {progress.targetHours}h ({progress.progressPercentage}%)
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 bg-[#0a0e17] rounded-full border border-[#1e293b] overflow-hidden flex">
          {/* Normal hours filled */}
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, progress.progressPercentage)}%` }}
          />
          {/* Overtime overflow */}
          {progress.otHours > 0 && (
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 animate-pulse"
              style={{ width: `${Math.min(30, (progress.otHours / progress.targetHours) * 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Sub metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Eligible Normal Work</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {progress.eligibleHours}h
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {formatDurationHM(progress.eligibleSeconds)}
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-slate-400" />
            <span>Remaining to Threshold</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-200 mt-1">
            {progress.remainingNormalHours}h
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isComplete ? 'Target satisfied' : `${formatDurationHM(progress.remainingNormalSeconds)} needed`}
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Overtime Overflow</span>
          </div>
          <div className="text-lg font-bold font-mono text-purple-300 mt-1">
            {progress.otHours > 0 ? `+${progress.otHours}h` : '0.0h'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {progress.otHours > 0 ? 'Accruing at 2.0x rate' : 'Starts after 208:00h'}
          </div>
        </div>
      </div>
    </div>
  );
};
