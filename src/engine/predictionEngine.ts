// ============================================================================
// SALARYPULSE — AUTHORITATIVE SALARY PREDICTION & SCENARIO ENGINE
// Pure deterministic engine for Running-Month Projections, Multi-Month Forecasts,
// Target Earning Calculations, Work-Until Simulations, and Scenario Comparisons
// ============================================================================

import {
  AssumptionType,
  AttendanceDay,
  DayCalculationDetails,
  DeductionRule,
  Holiday,
  MonthlyProjectionResult,
  OvertimeMethod,
  ProjectionConfidenceLabel,
  ProjectionDay,
  ProjectionScenario,
  RateDerivation,
  SalaryConfig,
  ScenarioComparisonItem,
  WorkSchedule,
} from '../types';
import { DateEngine } from './dateEngine';
import { DayEngine } from './dayEngine';
import { SalaryEngine } from './salaryEngine';

export class PredictionEngine {
  /**
   * 1. Create a Default Projection Scenario for a given Month
   */
  static createDefaultScenario(
    yearMonth: string,
    schedule: WorkSchedule,
    holidays: Holiday[] = [],
    assumptionType: AssumptionType = 'EXPECTED'
  ): ProjectionScenario {
    const dates = DateEngine.getMonthDates(yearMonth);
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    const defaultLunchSeconds = Math.round((schedule.defaultLunchDurationMinutes || 60) * 60);

    const futureDays: ProjectionDay[] = dates.map(dateStr => {
      const isWeeklyOff = DateEngine.isWeeklyOff(dateStr, schedule);
      const holidayInfo = DateEngine.getHolidayForDate(dateStr, holidays);

      if (holidayInfo) {
        return {
          date: dateStr,
          status: holidayInfo.type === 'paid' ? 'PAID_HOLIDAY' : 'UNPAID_HOLIDAY',
          plannedWorkSeconds: 0,
          plannedBreakSeconds: 0,
          holidayId: holidayInfo.id,
          notes: holidayInfo.name,
        };
      }

      if (isWeeklyOff) {
        return {
          date: dateStr,
          status: 'WEEKLY_OFF',
          plannedWorkSeconds: 0,
          plannedBreakSeconds: 0,
        };
      }

      // Scheduled working day
      if (assumptionType === 'BEST_CASE') {
        return {
          date: dateStr,
          status: 'PRESENT',
          plannedWorkSeconds: requiredDailySeconds + 7200, // +2h OT planned
          plannedBreakSeconds: defaultLunchSeconds,
          notes: 'Best Case: Standard shift + 2h OT',
        };
      }

      if (assumptionType === 'WORST_CASE') {
        // e.g. Friday before last week absent
        const dayNumber = Number(dateStr.split('-')[2]);
        if (dayNumber >= 25 && dayNumber <= 27) {
          return {
            date: dateStr,
            status: 'ABSENT',
            plannedWorkSeconds: 0,
            plannedBreakSeconds: 0,
            notes: 'Worst Case: Projected absence',
          };
        }
      }

      return {
        date: dateStr,
        status: 'PRESENT',
        plannedWorkSeconds: requiredDailySeconds,
        plannedBreakSeconds: defaultLunchSeconds,
        notes: 'Default Projection Assumption (Normal full day)',
      };
    });

    return {
      id: `scenario-${yearMonth}-${assumptionType.toLowerCase()}`,
      name: assumptionType === 'EXPECTED' ? 'Expected Normal Month' : assumptionType === 'BEST_CASE' ? 'Best Case (Max OT)' : 'Conservative / Worst Case',
      targetMonth: yearMonth,
      assumptionType,
      futureDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Authoritative: Project Monthly Salary and Breakdown (Strict separation of Actual, Live, Projected, Potential, Confirmed)
   */
  static projectMonth(
    yearMonth: string,
    attendanceDays: AttendanceDay[],
    scenario: ProjectionScenario | undefined,
    config: SalaryConfig,
    schedule: WorkSchedule,
    holidays: Holiday[] = [],
    deductions: DeductionRule[] = [],
    referenceTodayDate: string = '2026-08-15',
    todayLiveDetails?: { liveActiveSeconds: number; liveBreakSeconds: number; liveOtSeconds: number; liveEarned: number }
  ): MonthlyProjectionResult {
    const dates = DateEngine.getMonthDates(yearMonth);
    const rates: RateDerivation = SalaryEngine.deriveRates(yearMonth, config, schedule, holidays);
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    // Map existing actual attendance days
    const actualMap = new Map<string, AttendanceDay>();
    attendanceDays.forEach(d => {
      if (d.date.startsWith(yearMonth)) {
        actualMap.set(d.date, d);
      }
    });

    // Map scenario future days
    const scenarioMap = new Map<string, ProjectionDay>();
    if (scenario && scenario.futureDays) {
      scenario.futureDays.forEach(fd => scenarioMap.set(fd.date, fd));
    }

    const calculatedDays: DayCalculationDetails[] = [];

    let scheduledWorkingDays = 0;
    let actualWorkingDays = 0;
    let futureWorkingDays = 0;
    let futureLeaveDays = 0;
    let futureHolidayDays = 0;

    let actualWorkSeconds = 0;
    let projectedFuturePlannedWorkSeconds = 0;

    let actualNormalEarnings = 0;
    let actualOTEarnings = 0;
    let actualHolidayCreditEarnings = 0;
    let liveTodayEarnings = 0;

    let projectedFutureNormalEarnings = 0;
    let projectedFutureOTEarnings = 0;
    let projectedFutureHolidayCredit = 0;

    let qualifyingAttendanceDays = 0;
    let customFutureDayCount = 0;

    // Track daily OT for Daily Threshold mode
    let actualDailyOTSeconds = 0;
    let projectedFutureDailyOTSeconds = 0;

    for (const dateStr of dates) {
      const isPast = dateStr < referenceTodayDate;
      const isToday = dateStr === referenceTodayDate;
      const isFuture = dateStr > referenceTodayDate;

      const isWeeklyOff = DateEngine.isWeeklyOff(dateStr, schedule);
      const holidayInfo = DateEngine.getHolidayForDate(dateStr, holidays);
      const isHoliday = !!holidayInfo;

      if (!isWeeklyOff && !isHoliday) {
        scheduledWorkingDays++;
      }

      if (isPast) {
        const record = actualMap.get(dateStr);
        const dayDetails = DayEngine.calculateDayDetails(
          dateStr,
          record,
          config,
          schedule,
          holidays,
          rates,
          referenceTodayDate
        );
        calculatedDays.push(dayDetails);

        actualWorkSeconds += dayDetails.actualActiveSeconds;
        actualNormalEarnings += dayDetails.baseSalaryEarned;
        actualOTEarnings += dayDetails.overtimeEarned;
        actualHolidayCreditEarnings += dayDetails.holidayCreditEarned;

        if (dayDetails.status === 'PRESENT' || dayDetails.status === 'COMPLETED' || dayDetails.status === 'PAID_LEAVE' || dayDetails.status === 'PAID_HOLIDAY') {
          qualifyingAttendanceDays += 1;
          if (!isWeeklyOff && !dayDetails.isHoliday) actualWorkingDays++;
        } else if (dayDetails.status === 'PARTIAL' || dayDetails.actualActiveSeconds > 0) {
          qualifyingAttendanceDays += 0.5;
          if (!isWeeklyOff && !dayDetails.isHoliday) actualWorkingDays += 0.5;
        }

        if (config.overtimeMethod === 'daily_threshold') {
          actualDailyOTSeconds += dayDetails.overtimeSeconds;
        }
      } else if (isToday) {
        const record = actualMap.get(dateStr);
        const dayDetails = DayEngine.calculateDayDetails(
          dateStr,
          record,
          config,
          schedule,
          holidays,
          rates,
          referenceTodayDate,
          todayLiveDetails ? {
            activeSeconds: todayLiveDetails.liveActiveSeconds,
            breakSeconds: todayLiveDetails.liveBreakSeconds,
            otSeconds: todayLiveDetails.liveOtSeconds,
          } : undefined
        );
        calculatedDays.push(dayDetails);

        const currentWork = todayLiveDetails ? todayLiveDetails.liveActiveSeconds : dayDetails.actualActiveSeconds;
        actualWorkSeconds += currentWork;
        liveTodayEarnings = todayLiveDetails ? todayLiveDetails.liveEarned : dayDetails.totalDailyEarned;
        actualHolidayCreditEarnings += dayDetails.holidayCreditEarned;

        if (currentWork >= requiredDailySeconds * 0.5 || dayDetails.isHoliday) {
          qualifyingAttendanceDays += 1;
          if (!isWeeklyOff && !dayDetails.isHoliday) actualWorkingDays++;
        }

        if (config.overtimeMethod === 'daily_threshold') {
          actualDailyOTSeconds += (todayLiveDetails ? todayLiveDetails.liveOtSeconds : dayDetails.overtimeSeconds);
        }
      } else {
        // FUTURE DAY: Use Scenario or Default Assumption
        const plannedDay = scenarioMap.get(dateStr);
        if (plannedDay && plannedDay.notes !== 'Default Projection Assumption (Normal full day)') {
          customFutureDayCount++;
        }

        const status = plannedDay ? plannedDay.status : (isHoliday ? (holidayInfo?.type === 'paid' ? 'PAID_HOLIDAY' : 'UNPAID_HOLIDAY') : isWeeklyOff ? 'WEEKLY_OFF' : 'PRESENT');
        const plannedWorkSec = plannedDay !== undefined ? plannedDay.plannedWorkSeconds : (isHoliday || isWeeklyOff ? 0 : requiredDailySeconds);
        const plannedBreakSec = plannedDay !== undefined ? plannedDay.plannedBreakSeconds : (isHoliday || isWeeklyOff ? 0 : Math.round((schedule.defaultLunchDurationMinutes || 60) * 60));

        let creditedNormalSec = 0;
        let dayBaseEarned = 0;
        let dayHolidayCredit = 0;
        let dayOTSeconds = 0;
        let dayOTEarned = 0;

        if (status === 'PAID_HOLIDAY' || (isHoliday && holidayInfo?.type === 'paid')) {
          creditedNormalSec = Math.round((holidayInfo?.creditedHours || config.defaultPaidHolidayCreditedHours || 8.0) * 3600);
          dayHolidayCredit = rates.perDayRate;
          projectedFutureHolidayCredit += dayHolidayCredit;
          qualifyingAttendanceDays += 1;
          futureHolidayDays++;
        } else if (status === 'PAID_LEAVE') {
          creditedNormalSec = requiredDailySeconds;
          dayBaseEarned = rates.perDayRate;
          projectedFutureNormalEarnings += dayBaseEarned;
          qualifyingAttendanceDays += 1;
          futureLeaveDays++;
        } else if (status === 'UNPAID_LEAVE' || status === 'ABSENT') {
          creditedNormalSec = 0;
          dayBaseEarned = 0;
          if (status === 'UNPAID_LEAVE') futureLeaveDays++;
        } else if (status === 'WEEKLY_OFF') {
          creditedNormalSec = 0;
          if (plannedWorkSec > 0) {
            projectedFuturePlannedWorkSeconds += plannedWorkSec;
          }
        } else {
          // PRESENT or CUSTOM WORK
          projectedFuturePlannedWorkSeconds += plannedWorkSec;
          if (plannedWorkSec >= requiredDailySeconds * 0.9) {
            qualifyingAttendanceDays += 1;
            futureWorkingDays++;
          } else if (plannedWorkSec > 0) {
            qualifyingAttendanceDays += 0.5;
            futureWorkingDays += 0.5;
          }

          if (config.overtimeMethod === 'daily_threshold') {
            const normalSec = Math.min(plannedWorkSec, requiredDailySeconds);
            dayOTSeconds = Math.max(0, plannedWorkSec - requiredDailySeconds);
            dayOTEarned = Number(((dayOTSeconds / 3600) * rates.overtimeHourlyRate).toFixed(2));
            dayBaseEarned = Number((normalSec * rates.perSecondRate).toFixed(2));
            projectedFutureDailyOTSeconds += dayOTSeconds;
            projectedFutureOTEarnings += dayOTEarned;
            projectedFutureNormalEarnings += dayBaseEarned;
          }
        }

        const futureDayDetails: DayCalculationDetails = {
          date: dateStr,
          dayNumber: Number(dateStr.split('-')[2]),
          dayOfWeek: DateEngine.getDayOfWeek(dateStr),
          dayName: new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
          status: status as any,
          statusLabel: status === 'PAID_HOLIDAY' ? 'Paid Holiday' : status === 'PAID_LEAVE' ? 'Paid Leave' : status === 'ABSENT' ? 'Absent' : status === 'WEEKLY_OFF' ? 'Weekly Off' : 'Present (Planned)',
          isToday: false,
          isPast: false,
          isFuture: true,
          isWeeklyOff,
          isHoliday,
          holidayInfo,
          requiredNormalSeconds: isWeeklyOff || isHoliday ? 0 : requiredDailySeconds,
          actualActiveSeconds: 0, // No actual physical work on future day!
          creditedNormalSeconds: creditedNormalSec,
          totalBreakSeconds: plannedBreakSec,
          normalSecondsWorked: config.overtimeMethod === 'daily_threshold' ? Math.min(plannedWorkSec, requiredDailySeconds) : plannedWorkSec,
          overtimeSeconds: dayOTSeconds,
          remainingSeconds: Math.max(0, requiredDailySeconds - plannedWorkSec),
          deficitSeconds: 0,
          baseSalaryEarned: 0,
          overtimeEarned: 0,
          holidayCreditEarned: 0,
          totalDailyEarned: 0,
          projectedDailyEarned: Number((dayBaseEarned + dayHolidayCredit + dayOTEarned).toFixed(2)),
          expectedNormalDaySalary: isWeeklyOff || isHoliday ? 0 : rates.perDayRate,
          salaryGap: 0,
          salaryGapReasons: [],
          isSuspicious: false,
          suspiciousReasons: [],
          workSessions: [],
          breakSessions: [],
          notes: plannedDay?.notes || 'Projected Scenario',
          source: 'SYSTEM',
        };

        calculatedDays.push(futureDayDetails);
      }
    }

    // =========================================================================
    // OVERTIME & NORMAL POOL RESOLUTION
    // =========================================================================
    const monthlyNormalTargetSeconds = scheduledWorkingDays * requiredDailySeconds;
    const totalMonthPlannedWorkSeconds = actualWorkSeconds + projectedFuturePlannedWorkSeconds;

    let actualNormalSeconds = 0;
    let actualOTSeconds = 0;
    let projectedNormalSeconds = 0;
    let projectedOTSeconds = 0;
    let otThresholdCrossed = false;
    let remainingNormalTargetSeconds = 0;

    if (config.overtimeMethod === 'monthly_threshold') {
      if (actualWorkSeconds >= monthlyNormalTargetSeconds) {
        // Threshold crossed already by actual work!
        otThresholdCrossed = true;
        actualNormalSeconds = monthlyNormalTargetSeconds;
        actualOTSeconds = actualWorkSeconds - monthlyNormalTargetSeconds;
        remainingNormalTargetSeconds = 0;

        projectedNormalSeconds = 0;
        projectedOTSeconds = projectedFuturePlannedWorkSeconds;
      } else {
        // Actual work is below monthly normal target
        actualNormalSeconds = actualWorkSeconds;
        actualOTSeconds = 0;
        remainingNormalTargetSeconds = monthlyNormalTargetSeconds - actualWorkSeconds;

        if (projectedFuturePlannedWorkSeconds > remainingNormalTargetSeconds) {
          otThresholdCrossed = true;
          projectedNormalSeconds = remainingNormalTargetSeconds;
          projectedOTSeconds = projectedFuturePlannedWorkSeconds - remainingNormalTargetSeconds;
        } else {
          otThresholdCrossed = false;
          projectedNormalSeconds = projectedFuturePlannedWorkSeconds;
          projectedOTSeconds = 0;
        }
      }

      // Re-evaluate earnings based on monthly threshold
      actualOTEarnings = Number(((actualOTSeconds / 3600) * rates.overtimeHourlyRate).toFixed(2));
      projectedFutureOTEarnings = Number(((projectedOTSeconds / 3600) * rates.overtimeHourlyRate).toFixed(2));
      projectedFutureNormalEarnings = Number((projectedNormalSeconds * rates.perSecondRate).toFixed(2));
    } else {
      // Daily threshold mode
      actualNormalSeconds = Math.max(0, actualWorkSeconds - actualDailyOTSeconds);
      actualOTSeconds = actualDailyOTSeconds;
      projectedNormalSeconds = Math.max(0, projectedFuturePlannedWorkSeconds - projectedFutureDailyOTSeconds);
      projectedOTSeconds = projectedFutureDailyOTSeconds;
      otThresholdCrossed = actualOTSeconds > 0 || projectedOTSeconds > 0;
      remainingNormalTargetSeconds = Math.max(0, monthlyNormalTargetSeconds - (actualNormalSeconds + projectedNormalSeconds));
    }

    const totalMonthNormalSeconds = actualNormalSeconds + projectedNormalSeconds;
    const totalMonthOTSeconds = actualOTSeconds + projectedOTSeconds;
    const totalMonthWorkSeconds = totalMonthNormalSeconds + totalMonthOTSeconds;

    // Actual Earnings Sum (Confirmed past base + confirmed OT + confirmed holiday credits)
    const actualEarnings = Number((actualNormalEarnings + actualOTEarnings + actualHolidayCreditEarnings + liveTodayEarnings).toFixed(2));

    // Projected Future Earnings Sum (Future normal + Future OT + Future holiday credits)
    const projectedFutureEarnings = Number((projectedFutureNormalEarnings + projectedFutureOTEarnings + projectedFutureHolidayCredit).toFixed(2));

    // Attendance Bonus Evaluation
    const bonusTargetDays = config.attendanceBonusEligibleDays || 26;
    const potentialBonus = config.attendanceBonusEnabled ? (config.attendanceBonusAmount || 3000) : 0;
    let bonusStatus: 'LIKELY ELIGIBLE' | 'AT RISK' | 'NOT ELIGIBLE' = 'NOT ELIGIBLE';
    let projectedBonus = 0;

    if (config.attendanceBonusEnabled) {
      if (qualifyingAttendanceDays >= bonusTargetDays) {
        bonusStatus = 'LIKELY ELIGIBLE';
        projectedBonus = potentialBonus;
      } else {
        const remainingDays = dates.filter(d => d > referenceTodayDate && !DateEngine.isWeeklyOff(d, schedule)).length;
        if (qualifyingAttendanceDays + remainingDays >= bonusTargetDays) {
          bonusStatus = 'AT RISK';
        } else {
          bonusStatus = 'NOT ELIGIBLE';
        }
        projectedBonus = 0;
      }
    }

    // Deductions Calculation
    let totalDeductions = 0;
    const itemizedDeductions = (deductions || []).filter(d => d.isEnabled).map(d => {
      let amount = 0;
      if (d.type === 'fixed') {
        amount = d.value;
      } else if (d.type === 'percentage') {
        amount = Number(((config.monthlyBaseSalary * d.value) / 100).toFixed(2));
      } else {
        amount = d.value;
      }
      totalDeductions += amount;
      return { id: d.id, name: d.name, amount };
    });

    // Month-End Totals
    let projectedMonthEndTotal = Math.max(0, Number((actualEarnings + projectedFutureEarnings - totalDeductions).toFixed(2)));
    if (projectedFuturePlannedWorkSeconds === 0 && futureLeaveDays === 0) {
      const authoritativeCalc = SalaryEngine.calculateMonthlySalary(
        yearMonth,
        config,
        schedule,
        attendanceDays,
        holidays,
        deductions
      );
      projectedMonthEndTotal = authoritativeCalc.finalSalary;
    }
    const projectedMonthEndWithBonus = Math.max(0, Number((projectedMonthEndTotal + projectedBonus).toFixed(2)));

    // Salary Gap Analysis
    const expectedMonthEndTarget = config.monthlyBaseSalary + (config.attendanceBonusEnabled ? potentialBonus : 0);
    const projectedSalaryGap = Math.max(0, Number((expectedMonthEndTarget - (projectedMonthEndTotal + projectedBonus)).toFixed(2)));

    const leaveImpact = Number((futureLeaveDays * rates.perDayRate).toFixed(2));
    const bonusDifference = (qualifyingAttendanceDays < bonusTargetDays && config.attendanceBonusEnabled) ? potentialBonus : 0;
    const otDifference = Math.max(0, Number((projectedFutureOTEarnings).toFixed(2)));
    const partialDayImpact = Math.max(0, Number((projectedSalaryGap - leaveImpact - bonusDifference).toFixed(2)));

    // Confidence / Assumption Quality Indicator
    const passedDaysCount = dates.filter(d => d <= referenceTodayDate).length;
    const totalMonthDays = dates.length;
    let confidenceLabel: ProjectionConfidenceLabel = 'MEDIUM CONFIDENCE';
    let confidenceReason = 'Standard projection with mixed actuals and default assumptions';

    if (passedDaysCount / totalMonthDays >= 0.6 && customFutureDayCount <= 2) {
      confidenceLabel = 'HIGH CONFIDENCE';
      confidenceReason = 'Actual recorded attendance dominates calculation (>60% elapsed with standard plan)';
    } else if (customFutureDayCount > 4 || passedDaysCount / totalMonthDays < 0.25) {
      confidenceLabel = 'LOW CONFIDENCE';
      confidenceReason = 'Significant custom future assumptions or early in the month';
    } else {
      confidenceLabel = 'MEDIUM CONFIDENCE';
      confidenceReason = 'Some future days use default or moderate custom assumptions';
    }

    // Step-by-step calculation explanation items
    const calculationSteps: MonthlyProjectionResult['calculationSteps'] = [
      {
        label: 'Actual Base Earned (Past Days)',
        amount: actualNormalEarnings,
        type: 'ACTUAL',
        description: `Verified compensation from recorded physical attendance (Aug 1–${referenceTodayDate === '2026-08-15' ? '14' : referenceTodayDate.slice(8)})`,
      },
      {
        label: "Today's Live Accrual",
        amount: liveTodayEarnings,
        type: 'LIVE' as const,
        description: `Real-time earnings accrued during active session on ${referenceTodayDate}`,
      },
      {
        label: 'Actual Overtime Pay',
        amount: actualOTEarnings,
        type: 'ACTUAL' as const,
        description: `Overtime earned so far (${(actualOTSeconds / 3600).toFixed(1)}h at ₹${rates.overtimeHourlyRate.toFixed(2)}/h)`,
      },
      {
        label: 'Confirmed Holiday Credits',
        amount: actualHolidayCreditEarnings,
        type: 'ACTUAL' as const,
        description: 'Paid holiday statutory credit applied to historical/current dates',
      },
      {
        label: 'Projected Future Normal Salary',
        amount: projectedFutureNormalEarnings,
        type: 'PROJECTED' as const,
        description: `Estimated standard earnings from future planned shifts (${(projectedNormalSeconds / 3600).toFixed(1)}h)`,
      },
      {
        label: 'Projected Future Overtime Pay',
        amount: projectedFutureOTEarnings,
        type: 'PROJECTED' as const,
        description: `Projected overtime compensation (${(projectedOTSeconds / 3600).toFixed(1)}h beyond threshold)`,
      },
      {
        label: 'Projected Future Holiday Credits',
        amount: projectedFutureHolidayCredit,
        type: 'PROJECTED' as const,
        description: 'Upcoming scheduled paid holidays credited at full day rate',
      },
      {
        label: 'Potential Attendance Bonus',
        amount: potentialBonus,
        type: 'POTENTIAL' as const,
        description: `Attendance incentive (Requires ${bonusTargetDays} days attendance; Status: ${bonusStatus}${config.bonusRequiresApproval ? ' — HR Approval Required' : ''})`,
      },
    ];

    if (totalDeductions > 0) {
      calculationSteps.push({
        label: 'Configured Deductions',
        amount: -totalDeductions,
        type: 'DEDUCTION' as const,
        description: itemizedDeductions.map(id => `${id.name}: ₹${id.amount}`).join(', '),
      });
    }

    return {
      yearMonth,
      scenarioId: scenario?.id,
      scenarioName: scenario?.name || 'Default Projection',
      assumptionType: scenario?.assumptionType || 'EXPECTED',
      confidenceLabel,
      confidenceReason,
      scheduledWorkingDays,
      actualWorkingDays,
      futureWorkingDays,
      futureLeaveDays,
      futureHolidayDays,
      actualWorkSeconds,
      projectedWorkSeconds: projectedFuturePlannedWorkSeconds,
      totalMonthWorkSeconds,
      actualNormalSeconds,
      projectedNormalSeconds,
      totalMonthNormalSeconds,
      requiredMonthlyNormalSeconds: monthlyNormalTargetSeconds,
      actualOTSeconds,
      projectedOTSeconds,
      totalMonthOTSeconds,
      actualEarnings,
      actualNormalEarnings,
      actualOTEarnings,
      actualHolidayCreditEarnings,
      liveTodayEarnings,
      projectedFutureEarnings,
      projectedFutureNormalEarnings,
      projectedFutureOTEarnings,
      projectedFutureHolidayCredit,
      potentialBonus,
      projectedBonus,
      bonusStatus,
      bonusRequiresApproval: config.bonusRequiresApproval,
      bonusApprovalState: config.autoApproveBonusOnEligible,
      qualifyingAttendanceDays,
      bonusTargetDays,
      deductions: totalDeductions,
      itemizedDeductions,
      projectedMonthEndTotal,
      projectedMonthEndWithBonus,
      expectedMonthEndTarget,
      projectedSalaryGap,
      salaryGapBreakdown: {
        leaveImpact,
        partialDayImpact,
        otDifference,
        bonusDifference,
      },
      otMode: config.overtimeMethod,
      monthlyNormalTargetSeconds,
      actualEligibleSeconds: actualWorkSeconds,
      remainingNormalTargetSeconds,
      projectedFutureEligibleSeconds: projectedFuturePlannedWorkSeconds,
      otThresholdCrossed,
      days: calculatedDays,
      calculationSteps,
    };
  }

  /**
   * 3. Target Salary Mode: Calculate required Overtime hours/seconds to reach a target earning
   */
  static calculateTargetEarningOT(
    targetAmount: number,
    projection: MonthlyProjectionResult,
    config: SalaryConfig,
    rates: RateDerivation
  ): {
    targetAmount: number;
    baseSalary: number;
    potentialBonus: number;
    bonusRequiresApproval: boolean;
    remainingDeficit: number;
    requiredOTSeconds: number;
    requiredOTHours: number;
    formattedRequiredOT: string;
    isAchievable: boolean;
    explanation: string;
  } {
    const baseSalary = config.monthlyBaseSalary || 15000;
    const potentialBonus = config.attendanceBonusEnabled ? (config.attendanceBonusAmount || 3000) : 0;
    const effectiveOtSecondRate = rates.overtimeSecondRate || (rates.overtimeHourlyRate / 3600);

    // If target is less than base + potential bonus:
    const expectedBaseAndBonus = baseSalary + potentialBonus;
    const remainingDeficit = Math.max(0, targetAmount - expectedBaseAndBonus);

    let requiredOTSeconds = 0;
    if (remainingDeficit > 0 && effectiveOtSecondRate > 0) {
      requiredOTSeconds = Math.ceil(remainingDeficit / effectiveOtSecondRate);
    }

    const requiredOTHours = Number((requiredOTSeconds / 3600).toFixed(2));
    const h = Math.floor(requiredOTSeconds / 3600);
    const m = Math.floor((requiredOTSeconds % 3600) / 60);
    const formattedRequiredOT = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    // Achievable check (assuming max realistic OT in a month is 80 hours)
    const isAchievable = requiredOTHours <= 80;

    let explanation = '';
    if (remainingDeficit === 0) {
      explanation = `Target ₹${targetAmount.toLocaleString()} is fully covered by Base Salary (₹${baseSalary.toLocaleString()}) + Potential Bonus (₹${potentialBonus.toLocaleString()}). No additional OT required.`;
    } else {
      explanation = `To reach ₹${targetAmount.toLocaleString()}, after Base (₹${baseSalary.toLocaleString()}) and Potential Bonus (₹${potentialBonus.toLocaleString()}), you need ₹${remainingDeficit.toLocaleString()} in Overtime (${formattedRequiredOT} hrs at ₹${rates.overtimeHourlyRate.toFixed(2)}/h).`;
    }

    return {
      targetAmount,
      baseSalary,
      potentialBonus,
      bonusRequiresApproval: config.bonusRequiresApproval,
      remainingDeficit,
      requiredOTSeconds,
      requiredOTHours,
      formattedRequiredOT,
      isAchievable,
      explanation,
    };
  }

  /**
   * 4. "Work Until" Simulator: Simulate extending today's work session
   */
  static calculateWorkUntil(
    currentTimeIso: string,
    targetClockTime: string, // e.g. "18:02" or "18:30"
    currentLiveActiveSeconds: number,
    currentLiveEarned: number,
    isCurrentlyWorking: boolean,
    config: SalaryConfig,
    rates: RateDerivation,
    schedule: WorkSchedule
  ): {
    selectedTime: string;
    currentEarned: number;
    projectedDailyEarned: number;
    additionalEarned: number;
    additionalWorkSeconds: number;
    formattedAdditionalWork: string;
    isOvertime: boolean;
    monthlyProjectedIncrease: number;
  } {
    const now = new Date(currentTimeIso);
    const [targetH, targetM] = targetClockTime.split(':').map(Number);
    const targetDate = new Date(now);
    targetDate.setHours(targetH, targetM, 0, 0);

    let additionalSeconds = 0;
    if (targetDate.getTime() > now.getTime()) {
      additionalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
    }

    const totalSimulatedActiveSeconds = currentLiveActiveSeconds + additionalSeconds;
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    let simulatedEarned = 0;
    let isOvertime = false;

    if (config.overtimeMethod === 'daily_threshold') {
      const normalSec = Math.min(totalSimulatedActiveSeconds, requiredDailySeconds);
      const otSec = Math.max(0, totalSimulatedActiveSeconds - requiredDailySeconds);
      isOvertime = otSec > 0;
      simulatedEarned = Number((normalSec * rates.perSecondRate + (otSec / 3600) * rates.overtimeHourlyRate).toFixed(2));
    } else {
      // Monthly threshold (pro-rated standard rate until threshold)
      simulatedEarned = Number((totalSimulatedActiveSeconds * rates.perSecondRate).toFixed(2));
    }

    const additionalEarned = Math.max(0, Number((simulatedEarned - currentLiveEarned).toFixed(2)));

    const addH = Math.floor(additionalSeconds / 3600);
    const addM = Math.floor((additionalSeconds % 3600) / 60);
    const formattedAdditionalWork = `${String(addH).padStart(2, '0')}:${String(addM).padStart(2, '0')}`;

    return {
      selectedTime: targetClockTime,
      currentEarned: currentLiveEarned,
      projectedDailyEarned: simulatedEarned,
      additionalEarned,
      additionalWorkSeconds: additionalSeconds,
      formattedAdditionalWork,
      isOvertime,
      monthlyProjectedIncrease: additionalEarned,
    };
  }

  /**
   * 4b. Comprehensive Work Until Projection (Break-Aware & OT Threshold-Aware)
   */
  static calculateWorkUntilProjection(
    currentTimeIso: string,
    targetClockTime: string, // e.g. "18:02"
    currentLiveActiveSeconds: number,
    currentLiveEarned: number,
    config: SalaryConfig,
    rates: RateDerivation,
    schedule: WorkSchedule,
    options?: {
      monthlyEligibleSecondsPrior?: number;
      monthlyTargetSeconds?: number;
      unpaidBreaksInIntervalSeconds?: number;
      targetDateStr?: string;
    }
  ): {
    selectedTime: string;
    currentEarned: number;
    projectedDailyEarned: number;
    additionalEarned: number;
    additionalWorkSeconds: number;
    formattedAdditionalWork: string;
    normalSecondsAdded: number;
    otSecondsAdded: number;
    normalEarningsAdded: number;
    otEarningsAdded: number;
    isOvertime: boolean;
  } {
    const now = new Date(currentTimeIso);
    const [targetH, targetM] = targetClockTime.split(':').map(Number);
    const targetDate = new Date(now);
    targetDate.setHours(targetH, targetM, 0, 0);

    let grossIntervalSeconds = 0;
    if (targetDate.getTime() > now.getTime()) {
      grossIntervalSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
    }

    const unpaidBreakSec = options?.unpaidBreaksInIntervalSeconds || 0;
    const additionalActiveSeconds = Math.max(0, grossIntervalSeconds - unpaidBreakSec);
    const totalSimulatedActive = currentLiveActiveSeconds + additionalActiveSeconds;

    const dayRequiredSeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    let normalSecondsAdded = 0;
    let otSecondsAdded = 0;
    let normalEarningsAdded = 0;
    let otEarningsAdded = 0;

    const otRatePerSec = rates.overtimeSecondRate || (rates.perSecondRate * (config.overtimeMultiplier || 2.0));

    if (config.overtimeMethod === 'daily_threshold') {
      const remainingDailyNormal = Math.max(0, dayRequiredSeconds - currentLiveActiveSeconds);
      normalSecondsAdded = Math.min(additionalActiveSeconds, remainingDailyNormal);
      otSecondsAdded = Math.max(0, additionalActiveSeconds - normalSecondsAdded);

      normalEarningsAdded = Number((normalSecondsAdded * rates.perSecondRate).toFixed(2));
      otEarningsAdded = Number((otSecondsAdded * otRatePerSec).toFixed(2));
    } else {
      // Monthly threshold
      const monthlyTarget = options?.monthlyTargetSeconds || ((schedule as any).monthlyScheduledWorkHours ? (schedule as any).monthlyScheduledWorkHours * 3600 : ((schedule.requiredActiveHoursPerDay || 8) * 26 * 3600));
      const priorMonthlyEligible = options?.monthlyEligibleSecondsPrior ?? (currentLiveActiveSeconds);
      const remainingMonthlyNormal = Math.max(0, monthlyTarget - priorMonthlyEligible);

      normalSecondsAdded = Math.min(additionalActiveSeconds, remainingMonthlyNormal);
      otSecondsAdded = Math.max(0, additionalActiveSeconds - normalSecondsAdded);

      normalEarningsAdded = Number((normalSecondsAdded * rates.perSecondRate).toFixed(2));
      otEarningsAdded = Number((otSecondsAdded * otRatePerSec).toFixed(2));
    }

    const additionalEarned = Number((normalEarningsAdded + otEarningsAdded).toFixed(2));
    const projectedDailyEarned = Number((currentLiveEarned + additionalEarned).toFixed(2));

    const addH = Math.floor(additionalActiveSeconds / 3600);
    const addM = Math.floor((additionalActiveSeconds % 3600) / 60);
    const addS = additionalActiveSeconds % 60;
    const formattedAdditionalWork = `${String(addH).padStart(2, '0')}:${String(addM).padStart(2, '0')}:${String(addS).padStart(2, '0')}`;

    return {
      selectedTime: targetClockTime,
      currentEarned: currentLiveEarned,
      projectedDailyEarned,
      additionalEarned,
      additionalWorkSeconds: additionalActiveSeconds,
      formattedAdditionalWork,
      normalSecondsAdded,
      otSecondsAdded,
      normalEarningsAdded,
      otEarningsAdded,
      isOvertime: otSecondsAdded > 0,
    };
  }

  /**
   * 5b. Authoritative calculateTimeToEarn (Two-tier rate calculation)
   */
  static calculateTimeToEarn(
    targetTodayEarnings: number,
    currentLiveEarned: number,
    currentLiveActiveSeconds: number,
    currentTimeIso: string,
    config: SalaryConfig,
    rates: RateDerivation,
    schedule: WorkSchedule,
    options?: {
      monthlyEligibleSecondsPrior?: number;
      monthlyTargetSeconds?: number;
    }
  ): {
    targetAmount: number;
    currentEarned: number;
    remainingAmount: number;
    requiredAdditionalSeconds: number;
    normalSecondsRequired: number;
    otSecondsRequired: number;
    formattedRequiredTime: string;
    estimatedClockCompletion: string;
    isOvertimeTransition: boolean;
    isTargetReached: boolean;
  } {
    const remainingAmount = Math.max(0, Number((targetTodayEarnings - currentLiveEarned).toFixed(2)));
    if (remainingAmount <= 0) {
      const now = new Date(currentTimeIso);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      return {
        targetAmount: targetTodayEarnings,
        currentEarned: currentLiveEarned,
        remainingAmount: 0,
        requiredAdditionalSeconds: 0,
        normalSecondsRequired: 0,
        otSecondsRequired: 0,
        formattedRequiredTime: '00:00:00',
        estimatedClockCompletion: `${hh}:${mm}`,
        isOvertimeTransition: false,
        isTargetReached: true,
      };
    }

    const otRatePerSec = rates.overtimeSecondRate || (rates.perSecondRate * (config.overtimeMultiplier || 2.0));
    let normalSecondsRequired = 0;
    let otSecondsRequired = 0;
    let isOvertimeTransition = false;

    if (config.overtimeMethod === 'daily_threshold') {
      const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
      const remainingNormalSeconds = Math.max(0, requiredDailySeconds - currentLiveActiveSeconds);
      const normalPotentialAmount = remainingNormalSeconds * rates.perSecondRate;

      if (remainingAmount <= normalPotentialAmount) {
        normalSecondsRequired = rates.perSecondRate > 0 ? Math.ceil(remainingAmount / rates.perSecondRate) : 0;
      } else {
        isOvertimeTransition = true;
        normalSecondsRequired = remainingNormalSeconds;
        const otDeficit = remainingAmount - normalPotentialAmount;
        otSecondsRequired = otRatePerSec > 0 ? Math.ceil(otDeficit / otRatePerSec) : 0;
      }
    } else {
      // Monthly Threshold
      const monthlyTarget = options?.monthlyTargetSeconds || ((schedule as any).monthlyScheduledWorkHours ? (schedule as any).monthlyScheduledWorkHours * 3600 : ((schedule.requiredActiveHoursPerDay || 8) * 26 * 3600));
      const priorMonthlyEligible = options?.monthlyEligibleSecondsPrior ?? currentLiveActiveSeconds;
      const remainingMonthlyNormal = Math.max(0, monthlyTarget - priorMonthlyEligible);
      const normalPotentialAmount = remainingMonthlyNormal * rates.perSecondRate;

      if (remainingAmount <= normalPotentialAmount) {
        normalSecondsRequired = rates.perSecondRate > 0 ? Math.ceil(remainingAmount / rates.perSecondRate) : 0;
      } else {
        isOvertimeTransition = true;
        normalSecondsRequired = remainingMonthlyNormal;
        const otDeficit = remainingAmount - normalPotentialAmount;
        otSecondsRequired = otRatePerSec > 0 ? Math.ceil(otDeficit / otRatePerSec) : 0;
      }
    }

    const totalSecRequired = normalSecondsRequired + otSecondsRequired;
    const now = new Date(currentTimeIso);
    const completionDate = new Date(now.getTime() + totalSecRequired * 1000);
    const hh = String(completionDate.getHours()).padStart(2, '0');
    const mm = String(completionDate.getMinutes()).padStart(2, '0');

    const reqH = Math.floor(totalSecRequired / 3600);
    const reqM = Math.floor((totalSecRequired % 3600) / 60);
    const reqS = totalSecRequired % 60;
    const formattedRequiredTime = `${String(reqH).padStart(2, '0')}:${String(reqM).padStart(2, '0')}:${String(reqS).padStart(2, '0')}`;

    return {
      targetAmount: targetTodayEarnings,
      currentEarned: currentLiveEarned,
      remainingAmount,
      requiredAdditionalSeconds: totalSecRequired,
      normalSecondsRequired,
      otSecondsRequired,
      formattedRequiredTime,
      estimatedClockCompletion: `${hh}:${mm}`,
      isOvertimeTransition,
      isTargetReached: false,
    };
  }

  /**
   * 8. Daily Work Progress Calculator (Exact % & HH:MM:SS)
   */
  static calculateDailyProgress(
    activeSeconds: number,
    requiredDailyHours: number = 8.0,
    dateStr: string = '2026-08-15'
  ) {
    const requiredSeconds = Math.round(requiredDailyHours * 3600);
    const normalSeconds = Math.min(activeSeconds, requiredSeconds);
    const overtimeSeconds = Math.max(0, activeSeconds - requiredSeconds);
    const remainingSeconds = Math.max(0, requiredSeconds - activeSeconds);

    const progressPercentage = requiredSeconds > 0
      ? Number(((normalSeconds / requiredSeconds) * 100).toFixed(2))
      : 0;

    const remainingPercentage = requiredSeconds > 0
      ? Number(((remainingSeconds / requiredSeconds) * 100).toFixed(2))
      : 0;

    const formatHMS = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return {
      date: dateStr,
      requiredSeconds,
      completedSeconds: activeSeconds,
      normalSeconds,
      remainingSeconds,
      overtimeSeconds,
      progressPercentage,
      remainingPercentage,
      isCompleted: activeSeconds >= requiredSeconds,
      formattedRequired: formatHMS(requiredSeconds),
      formattedCompleted: formatHMS(activeSeconds),
      formattedRemaining: formatHMS(remainingSeconds),
      formattedOvertime: formatHMS(overtimeSeconds),
    };
  }

  /**
   * 9. Weekly Work Progress Calculator (Monday - Sunday)
   */
  static calculateWeeklyProgress(
    weekStartDate: string,
    attendanceDays: AttendanceDay[],
    schedule: WorkSchedule,
    holidays: Holiday[] = []
  ) {
    const weekDates: string[] = [];
    const [y, m, d] = weekStartDate.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);

    for (let i = 0; i < 7; i++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + i);
      const cY = cur.getFullYear();
      const cM = String(cur.getMonth() + 1).padStart(2, '0');
      const cD = String(cur.getDate()).padStart(2, '0');
      weekDates.push(`${cY}-${cM}-${cD}`);
    }

    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    let totalRequiredSeconds = 0;
    let totalCompletedSeconds = 0;
    let totalOvertimeSeconds = 0;

    for (const dateStr of weekDates) {
      const isWeeklyOff = DateEngine.isWeeklyOff(dateStr, schedule);
      const holiday = DateEngine.getHolidayForDate(dateStr, holidays);

      if (!isWeeklyOff && (!holiday || holiday.type !== 'paid')) {
        totalRequiredSeconds += requiredDailySeconds;
      }

      const dayRecord = attendanceDays.find(a => a.date === dateStr);
      if (dayRecord) {
        const active = dayRecord.totalActiveSeconds || 0;
        totalCompletedSeconds += active;
        if (active > requiredDailySeconds) {
          totalOvertimeSeconds += (active - requiredDailySeconds);
        }
      }
    }

    const normalCompleted = Math.min(totalCompletedSeconds, totalRequiredSeconds);
    const remainingSeconds = Math.max(0, totalRequiredSeconds - totalCompletedSeconds);
    const progressPercentage = totalRequiredSeconds > 0
      ? Number(((normalCompleted / totalRequiredSeconds) * 100).toFixed(2))
      : 0;

    const formatHMS = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return {
      weekLabel: `${weekDates[0]} to ${weekDates[6]}`,
      startDate: weekDates[0],
      endDate: weekDates[6],
      requiredSeconds: totalRequiredSeconds,
      completedSeconds: totalCompletedSeconds,
      remainingSeconds,
      overtimeSeconds: totalOvertimeSeconds,
      progressPercentage,
      formattedRequired: formatHMS(totalRequiredSeconds),
      formattedCompleted: formatHMS(totalCompletedSeconds),
      formattedRemaining: formatHMS(remainingSeconds),
      formattedOvertime: formatHMS(totalOvertimeSeconds),
    };
  }

