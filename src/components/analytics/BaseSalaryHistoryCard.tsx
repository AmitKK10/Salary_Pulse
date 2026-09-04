import React from 'react';
import { BaseSalaryHistoryItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, DollarSign, ArrowRight, ShieldCheck } from 'lucide-react';

interface BaseSalaryHistoryCardProps {
  history: BaseSalaryHistoryItem[];
}

export const BaseSalaryHistoryCard: React.FC<BaseSalaryHistoryCardProps> = ({ history }) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Contracted Base Salary History & Increments
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tracks formal contractual base salary adjustments by effective date. Distinguishes base wage changes from variable overtime / take-home fluctuations.
          </p>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
          CONTRACTUAL BASE
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l-2 border-[#1e293b] ml-3 pl-4 space-y-4 my-2">
        {history.map((item) => {
          return (
            <div key={item.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 ${
                  item.isCurrent
                    ? 'bg-emerald-500 border-[#121824] ring-4 ring-emerald-500/20'
                    : 'bg-slate-700 border-[#121824]'
                }`}
              />

              <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Effective: {item.effectiveFrom}
                    </span>
                    {item.isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                        Active Base
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <span className="text-xs text-slate-400">Monthly Base:</span>
                  <span className="text-base font-bold font-mono text-white">
                    {formatCurrency(item.monthlyBaseSalary)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next scheduled increment effective from: <strong className="text-slate-200">01-Sep-2026</strong></span>
        </span>
        <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(18000)}/month</span>
      </div>
    </div>
  );
};
