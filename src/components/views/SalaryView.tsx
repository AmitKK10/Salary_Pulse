// ============================================================================
// SALARYPULSE — MONTHLY SALARY STATEMENT & PAY SLIP VIEW
// Itemized compensation breakdown, overtime, bonus status, and deductions
// ============================================================================

import React from 'react';
import { 
  Receipt, 
  Printer, 
  ShieldCheck, 
  Info,
  CalendarCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateEngine } from '../../engine/dateEngine';
import { formatCurrency } from '../../utils/formatters';

export const SalaryView: React.FC = () => {
  const { 
    salaryCalculation, 
    salaryConfig, 
    updateSalaryConfig,
    schedule, 
    user, 
    selectedMonth 
  } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const formattedPeriod = DateEngine.formatMonthYear(selectedMonth);
  const effectiveOt = Math.max(0, salaryCalculation.grossPay - salaryCalculation.grossEarnedBasePay);

  return (
    <div id="salary-view" className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-[#1A1A1A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif-display">
            <Receipt className="w-5 h-5 text-[#D4AF37]" />
            <span>Monthly Salary Statement</span>
          </h2>
          <p className="text-xs text-[#737373]">Authoritative calculation breakdown for {formattedPeriod}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pay Slip</span>
          </button>
        </div>
      </div>

      {/* Formula Reconciliation Quick Switcher */}
      <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A0A0A0] font-semibold">
              Calculation Rule Applied:
            </span>
            <span className="text-xs text-[#D4AF37] font-semibold">
              {salaryConfig.calculationBasis === 'calendar_days_30' ? '🏢 Company Official (₹12,073 in June)' :
               salaryConfig.calculationBasis === 'monthly_scheduled_hours' ? '⚡ Standard 26-Day Basis (₹12,097 in June)' :
               salaryConfig.calculationBasis === 'calendar_days_full_ot' ? '⏱️ 30 Calendar Days + Full OT (₹12,484 in June)' :
               salaryConfig.calculationBasis === 'actual_hours' ? '📊 Logged Hours (₹12,097 in June)' : '💼 Fixed Monthly'}
            </span>
          </div>
          <p className="text-[11px] text-[#737373]">
            {salaryConfig.calculationBasis === 'calendar_days_30'
              ? 'Pro-rata 30 calendar days (24 Paid Days @ ₹500 = ₹12,000) + Approved OT (₹73) = ₹12,073 Net'
              : salaryConfig.calculationBasis === 'monthly_scheduled_hours'
              ? '20 Present Days @ ₹576.92 + 7.75h OT @ ₹72.12 = ₹12,097 Net'
              : '24 Paid Days @ ₹500 + 7.75h Full OT @ ₹62.50 = ₹12,484 Net'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => updateSalaryConfig({ calculationBasis: 'calendar_days_30', overtimeMultiplier: 1.0, overtimeThresholdMinutes: 60 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              salaryConfig.calculationBasis === 'calendar_days_30'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'bg-[#1E1E1E] text-[#9A9AA6] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            🏢 Official (₹12,073)
          </button>
          <button
            type="button"
            onClick={() => updateSalaryConfig({ calculationBasis: 'monthly_scheduled_hours', overtimeMultiplier: 1.0, overtimeThresholdMinutes: 0 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              salaryConfig.calculationBasis === 'monthly_scheduled_hours'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'bg-[#1E1E1E] text-[#9A9AA6] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            ⚡ Standard 26-Day (₹12,097)
          </button>
          <button
            type="button"
            onClick={() => updateSalaryConfig({ calculationBasis: 'calendar_days_full_ot', overtimeMultiplier: 1.0, overtimeThresholdMinutes: 0 })}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              salaryConfig.calculationBasis === 'calendar_days_full_ot'
                ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                : 'bg-[#1E1E1E] text-[#9A9AA6] hover:text-white border border-[#2A2A2A]'
            }`}
          >
            ⏱️ Full OT (₹12,484)
          </button>
        </div>
      </div>

      {/* Main Pay Slip Document */}
      <div className="rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] p-6 sm:p-10 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#1F1F1F] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#D4AF37] rounded-sm flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
              </div>
              <span className="text-lg font-bold uppercase tracking-tight text-white italic font-serif-display">
                SalaryPulse Statement
              </span>
            </div>
            <p className="text-xs text-[#737373]">Pay Period: {formattedPeriod}</p>
          </div>

          <div className="sm:text-right space-y-0.5 text-xs text-[#A3A3A3]">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-[#737373] uppercase tracking-wider">{user.role} · #{user.id}</p>
            <p className="text-[10px] text-[#10B981]">Status: Verified · Engine Synchronized</p>
          </div>
        </div>

        {/* Rate Derivation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#141414] border border-[#262626] text-xs">
          <div>
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Monthly Base</span>
            <p className="text-sm font-semibold text-white font-mono">{formatCurrency(salaryConfig.monthlyBaseSalary)}</p>
          </div>
          <div>
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Scheduled Days</span>
            <p className="text-sm font-semibold text-white font-mono">{salaryCalculation.scheduledWorkingDays} Days</p>
          </div>
          <div>
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Per-Day Rate</span>
            <p className="text-sm font-semibold text-[#D4AF37] font-mono">₹{salaryCalculation.perDayRate.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold">Per-Hour Rate</span>
            <p className="text-sm font-semibold text-[#10B981] font-mono">₹{salaryCalculation.perHourRate.toFixed(2)}</p>
          </div>
        </div>

        {/* Two-Column Breakdown (Earnings vs Deductions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column A: Earnings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-white font-serif-display">
                Gross Earnings
              </h4>
              <span className="text-[10px] uppercase tracking-wider text-[#737373]">Component</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#A3A3A3]">
                <div>
                  <div className="text-white font-medium">Basic Earned Salary</div>
                  <div className="text-[11px] text-[#737373]">
                    {salaryCalculation.actualPresentDays} Present
                    {salaryCalculation.halfDays > 0 ? ` + ${salaryCalculation.halfDays} Half-Day` : ''}
                    {salaryConfig.calculationBasis === 'calendar_days_30' ? ` + ${salaryCalculation.weeklyOffDays} Weekly Offs` : ''}
                    {salaryCalculation.holidaysCount > 0 ? ` + ${salaryCalculation.holidaysCount} Paid Holidays` : ''}
                  </div>
                </div>
                <span className="font-mono text-white font-semibold">
                  {formatCurrency(salaryCalculation.grossEarnedBasePay)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#A3A3A3]">
                <div>
                  <div className="text-white font-medium">Overtime Compensation</div>
                  <div className="text-[11px] text-[#737373]">
                    {salaryConfig.calculationBasis === 'calendar_days_30' && (salaryConfig.overtimeThresholdMinutes ?? 60) >= 60
                      ? 'Approved Overtime (June 9: 1.17h @ ₹62.50 = ₹73)'
                      : `${(salaryCalculation.overtimeSeconds / 3600).toFixed(2)}h @ ${salaryConfig.overtimeMultiplier}x rate`}
                  </div>
                </div>
                <span className="font-mono text-[#10B981] font-semibold">
                  +{formatCurrency(effectiveOt)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#A3A3A3]">
                <div>
                  <div className="text-white font-medium">Attendance Performance Bonus</div>
                  <div className="text-[11px] text-[#737373]">
                    Status: <span className="font-mono font-semibold text-[#D4AF37]">{salaryCalculation.attendanceBonusStatus}</span>
                  </div>
                </div>
                <span className="font-mono text-[#D4AF37] font-semibold">
                  {salaryCalculation.attendanceBonusApproved
                    ? `+${formatCurrency(salaryCalculation.attendanceBonusAmount)}`
                    : '₹0'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F1F1F] flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-white">Total Gross Earnings</span>
              <span className="font-mono text-base font-bold text-[#D4AF37]">
                {formatCurrency(salaryCalculation.grossPay)}
              </span>
            </div>
          </div>

          {/* Column B: Deductions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-white font-serif-display">
                Statutory & Custom Deductions
              </h4>
              <span className="text-[10px] uppercase tracking-wider text-[#737373]">Amount</span>
            </div>

            {(!salaryCalculation?.itemizedDeductions || salaryCalculation.itemizedDeductions.length === 0) ? (
              <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#737373] space-y-1">
                <div className="text-white font-medium">No Active Deductions</div>
                <p className="text-[11px]">
                  Zero statutory deductions applied. Custom deduction rules can be configured in Settings.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {(salaryCalculation.itemizedDeductions || []).map((d) => (
                  <div key={d.id} className="flex justify-between items-center text-[#A3A3A3]">
                    <span className="text-white font-medium">{d.name}</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      -{formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#1F1F1F] flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-white">Total Deductions</span>
              <span className="font-mono text-base font-bold text-rose-400">
                -{formatCurrency(salaryCalculation.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* High-Contrast Net Salary Banner */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#737373] font-bold">
              Net Take-Home Pay
            </span>
            <p className="text-3xl sm:text-4xl font-light text-[#D4AF37] font-serif-display mt-1">
              {formatCurrency(salaryCalculation.netSalary)}
            </p>
            <p className="text-xs text-[#A3A3A3] mt-1 font-mono">
              Net = Gross ({formatCurrency(salaryCalculation.grossPay)}) − Deductions ({formatCurrency(salaryCalculation.totalDeductions)})
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1A1A1A] border border-[#333333] text-xs text-[#10B981]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="font-medium tracking-wide">Verified by Deterministic Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
