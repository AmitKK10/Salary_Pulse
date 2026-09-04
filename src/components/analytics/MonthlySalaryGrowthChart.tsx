import React, { useState } from 'react';
import { MonthlySalaryGrowthPoint } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

interface MonthlySalaryGrowthChartProps {
  growthPoints: MonthlySalaryGrowthPoint[];
  onSelectMonth?: (monthKey: string) => void;
}

export const MonthlySalaryGrowthChart: React.FC<MonthlySalaryGrowthChartProps> = ({
  growthPoints,
  onSelectMonth,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<MonthlySalaryGrowthPoint | null>(null);

  // Determine scaling for SVG chart
  const maxVal = Math.max(
    22000,
    ...growthPoints.map((p) => Math.max(p.calculatedNet, p.officialNet || 0, p.actualReceived || 0))
  );

  const chartHeight = 180;
  const chartWidth = 500;
  const barGroupWidth = chartWidth / Math.max(1, growthPoints.length);

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Monthly Salary Growth & Three-Way Reconciliation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side comparison of SalaryPulse Calculated Net vs Official HR Payroll vs Confirmed Bank Receipt.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10B981]"></span>
            <span className="text-slate-300">Pulse Calculated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#38BDF8]"></span>
            <span className="text-slate-300">Official HR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F59E0B]"></span>
            <span className="text-slate-300">Bank Received</span>
          </div>
        </div>
      </div>

      {/* Responsive Visual Bar Chart (Pure SVG) */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 overflow-x-auto">
        <div className="min-w-[480px]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-48">
            {/* Grid lines */}
            {[0, 5000, 10000, 15000, 20000].map((level) => {
              const y = chartHeight - (level / maxVal) * chartHeight;
              return (
                <g key={level}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="2,2"
                    strokeWidth="1"
                  />
                  <text x="5" y={y - 4} fill="#475569" fontSize="9" fontFamily="monospace">
                    {formatCurrency(level)}
                  </text>
                </g>
              );
            })}

            {/* Bars & Points */}
            {growthPoints.map((pt, idx) => {
              const groupX = idx * barGroupWidth;
              const barWidth = 14;
              const centerOffset = (barGroupWidth - barWidth * 3 - 6) / 2;

              const calcHeight = (pt.calculatedNet / maxVal) * chartHeight;
              const calcY = chartHeight - calcHeight;

              const officialHeight = pt.officialNet ? (pt.officialNet / maxVal) * chartHeight : 0;
              const officialY = chartHeight - officialHeight;

              const bankHeight = pt.actualReceived ? (pt.actualReceived / maxVal) * chartHeight : 0;
              const bankY = chartHeight - bankHeight;

              const isSelected = hoveredPoint?.month === pt.month;

              return (
                <g
                  key={pt.month}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onClick={() => onSelectMonth && onSelectMonth(pt.month)}
                >
                  {/* Background highlight on hover */}
                  {isSelected && (
                    <rect
                      x={groupX + 2}
                      y="0"
                      width={barGroupWidth - 4}
                      height={chartHeight + 30}
                      fill="#1e293b"
                      opacity="0.4"
                      rx="4"
                    />
                  )}

                  {/* 1. Calculated Net Bar */}
                  <rect
                    x={groupX + centerOffset}
                    y={calcY}
                    width={barWidth}
                    height={calcHeight}
                    fill="#10B981"
                    rx="2"
                  />

                  {/* 2. Official Payroll Bar */}
                  {pt.officialNet !== null ? (
                    <rect
                      x={groupX + centerOffset + barWidth + 3}
                      y={officialY}
                      width={barWidth}
                      height={officialHeight}
                      fill="#38BDF8"
                      rx="2"
                    />
                  ) : (
                    <rect
                      x={groupX + centerOffset + barWidth + 3}
                      y={chartHeight - 4}
                      width={barWidth}
                      height={4}
                      fill="#334155"
                      rx="1"
                    />
                  )}

                  {/* 3. Bank Received Bar */}
                  {pt.actualReceived !== null ? (
                    <rect
                      x={groupX + centerOffset + (barWidth + 3) * 2}
                      y={bankY}
                      width={barWidth}
                      height={bankHeight}
                      fill="#F59E0B"
                      rx="2"
                    />
                  ) : (
                    <rect
                      x={groupX + centerOffset + (barWidth + 3) * 2}
                      y={chartHeight - 4}
                      width={barWidth}
                      height={4}
                      fill="#334155"
                      rx="1"
                    />
                  )}

                  {/* Discrepancy indicator dot */}
                  {pt.hasReconciliationDiff && (
                    <circle
                      cx={groupX + barGroupWidth / 2}
                      cy={Math.min(calcY, officialY, bankY) - 10}
                      r="3.5"
                      fill="#EF4444"
                    />
                  )}

                  {/* X-Axis Label */}
                  <text
                    x={groupX + barGroupWidth / 2}
                    y={chartHeight + 18}
                    fill={pt.isCurrentMonth ? '#10B981' : '#94A3B8'}
                    fontSize="10"
                    fontWeight={pt.isCurrentMonth ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {pt.monthLabel}
                  </text>
                  {pt.isCurrentMonth && (
                    <text
                      x={groupX + barGroupWidth / 2}
                      y={chartHeight + 28}
                      fill="#10B981"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      (Active)
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected/Hovered Point Inspection Box */}
      {hoveredPoint && (
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{hoveredPoint.monthLabel}:</span>
            <span className="text-emerald-400 font-mono">
              Pulse: {formatCurrency(hoveredPoint.calculatedNet)}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400 font-mono">
              HR Slip:{' '}
              {hoveredPoint.officialNet !== null
                ? formatCurrency(hoveredPoint.officialNet)
                : 'NOT AVAILABLE'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-mono">
              Bank Deposit:{' '}
              {hoveredPoint.actualReceived !== null
                ? formatCurrency(hoveredPoint.actualReceived)
                : 'PENDING'}
            </span>
          </div>

          {hoveredPoint.hasReconciliationDiff && (
            <div className="flex items-center gap-1.5 text-rose-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Variance: {formatCurrency(hoveredPoint.reconciliationVariance)}</span>
            </div>
          )}
        </div>
      )}

      {/* High-Precision Historical Reconciliation Table */}
      <div className="overflow-x-auto border border-[#1e293b] rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0a0e17] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1e293b]">
            <tr>
              <th className="px-3 py-2.5">Month Period</th>
              <th className="px-3 py-2.5">Base Pay</th>
              <th className="px-3 py-2.5">Overtime Pay</th>
              <th className="px-3 py-2.5">Bonus</th>
              <th className="px-3 py-2.5">Deductions</th>
              <th className="px-3 py-2.5 text-emerald-400">Pulse Net</th>
              <th className="px-3 py-2.5 text-sky-400">Official HR</th>
              <th className="px-3 py-2.5 text-amber-400">Bank Received</th>
              <th className="px-3 py-2.5">Variance</th>
              <th className="px-3 py-2.5 text-right">Reconciliation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/70 font-mono">
            {growthPoints.map((pt) => {
              return (
                <tr
                  key={pt.month}
                  onClick={() => onSelectMonth && onSelectMonth(pt.month)}
                  className={`hover:bg-[#1e293b]/40 cursor-pointer transition-colors ${
                    pt.isCurrentMonth ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>{pt.monthLabel}</span>
                    {pt.isCurrentMonth && (
                      <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 rounded">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{formatCurrency(pt.basePay)}</td>
                  <td className="px-3 py-2.5 text-purple-300">{formatCurrency(pt.otEarnings)}</td>
                  <td className="px-3 py-2.5 text-emerald-300">{formatCurrency(pt.bonus)}</td>
                  <td className="px-3 py-2.5 text-rose-400">{formatCurrency(pt.deductions)}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-400">
                    {formatCurrency(pt.calculatedNet)}
                  </td>
                  <td className="px-3 py-2.5 text-sky-300">
                    {pt.officialNet !== null ? formatCurrency(pt.officialNet) : <span className="text-slate-500">NO DATA</span>}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-amber-400">
                    {pt.actualReceived !== null ? formatCurrency(pt.actualReceived) : <span className="text-slate-500">PENDING</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {pt.hasReconciliationDiff ? (
                      <span className="text-rose-400 font-bold">
                        {pt.reconciliationVariance > 0 ? '+' : ''}
                        {formatCurrency(pt.reconciliationVariance)}
                      </span>
                    ) : (
                      <span className="text-emerald-400">₹0.00</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                        pt.status === 'RECONCILED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : pt.status === 'DISPUTED_WITH_HR'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : pt.status === 'EXPLAINED_VARIANCE'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pt.status === 'RECONCILED' && <CheckCircle className="w-2.5 h-2.5" />}
                      {pt.status === 'DISPUTED_WITH_HR' && <AlertCircle className="w-2.5 h-2.5" />}
                      <span>{pt.status.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
