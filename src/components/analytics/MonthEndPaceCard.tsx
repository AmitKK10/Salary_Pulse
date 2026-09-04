import React from 'react';
import { MonthEndPaceData } from '../../types';
import { Clock, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface MonthEndPaceCardProps {
  pace: MonthEndPaceData;
}

export const MonthEndPaceCard: React.FC<MonthEndPaceCardProps> = ({ pace }) => {
  const getPaceBadge = () => {
    switch (pace.paceStatus) {
      case 'AHEAD':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          label: 'AHEAD OF SCHEDULE',
          icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'ON_TRACK':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          label: 'ON TRACK (OPTIMAL)',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'BEHIND':
      default:
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          label: 'BEHIND SCHEDULE',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  const badge = getPaceBadge();

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Running Month Work Pace & Projected Total
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pacing velocity across {pace.daysElapsed} days elapsed ({pace.scheduledDaysElapsed} scheduled days).
          </p>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold border ${badge.bg}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Hours Logged So Far</div>
          <div className="text-xl font-bold font-mono text-cyan-300 my-1">
            {pace.hoursWorked}h
          </div>
          <div className="text-[10px] text-slate-500">Across elapsed days</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Expected Pace Target</div>
          <div className="text-xl font-bold font-mono text-slate-200 my-1">
            {pace.expectedHoursAtCurrentPace}h
          </div>
          <div className="text-[10px] text-slate-500">
            {pace.scheduledDaysElapsed} days @ 8.0h/day
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Pace Variance</div>
          <div
            className={`text-xl font-bold font-mono my-1 ${
              pace.paceDifferenceHours >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {pace.paceDifferenceHours >= 0 ? '+' : ''}
            {pace.paceDifferenceHours}h
          </div>
          <div className="text-[10px] text-slate-500">
            {pace.paceDifferenceHours >= 0 ? 'Surplus buffer accrued' : 'Hours below target'}
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Projected Month-End</div>
          <div className="text-xl font-bold font-mono text-white my-1">
            {pace.projectedMonthEndHours}h
          </div>
          <div className="text-[10px] text-emerald-400">
            vs {pace.targetMonthHours}h benchmark
          </div>
        </div>
      </div>
    </div>
  );
};
