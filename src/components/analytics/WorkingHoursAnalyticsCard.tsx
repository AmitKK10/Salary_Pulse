import React from 'react';
import { PeriodCoreKPIs } from '../../types';
import { formatDurationHM } from '../../utils/formatters';
import { Clock, Building2, Coffee, Zap, BarChart2 } from 'lucide-react';

interface WorkingHoursAnalyticsCardProps {
  kpis: PeriodCoreKPIs;
  timeframeLabel: string;
}

export const WorkingHoursAnalyticsCard: React.FC<WorkingHoursAnalyticsCardProps> = ({
  kpis,
  timeframeLabel,
}) => {
  const activeHoursStr = formatDurationHM(kpis.totalActiveSeconds);
  const officeSpanStr = formatDurationHM(kpis.totalOfficeSpanSeconds);
  const breakStr = formatDurationHM(kpis.totalBreakSeconds);

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Work Time Allocation & Span Breakdown
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
          TIME COMPOSITION
        </span>
      </div>

      {/* Grid of time breakdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Active Working Hours */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Productive Work</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 my-1">
            {activeHoursStr}
          </div>
          <div className="text-[11px] text-slate-500">
            Sum of all active clocked work sessions
          </div>
        </div>

        {/* 2. Total Office Span */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Office Span</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 my-1">
            {officeSpanStr}
          </div>
          <div className="text-[11px] text-slate-500">
            First punch-in to last punch-out
          </div>
        </div>

        {/* 3. Total Break Time */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Break Time</span>
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 my-1">
            {breakStr}
          </div>
          <div className="text-[11px] text-slate-500">
            Avg {kpis.averageBreakDurationMinutes} min / logged workday
          </div>
        </div>

        {/* 4. Overtime Work */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Overtime Duration</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300 my-1">
            {formatDurationHM(kpis.totalOTSeconds)}
          </div>
          <div className="text-[11px] text-slate-500">
            {kpis.totalOTHours}h total recognized OT
          </div>
        </div>
      </div>

      {/* Extremes footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Peak Single Workday: </span>
            <strong className="text-slate-200 font-mono">{kpis.longestWorkDayDate || 'N/A'}</strong>
          </div>
          <span className="font-mono text-emerald-400 font-bold">
            {formatDurationHM(kpis.longestWorkDaySeconds)}
          </span>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Shortest Active Workday: </span>
            <strong className="text-slate-200 font-mono">{kpis.shortestWorkDayDate || 'N/A'}</strong>
          </div>
          <span className="font-mono text-amber-400 font-bold">
            {formatDurationHM(kpis.shortestWorkDaySeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
