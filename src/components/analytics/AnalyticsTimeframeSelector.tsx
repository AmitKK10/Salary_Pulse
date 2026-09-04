import React from 'react';
import { AnalyticsSectionTab, AnalyticsTimeframe } from '../../types';
import { Calendar, Layers, Clock, TrendingUp, DollarSign, Award, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

interface AnalyticsTimeframeSelectorProps {
  activeTimeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
  activeTab: AnalyticsSectionTab;
  onTabChange: (tab: AnalyticsSectionTab) => void;
  dateRangeLabel: string;
  customStartDate?: string;
  customEndDate?: string;
  onCustomStartChange?: (date: string) => void;
  onCustomEndChange?: (date: string) => void;
  onOpenSummaryModal: () => void;
}

export const AnalyticsTimeframeSelector: React.FC<AnalyticsTimeframeSelectorProps> = ({
  activeTimeframe,
  onTimeframeChange,
  activeTab,
  onTabChange,
  dateRangeLabel,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
  onOpenSummaryModal,
}) => {
  const timeframeOptions: { id: AnalyticsTimeframe; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_year', label: 'Year 2026' },
    { id: 'financial_year', label: 'FY 2026–27' },
    { id: 'lifetime', label: 'Lifetime' },
    { id: 'custom_range', label: 'Custom Range' },
  ];

  const sectionTabs: { id: AnalyticsSectionTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview & KPIs', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'salary', label: 'Salary Growth & Trends', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'work_hours', label: 'Working Hours & Pace', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'overtime', label: 'Overtime Analysis', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: 'Attendance & Absence', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'bonus', label: 'Bonus & Rates', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'reconciliation', label: 'Payroll Reconciliation', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Annual & Lifetime', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Top row: timeframe selector and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Timeframe Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]/70">
          {timeframeOptions.map((tf) => (
            <button
              key={tf.id}
              id={`analytics-tf-${tf.id}`}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                activeTimeframe === tf.id
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/50'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Range Label & Summary Generator Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-xs font-mono text-emerald-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRangeLabel}</span>
          </div>

          <button
            id="analytics-generate-summary-btn"
            onClick={onOpenSummaryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-slate-700/60 rounded-lg text-xs font-medium transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Performance Summary</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Custom Date Pickers (Shown only when 'custom_range' is selected) */}
      {activeTimeframe === 'custom_range' && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0a0e17] rounded-lg border border-amber-500/30 text-xs">
          <span className="font-semibold text-amber-400">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">From:</label>
            <input
              type="date"
              id="analytics-custom-start-date"
              value={customStartDate || '2026-08-01'}
              onChange={(e) => onCustomStartChange && onCustomStartChange(e.target.value)}
              className="bg-[#121824] border border-[#1e293b] rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400">To:</label>
            <input
              type="date"
              id="analytics-custom-end-date"
              value={customEndDate || '2026-08-15'}
              onChange={(e) => onCustomEndChange && onCustomEndChange(e.target.value)}
              className="bg-[#121824] border border-[#1e293b] rounded px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Section Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#1e293b]/70 pt-3">
        {sectionTabs.map((tab) => (
          <button
            key={tab.id}
            id={`analytics-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#1e293b] text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
