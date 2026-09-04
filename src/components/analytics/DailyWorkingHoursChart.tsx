import React, { useState } from 'react';
import { DailyWorkHourPoint } from '../../types';
import { Clock, Info, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { formatDurationHM } from '../../utils/formatters';

interface DailyWorkingHoursChartProps {
  dailyPoints: DailyWorkHourPoint[];
  onSelectDay?: (point: DailyWorkHourPoint) => void;
}

export const DailyWorkingHoursChart: React.FC<DailyWorkingHoursChartProps> = ({
  dailyPoints,
  onSelectDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyWorkHourPoint | null>(null);

  const maxHours = 12;
  const chartHeight = 160;
  const chartWidth = 600;
  const barWidth = 12;
  const slotWidth = chartWidth / Math.max(1, dailyPoints.length);

  const targetLineY = chartHeight - (8.0 / maxHours) * chartHeight;

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Daily Working Hours vs 8.0-Hour Baseline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active logged work per day with 8h scheduled benchmark. Click any workday bar to inspect detailed punch sessions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10B981]"></span>
            <span className="text-slate-300">Target Met (8.0h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#A855F7]"></span>
            <span className="text-slate-300">Surplus Work (&gt;8.0h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F59E0B]"></span>
            <span className="text-slate-300">Below Target (&lt;8.0h)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 overflow-x-auto">
        <div className="min-w-[580px]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} className="w-full h-44">
            {/* Grid & Reference Lines */}
            {[0, 4, 8, 12].map((h) => {
              const y = chartHeight - (h / maxHours) * chartHeight;
              const isTarget = h === 8;
              return (
                <g key={h}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={isTarget ? '#10B981' : '#1e293b'}
                    strokeDasharray={isTarget ? '4,4' : '2,2'}
                    strokeWidth={isTarget ? '1.5' : '1'}
                  />
                  <text
                    x="4"
                    y={y - 4}
                    fill={isTarget ? '#10B981' : '#475569'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight={isTarget ? 'bold' : 'normal'}
                  >
                    {h}h {isTarget ? '(Target Benchmark)' : ''}
                  </text>
                </g>
              );
            })}

            {/* Daily Bars */}
            {dailyPoints.map((pt, idx) => {
              const x = idx * slotWidth + (slotWidth - barWidth) / 2;
              const barHeight = (Math.min(maxHours, pt.activeHours) / maxHours) * chartHeight;
              const y = chartHeight - barHeight;

              let fillColor = '#334155'; // Not started / empty
              if (pt.activeHours > 8.0) fillColor = '#A855F7';
              else if (pt.activeHours >= 7.9) fillColor = '#10B981';
              else if (pt.activeHours > 0) fillColor = '#F59E0B';

              const isSelected = hoveredDay?.date === pt.date;

              return (
                <g
                  key={pt.date}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onMouseEnter={() => setHoveredDay(pt)}
                  onClick={() => onSelectDay && onSelectDay(pt)}
                >
                  {isSelected && (
                    <rect
                      x={idx * slotWidth}
                      y="0"
                      width={slotWidth}
                      height={chartHeight + 25}
                      fill="#1e293b"
                      opacity="0.4"
                      rx="3"
                    />
                  )}

                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(2, barHeight)}
                    fill={fillColor}
                    rx="2"
                  />

                  {/* Day number label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 15}
                    fill={pt.activeHours > 0 ? '#94A3B8' : '#475569'}
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {parseInt(pt.date.split('-')[2], 10)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Day Quick Inspector */}
      {hoveredDay && (
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200 font-mono">{hoveredDay.date} ({hoveredDay.dayOfWeek}):</span>
            <span className="text-cyan-300 font-mono">
              Active: {hoveredDay.activeHours}h ({formatDurationHM(hoveredDay.activeSeconds)})
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-300 font-mono">
              Daily Surplus: {hoveredDay.dailySurplusHours > 0 ? `+${hoveredDay.dailySurplusHours}h` : '0h'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono">
              Breaks: {formatDurationHM(hoveredDay.breakSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
              Status: {hoveredDay.status}
            </span>
            <button
              onClick={() => onSelectDay && onSelectDay(hoveredDay)}
              className="text-emerald-400 hover:underline text-[11px] font-medium"
            >
              View Full Details →
            </button>
          </div>
        </div>
      )}

      {/* Rule Notice */}
      <div className="bg-[#0a0e17] border border-purple-500/20 rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-purple-300">Monthly Threshold Rule Note: </span>
          <span>
            Under the active <strong>Monthly Threshold</strong> model, daily work in excess of 8.0h (shown in purple) accumulates into your monthly 208-hour required pool. Overtime compensation begins once total cumulative monthly active hours surpass the 208-hour threshold.
          </span>
        </div>
      </div>
    </div>
  );
};
