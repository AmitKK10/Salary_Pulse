import React from 'react';
import { OvertimeAnalyticsData } from '../../types';
import { formatCurrency, formatDurationHM } from '../../utils/formatters';
import { Zap, TrendingUp, DollarSign, Award, Info, Scale, Clock } from 'lucide-react';

interface OvertimeAnalyticsCardProps {
  otData: OvertimeAnalyticsData;
}

export const OvertimeAnalyticsCard: React.FC<OvertimeAnalyticsCardProps> = ({ otData }) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Overtime Accrual & Financial Contribution Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Overtime compensation dynamics, rate multipliers, and comparison between calculation models.
          </p>
        </div>
        <div className="text-[11px] font-mono text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded">
          {otData.otMultiplier}x MULTIPLIER
        </div>
      </div>

      {/* Top 4 KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Total OT Hours */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total OT Duration</div>
          <div className="text-xl font-bold font-mono text-purple-300 my-1">
            {otData.totalOTHours}h
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {formatDurationHM(otData.totalOTSeconds)}
          </div>
        </div>

        {/* 2. Overtime Earnings */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Overtime Earnings</div>
          <div className="text-xl font-bold font-mono text-emerald-400 my-1">
            {formatCurrency(otData.otEarnings)}
          </div>
          <div className="text-[10px] text-slate-500">
            @ {formatCurrency(otData.earningsPerOTHour)}/hour
          </div>
        </div>

        {/* 3. Highest OT Month */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Peak OT Month</div>
          <div className="text-xl font-bold font-mono text-white my-1">
            {otData.highestOTMonth.hours}h
          </div>
          <div className="text-[10px] text-purple-400">
            {otData.highestOTMonth.month} ({formatCurrency(otData.highestOTMonth.earnings)})
          </div>
        </div>

        {/* 4. Highest OT Single Day */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Peak OT Day</div>
          <div className="text-xl font-bold font-mono text-indigo-300 my-1">
            {otData.highestOTDay.hours}h
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {otData.highestOTDay.date}
          </div>
        </div>
      </div>

      {/* OT Contribution & Efficiency Metrics */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>Overtime Contribution & Rate Multipliers</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#121824] rounded-lg border border-[#1e293b]">
            <div className="text-slate-400">OT Hourly Rate vs Normal:</div>
            <div className="text-sm font-bold font-mono text-white mt-1">
              <span className="text-purple-300">{formatCurrency(otData.earningsPerOTHour)}/h</span>{' '}
              <span className="text-slate-500 font-normal">vs {formatCurrency(otData.normalHourlyRate)}/h normal</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {otData.otMultiplier}x Contractual overtime rate
            </div>
          </div>

          <div className="p-3 bg-[#121824] rounded-lg border border-[#1e293b]">
            <div className="text-slate-400">OT Share of Total Working Hours:</div>
            <div className="text-sm font-bold font-mono text-purple-400 mt-1">
              {otData.otPercentOfTotalHours}% of time
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Share of all active monthly clocked hours
            </div>
          </div>

          <div className="p-3 bg-[#121824] rounded-lg border border-[#1e293b]">
            <div className="text-slate-400">OT Contribution to Gross Salary:</div>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {otData.otPercentOfTotalEarnings}% of gross income
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Additional earnings generated via OT
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Matrix: Daily vs Monthly vs Official */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-sky-400" />
          <span>Calculation Model Comparison (Daily Threshold vs Monthly Pool vs HR Slip)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121824] text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-3 py-2">Calculation Model</th>
                <th className="px-3 py-2">Overtime Hours Recognized</th>
                <th className="px-3 py-2">Overtime Compensation</th>
                <th className="px-3 py-2">Policy Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b] font-mono">
              <tr className="hover:bg-[#1e293b]/30">
                <td className="px-3 py-2 font-semibold text-slate-200">
                  Monthly Threshold (Active)
                </td>
                <td className="px-3 py-2 text-purple-300 font-bold">
                  {otData.monthlyModel.hours}h
                </td>
                <td className="px-3 py-2 text-emerald-400 font-bold">
                  {formatCurrency(otData.monthlyModel.earnings)}
                </td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[11px]">
                  Accumulates beyond monthly 208h scheduled benchmark.
                </td>
              </tr>
              <tr className="hover:bg-[#1e293b]/30">
                <td className="px-3 py-2 font-semibold text-slate-200">
                  Daily Threshold Model
                </td>
                <td className="px-3 py-2 text-purple-300">
                  {otData.dailyModel.hours}h
                </td>
                <td className="px-3 py-2 text-emerald-400">
                  {formatCurrency(otData.dailyModel.earnings)}
                </td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[11px]">
                  Every minute beyond 8.0h in a single day is credited as daily OT.
                </td>
              </tr>
              <tr className="hover:bg-[#1e293b]/30">
                <td className="px-3 py-2 font-semibold text-sky-400">
                  Official HR Payroll Slip
                </td>
                <td className="px-3 py-2 text-sky-300">
                  {otData.officialModel.hours !== null ? `${otData.officialModel.hours}h` : 'NOT AVAILABLE'}
                </td>
                <td className="px-3 py-2 text-sky-300">
                  {otData.officialModel.earnings !== null ? formatCurrency(otData.officialModel.earnings) : 'NOT AVAILABLE'}
                </td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[11px]">
                  Recorded on official HR payslip statement.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
