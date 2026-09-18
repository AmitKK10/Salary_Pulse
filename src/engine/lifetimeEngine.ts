// ============================================================================
// SALARYPULSE — AUTHORITATIVE LIFETIME STATS ENGINE
// Centralized lifetime salary and hours aggregation engine
// Strictly implementing confirmed historical payroll + dynamic current accrual
// ============================================================================

import { AttendanceDay, Holiday, SalaryConfig, WorkSchedule, SalaryReconciliationRecord } from '../types';
import { SalaryEngine } from './salaryEngine';
import { formatSecondsToHHMMSS } from '../utils/formatters';

export const CONFIRMED_LIFETIME_BENCHMARKS: Record<string, {
  officialDisbursed: number;
  confirmedWorkSeconds: number;
  isConfirmed: boolean;
  notes: string;
}> = {
  '2026-05': {
    officialDisbursed: 3016,
    confirmedWorkSeconds: 49 * 3600 + 52 * 60, // 179,520s (49h 52m 00s)
    isConfirmed: true,
    notes: 'Confirmed company slip shows ₹3,016 for partial joining month starting May 25, 2026 (6 scheduled working days worked + 1h 52m extra work @ daily rate = ₹3,016).',
  },
  '2026-06': {
    officialDisbursed: 12073,
    confirmedWorkSeconds: 169 * 3600 + 10 * 60, // 609,000s (169h 10m 00s)
    isConfirmed: true,
    notes: 'Official attendance 169h 10m (208h required - 38h 50m shortfall = ₹2,427.08 deduction) - 1 Sandwich Sunday (₹500) = ₹12,073 Net.',
  },
  '2026-07': {
    officialDisbursed: 0,
    confirmedWorkSeconds: 0,
    isConfirmed: true,
    notes: 'July has no attendance data; contributes ₹0 to lifetime accounting.',
  },
  '2026-08': {
    officialDisbursed: 15102,
    confirmedWorkSeconds: 201 * 3600 + 41 * 60, // 726,060s (201h 41m 00s)
    isConfirmed: true,
    notes: 'Confirmed company salary ₹15,102: Base ₹15,000 - Shortfall ₹382.06 + Paid Holiday ₹483.87 (Aug 15) = ₹15,102.',
  },
};

export interface LifetimeMonthRecord {
  month: string;                    // '2026-05'
  monthLabel: string;               // 'May 2026'
  hoursWorked: number;              // decimal hours, e.g. 49.87
  activeSeconds: number;            // raw active seconds
  hoursFormatted: string;           // '49:52:00'
  officialDisbursedPay: number;     // Confirmed disbursed salary (0 for current unfinalized month)
  calculatedAccruedPay: number;     // Net calculated / live accrued salary
  effectiveIncome: number;          // Depends on active mode
  isCurrentRunningMonth: boolean;   // true for current in-progress month (e.g. September)
  isDisbursed: boolean;             // true if finalized and disbursed
  isReconciled: boolean;
  isLocked: boolean;
  statusText: string;
}

export interface LifetimeStatsResult {
  totalIncome: number;              // Active mode income (Disbursed vs Calculated Accrual)
  totalCumulativeIncome: number;    // Alias to totalIncome for UI consistency
  totalIncomeDisbursed: number;     // ₹30,191.00 (May: 3016 + June: 12073 + July: 0 + Aug: 15102)
  totalIncomeCalculated: number;    // ₹30,191.00 + current month's live accrued (e.g. ~₹37,271.50)
  currentMonthAccrued: number;      // Current month's dynamic accrued earnings
  totalMonthsWorked: number;        // Total distinct months in lifetime history
  totalHoursLogged: number;         // Total active hours worked across all time
  totalHoursFormatted: string;      // Formatted as HH:MM:SS
  totalActiveSeconds: number;       // Raw seconds
  averageMonthlyEarnings: number;   // totalIncome / totalMonthsWorked
  averageHoursPerMonth: number;     // totalHoursLogged / totalMonthsWorked
  averageHourlyEarning: number;     // totalIncome / totalHoursLogged
  monthlyList: LifetimeMonthRecord[];
  incomeMode: 'disbursed' | 'calculated';
}

