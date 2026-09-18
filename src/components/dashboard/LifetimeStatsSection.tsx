// ============================================================================
// SALARYPULSE — LIFETIME STATS SECTION (DASHBOARD)
// Aggregates historical data: Cumulative Income, Months Worked,
// Total Hours Logged Across All Time, and Average Monthly Earnings.
// ============================================================================

import React, { useMemo, useState } from 'react';
import { 
  Coins, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight,
  Info,
  Layers,
  Award,
  CheckCircle2,
  Hourglass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LifetimeEngine, LifetimeStatsResult } from '../../engine/lifetimeEngine';
import { formatCurrency, formatSecondsToHHMMSS, formatDurationHM } from '../../utils/formatters';

export const LifetimeStatsSection: React.FC = () => {
  const {
    attendanceDays,
    salaryConfig,
    schedule,
    holidays,
    salaryReconciliationRecords,
    todayDate,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    isCurrentlyWorking,
    todayLiveActiveSeconds,
    salaryCalculation,
  } = useApp();

  // Detail drawer / breakdown expander state
  const [isExpanded, setIsExpanded] = useState(false);
  const [incomeMode, setIncomeMode] = useState<'disbursed' | 'calculated'>('disbursed');

  // Authoritative multi-month aggregation via LifetimeEngine
  const lifetimeMetrics = useMemo(() => {
    const stats: LifetimeStatsResult = LifetimeEngine.calculateLifetimeStats({
      attendanceDays: attendanceDays || [],
      salaryReconciliationRecords: salaryReconciliationRecords || [],
      salaryConfig,
      schedule,
      holidays,
      selectedMonth,
      todayDate,
      currentMonthLiveAccrued: salaryCalculation?.realtimeEarnedSoFar || 0,
      isCurrentlyWorking,
      todayLiveActiveSeconds,
      incomeMode,
    });

    const firstMonth = stats.monthlyList[0]?.month || '2026-05';
    const latestMonth = stats.monthlyList[stats.monthlyList.length - 1]?.month || '2026-09';

    return {
      ...stats,
      activeIncomeTotal: stats.totalIncome,
      firstMonth,
      latestMonth,
    };
  }, [
    attendanceDays,
    salaryReconciliationRecords,
    selectedMonth,
    todayDate,
    salaryConfig,
    schedule,
    holidays,
    isCurrentlyWorking,
    todayLiveActiveSeconds,
    salaryCalculation?.realtimeEarnedSoFar,
    incomeMode,
  ]);

  return (
    <section 
      id="lifetime-stats-section" 
      aria-label="Lifetime Stats"
      className="bg-[#121215] border border-[#1F1F24] hover:border-[#2C2C35] rounded-2xl p-5 md:p-6 shadow-2xl transition-all duration-200"
    >
      {/* 1. Header Bar: Title, Scope Badge & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E1E24]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B38F26]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold tracking-wide text-white uppercase italic font-serif-display">
                Lifetime Stats
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider">
                Career History
              </span>
            </div>
            <p className="text-xs text-[#8E8E9A] font-mono mt-0.5">
              Cumulative historical totals across all worked months ({lifetimeMetrics.firstMonth} – {lifetimeMetrics.latestMonth})
            </p>
          </div>
        </div>

        {/* Action Buttons: Calculation Mode Switcher & Details Drawer Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Income Source Mode Toggle */}
          <div className="inline-flex rounded-lg bg-[#18181F] border border-[#272730] p-0.5 text-xs font-mono">
            <button
              type="button"
              id="lifetime-income-disbursed-btn"
              onClick={() => setIncomeMode('disbursed')}
              title="Includes verified HR salary slips, bank receipts, and calculated running earnings"
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                incomeMode === 'disbursed'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'text-[#888894] hover:text-white'
              }`}
            >
              Official / Disbursed
            </button>
            <button
              type="button"
              id="lifetime-income-calculated-btn"
              onClick={() => setIncomeMode('calculated')}
              title="Aggregates pure SalaryPulse attendance formula earnings across all months"
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                incomeMode === 'calculated'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 shadow-sm'
                  : 'text-[#888894] hover:text-white'
              }`}
            >
              Calculated Accrual
            </button>
          </div>

          {/* Expand Monthly Table Toggle */}
          <button
            type="button"
            id="lifetime-toggle-breakdown-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181F] hover:bg-[#20202A] text-xs font-mono font-medium text-[#A2A2B0] hover:text-white border border-[#272730] transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{isExpanded ? 'Hide Monthly Ledger' : 'View Monthly Ledger'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Primary Metric Quad: The 4 Required Lifetime Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Total Cumulative Income */}
        <div 
          id="stat-lifetime-cumulative-income"
          className="bg-[#16161B] border border-[#24242D] hover:border-[#383845] rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-[#888896] text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Total Cumulative Income</span>
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37]/20 transition">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-light tracking-tight text-[#D4AF37] font-serif-display">
              {formatCurrency(lifetimeMetrics.activeIncomeTotal)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#202028] mt-2 flex items-center justify-between text-[11px] font-mono text-[#8E8E9E]">
            <span>{incomeMode === 'disbursed' ? 'Verified HR / Disbursed' : 'Pure Calculated Work'}</span>
            <span className="text-emerald-400 font-semibold">{lifetimeMetrics.totalMonthsWorked} mos</span>
          </div>
        </div>

        {/* Metric 2: Total Months Worked */}
        <div 
          id="stat-lifetime-months-worked"
          className="bg-[#16161B] border border-[#24242D] hover:border-[#383845] rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-[#888896] text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Total Months Worked</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-semibold text-white font-mono">
              {lifetimeMetrics.totalMonthsWorked}
            </span>
            <span className="text-xs text-[#8E8E9E] font-mono uppercase tracking-wider">Payroll Cycles</span>
          </div>
          <div className="pt-2 border-t border-[#202028] mt-2 flex items-center justify-between text-[11px] font-mono text-[#8E8E9E]">
            <span>Tenure Span</span>
            <span className="text-sky-300 font-medium">{lifetimeMetrics.firstMonth} → {lifetimeMetrics.latestMonth}</span>
          </div>
        </div>

        {/* Metric 3: Total Hours Logged Across All Time */}
        <div 
          id="stat-lifetime-hours-logged"
          className="bg-[#16161B] border border-[#24242D] hover:border-[#383845] rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-[#888896] text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Total Hours Logged</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl sm:text-3xl font-semibold text-emerald-400 font-mono">
              {lifetimeMetrics.totalHoursFormatted}
            </span>
          </div>
          <div className="pt-2 border-t border-[#202028] mt-2 flex items-center justify-between text-[11px] font-mono text-[#8E8E9E]">
            <span>Decimal Equivalent</span>
            <span className="text-emerald-300 font-semibold">{lifetimeMetrics.totalHoursLogged.toFixed(1)} hrs</span>
          </div>
        </div>

        {/* Metric 4: Average Monthly Earnings */}
        <div 
          id="stat-lifetime-avg-monthly-earnings"
          className="bg-[#16161B] border border-[#24242D] hover:border-[#383845] rounded-xl p-4 md:p-5 flex flex-col justify-between shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-[#888896] text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Average Monthly Earnings</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-light tracking-tight text-white font-serif-display">
              {formatCurrency(lifetimeMetrics.averageMonthlyEarnings)}
            </span>
            <span className="text-[11px] text-[#8E8E9E] font-mono">/mo</span>
          </div>
          <div className="pt-2 border-t border-[#202028] mt-2 flex items-center justify-between text-[11px] font-mono text-[#8E8E9E]">
            <span>Hourly Yield</span>
            <span className="text-purple-300 font-semibold">{formatCurrency(lifetimeMetrics.averageHourlyEarning)}/hr</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Lifetime Context Bar */}
      <div className="mt-4 bg-[#0D0D11] border border-[#1B1B22] rounded-xl px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono text-[#9494A2]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Avg Work/Month: <strong className="text-white">{lifetimeMetrics.averageHoursPerMonth.toFixed(1)} hrs</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>Base Salary Contract: <strong className="text-white">{formatCurrency(salaryConfig.monthlyBaseSalary || 15000)}/mo</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Total Attendance Records: <strong className="text-white">{attendanceDays.length} days logged</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#E6C65C] transition font-semibold"
        >
          <span>Open Full Historical Analytics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Expandable Monthly Historical Ledger */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#1F1F26] space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              Itemized Lifetime Monthly Breakdown ({lifetimeMetrics.monthlyList.length} Months)
            </h4>
            <span className="text-[11px] font-mono text-[#7D7D8B]">
              Click month to view details
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#22222B]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#17171E] text-[#888896] uppercase tracking-wider border-b border-[#22222B]">
                <tr>
                  <th className="py-2.5 px-3">Payroll Month</th>
                  <th className="py-2.5 px-3">Hours Logged</th>
                  <th className="py-2.5 px-3">Calculated (Pulse)</th>
                  <th className="py-2.5 px-3">Verified / Slip Net</th>
                  <th className="py-2.5 px-3">Effective Counted</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D26] bg-[#101014]">
                {lifetimeMetrics.monthlyList.map((mRec) => (
                  <tr 
                    key={mRec.month}
                    className={`hover:bg-[#181822] transition-colors ${
                      mRec.month === selectedMonth ? 'bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                      <span className={mRec.month === selectedMonth ? 'text-[#D4AF37] font-bold' : ''}>
                        {mRec.monthLabel}
                      </span>
                      {mRec.month === selectedMonth && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37]">
                          CURRENT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono">
                      {mRec.hoursFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {formatCurrency(mRec.calculatedAccruedPay)}
                    </td>
                    <td className="py-2.5 px-3 text-[#D4AF37] font-semibold">
                      {mRec.officialDisbursedPay > 0 ? formatCurrency(mRec.officialDisbursedPay) : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {formatCurrency(mRec.effectiveIncome)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                        mRec.isCurrentRunningMonth
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                          : mRec.isLocked
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                          : mRec.isReconciled
                          ? 'bg-sky-950/40 text-sky-300 border border-sky-500/30'
                          : 'bg-[#1E1E28] text-slate-400'
                      }`}>
                        {mRec.isCurrentRunningMonth ? (
                          <Hourglass className="w-2.5 h-2.5 text-emerald-400 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#D4AF37]" />
                        )}
                        {mRec.statusText}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(mRec.month)}
                        className="px-2 py-1 rounded text-[10px] bg-[#1A1A24] hover:bg-[#252533] text-[#D4AF37] border border-[#2D2D3B] hover:border-[#D4AF37]/50 transition cursor-pointer"
                      >
                        Select Month
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
