import React, { useState } from 'react';
import { DeterministicMonthlySummary } from '../../types';
import { FileText, Copy, Check, X, Printer, Award, Clock, DollarSign } from 'lucide-react';

interface MonthlySummaryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DeterministicMonthlySummary;
}

export const MonthlySummaryGeneratorModal: React.FC<MonthlySummaryGeneratorModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullTextToCopy = `SALARYPULSE MONTHLY PERFORMANCE & COMPENSATION STATEMENT
Period: ${summary.monthLabel}
------------------------------------------------------------
- Attendance: ${summary.attendanceDaysFraction} Scheduled Days
- Active Work Hours: ${summary.activeWorkHoursFormatted}
- Overtime Logged: ${summary.otHoursFormatted}
- Base Work Pay: ${summary.normalEarningsFormatted}
- Overtime Earnings: ${summary.otEarningsFormatted}
- Attendance Bonus: ${summary.bonusFormatted}
- Deductions: ${summary.deductionsFormatted}
------------------------------------------------------------
Pulse Calculated Net: ${summary.calculatedNetFormatted}
Actual Bank Received: ${summary.actualReceivedFormatted}
Reconciliation Variance: ${summary.varianceFormatted}

Forensic Narrative:
${summary.narrativeText}

Itemized Key Insights:
${summary.bulletInsights.map((b) => `• ${b}`).join('\n')}
------------------------------------------------------------
Generated deterministically by SalaryPulse Analytics Engine.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121824] border border-[#1e293b] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Monthly Performance & Salary Statement
              </h3>
              <p className="text-xs text-slate-400">{summary.monthLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Box */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Executive Summary
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {summary.narrativeText}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded">
            <span className="text-[10px] text-slate-500 block">Attendance:</span>
            <span className="text-slate-200 font-bold">{summary.attendanceDaysFraction}</span>
          </div>
          <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded">
            <span className="text-[10px] text-slate-500 block">Active Work:</span>
            <span className="text-cyan-300 font-bold">{summary.activeWorkHoursFormatted}</span>
          </div>
          <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded">
            <span className="text-[10px] text-slate-500 block">Overtime Pay:</span>
            <span className="text-purple-300 font-bold">{summary.otEarningsFormatted}</span>
          </div>
          <div className="p-2.5 bg-[#0a0e17] border border-[#1e293b] rounded">
            <span className="text-[10px] text-slate-500 block">Pulse Net Pay:</span>
            <span className="text-emerald-400 font-bold">{summary.calculatedNetFormatted}</span>
          </div>
        </div>

        {/* Bullet points */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Key Deterministic Findings
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {summary.bulletInsights.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] hover:bg-[#283548] text-slate-300 text-xs font-medium rounded-lg transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Statement</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Full Statement'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