  /**
   * 10. Monthly Work Progress Calculator (Authoritative)
   */
  static calculateMonthlyProgress(
    yearMonth: string,
    attendanceDays: AttendanceDay[],
    schedule: WorkSchedule,
    holidays: Holiday[] = []
  ) {
    const dates = DateEngine.getMonthDates(yearMonth);
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    let targetNormalSeconds = 0;
    for (const d of dates) {
      const isOff = DateEngine.isWeeklyOff(d, schedule);
      const hol = DateEngine.getHolidayForDate(d, holidays);
      if (!isOff && (!hol || hol.type !== 'paid')) {
        targetNormalSeconds += requiredDailySeconds;
      }
    }

    let completedEligibleSeconds = 0;
    const monthDays = attendanceDays.filter(a => a.date.startsWith(yearMonth));
    for (const md of monthDays) {
      completedEligibleSeconds += (md.totalActiveSeconds || 0);
    }

    const isThresholdReached = completedEligibleSeconds >= targetNormalSeconds;
    const remainingNormalSeconds = Math.max(0, targetNormalSeconds - completedEligibleSeconds);
    const overtimeSeconds = Math.max(0, completedEligibleSeconds - targetNormalSeconds);

    const normalWorked = Math.min(completedEligibleSeconds, targetNormalSeconds);
    const progressPercentage = targetNormalSeconds > 0
      ? Number(((normalWorked / targetNormalSeconds) * 100).toFixed(2))
      : 0;

    const formatHMS = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return {
      yearMonth,
      targetNormalSeconds,
      completedEligibleSeconds,
      remainingNormalSeconds,
      overtimeSeconds,
      progressPercentage,
      isThresholdReached,
      formattedTarget: formatHMS(targetNormalSeconds),
      formattedCompleted: formatHMS(completedEligibleSeconds),
      formattedRemaining: formatHMS(remainingNormalSeconds),
      formattedOvertime: formatHMS(overtimeSeconds),
    };
  }

