import React from 'react';
import { ProjectionAccuracyItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Target, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface ProjectionAccuracyCardProps {
  accuracyItems: ProjectionAccuracyItem[];
}

export const ProjectionAccuracyCard: React.FC<ProjectionAccuracyCardProps> = ({
  accuracyItems,
}) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Salary Projection Accuracy & Realization
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates historical projection forecasts against finalized bank receipts for completed months.
          </p>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2.5 py-1 rounded border border-[#1e293b]">
          COMPLETED MONTHS ONLY
        </div>
      </div>

      {/* Grid of completed month accuracy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accuracyItems.map((item) => {
          return (
            <div
              key={item.month}
              className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200 font-mono">
                  {item.monthLabel}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.accuracyPercentage}% Accuracy
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Early Month Projection:</span>
                  <span className="text-slate-200">{formatCurrency(item.projected)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Final Verified Take-Home:</span>
                  <span className="text-amber-400 font-bold">{formatCurrency(item.actual)}</span>
                </div>
                <div className="flex justify-between border-t border-[#1e293b] pt-1.5 text-slate-400">
                  <span>Difference (Statutory / OT):</span>
                  <span className="text-rose-400 font-bold">
                    {item.difference > 0 ? '+' : ''}
                    {formatCurrency(item.difference)}
                  </span>
                </div>
              </div>

              <div className="w-full h-2 bg-[#121824] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, item.accuracyPercentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
