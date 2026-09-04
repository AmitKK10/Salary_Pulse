import React, { useState } from 'react';
import { FinancialYearData, YearlyDashboardData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, DollarSign, Clock, ShieldCheck, FileText, Info } from 'lucide-react';

interface YearlyAndFinancialYearDashboardProps {
  yearlyData: YearlyDashboardData;
  financialYearData: FinancialYearData;
}

export const YearlyAndFinancialYearDashboard: React.FC<YearlyAndFinancialYearDashboardProps> = ({
  yearlyData,
  financialYearData,
}) => {
  const [viewMode, setViewMode] = useState<'calendar_year' | 'financial_year'>('financial_year');

  const activeData = viewMode === 'financial_year' ? financialYearData : yearlyData;
  const label = viewMode === 'financial_year' ? financialYearData.fyLabel : `Calendar Year ${yearlyData.year}`;

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Annual & Indian Financial Year Aggregation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            12-month fiscal consolidation. Missing historical periods are explicitly rendered as <span className="font-mono text-slate-300">NO DATA</span> rather than zero income.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
          <button
            id="analytics-fy-mode-btn"
            onClick={() => setViewMode('financial_year')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all ${
              viewMode === 'financial_year'
                ? 'bg-[#10B981] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {financialYearData.fyLabel} (Apr–Mar)
          </button>
          <button
            id="analytics-cy-mode-btn"
            onClick={() => setViewMode('calendar_year')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all ${
              viewMode === 'calendar_year'
                ? 'bg-[#10B981] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Year {yearlyData.year} (Jan–Dec)
          </button>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Actual Received</div>
          <div className="text-xl font-bold font-mono text-amber-400 my-1">
            {formatCurrency(activeData.totalActualReceived)}
          </div>
          <div className="text-[10px] text-slate-500">Bank verified take-home</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Calculated Gross</div>
          <div className="text-xl font-bold font-mono text-emerald-400 my-1">
            {formatCurrency('totalCalculated' in activeData ? activeData.totalCalculated : activeData.totalCalculatedSalary)}
          </div>
          <div className="text-[10px] text-slate-500">Pulse compensation sum</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Overtime Pay</div>
          <div className="text-xl font-bold font-mono text-purple-300 my-1">
            {formatCurrency(activeData.totalOT)}
          </div>
          <div className="text-[10px] text-slate-500">Overtime component</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Working Hours</div>
          <div className="text-xl font-bold font-mono text-cyan-300 my-1">
            {activeData.totalWorkingHours}h
          </div>
          <div className="text-[10px] text-slate-500">Productive time logged</div>
        </div>
      </div>

      {/* 12-Month Table */}
      <div className="overflow-x-auto border border-[#1e293b] rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#0a0e17] text-slate-400 uppercase font-mono text-[10px] border-b border-[#1e293b]">
            <tr>
              <th className="px-3 py-2.5">Month</th>
              <th className="px-3 py-2.5 text-emerald-400">Calculated Net</th>
              <th className="px-3 py-2.5 text-sky-400">Official HR</th>
              <th className="px-3 py-2.5 text-amber-400">Bank Received</th>
              <th className="px-3 py-2.5">Overtime</th>
              <th className="px-3 py-2.5">Bonus</th>
              <th className="px-3 py-2.5">Deductions</th>
              <th className="px-3 py-2.5">Work Hours</th>
              <th className="px-3 py-2.5 text-right">Data Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] font-mono">
            {activeData.months.map((m) => {
              return (
                <tr key={m.monthKey} className="hover:bg-[#1e293b]/40 transition-colors">
                  <td className="px-3 py-2 font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>{m.monthName}</span>
                    <span className="text-[10px] text-slate-500 font-normal font-sans">({m.monthKey})</span>
                  </td>
                  <td className="px-3 py-2 text-emerald-400 font-bold">
                    {m.hasData && m.calculated !== null ? formatCurrency(m.calculated) : <span className="text-slate-500">NO DATA</span>}
                  </td>
                  <td className="px-3 py-2 text-sky-300">
                    {m.hasData && m.official !== null ? formatCurrency(m.official) : <span className="text-slate-500">NO DATA</span>}
                  </td>
                  <td className="px-3 py-2 text-amber-400 font-semibold">
                    {m.hasData && m.actualReceived !== null ? formatCurrency(m.actualReceived) : <span className="text-slate-500">NO DATA</span>}
                  </td>
                  <td className="px-3 py-2 text-purple-300">
                    {m.hasData && m.ot !== null ? formatCurrency(m.ot) : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="px-3 py-2 text-emerald-300">
                    {m.hasData && m.bonus !== null ? formatCurrency(m.bonus) : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="px-3 py-2 text-rose-400">
                    {m.hasData && m.deductions !== null ? formatCurrency(m.deductions) : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="px-3 py-2 text-cyan-300">
                    {m.hasData && m.workingHours !== null ? `${m.workingHours}h` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {m.hasData ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AUDITED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-500">
                        NO DATA
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legal & Taxation Disclaimer */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Statutory & Taxation Disclaimer: </span>
          <span>
            Aggregations are calculated from internal attendance logs and reconciled payroll slips for personal salary tracking. This report does not constitute certified taxation, legal, or investment advice.
          </span>
        </div>
      </div>
    </div>
  );
};