  /**
   * 5. "How Long to Earn ₹X?" Target Daily Earning Time Calculator
   */
  static calculateTimeToEarnAmount(
    targetTodayEarnings: number,
    currentLiveEarned: number,
    currentLiveActiveSeconds: number,
    currentTimeIso: string,
    config: SalaryConfig,
    rates: RateDerivation,
    schedule: WorkSchedule
  ): {
    targetAmount: number;
    currentEarned: number;
    remainingAmount: number;
    requiredAdditionalSeconds: number;
    formattedRequiredTime: string;
    estimatedClockCompletion: string;
    isOvertimeTransition: boolean;
  } {
    const remainingAmount = Math.max(0, Number((targetTodayEarnings - currentLiveEarned).toFixed(2)));
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    let requiredAdditionalSeconds = 0;
    let isOvertimeTransition = false;

    if (remainingAmount > 0) {
      if (config.overtimeMethod === 'daily_threshold' && currentLiveActiveSeconds >= requiredDailySeconds) {
        // Already in daily OT
        isOvertimeTransition = true;
        requiredAdditionalSeconds = Math.ceil(remainingAmount / (rates.overtimeHourlyRate / 3600));
      } else if (config.overtimeMethod === 'daily_threshold') {
        // May transition from normal to OT
        const remainingNormalSeconds = Math.max(0, requiredDailySeconds - currentLiveActiveSeconds);
        const normalPotentialEarned = remainingNormalSeconds * rates.perSecondRate;

        if (remainingAmount <= normalPotentialEarned) {
          requiredAdditionalSeconds = Math.ceil(remainingAmount / rates.perSecondRate);
        } else {
          isOvertimeTransition = true;
          const otDeficit = remainingAmount - normalPotentialEarned;
          const otSec = Math.ceil(otDeficit / (rates.overtimeHourlyRate / 3600));
          requiredAdditionalSeconds = remainingNormalSeconds + otSec;
        }
      } else {
        requiredAdditionalSeconds = Math.ceil(remainingAmount / rates.perSecondRate);
      }
    }

    const now = new Date(currentTimeIso);
    const completionDate = new Date(now.getTime() + requiredAdditionalSeconds * 1000);
    const estimatedClockCompletion = completionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const h = Math.floor(requiredAdditionalSeconds / 3600);
    const m = Math.floor((requiredAdditionalSeconds % 3600) / 60);
    const formattedRequiredTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    return {
      targetAmount: targetTodayEarnings,
      currentEarned: currentLiveEarned,
      remainingAmount,
      requiredAdditionalSeconds,
      formattedRequiredTime,
      estimatedClockCompletion,
      isOvertimeTransition,
    };
  }

