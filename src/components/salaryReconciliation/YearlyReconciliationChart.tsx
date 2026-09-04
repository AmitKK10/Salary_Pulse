// ============================================================================
// SALARYPULSE — MULTI-MONTH RECONCILIATION TREND & HISTORY (STEP 7)
// Visual Recharts bar comparison of Accrued Net vs Official Slip vs Bank Credit
// ============================================================================

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  History, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';
import { YearlySalarySummaryItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface YearlyReconciliationChartProps {
  summaries: YearlySalarySummaryItem[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const YearlyReconciliationChart: React.FC<YearlyReconciliationChartProps> = ({
  summaries = [],
  selectedMonth,
  onSelectMonth,
}) => {
  const safeSummaries = summaries || [];
  const chartData = safeSummaries.map((s) => ({
    month: s.month,
    'Pulse Accrued': s.pulseNet,
    'Official Slip': s.officialNet,
    'Bank Credit': s.bankReceived,
    variance: s.variance,
  }));

  const totalPulseNet = safeSummaries.reduce((acc, curr) => acc + curr.pulseNet, 0);
  const totalOfficialNet = safeSummaries.reduce((acc, curr) => acc + curr.officialNet, 0);
  const totalBankNet = safeSummaries.reduce((acc, curr) => acc + (curr.bankReceived || 0), 0);
  const netCumulativeVariance = safeSummaries.reduce((acc, curr) => acc + (curr.variance || 0), 0);

  return (
    <div id="yearly-reconciliation-card" className="rounded-2xl bg-[#0E0E0E] border border-[#262626] p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Multi-Month Salary Reconciliation History
            </h3>
            <p className="text-xs text-[#737373]">
              Year-to-date tracking of verified biometric earnings vs company disbursements
            </p>
          </div>
        </div>

        {/* High-level YTD Cumulative Variance */}
        <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2 text-xs">
          <span className="text-[#A3A3A3]">YTD Net Variance:</span>
          <span className={`font-mono font-bold ${netCumulativeVariance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {netCumulativeVariance >= 0 ? '+' : ''}{formatCurrency(netCumulativeVariance)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="month" stroke="#737373" fontSize={11} tickLine={false} />
            <YAxis 
              stroke="#737373" 
              fontSize={11} 
              tickLine={false} 
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#141414',
                borderColor: '#333333',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
                fontFamily: 'monospace'
              }}
              formatter={(val: number) => [formatCurrency(val), '']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
            />
            <Bar dataKey="Pulse Accrued" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Official Slip" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Bank Credit" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month-by-Month Snapshot Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1F1F1F]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#141414] border-b border-[#262626] text-[#737373] uppercase tracking-wider font-mono text-[10px]">
              <th className="py-2.5 px-4">Month</th>
              <th className="py-2.5 px-4 text-right">Pulse Accrued</th>
              <th className="py-2.5 px-4 text-right">Official Slip</th>
              <th className="py-2.5 px-4 text-right">Bank Credit</th>
              <th className="py-2.5 px-4 text-right">Net Variance</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]">
            {safeSummaries.map((s) => {
              const isCurrent = s.month === selectedMonth;
              return (
                <tr 
                  key={s.month}
                  className={`transition ${
                    isCurrent ? 'bg-[#D4AF37]/10 font-medium' : 'hover:bg-[#141414]'
                  }`}
                >
                  <td className="py-2.5 px-4 font-mono text-white flex items-center gap-2">
                    <span>{s.month}</span>
                    {s.isLocked && <span title="Locked Snapshot"><Lock className="w-3 h-3 text-[#D4AF37]" /></span>}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right text-[#D4AF37]">
                    {formatCurrency(s.pulseNet)}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right text-white">
                    {formatCurrency(s.officialNet)}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right text-[#10B981]">
                    {formatCurrency(s.bankReceived || 0)}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold">
                    <span className={Math.abs(s.variance || 0) < 1 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                      {(s.variance || 0) >= 0 ? '+' : ''}{formatCurrency(s.variance || 0)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      s.status === 'LOCKED_FINAL' 
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                        : s.status === 'DISPUTE_RAISED'
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                          : s.status === 'RECONCILED_MATCH'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#737373]/15 text-[#A3A3A3]'
                    }`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => onSelectMonth(s.month)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded transition ${
                        isCurrent 
                          ? 'text-[#D4AF37] bg-[#D4AF37]/20 cursor-default' 
                          : 'text-[#3B82F6] hover:bg-[#3B82F6]/10'
                      }`}
                    >
                      {isCurrent ? 'Viewing' : 'Inspect'}
                    </button>
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