export class LifetimeEngine {
  /**
   * Authoritative lifetime statistics aggregation function.
   * Strictly separates Official / Disbursed vs Calculated Accrual modes.
   *
   * Confirmed lifetime payroll basis:
   * May 2026:  ₹3,016
   * June 2026: ₹12,073
   * July 2026: ₹0
   * August 2026: ₹15,102
   * September 2026: Dynamic accrued amount (never hardcoded, updates every second)
   */
  static calculateLifetimeStats(params: {
    attendanceDays: AttendanceDay[];
    salaryReconciliationRecords?: SalaryReconciliationRecord[];
    salaryConfig: SalaryConfig;
    schedule: WorkSchedule;
    holidays: Holiday[];
    selectedMonth: string;
    todayDate: string;
    currentMonthLiveAccrued: number;
    isCurrentlyWorking: boolean;
    todayLiveActiveSeconds: number;
    incomeMode?: 'disbursed' | 'calculated';
  }): LifetimeStatsResult {
    const {
      attendanceDays = [],
      salaryReconciliationRecords = [],
      salaryConfig,
      schedule,
      holidays,
      selectedMonth,
      todayDate,
      currentMonthLiveAccrued,
      isCurrentlyWorking,
      todayLiveActiveSeconds,
      incomeMode = 'disbursed',
    } = params;

    // 1. Determine active current running month key from todayDate or selectedMonth
    const currentRunningMonth = todayDate ? todayDate.substring(0, 7) : (selectedMonth || '2026-09');

    let dynamicAccrued = currentMonthLiveAccrued;
    if (typeof dynamicAccrued !== 'number') {
      try {
        const currentMonthCalc = SalaryEngine.calculateMonthlySalary(
          currentRunningMonth,
          salaryConfig,
          schedule,
          attendanceDays,
          holidays
        );
        dynamicAccrued = currentMonthCalc.realtimeEarnedSoFar || currentMonthCalc.finalSalary || 0;
      } catch {
        dynamicAccrued = 0;
      }
    }

    // 2. Identify all career months: guaranteed standard history (May to current) plus any in records
    const monthsSet = new Set<string>(['2026-05', '2026-06', '2026-07', '2026-08', currentRunningMonth]);
    attendanceDays.forEach((d) => {
      if (d.date && d.date.length >= 7) monthsSet.add(d.date.substring(0, 7));
    });
    salaryReconciliationRecords.forEach((r) => {
      if (r.month) monthsSet.add(r.month);
    });
    if (selectedMonth) monthsSet.add(selectedMonth);

    const sortedMonths = Array.from(monthsSet).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 3. Pre-aggregate active seconds per month strictly using authoritative daily work duration
    // Authoritative daily work duration = Last Punch-Out - First Punch-In - 1 hour lunch
    const monthActiveSecondsMap: Record<string, number> = {};
    let grandTotalActiveSeconds = 0;

    attendanceDays.forEach((d) => {
      const ym = d.date.substring(0, 7);
      let daySec = d.totalActiveSeconds || 0;
      if (d.date === todayDate && isCurrentlyWorking && todayLiveActiveSeconds > daySec) {
        daySec = todayLiveActiveSeconds;
      }
      monthActiveSecondsMap[ym] = (monthActiveSecondsMap[ym] || 0) + daySec;
      grandTotalActiveSeconds += daySec;
    });

    let cumulativeIncomeDisbursed = 0;
    let cumulativeIncomeCalculated = 0;
    const monthlyList: LifetimeMonthRecord[] = [];

    for (const ym of sortedMonths) {
      const [year, mStr] = ym.split('-');
      const monthIdx = parseInt(mStr, 10) - 1;
      const monthLabel = `${monthNames[monthIdx] || mStr} ${year}`;
      const isRunningMonth = ym === currentRunningMonth;

      // Authoritative work seconds for this month
      let monthSeconds = monthActiveSecondsMap[ym] || 0;
      // If confirmed benchmark exists and no attendance days were in dataset for this historical month (e.g. July = 0)
      if (monthSeconds === 0 && CONFIRMED_LIFETIME_BENCHMARKS[ym]) {
        monthSeconds = CONFIRMED_LIFETIME_BENCHMARKS[ym].confirmedWorkSeconds;
      }

      let officialDisbursedPay = 0;
      let calculatedAccruedPay = 0;
      let statusText = 'Completed';
      let isDisbursed = false;

      if (isRunningMonth) {
        // Current in-progress month:
        // - Official / Disbursed: ₹0 (Not yet finalized / not disbursed)
        // - Calculated Accrual: authoritative dynamic live accrued earnings
        officialDisbursedPay = 0;
        calculatedAccruedPay = dynamicAccrued;
        statusText = 'Live Accruing (In Progress)';
        isDisbursed = false;
      } else if (CONFIRMED_LIFETIME_BENCHMARKS[ym]) {
        // Confirmed historical benchmark month (May, June, July, August)
        const benchmark = CONFIRMED_LIFETIME_BENCHMARKS[ym];
        officialDisbursedPay = benchmark.officialDisbursed;
        calculatedAccruedPay = benchmark.officialDisbursed;
        isDisbursed = benchmark.officialDisbursed > 0;
        statusText = benchmark.officialDisbursed === 0 ? 'No Attendance / ₹0' : 'Confirmed & Disbursed';
      } else {
        // Any other historical month: check reconciliation records or calculate via SalaryEngine
        const recon = salaryReconciliationRecords.find((r) => r.month === ym);
        const calc = SalaryEngine.calculateMonthlySalary(
          ym,
          salaryConfig,
          schedule,
          attendanceDays,
          holidays
        );

        if (recon?.officialSlip?.isProvided && recon.officialSlip.netSalary > 0) {
          officialDisbursedPay = recon.officialSlip.netSalary;
        } else if (recon?.bankReceipt?.isProvided && recon.bankReceipt.amountReceived > 0) {
          officialDisbursedPay = recon.bankReceipt.amountReceived;
        } else {
          officialDisbursedPay = calc.finalSalary;
        }

        calculatedAccruedPay = calc.finalSalary;
        isDisbursed = officialDisbursedPay > 0;
        statusText = recon?.isLocked ? 'Verified & Locked' : 'Historical Record';
      }

      cumulativeIncomeDisbursed += officialDisbursedPay;
      cumulativeIncomeCalculated += (isRunningMonth ? calculatedAccruedPay : officialDisbursedPay);

      const effectiveIncome = incomeMode === 'disbursed' ? officialDisbursedPay : calculatedAccruedPay;

      monthlyList.push({
        month: ym,
        monthLabel,
        hoursWorked: Number((monthSeconds / 3600).toFixed(2)),
        activeSeconds: monthSeconds,
        hoursFormatted: formatSecondsToHHMMSS(monthSeconds),
        officialDisbursedPay,
        calculatedAccruedPay,
        effectiveIncome,
        isCurrentRunningMonth: isRunningMonth,
        isDisbursed,
        isReconciled: isDisbursed,
        isLocked: !isRunningMonth && isDisbursed,
        statusText,
      });
    }

    const totalMonthsWorked = sortedMonths.length;
    const activeIncomeTotal = incomeMode === 'disbursed' ? cumulativeIncomeDisbursed : cumulativeIncomeCalculated;
    const totalHoursLogged = grandTotalActiveSeconds / 3600;
    const averageMonthlyEarnings = totalMonthsWorked > 0 ? activeIncomeTotal / totalMonthsWorked : 0;
    const averageHoursPerMonth = totalMonthsWorked > 0 ? totalHoursLogged / totalMonthsWorked : 0;
    const averageHourlyEarning = totalHoursLogged > 0 ? activeIncomeTotal / totalHoursLogged : 0;

    return {
      totalIncome: activeIncomeTotal,
      totalCumulativeIncome: activeIncomeTotal,
      totalIncomeDisbursed: cumulativeIncomeDisbursed,
      totalIncomeCalculated: cumulativeIncomeCalculated,
      currentMonthAccrued: dynamicAccrued,
      totalMonthsWorked,
      totalHoursLogged: Number(totalHoursLogged.toFixed(2)),
      totalHoursFormatted: formatSecondsToHHMMSS(grandTotalActiveSeconds),
      totalActiveSeconds: grandTotalActiveSeconds,
      averageMonthlyEarnings: Number(averageMonthlyEarnings.toFixed(2)),
      averageHoursPerMonth: Number(averageHoursPerMonth.toFixed(2)),
      averageHourlyEarning: Number(averageHourlyEarning.toFixed(2)),
      monthlyList,
      incomeMode,
    };
  }
}
