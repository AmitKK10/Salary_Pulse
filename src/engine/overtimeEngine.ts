// ============================================================================
// SALARYPULSE — OVERTIME ENGINE
// Authoritative calculation of Monthly Threshold, Daily Threshold, and OT Accruals
// ============================================================================

import { 
  AttendanceDay, 
  Holiday, 
  SalaryConfig, 
  WorkSchedule 
} from '../types';
import { DateEngine } from './dateEngine';

export interface OvertimeResult {
  overtimeSeconds: number;
  overtimeHours: number;
  normalHoursWorked: number;
  normalSecondsWorked: number;
  eligibleTotalSeconds: number;
  monthlyTargetSeconds: number;
  monthlyTargetHours: number;
  methodUsed: string;
  isThresholdCrossed: boolean;
  surplusSeconds: number;
  dailyBreakdown: { date: string; activeSeconds: number; overtimeSeconds: number; isWeeklyOff: boolean }[];
}

export class OvertimeEngine {
  /**
   * Authoritative calculation of Overtime across the entire month
   */
  static calculateMonthlyOvertime(
    yearMonth: string,
    attendanceDays: AttendanceDay[],
    config: SalaryConfig,
    schedule: WorkSchedule,
    holidays: Holiday[]
  ): OvertimeResult {
    const scheduledDaysCount = 26; // Standard 26-day monthly basis (26 * 8 = 208h)
    const requiredDailySeconds = Math.round((schedule?.requiredActiveHoursPerDay || 8.0) * 3600);
    const monthlyTargetSeconds = scheduledDaysCount * requiredDailySeconds;
    const monthlyTargetHours = monthlyTargetSeconds / 3600;

    const workingDays = schedule.workingDays || [1, 2, 3, 4, 5, 6];

    // Filter attendance days belonging to the active month
    const monthDays = attendanceDays.filter(d => d.date.startsWith(yearMonth));

    if (config.overtimeMethod === 'daily_threshold') {
      // ----------------------------------------------------------------------
      // DAILY THRESHOLD MODE:
      // Overtime is calculated on a per-day basis whenever daily active work > daily threshold
      // ----------------------------------------------------------------------
      let totalDailyOtSeconds = 0;
      let totalNormalSeconds = 0;
      const dailyBreakdown: OvertimeResult['dailyBreakdown'] = [];

      for (const day of monthDays) {
        const isWeeklyOff = !workingDays.includes(DateEngine.getDayOfWeek(day.date));
        const activeSec = day.totalActiveSeconds || 0;

        let dailyOt = 0;
        let dailyNormal = 0;

        if (isWeeklyOff) {
          if (config.weeklyOffWorkRule === 'always_overtime') {
            dailyOt = activeSec;
          } else if (config.weeklyOffWorkRule === 'ignore') {
            dailyOt = 0;
            dailyNormal = 0;
          } else {
            // Default: if worked on weekly off in daily mode, counts as OT or normal up to 8h
            dailyNormal = Math.min(activeSec, requiredDailySeconds);
            dailyOt = Math.max(0, activeSec - requiredDailySeconds);
          }
        } else {
          dailyNormal = Math.min(activeSec, requiredDailySeconds);
          dailyOt = Math.max(0, activeSec - requiredDailySeconds);
        }

        // Apply daily qualification threshold if configured (e.g., minimum 30 or 60 minutes required to qualify for OT payment)
        if (config.overtimeThresholdMinutes && config.overtimeThresholdMinutes > 0) {
          if (dailyOt < config.overtimeThresholdMinutes * 60) {
            dailyOt = 0;
          }
        }

        totalNormalSeconds += dailyNormal;
        totalDailyOtSeconds += dailyOt;

        dailyBreakdown.push({
          date: day.date,
          activeSeconds: activeSec,
          overtimeSeconds: dailyOt,
          isWeeklyOff,
        });
      }

      return {
        overtimeSeconds: totalDailyOtSeconds,
        overtimeHours: Number((totalDailyOtSeconds / 3600).toFixed(2)),
        normalHoursWorked: Number((totalNormalSeconds / 3600).toFixed(2)),
        normalSecondsWorked: totalNormalSeconds,
        eligibleTotalSeconds: totalNormalSeconds + totalDailyOtSeconds,
        monthlyTargetSeconds,
        monthlyTargetHours,
        methodUsed: 'daily_threshold',
        isThresholdCrossed: totalNormalSeconds >= monthlyTargetSeconds,
        surplusSeconds: totalDailyOtSeconds,
        dailyBreakdown,
      };
    } else {
      // ----------------------------------------------------------------------
      // MONTHLY THRESHOLD MODE (DEFAULT):
      // Monthly target = Scheduled working days × required active hours/day (e.g. 26 × 8h = 208h)
      // Daily surplus accumulates towards monthly total; OT begins ONLY when total exceeds target
      // ----------------------------------------------------------------------
      let accumulatedEligibleSeconds = 0;
      const dailyBreakdown: OvertimeResult['dailyBreakdown'] = [];

      for (const day of monthDays) {
        const isWeeklyOff = !workingDays.includes(DateEngine.getDayOfWeek(day.date));
        const activeSec = day.totalActiveSeconds || 0;
        
        let eligibleForMonth = 0;
        if (isWeeklyOff) {
          if (config.weeklyOffWorkRule === 'always_overtime') {
            // Treated as direct OT outside threshold pool
            eligibleForMonth = 0;
          } else if (config.weeklyOffWorkRule === 'ignore') {
            eligibleForMonth = 0;
          } else {
            // Default 'add_to_monthly_threshold': contributes to monthly bucket
            eligibleForMonth = activeSec;
          }
        } else {
          eligibleForMonth = activeSec;
        }

        accumulatedEligibleSeconds += eligibleForMonth;

        dailyBreakdown.push({
          date: day.date,
          activeSeconds: activeSec,
          overtimeSeconds: 0, // In monthly threshold, OT is evaluated at monthly aggregation
          isWeeklyOff,
        });
      }

      // Check threshold crossing
      const isThresholdCrossed = accumulatedEligibleSeconds > monthlyTargetSeconds;
      const overtimeSeconds = Math.max(0, accumulatedEligibleSeconds - monthlyTargetSeconds);
      const normalSecondsWorked = Math.min(accumulatedEligibleSeconds, monthlyTargetSeconds);

      return {
        overtimeSeconds,
        overtimeHours: Number((overtimeSeconds / 3600).toFixed(2)),
        normalHoursWorked: Number((normalSecondsWorked / 3600).toFixed(2)),
        normalSecondsWorked,
        eligibleTotalSeconds: accumulatedEligibleSeconds,
        monthlyTargetSeconds,
        monthlyTargetHours,
        methodUsed: 'monthly_threshold',
        isThresholdCrossed,
        surplusSeconds: overtimeSeconds,
        dailyBreakdown,
      };
    }
  }

  /**
   * Calculates Overtime Pay based on derived normal hourly rate & multiplier
   */
  static calculateOvertimePay(
    overtimeSeconds: number,
    normalHourlyRate: number,
    overtimeMultiplier: number,
    customOtHourlyRate?: number
  ): number {
    if (overtimeSeconds <= 0) return 0;
    const otHours = overtimeSeconds / 3600;
    const effectiveOtHourlyRate = customOtHourlyRate && customOtHourlyRate > 0 
      ? customOtHourlyRate 
      : normalHourlyRate * overtimeMultiplier;

    return Number((otHours * effectiveOtHourlyRate).toFixed(2));
  }
}