  /**
   * 6. "If I Leave Now" Simulator
   */
  static calculateIfILeaveNow(
    todayDate: string,
    currentLiveActiveSeconds: number,
    currentLiveEarned: number,
    projection: MonthlyProjectionResult,
    config: SalaryConfig,
    schedule: WorkSchedule,
    rates: RateDerivation
  ): {
    todayActualWorkFormatted: string;
    todayEarned: number;
    todayDeficitSeconds: number;
    todayDeficitFormatted: string;
    todayDeficitImpact: number;
    monthlyProjectedTotalIfLeaveNow: number;
    monthlyImpact: number;
  } {
    const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    const todayDeficitSeconds = Math.max(0, requiredDailySeconds - currentLiveActiveSeconds);
    const todayDeficitImpact = Number((todayDeficitSeconds * rates.perSecondRate).toFixed(2));

    const workH = Math.floor(currentLiveActiveSeconds / 3600);
    const workM = Math.floor((currentLiveActiveSeconds % 3600) / 60);
    const todayActualWorkFormatted = `${String(workH).padStart(2, '0')}:${String(workM).padStart(2, '0')}`;

    const defH = Math.floor(todayDeficitSeconds / 3600);
    const defM = Math.floor((todayDeficitSeconds % 3600) / 60);
    const todayDeficitFormatted = `${String(defH).padStart(2, '0')}:${String(defM).padStart(2, '0')}`;

    const monthlyProjectedTotalIfLeaveNow = Math.max(0, Number((projection.projectedMonthEndTotal - todayDeficitImpact).toFixed(2)));

    return {
      todayActualWorkFormatted,
      todayEarned: currentLiveEarned,
      todayDeficitSeconds,
      todayDeficitFormatted,
      todayDeficitImpact,
      monthlyProjectedTotalIfLeaveNow,
      monthlyImpact: todayDeficitImpact,
    };
  }

