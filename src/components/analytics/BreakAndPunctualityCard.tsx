import React from 'react';
import { BreakAnalyticsData, PunctualityAnalyticsData } from '../../types';
import { formatDurationHM } from '../../utils/formatters';
import { Coffee, Clock, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

interface BreakAndPunctualityCardProps {
  breakStats: BreakAnalyticsData;
  punctuality: PunctualityAnalyticsData;
}

export const BreakAndPunctualityCard: React.FC<BreakAndPunctualityCardProps> = ({
  breakStats,
  punctuality,
}) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-5">
      {/* 1. BREAK ANALYTICS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Break Session Patterns & Lunch Utilization
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
            AVG {breakStats.averageBreakMinutesPerWorkday}M / DAY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Total Break Time</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-1">
              {formatDurationHM(breakStats.totalBreakSeconds)}
            </div>
            <div className="text-[10px] text-slate-500">{breakStats.totalBreakHours}h total</div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Actual vs Configured Lunch</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {breakStats.averageActualLunchMinutes}m <span className="text-xs font-normal text-slate-400">/ {breakStats.configuredLunchMinutes}m</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Diff: <span className="text-amber-400">+{breakStats.lunchDifferenceMinutes}m</span> vs setup
            </div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Tea & Coffee Breaks</div>
            <div className="text-lg font-bold font-mono text-slate-300 mt-1">
              {formatDurationHM(breakStats.teaBreakSeconds)}
            </div>
            <div className="text-[10px] text-slate-500">Short intervals</div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Longest Single Break</div>
            <div className="text-lg font-bold font-mono text-slate-200 mt-1">
              {breakStats.longestBreakMinutes} min
            </div>
            <div className="text-[10px] text-slate-500">Peak duration</div>
          </div>
        </div>
      </div>

      {/* 2. PUNCTUALITY & ARRIVAL ANALYSIS */}
      <div className="pt-2 border-t border-[#1e293b] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Arrival, Departure & Punctuality Dynamics
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2 py-0.5 rounded border border-[#1e293b]">
            SCHEDULE: {punctuality.scheduledStartTime} - {punctuality.scheduledEndTime}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Late Arrivals Count</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {punctuality.lateArrivalsCount} Days
            </div>
            <div className="text-[10px] text-slate-500">After {punctuality.scheduledStartTime}</div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Average Late Arrival</div>
            <div className="text-lg font-bold font-mono text-slate-200 mt-1">
              +{punctuality.averageLateMinutes} min
            </div>
            <div className="text-[10px] text-slate-500">{punctuality.totalLateMinutes}m total late</div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Earliest Arrival</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {punctuality.earliestArrival}
            </div>
            <div className="text-[10px] text-slate-500">Latest: {punctuality.latestArrival}</div>
          </div>

          <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
            <div className="text-[11px] text-slate-400">Early Departures</div>
            <div className="text-lg font-bold font-mono text-slate-300 mt-1">
              {punctuality.earlyDeparturesCount} Days
            </div>
            <div className="text-[10px] text-slate-500">Before {punctuality.scheduledEndTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
