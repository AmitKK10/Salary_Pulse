import React from 'react';
import { PeriodCoreKPIs } from '../../types';
import { formatCurrency, formatDurationHM } from '../../utils/formatters';
import { 
  DollarSign, 
  CheckCircle2, 
  Briefcase, 
  Clock, 
  Award, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Building2, 
  Zap 
} from 'lucide-react';

interface CoreLifetimeKPIsProps {
  kpis: PeriodCoreKPIs;
  timeframeLabel: string;
}

export const CoreLifetimeKPIs: React.FC<CoreLifetimeKPIsProps> = ({ kpis, timeframeLabel }) => {
  const activeHoursFormatted = formatDurationHM(kpis.totalActiveSeconds);
  const officeSpanFormatted = formatDurationHM(kpis.totalOfficeSpanSeconds);
  const breakHoursFormatted = formatDurationHM(kpis.totalBreakSeconds);
  const otHoursFormatted = formatDurationHM(kpis.totalOTSeconds);

  const activeRatioPercent = kpis.totalOfficeSpanSeconds > 0
    ? ((kpis.totalActiveSeconds / kpis.totalOfficeSpanSeconds) * 100).toFixed(1)
    : '100.0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Core Period Financial & Work KPIs
          </h3>
          <p className="text-xs text-slate-400">
            Aggregated for <span className="font-mono text-emerald-400">{timeframeLabel}</span> from authoritative calculation engines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-[#0a0e17] px-2.5 py-1 rounded-md border border-[#1e293b]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>STRICT SEPARATION: ACTUALS vs POTENTIAL</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Total Salary Earned (Gross calculated) */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Gross Salary Earned</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-white">
            {formatCurrency(kpis.totalSalaryEarned)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400">Calculated</span> (Base + OT + Bonus)
          </div>
        </div>

        {/* 2. Confirmed Bank / Actual Received */}
        <div className="bg-[#121824] border border-amber-500/30 rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-amber-300">Actual Bank Received</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-amber-400">
            {kpis.totalActualSalaryReceived > 0 ? formatCurrency(kpis.totalActualSalaryReceived) : '₹0.00'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.totalActualSalaryReceived > 0 ? 'Verified bank deposits' : 'Awaiting deposit credit'}
          </div>
        </div>

        {/* 3. Normal Work Earnings */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Normal Work Pay</span>
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-sky-300">
            {formatCurrency(kpis.totalNormalEarnings)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Present + Holiday + Paid Leave
          </div>
        </div>

        {/* 4. Overtime Earnings */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Overtime Earnings</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-purple-300">
            {formatCurrency(kpis.totalOTEarnings)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.totalOTHours}h @ 2.0x overtime rate
          </div>
        </div>

        {/* 5. Attendance Bonuses */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Bonus Credited</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-emerald-300">
            {formatCurrency(kpis.totalBonuses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Potential: <span className="font-mono text-amber-400">{formatCurrency(kpis.potentialBonusAmount)}</span>
          </div>
        </div>

        {/* 6. Total Deductions */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Total Deductions</span>
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-rose-400">
            {formatCurrency(kpis.totalDeductions)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Statutory PF, PT & active rules
          </div>
        </div>

        {/* 7. Net Take-Home Salary */}
        <div className="bg-[#121824] border border-emerald-500/30 rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium text-emerald-300">Calculated Net Salary</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-emerald-400">
            {formatCurrency(kpis.netEarnedSalary)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Gross minus deductions
          </div>
        </div>

        {/* 8. Active Work Hours */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Active Work Hours</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-cyan-300">
            {activeHoursFormatted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg: <span className="font-mono text-slate-200">{kpis.averageWorkHoursPerScheduledDay}h</span> / scheduled day
          </div>
        </div>

        {/* 9. Attendance Days */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Attendance Achieved</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-white">
            {kpis.totalAttendanceDays} <span className="text-xs font-normal text-slate-400">/ {kpis.scheduledWorkingDaysCount} Sched</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.totalPresentDays} Present, {kpis.totalPartialDays} Half Days
          </div>
        </div>

        {/* 10. Absences & Leaves */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Absences & Leaves</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-amber-300">
            {kpis.totalAbsentDays} <span className="text-xs font-normal text-slate-400">Absent</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.totalPaidLeaveDays} Paid Leave, {kpis.totalUnpaidLeaveDays} Unpaid
          </div>
        </div>

        {/* 11. Longest Workday */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Peak Work Day</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-indigo-300">
            {formatDurationHM(kpis.longestWorkDaySeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {kpis.longestWorkDayDate || 'N/A'}
          </div>
        </div>

        {/* 12. Office Span vs Active Work */}
        <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-3.5 md:p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-medium">Active / Span Ratio</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-emerald-400">
            {activeRatioPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Span: <span className="font-mono text-slate-300">{officeSpanFormatted}</span> (Break: {breakHoursFormatted})
          </div>
        </div>
      </div>
    </div>
  );
};
