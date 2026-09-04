import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { MonthlyProjectionResult, DayCalculationDetails } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PredictionAnalyticsChartsProps {
  projection: MonthlyProjectionResult;
  monthlyDaysDetails?: DayCalculationDetails[];
  selectedMonth: string;
}

export const PredictionAnalyticsCharts: React.FC<PredictionAnalyticsChartsProps> = ({
  projection,
  monthlyDaysDetails,
  selectedMonth,
}) => {
  const days = (monthlyDaysDetails && monthlyDaysDetails.length > 0) 
    ? monthlyDaysDetails 
    : (projection?.days || []);

  // Build cumulative chart dataset
  let runningCumulativeActual = 0;
  let runningCumulativeProjected = 0;

  const trajectoryData = (days || []).map((day) => {
    const dayNum = new Date(`${day.date}T12:00:00Z`).getUTCDate();
    const isPast = day.date < '2026-08-15';
    const isToday = day.date === '2026-08-15';
    const dailyEarning = (day.totalDailyEarned ?? (day as any).earnedSalary) || (day.projectedDailyEarned || 0);

    if (isPast) {
      runningCumulativeActual += dailyEarning;
      runningCumulativeProjected = runningCumulativeActual;
    } else if (isToday) {
      runningCumulativeActual += dailyEarning;
      runningCumulativeProjected = runningCumulativeActual;
    } else {
      runningCumulativeProjected += dailyEarning;
    }

    return {
      date: `Aug ${dayNum}`,
      fullDate: day.date,
      actualCumulative: isPast || isToday ? Math.round(runningCumulativeActual) : null,
      projectedCumulative: Math.round(runningCumulativeProjected),
      dailyEarned: Math.round(dailyEarning),
      workHours: Number((((day.actualActiveSeconds ?? (day as any).activeSeconds) || 0) / 3600).toFixed(1)),
      type: isPast ? 'PAST' : isToday ? 'TODAY' : 'FUTURE',
    };
  });

  return (
    <div id="prediction-analytics-charts" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chart 1: Cumulative Trajectory (7 cols) */}
      <div className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="text-sm font-bold text-white font-serif-display">
              Cumulative Salary Trajectory (Actual vs Projected)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#888888]">{selectedMonth}</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis 
                dataKey="date" 
                stroke="#666666" 
                tick={{ fill: '#737373', fontSize: 10 }}
                interval={4}
              />
              <YAxis 
                stroke="#666666" 
                tick={{ fill: '#737373', fontSize: 10 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', borderColor: '#2B2B2B', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`₹${val.toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="projectedCumulative" 
                name="Projected Trajectory" 
                stroke="#D4AF37" 
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#projectedGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="actualCumulative" 
                name="Confirmed Actual" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="url(#actualGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Hours Distribution (5 cols) */}
      <div className="lg:col-span-5 bg-[#121212] border border-[#222222] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white font-serif-display">
              Daily Active Hours Sequence
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#888888]">Target: 8h/day</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis 
                dataKey="date" 
                stroke="#666666" 
                tick={{ fill: '#737373', fontSize: 10 }}
                interval={5}
              />
              <YAxis 
                stroke="#666666" 
                tick={{ fill: '#737373', fontSize: 10 }}
                domain={[0, 14]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', borderColor: '#2B2B2B', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`${val} hrs`, 'Work Duration']}
              />
              <ReferenceLine y={8} stroke="#D4AF37" strokeDasharray="3 3" label={{ value: '8h Target', fill: '#D4AF37', fontSize: 9 }} />
              <Bar 
                dataKey="workHours" 
                fill="#10B981" 
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
