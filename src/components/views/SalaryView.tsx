// ============================================================================
// SALARYPULSE — AUTHORITATIVE SALARY STATEMENT & BREAKDOWN VIEW
// Transparent breakdown strictly adhering to confirmed Company / Boss Rules
// ============================================================================

import React, { useState } from 'react';
import { 
  Receipt, 
  Printer, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Table as TableIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateEngine } from '../../engine/dateEngine';
import { CONFIRMED_BENCHMARK_RESULTS } from '../../engine/salaryEngine';
import { formatCurrency } from '../../utils/formatters';

export const SalaryView: React.FC = () => {
  const { 
    salaryCalculation, 
    selectedMonth 
  } = useApp();

  const [showSandwichBreakdown, setShowSandwichBreakdown] = useState<boolean>(true);

  const handlePrint = () => {
    window.print();
  };

  const formattedPeriod = DateEngine.formatMonthYear(selectedMonth);

  // Directly consume the authoritative result from the salary engine without local recalculation
  const calculation = salaryCalculation;

  const benchmark = CONFIRMED_BENCHMARK_RESULTS[selectedMonth];

  if (!calculation) {
    return (
      <div className="p-8 text-center text-neutral-400 font-mono text-sm">
        Loading authoritative payroll calculations...
      </div>
    );
  }

  return (
    <div id="salary-view" className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto text-slate-100">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900/90 dark:bg-[#121212] border border-neutral-800 dark:border-[#1A1A1A] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif-display tracking-tight">
            <Receipt className="w-5 h-5 text-[#D4AF37]" />
            <span>Authoritative Salary Statement</span>
          </h2>
          <p className="text-xs text-neutral-400">Strict Company / Boss Payroll Engine for {formattedPeriod}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="print-payslip-btn"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pay Slip</span>
          </button>
        </div>
      </div>

      {/* CONFIRMED BENCHMARK AUDIT BANNER */}
      {calculation.benchmarkAudit && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
          calculation.benchmarkAudit.isExactMatch
            ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
            : 'bg-amber-950/20 border-amber-800/50 text-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            {calculation.benchmarkAudit.isExactMatch ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold uppercase tracking-wider text-white">
                  Confirmed Boss Payroll Benchmark:
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 font-mono font-bold text-[#D4AF37]">
                  ₹{calculation.benchmarkAudit.confirmedSalary.toLocaleString('en-IN')}
                </span>
                <span className="text-neutral-400 text-[11px]">
                  (Official Attendance: <span className="font-mono text-neutral-200">{calculation.benchmarkAudit.officialHoursFormatted}</span>)
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {calculation.benchmarkAudit.explanation}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider block text-neutral-400">Authoritative Salary Output</span>
            <span className="text-base font-mono font-bold text-white">
              ₹{calculation.finalSalary.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* VISUAL SALARY CALCULATION LEDGER */}
      <div id="salary-visual-calculation-card" className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Official Payroll Ledger
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-serif-display mt-0.5">
              Final Salary Calculation
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase tracking-wider">Payroll Period</span>
            <span className="text-xs font-mono font-bold text-neutral-200">{formattedPeriod}</span>
          </div>
        </div>

        {/* Visual Formula Block strictly reflecting the engine's authoritative calculation */}
        <div className="max-w-md mx-auto p-6 rounded-xl bg-neutral-950/90 border border-neutral-800/90 font-mono shadow-inner space-y-2.5">
          {/* Base Salary */}
          <div className="flex justify-between items-center text-white text-base">
            <span className="font-bold">{formatCurrency(calculation.baseSalary)}</span>
            <span className="text-xs font-sans text-neutral-400">Base Salary</span>
          </div>

          {/* Shortfall Deduction */}
          <div className="flex justify-between items-center text-rose-400 text-sm sm:text-base">
            <span>− ₹{calculation.shortfallDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Shortfall</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {calculation.shortfallHoursFormatted}
            </span>
          </div>

          {/* Sandwich Sunday Deduction */}
          <div className="flex justify-between items-center text-rose-400 text-sm sm:text-base">
            <span>− ₹{calculation.sandwichSundayDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Sandwich Sunday</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {calculation.sandwichSundayCount} {calculation.sandwichSundayCount === 1 ? 'Sunday' : 'Sundays'}
            </span>
          </div>

          {/* Overtime Pay */}
          <div className="flex justify-between items-center text-emerald-400 text-sm sm:text-base">
            <span>+ ₹{calculation.overtimePay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} OT</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {calculation.overtimeHoursFormatted}
            </span>
          </div>

          {/* Paid Holiday Pay */}
          {calculation.creditedHolidayPay > 0 && (
            <div className="flex justify-between items-center text-sky-400 text-sm sm:text-base">
              <span>+ ₹{calculation.creditedHolidayPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Holiday Pay</span>
              <span className="text-[11px] font-mono text-neutral-500">
                {calculation.holidaysCount} Paid {calculation.holidaysCount === 1 ? 'Holiday' : 'Holidays'}
              </span>
            </div>
          )}

          {/* Horizontal Rule */}
          <div className="border-t border-neutral-700/80 my-2 pt-2"></div>

          {/* Unrounded */}
          <div className="flex justify-between items-center text-neutral-300 text-sm sm:text-base">
            <span className="font-semibold">
              ₹{calculation.unroundedFinalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-sans text-neutral-400">Unrounded Calculation</span>
          </div>

          {/* Rounded Final */}
          <div className="border-t border-dashed border-neutral-700/60 pt-2 flex justify-between items-baseline text-[#D4AF37]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base text-neutral-400">≈</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono">
                ₹{calculation.finalSalary.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs font-sans uppercase tracking-wider font-semibold text-[#D4AF37]">
              Final Salary
            </span>
          </div>
        </div>
      </div>

      {/* TRANSPARENT SALARY BREAKDOWN TABLE */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Transparent Salary Breakdown Table
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-serif-display mt-0.5">
              Salary Component Statement
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Final Salary = Base Salary − Shortfall Deduction − Sandwich Sunday Deduction + Overtime Pay{calculation.creditedHolidayPay > 0 ? ' + Paid Holiday Salary' : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase tracking-wider">Payroll Period</span>
            <span className="text-xs font-mono font-bold text-neutral-200">{formattedPeriod}</span>
          </div>
        </div>

        {/* The Exact Transparent Salary Breakdown Table */}
        <div className="overflow-x-auto">
          <table 
            id="salary-breakdown-table" 
            className="w-full text-left border-collapse min-w-[540px]"
          >
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-950/40">
                <th className="py-3.5 px-4 font-semibold">Component</th>
                <th className="py-3.5 px-3 font-semibold text-center w-24">Operation</th>
                <th className="py-3.5 px-4 font-semibold">Calculation Detail & Basis</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70 font-mono text-xs">
              {/* Field 1: Base Salary */}
              <tr id="row-base-salary" className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center text-[11px] font-bold text-neutral-300 shrink-0">
                      1
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-white text-sm block">Base Salary</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Guaranteed monthly base compensation</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                    BASE
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-300 font-sans text-xs">
                  {calculation.isRunningMonth ? (
                    <span>
                      Prorated base compensation for {calculation.scheduledWorkingDays} elapsed working days ({calculation.scheduledWorkingDays} days × ₹{calculation.dailyRate.toFixed(2)}/day)
                    </span>
                  ) : (
                    <span>
                      Fixed monthly base compensation ({formatCurrency(calculation.baseSalary)} ÷ {calculation.calendarDays} calendar days = ₹{calculation.dailyRate.toFixed(2)}/day)
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-bold text-white text-sm font-mono">
                  {formatCurrency(calculation.baseSalary)}
                </td>
              </tr>

              {/* Field 2: Shortfall Deduction */}
              <tr id="row-shortfall-deduction" className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-[11px] font-bold text-rose-400 shrink-0">
                      −
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-white text-sm block">Shortfall Deduction</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Deduction for deficit below monthly target</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold">
                    − DEDUCT
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-300 font-sans text-xs">
                  {calculation.isShortfall ? (
                    <span>
                      <span className="font-mono text-rose-400 font-semibold">{calculation.shortfallHoursFormatted}</span> deficit below {calculation.requiredWorkingHoursFormatted} target × <span className="font-mono text-neutral-200">₹{calculation.hourlyShortfallRate.toFixed(2)}/hr</span> (Daily Rate ÷ 8)
                    </span>
                  ) : (
                    <span className="text-neutral-500">No shortfall deficit (Target: {calculation.requiredWorkingHoursFormatted})</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-bold font-mono text-sm">
                  <span className={calculation.shortfallDeduction > 0 ? 'text-rose-400' : 'text-neutral-500'}>
                    −{formatCurrency(calculation.shortfallDeduction)}
                  </span>
                </td>
              </tr>

              {/* Field 3: Sandwich Sunday Deduction */}
              <tr id="row-sandwich-sunday-deduction" className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-[11px] font-bold text-rose-400 shrink-0">
                      −
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-white text-sm block">Sandwich Sunday Deduction</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Saturday absent + Monday absent penalty</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold">
                    − DEDUCT
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-300 font-sans text-xs">
                  {calculation.sandwichSundayCount > 0 ? (
                    <span>
                      <span className="font-mono text-rose-400 font-semibold">{calculation.sandwichSundayCount} Sandwich Sunday{calculation.sandwichSundayCount !== 1 ? 's' : ''}</span> × <span className="font-mono text-neutral-200">₹{calculation.dailyRate.toFixed(2)}</span> (Full Daily Rate deduction)
                    </span>
                  ) : (
                    <span className="text-neutral-500">No sandwich Sunday penalties triggered this month</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-bold font-mono text-sm">
                  <span className={calculation.sandwichSundayDeduction > 0 ? 'text-rose-400' : 'text-neutral-500'}>
                    −{formatCurrency(calculation.sandwichSundayDeduction)}
                  </span>
                </td>
              </tr>

              {/* Field 4: Overtime Pay */}
              <tr id="row-overtime-pay" className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
                      +
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-white text-sm block">Overtime Pay</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Monthly net surplus above target</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-bold">
                    + ADD
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-300 font-sans text-xs">
                  {calculation.isOvertime ? (
                    <span>
                      <span className="font-mono text-emerald-400 font-semibold">{calculation.overtimeHoursFormatted}</span> surplus over {calculation.requiredWorkingHoursFormatted} target × <span className="font-mono text-neutral-200">₹{calculation.overtimeRate.toFixed(2)}/hr</span> (Confirmed Boss OT)
                    </span>
                  ) : (
                    <span className="text-neutral-500">No monthly surplus logged (Target: {calculation.requiredWorkingHoursFormatted})</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-bold font-mono text-sm">
                  <span className={calculation.overtimePay > 0 ? 'text-emerald-400' : 'text-neutral-500'}>
                    +{formatCurrency(calculation.overtimePay)}
                  </span>
                </td>
              </tr>

              {/* Field 5: Paid Holiday Salary */}
              <tr id="row-holiday-pay" className="hover:bg-neutral-800/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-[11px] font-bold text-sky-400 shrink-0">
                      +
                    </div>
                    <div>
                      <span className="font-sans font-semibold text-white text-sm block">Paid Holiday Salary</span>
                      <span className="text-[10px] text-neutral-400 font-sans">Public holiday credited according to per-day rate</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-300 text-[10px] font-bold">
                    + ADD
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-300 font-sans text-xs">
                  {calculation.creditedHolidayPay > 0 ? (
                    <span>
                      <span className="font-mono text-sky-400 font-semibold">{calculation.holidaysCount} Paid {calculation.holidaysCount === 1 ? 'Holiday' : 'Holidays'}</span> × <span className="font-mono text-neutral-200">₹{calculation.dailyRate.toFixed(2)}/day</span> (Per-Day Rate for {formattedPeriod})
                    </span>
                  ) : (
                    <span className="text-neutral-500">No paid public holidays recorded in this month</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right font-bold font-mono text-sm">
                  <span className={calculation.creditedHolidayPay > 0 ? 'text-sky-400' : 'text-neutral-500'}>
                    +{formatCurrency(calculation.creditedHolidayPay)}
                  </span>
                </td>
              </tr>

              {/* Field 6: Final Salary */}
              <tr id="row-final-salary" className="bg-neutral-950/90 border-t-2 border-[#D4AF37]/50 font-bold">
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#D4AF37] flex items-center justify-center text-[11px] font-bold text-black shrink-0">
                      =
                    </div>
                    <div>
                      <span className="font-sans font-bold text-[#D4AF37] text-base block">Final Salary</span>
                      <span className="text-[10px] text-neutral-400 font-sans font-normal">
                        Rounded to nearest whole rupee (Unrounded: ₹{calculation.unroundedFinalSalary.toFixed(4)})
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-3 text-center">
                  <span className="px-2.5 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold">
                    = FINAL
                  </span>
                </td>
                <td className="py-5 px-4 text-neutral-300 font-sans text-xs font-normal">
                  Base ({formatCurrency(calculation.baseSalary)}) − Shortfall ({formatCurrency(calculation.shortfallDeduction)}) − Sandwich ({formatCurrency(calculation.sandwichSundayDeduction)}) + Overtime ({formatCurrency(calculation.overtimePay)}){calculation.creditedHolidayPay > 0 ? ` + Holiday (${formatCurrency(calculation.creditedHolidayPay)})` : ''}
                </td>
                <td className="py-5 px-4 text-right font-serif-display text-2xl sm:text-3xl text-[#D4AF37] font-bold tracking-tight">
                  ₹{calculation.finalSalary.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE METRICS & RATES GRID */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-neutral-800 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Parameters & Rate Derivations
          </span>
          <h3 className="text-lg font-bold text-white font-serif-display mt-0.5">
            Operational Metrics & Rates
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 text-xs">
          {/* 1. Base Salary */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Base Salary</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{formatCurrency(calculation.baseSalary)}</span>
            <span className="text-[10px] text-neutral-500">Monthly gross base</span>
          </div>

          {/* 2. Calendar Days */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Calendar Days</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{calculation.calendarDays} Days</span>
            <span className="text-[10px] text-neutral-500">Days in {formattedPeriod}</span>
          </div>

          {/* 3. Sundays */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Sundays</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{calculation.sundayCount} Sundays</span>
            <span className="text-[10px] text-neutral-500">Weekly off days</span>
          </div>

          {/* 4. Working Days */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Working Days</span>
            <span className="text-lg font-bold font-mono text-[#D4AF37] mt-1 block">{calculation.scheduledWorkingDays} Days</span>
            <span className="text-[10px] text-neutral-500">{calculation.calendarDays} − {calculation.sundayCount} Sundays</span>
          </div>

          {/* 5. Required Work */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Required Work</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{calculation.requiredWorkingHoursFormatted}</span>
            <span className="text-[10px] text-neutral-500">{calculation.scheduledWorkingDays} × 8 hours</span>
          </div>

          {/* 6. Actual Work */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Actual Work</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">{calculation.actualWorkedHoursFormatted}</span>
            <span className="text-[10px] text-neutral-500">Sum of attendance</span>
          </div>

          {/* 7. Shortfall / Overtime (Show either SHORTFALL or OVERTIME, never both positive) */}
          <div className={`p-3.5 rounded-xl border ${
            calculation.isShortfall 
              ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' 
              : calculation.isOvertime 
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
              : 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
          }`}>
            <span className="text-[10px] uppercase tracking-wider font-semibold block">
              {calculation.isShortfall ? 'SHORTFALL' : calculation.isOvertime ? 'OVERTIME' : 'SHORTFALL / OVERTIME'}
            </span>
            <span className="text-lg font-bold font-mono mt-1 block">
              {calculation.isShortfall 
                ? calculation.shortfallHoursFormatted 
                : calculation.isOvertime 
                ? calculation.overtimeHoursFormatted 
                : '00:00:00'}
            </span>
            <span className="text-[10px] opacity-75">
              {calculation.isShortfall ? 'Deficit below target' : calculation.isOvertime ? 'Surplus over target' : 'Exact target match'}
            </span>
          </div>

          {/* 8. Daily Rate */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Daily Rate</span>
            <span className="text-lg font-bold font-mono text-[#D4AF37] mt-1 block">₹{calculation.dailyRate.toFixed(2)}</span>
            <span className="text-[10px] text-neutral-500">{formatCurrency(calculation.baseSalary)} ÷ {calculation.calendarDays} days</span>
          </div>

          {/* 9. Shortfall Hourly Rate */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Shortfall Hourly Rate</span>
            <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">₹{calculation.shortfallHourlyRate.toFixed(2)}</span>
            <span className="text-[10px] text-neutral-500">Daily Rate ÷ 8 hours</span>
          </div>

          {/* 10. OT Rate */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">OT Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">₹{calculation.overtimeRate.toFixed(2)}/hr</span>
            <span className="text-[10px] text-neutral-500">Confirmed flat OT</span>
          </div>

          {/* 11. Shortfall Deduction */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Shortfall Deduction</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${calculation.shortfallDeduction > 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
              −₹{calculation.shortfallDeduction.toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-500">(Shortfall ÷ 8) × Daily Rate</span>
          </div>

          {/* 12. Sandwich Sundays */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Sandwich Sundays</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${calculation.sandwichSundayCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {calculation.sandwichSundayCount}
            </span>
            <span className="text-[10px] text-neutral-500">Sat Absent + Mon Absent</span>
          </div>

          {/* 13. Sandwich Sunday Deduction */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Sandwich Sunday Deduction</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${calculation.sandwichSundayDeduction > 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
              −₹{calculation.sandwichSundayDeduction.toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-500">{calculation.sandwichSundayCount} × Daily Rate</span>
          </div>

          {/* 14. OT Pay */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">OT Pay</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${calculation.overtimePay > 0 ? 'text-emerald-400' : 'text-neutral-400'}`}>
              +₹{calculation.overtimePay.toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-500">Overtime hours × ₹{calculation.overtimeRate.toFixed(2)}</span>
          </div>

          {/* 15. Holiday Pay */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Holiday Pay</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${calculation.creditedHolidayPay > 0 ? 'text-sky-400' : 'text-neutral-400'}`}>
              +₹{calculation.creditedHolidayPay.toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-500">{calculation.holidaysCount} Paid Holidays × ₹{calculation.dailyRate.toFixed(2)}</span>
          </div>

          {/* 16. Final Salary */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-[#D4AF37]/50 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">Final Salary</span>
            <span className="text-lg font-bold font-mono text-[#D4AF37] mt-1 block">₹{calculation.finalSalary.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-neutral-500">Unrounded: ₹{calculation.unroundedFinalSalary.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* SANDWICH SUNDAY AUDIT SECTION */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-xl">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowSandwichBreakdown(!showSandwichBreakdown)}
        >
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Saturday / Monday Sandwich Sunday Audit</span>
            </h4>
            <p className="text-[11px] text-neutral-400">
              {calculation.sandwichSundayCount === 0 
                ? 'No sandwich Sunday penalties triggered this month.'
                : `${calculation.sandwichSundayCount} sandwich Sunday penalty triggered (−₹${calculation.sandwichSundayDeduction.toFixed(2)} total).`}
            </p>
          </div>
          <button className="text-neutral-400 hover:text-white p-1">
            {showSandwichBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showSandwichBreakdown && (
          <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs font-mono">
            {calculation.sandwichSundayDetails.map((detail) => (
              <div 
                key={detail.sundayDate}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                  detail.isSandwich 
                    ? 'bg-rose-950/20 border-rose-800/50 text-rose-200' 
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-sans">
                      Sunday, {detail.sundayDate}
                    </span>
                    {detail.isSandwich ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-sans text-[10px] font-semibold">
                        SANDWICH DEDUCTION APPLIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-sans text-[10px]">
                        CLEARED WEEKLY OFF
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] mt-0.5 text-neutral-400 font-sans">
                    Preceding Sat ({detail.saturdayDate}): <span className={detail.saturdayStatus === 'ABSENT' || detail.saturdayStatus === 'UNPAID_LEAVE' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>{detail.saturdayStatus}</span>
                    {' · '}
                    Succeeding Mon ({detail.mondayDate}): <span className={detail.mondayStatus === 'ABSENT' || detail.mondayStatus === 'UNPAID_LEAVE' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>{detail.mondayStatus}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-neutral-500 block">Deduction</span>
                  <span className={`font-bold font-mono ${detail.isSandwich ? 'text-rose-400' : 'text-neutral-500'}`}>
                    {detail.isSandwich ? `−₹${detail.deduction.toFixed(2)}` : '₹0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMED VALIDATION REFERENCE TABLE */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-xl">
        <div className="border-b border-neutral-800 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
            Authoritative Validation Reference
          </span>
          <h4 className="text-sm font-bold text-white font-serif-display mt-0.5">
            Confirmed Company / Boss Benchmark Results
          </h4>
          <p className="text-xs text-neutral-400">
            SalaryPulse validates strictly against the confirmed targets without modifying punch records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* June */}
          <div className={`p-3.5 rounded-xl border ${selectedMonth === '2026-06' ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <div className="flex justify-between items-start">
              <span className="font-bold text-white font-sans">June 2026</span>
              <span className="font-mono text-sm font-bold text-[#D4AF37]">₹12,073</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-mono">
              30 Days · 26 Working Days (208:00:00) · Actual 169:10:00 · Shortfall 38:50:00 (−₹2,427.08) · 1 Sandwich Sunday (−₹500.00)
            </p>
          </div>

          {/* August */}
          <div className={`p-3.5 rounded-xl border ${selectedMonth === '2026-08' ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <div className="flex justify-between items-start">
              <span className="font-bold text-white font-sans">August 2026</span>
              <span className="font-mono text-sm font-bold text-[#D4AF37]">₹15,102</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-mono">
              31 Days · 26 Working Days (208:00:00) · Actual 201:41:00 · Shortfall 06:19:00 (−₹382.06) · 15th Aug Holiday (+₹483.87)
            </p>
          </div>

          {/* May */}
          <div className={`p-3.5 rounded-xl border ${selectedMonth === '2026-05' ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <div className="flex justify-between items-start">
              <span className="font-bold text-white font-sans">May 2026</span>
              <span className="font-mono text-sm font-bold text-[#D4AF37]">₹3,016</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-mono">
              31 Days · 26 Working Days (208:00:00) · Actual 41:32:00 · Prorated starting month with shortfall deductions applied
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
