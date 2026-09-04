import React from 'react';
import { PayrollReconciliationStats } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ShieldCheck, AlertCircle, CheckCircle2, DollarSign, FileText } from 'lucide-react';

interface PayrollReconciliationStatsCardProps {
  stats: PayrollReconciliationStats;
}

export const PayrollReconciliationStatsCard: React.FC<PayrollReconciliationStatsCardProps> = ({
  stats,
}) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Payroll Reconciliation Audit Summary
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2 py-0.5 rounded border border-[#1e293b]">
          AUDIT PORTFOLIO
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Months Reconciled */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Audited Months</div>
          <div className="text-xl font-bold font-mono text-white my-1">
            {stats.monthsReconciled} Months
          </div>
          <div className="text-[10px] text-slate-500">Historical snapshots logged</div>
        </div>

        {/* 2. Months with Discrepancies */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Variances Detected</div>
          <div className="text-xl font-bold font-mono text-amber-400 my-1">
            {stats.monthsWithDifferences} Months
          </div>
          <div className="text-[10px] text-slate-500">Subject to forensic breakdown</div>
        </div>

        {/* 3. Total Pulse Calculated Net */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Pulse Calculated</div>
          <div className="text-xl font-bold font-mono text-emerald-400 my-1">
            {formatCurrency(stats.totalCalculated)}
          </div>
          <div className="text-[10px] text-slate-500">Authoritative baseline</div>
        </div>

        {/* 4. Total Actual Received */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Actual Received</div>
          <div className="text-xl font-bold font-mono text-amber-400 my-1">
            {formatCurrency(stats.totalActualReceived)}
          </div>
          <div className="text-[10px] text-slate-500">Bank & slip confirmed</div>
        </div>
      </div>

      {/* Adjustments & Missing Months Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-xs flex items-center justify-between">
          <span className="text-slate-400">Total Known Adjustments (OT, Bonus, PF/PT):</span>
          <span className="font-mono text-slate-200 font-bold">
            {formatCurrency(stats.totalKnownAdjustments)}
          </span>
        </div>

        <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-xs flex items-center justify-between">
          <span className="text-slate-400">Unexplained Residual Variance:</span>
          <span className="font-mono text-emerald-400 font-bold">
            {formatCurrency(stats.totalUnexplainedDifference)}
          </span>
        </div>
      </div>
    </div>
  );
};
