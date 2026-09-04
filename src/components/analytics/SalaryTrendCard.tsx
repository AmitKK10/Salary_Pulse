import React from 'react';
import { SalaryTrendMetric } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Award, Calendar, DollarSign, Info } from 'lucide-react';

interface SalaryTrendCardProps {
  trend: SalaryTrendMetric;
}

export const SalaryTrendCard: React.FC<SalaryTrendCardProps> = ({ trend }) => {
  const isPositive = trend.changeAmount >= 0;

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Salary Trend & Velocity Analysis
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2 py-0.5 rounded border border-[#1e293b]">
          MoM COMPARATIVE
        </span>
      </div>

      {/* Grid of trend metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Month-over-Month Change */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Month-over-Month Velocity</div>
          <div className="flex items-baseline gap-2 my-1">
            <span
              className={`text-xl font-bold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(trend.changeAmount)}
            </span>
            <span
              className={`text-xs font-semibold ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({isPositive ? '+' : ''}
              {trend.changePercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {trend.previousPeriodLabel} → {trend.currentPeriodLabel}
          </div>
        </div>

        {/* 2. Average Monthly Actual Received */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Average Actual Received</div>
          <div className="text-xl font-bold font-mono text-amber-400 my-1">
            {formatCurrency(trend.averageMonthlyActualReceived)}
          </div>
          <div className="text-[11px] text-slate-500">
            Across verified historical payrolls
          </div>
        </div>

        {/* 3. Highest Earning Month */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Peak Earning Month</span>
            <Award className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white my-1">
            {formatCurrency(trend.highestEarningMonth.amount)}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {trend.highestEarningMonth.month}
          </div>
        </div>

        {/* 4. Lowest Earning Month */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Baseline Earning Month</span>
            <Calendar className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-300 my-1">
            {formatCurrency(trend.lowestEarningMonth.amount)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {trend.lowestEarningMonth.month}
          </div>
        </div>
      </div>

      {/* Precise Narrative Note */}
      <div className="bg-[#0a0e17] border border-slate-800 rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-400">Descriptive Trend Finding: </span>
          <span>{trend.narrative}</span>
        </div>
      </div>
    </div>
  );
};