  /**
   * 7. Scenario Comparison: Compare multiple scenarios side-by-side
   */
  static compareScenarios(
    scenarios: ProjectionScenario[],
    attendanceDays: AttendanceDay[],
    config: SalaryConfig,
    schedule: WorkSchedule,
    holidays: Holiday[] = [],
    deductions: DeductionRule[] = [],
    referenceTodayDate: string = '2026-08-15',
    todayLiveDetails?: { liveActiveSeconds: number; liveBreakSeconds: number; liveOtSeconds: number; liveEarned: number }
  ): ScenarioComparisonItem[] {
    return (scenarios || []).map(sc => {
      const proj = this.projectMonth(
        sc.targetMonth,
        attendanceDays,
        sc,
        config,
        schedule,
        holidays,
        deductions,
        referenceTodayDate,
        todayLiveDetails
      );

      return {
        scenarioId: sc.id,
        scenarioName: sc.name,
        assumptionType: sc.assumptionType,
        projectedTotal: proj.projectedMonthEndTotal,
        projectedTotalWithBonus: proj.projectedMonthEndWithBonus,
        projectedOT: Number((proj.totalMonthOTSeconds / 3600).toFixed(1)),
        projectedOTPay: Number((proj.actualOTEarnings + proj.projectedFutureOTEarnings).toFixed(2)),
        projectedHours: Number((proj.totalMonthWorkSeconds / 3600).toFixed(1)),
        projectedAttendance: proj.qualifyingAttendanceDays,
        bonusStatus: proj.bonusStatus,
        salaryGap: proj.projectedSalaryGap,
      };
    });
  }
}
