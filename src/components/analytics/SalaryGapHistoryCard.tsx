import React from 'react';
import { SalaryGapHistoryItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ShieldAlert, AlertCircle, CheckCircle, Scale, ArrowRight } from 'lucide-react';

interface SalaryGapHistoryCardProps {
  history: SalaryGapHistoryItem[];
  onInspectDispute?: (monthKey: string) => void;
}

export const SalaryGapHistoryCard: React.FC<SalaryGapHistoryCardProps> = ({
  history,
  onInspectDispute,
}) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Salary Gap & Forensic Variance History
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical discrepancies between SalaryPulse calculation and official bank credits, itemized by root driver.
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2.5 py-1 rounded border border-[#1e293b]">
          AUDIT TRAIL
        </div>
      </div>

      {/* Month-by-month gap cards */}
      <div className="space-y-3">
        {history.map((item) => {
          const hasVariance = item.variance !== null && Math.abs(item.variance) >= 1.0;
          const isPositive = (item.variance || 0) >= 0;

          return (
            <div
              key={item.month}
              className={`bg-[#0a0e17] border rounded-lg p-3.5 transition-all ${
                hasVariance ? 'border-rose-500/30' : 'border-[#1e293b]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-200 font-mono">
                    {item.monthLabel}
                  </span>
                  {hasVariance ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Variance: {isPositive ? '+' : ''}
                      {formatCurrency(item.variance!)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Fully Reconciled (₹0.00 Variance)
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span>Pulse: {formatCurrency(item.calculated)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-400">
                    Bank: {item.actualReceived !== null ? formatCurrency(item.actualReceived) : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Itemized Drivers Breakdown */}
              {hasVariance && (
                <div className="mt-3 pt-2.5 border-t border-[#1e293b] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-[#121824] rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-400 block">OT Rate Variance:</span>
                    <span className="font-mono font-semibold text-purple-300">
                      {item.breakdown.ot !== 0 ? formatCurrency(item.breakdown.ot) : '₹0.00'}
                    </span>
                  </div>

                  <div className="p-2 bg-[#121824] rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-400 block">Bonus Difference:</span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {item.breakdown.bonus !== 0 ? formatCurrency(item.breakdown.bonus) : '₹0.00'}
                    </span>
                  </div>

                  <div className="p-2 bg-[#121824] rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-400 block">Statutory / Deductions:</span>
                    <span className="font-mono font-semibold text-rose-400">
                      {item.breakdown.deductions !== 0 ? formatCurrency(item.breakdown.deductions) : '₹0.00'}
                    </span>
                  </div>

                  <div className="p-2 bg-[#121824] rounded border border-[#1e293b]">
                    <span className="text-[10px] text-slate-400 block">Unexplained Gap:</span>
                    <span className="font-mono font-semibold text-amber-400">
                      {item.breakdown.unexplained !== 0 ? formatCurrency(item.breakdown.unexplained) : '₹0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
