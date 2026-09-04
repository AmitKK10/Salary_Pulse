import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { 
  TrendingUp, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight, 
  IndianRupee,
  Layers,
  Activity
} from 'lucide-react';
import { DailyEarningTrajectoryPoint } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DailyEarningTrajectoryChartProps {
  trajectoryPoints: DailyEarningTrajectoryPoint[];
  targetBaseSalary?: number;
  monthLabel?: string;
}

// Custom Tooltip Component for High-Precision Financial Data
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint: DailyEarningTrajectoryPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const actual = dataPoint.actualCumulative;
  const projected = dataPoint.projectedCumulative;
  const linear = dataPoint.scheduledLinearPace;
  const diff = actual !== null ? actual - linear : projected - linear;
  const isAhead = diff >= 0;

  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-3.5 shadow-2xl font-mono text-xs max-w-xs space-y-2.5 z-50 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
        <div className="flex items-center gap-1.5 text-slate-200 font-bold">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dataPoint.dayLabel || `Day ${dataPoint.dayNumber}`}</span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold ${
          dataPoint.isPastOrToday 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {dataPoint.isPastOrToday ? 'Logged / Accrued' : 'Projected Forecast'}
        </span>
      </div>

      {/* Metric Breakdown */}
      <div className="space-y-1.5 text-[11px]">
        {actual !== null ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              Actual Cumulative:
            </span>
            <span className="text-emerald-400 font-bold">{formatCurrency(actual)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]"></span>
              Forecast Cumulative:
            </span>
            <span className="text-purple-300 font-bold">{formatCurrency(projected)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#64748B]"></span>
            Linear Benchmark:
          </span>
          <span className="text-slate-300">{formatCurrency(linear)}</span>
        </div>

        {/* Pace Status */}
        <div className="pt-1.5 border-t border-[#1e293b] flex items-center justify-between">
          <span className="text-slate-400">Pace vs Target:</span>
          <span className={`font-bold flex items-center gap-1 ${isAhead ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isAhead ? '+' : ''}{formatCurrency(diff)}
            <span className="text-[9px] font-sans">({isAhead ? 'Ahead' : 'Behind'})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const DailyEarningTrajectoryChart: React.FC<DailyEarningTrajectoryChartProps> = ({
  trajectoryPoints,
  targetBaseSalary = 15000,
  monthLabel = 'Current Pay Period',
}) => {
  const [showLinearBenchmark, setShowLinearBenchmark] = useState(true);
  const [showProjectedTrajectory, setShowProjectedTrajectory] = useState(true);

  // Compute summary KPI values
  const summary = useMemo(() => {
    if (!trajectoryPoints || trajectoryPoints.length === 0) {
      return {
        currentEarned: 0,
        projectedMonthEnd: targetBaseSalary,
        targetSalary: targetBaseSalary,
        currentDay: 1,
        totalDays: 31,
        pacingDiff: 0,
        completionRate: 0,
      };
    }

    const pastPoints = trajectoryPoints.filter(p => p.actualCumulative !== null);
    const lastPastPoint = pastPoints[pastPoints.length - 1] || trajectoryPoints[0];
    const currentEarned = lastPastPoint?.actualCumulative || 0;
    const finalPoint = trajectoryPoints[trajectoryPoints.length - 1];
    const projectedMonthEnd = finalPoint?.projectedCumulative || targetBaseSalary;
    const linearPaceAtNow = lastPastPoint?.scheduledLinearPace || 0;
    const pacingDiff = currentEarned - linearPaceAtNow;
    const completionRate = Math.min(100, Math.round((currentEarned / (targetBaseSalary || 1)) * 100));

    return {
      currentEarned,
      projectedMonthEnd,
      targetSalary: targetBaseSalary,
      currentDay: lastPastPoint?.dayNumber || 1,
      totalDays: trajectoryPoints.length,
      pacingDiff,
      completionRate,
    };
  }, [trajectoryPoints, targetBaseSalary]);

  // Format dataset for Recharts to allow smooth continuous visualization
  const chartData = useMemo(() => {
    return trajectoryPoints.map((point) => ({
      ...point,
      // For display, format day label
      label: `Day ${point.dayNumber}`,
      // Actual earnings line value
      actual: point.actualCumulative,
      // Projected line value
      projected: point.projectedCumulative,
      // Linear scheduled pace benchmark
      linear: point.scheduledLinearPace,
      // Base salary target reference
      target: targetBaseSalary,
    }));
  }, [trajectoryPoints, targetBaseSalary]);

  // Calculate domain upper bound
  const maxVal = useMemo(() => {
    const highestVal = Math.max(
      targetBaseSalary * 1.2,
      ...trajectoryPoints.map(p => Math.max(p.actualCumulative || 0, p.projectedCumulative || 0, p.scheduledLinearPace || 0))
    );
    return Math.ceil(highestVal / 2000) * 2000;
  }, [trajectoryPoints, targetBaseSalary]);

  return (
    <div 
      id="daily-cumulative-salary-trajectory-card"
      className="bg-[#121824] border border-[#1e293b] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
    >
      {/* Card Header & KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Cumulative Salary Growth Trend
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Accrual
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pay period trajectory comparing actual accrued earnings vs projected pace & scheduled benchmark.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* Current Accrued */}
          <div className="bg-[#0a0e17] border border-[#1e293b] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Accrued to Date:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {formatCurrency(summary.currentEarned)}
              </span>
            </div>
          </div>

          {/* Forecasted End */}
          <div className="bg-[#0a0e17] border border-[#1e293b] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Projected Month-End:</span>
              <span className="text-purple-300 font-bold text-sm">
                {formatCurrency(summary.projectedMonthEnd)}
              </span>
            </div>
          </div>

          {/* Pacing Velocity */}
          <div className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 ${
            summary.pacingDiff >= 0 
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-950/20 border-amber-500/30 text-amber-400'
          }`}>
            <Activity className="w-3.5 h-3.5" />
            <div>
              <span className="text-[10px] opacity-80 block uppercase">Pace Velocity:</span>
              <span className="font-bold text-sm">
                {summary.pacingDiff >= 0 ? '+' : ''}{formatCurrency(summary.pacingDiff)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Series Toggles & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0a0e17] p-2.5 sm:p-3 rounded-xl border border-[#1e293b]">
        {/* Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono mr-1">Series:</span>
          
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] transition-all cursor-default"
          >
            <span className="w-2.5 h-1 bg-emerald-400 rounded-full"></span>
            <span>Actual Accrued</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProjectedTrajectory(!showProjectedTrajectory)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all cursor-pointer ${
              showProjectedTrajectory
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                : 'bg-[#121824] border-[#1e293b] text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-0.5 border-b-2 border-purple-400 border-dashed"></span>
            <span>Forecast Trajectory</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLinearBenchmark(!showLinearBenchmark)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all cursor-pointer ${
              showLinearBenchmark
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-[#121824] border-[#1e293b] text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="w-2.5 h-0.5 border-b-2 border-slate-400 border-dotted"></span>
            <span>Scheduled Benchmark</span>
          </button>
        </div>

        {/* Milestone Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Base Target: <strong className="text-white">{formatCurrency(targetBaseSalary)}</strong></span>
        </div>
      </div>

      {/* Recharts High-Definition Line Chart */}
      <div className="w-full h-72 sm:h-80 bg-[#0a0e17] border border-[#1e293b] rounded-xl p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
          >
            <defs>
              {/* Emerald Gradient for Actual Accrued Fill */}
              <linearGradient id="actualSalaryGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>

              {/* Purple Gradient for Projected Fill */}
              <linearGradient id="projectedSalaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Subtle Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            {/* X-Axis */}
            <XAxis
              dataKey="dayNumber"
              stroke="#475569"
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(day) => `D${day}`}
              interval="preserveStartEnd"
            />

            {/* Y-Axis */}
            <YAxis
              stroke="#475569"
              domain={[0, maxVal]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Monthly Base Salary Reference Line */}
            <ReferenceLine
              y={targetBaseSalary}
              stroke="#38BDF8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Target: ₹${(targetBaseSalary / 1000).toFixed(0)}k`,
                fill: '#38BDF8',
                fontSize: 10,
                position: 'insideTopRight',
                fontFamily: 'monospace',
              }}
            />

            {/* 1. Scheduled Linear Benchmark Line */}
            {showLinearBenchmark && (
              <Line
                type="monotone"
                dataKey="linear"
                name="Scheduled Benchmark"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            )}

            {/* 2. Projected Cumulative Growth (Dashed Purple Line & Area) */}
            {showProjectedTrajectory && (
              <Area
                type="monotone"
                dataKey="projected"
                name="Forecast Trajectory"
                stroke="#A855F7"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#projectedSalaryGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#A855F7', stroke: '#0f172a', strokeWidth: 2 }}
              />
            )}

            {/* 3. Actual Confirmed Cumulative Salary Line (Solid Emerald) */}
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Cumulative"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#actualSalaryGrowthGrad)"
              connectNulls={false}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload || payload.actual === null) return <React.Fragment key={props.key || Math.random()} />;
                
                // Highlight current day with prominent marker
                const isCurrent = payload.dayNumber === summary.currentDay;
                if (isCurrent) {
                  return (
                    <g key={props.key || 'current-day-dot'}>
                      <circle cx={cx} cy={cy} r={7} fill="#10B981" fillOpacity={0.3} className="animate-ping" />
                      <circle cx={cx} cy={cy} r={5} fill="#10B981" stroke="#0a0e17" strokeWidth={2} />
                    </g>
                  );
                }
                return null;
              }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Accrual Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
        <div className="bg-[#0a0e17] border border-[#1e293b] p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Current Progress:</span>
            <span className="text-white font-bold">{summary.completionRate}% of Monthly Base</span>
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Estimated Surplus:</span>
            <span className="text-purple-300 font-bold">
              {summary.projectedMonthEnd > targetBaseSalary 
                ? `+${formatCurrency(summary.projectedMonthEnd - targetBaseSalary)} (OT Projected)`
                : 'On Track with Base Target'}
            </span>
          </div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] p-3 rounded-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Period Progress:</span>
            <span className="text-white font-bold">{summary.currentDay} of {summary.totalDays} Days Tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
