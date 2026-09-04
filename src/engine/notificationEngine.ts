// ============================================================================
// SALARYPULSE — NOTIFICATION & DAILY MILESTONE ENGINE (STEP 10)
// Pure deterministic evaluations for break completions, targets, OT triggers, bonus milestones, and forgotten punches
// ============================================================================

import { 
  AttendanceDay, 
  MonthlyRunningBreakdown, 
  NotificationSettings, 
  WorkdayStatus 
} from '../types';
import { LunchBreakStats, LiveOvertimeEvaluation } from './workSessionEngine';

export interface MilestoneEvaluationResult {
  milestoneKey: string;
  type: 'LUNCH_COMPLETE' | 'TARGET_8_HOURS' | 'MONTHLY_OT_ACTIVE' | 'BONUS_25_DAYS' | 'BONUS_26_DAYS' | 'FORGOTTEN_SESSION' | 'BACKUP_REMINDER';
  title: string;
  message: string;
  osMessage: string; // Privacy-safe version without monetary amounts for OS lockscreen
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export class NotificationEngine {
  /**
   * Evaluate all daily milestone triggers against current live state
   */
  static evaluateMilestones(
    todayDate: string,
    todayAttendance: AttendanceDay,
    currentWorkdayStatus: WorkdayStatus,
    todayLiveActiveSeconds: number,
    lunchStats: LunchBreakStats,
    liveOtInfo: LiveOvertimeEvaluation,
    monthlySummary: MonthlyRunningBreakdown,
    settings: NotificationSettings,
    lastBackupDate?: string
  ): MilestoneEvaluationResult[] {
    const results: MilestoneEvaluationResult[] = [];

    // 1. Lunch Break Complete
    if (
      settings.lunchComplete &&
      currentWorkdayStatus === 'ON_BREAK' &&
      (lunchStats.isComplete || lunchStats.isOverrun || (lunchStats.elapsedSeconds >= lunchStats.configuredSeconds && lunchStats.configuredSeconds > 0))
    ) {
      results.push({
        milestoneKey: `lunch-complete-${todayDate}`,
        type: 'LUNCH_COMPLETE',
        title: 'Lunch Break Complete',
        message: 'Your scheduled lunch duration is complete. Ready to resume work when you are ready.',
        osMessage: 'Lunch break complete. Ready to resume work?',
        severity: 'info',
      });
    }

    // 2. 8-Hour Active Work Target Reached
    const required8HoursSec = 8 * 3600;
    if (
      settings.target8HoursReached &&
      todayLiveActiveSeconds >= required8HoursSec &&
      todayAttendance.workdayStatus !== 'COMPLETED'
    ) {
      const isDailyOT = liveOtInfo.overtimeSecondsToday > 0;
      const isMonthlyOT = liveOtInfo.isOvertimeActive;

      let msg = '8-Hour active work target completed for today.';
      if (isDailyOT) {
        msg += ' Daily Overtime is now accruing at premium multiplier rate.';
      } else if (isMonthlyOT) {
        msg += ' Monthly Overtime is active!';
      } else {
        msg += ' Great progress on your daily target.';
      }

      results.push({
        milestoneKey: `target-8hr-${todayDate}`,
        type: 'TARGET_8_HOURS',
        title: '8-Hour Daily Target Reached',
        message: msg,
        osMessage: '8-hour target reached. Daily normal hours complete.',
        severity: 'success',
      });
    }

    // 3. Monthly Normal Target Reached (OT is now active for monthly_threshold mode)
    if (
      settings.monthlyOTStarted &&
      liveOtInfo.isOvertimeActive &&
      monthlySummary.remainingNormalSeconds === 0
    ) {
      results.push({
        milestoneKey: `monthly-ot-${todayDate.substring(0, 7)}`,
        type: 'MONTHLY_OT_ACTIVE',
        title: 'Monthly Normal Target Reached',
        message: 'You have reached your monthly required normal hours. Overtime (OT) is now actively accruing on subsequent hours worked!',
        osMessage: 'MONTHLY NORMAL TARGET REACHED: OT IS NOW ACTIVE',
        severity: 'success',
      });
    }

    // 4. Attendance Bonus Milestone Progress
    if (settings.bonusMilestone && monthlySummary.presentDaysCount) {
      const days = monthlySummary.presentDaysCount;
      const target = monthlySummary.scheduledWorkDaysCount || 26;

      if (days === target - 1) {
        results.push({
          milestoneKey: `bonus-25-${todayDate.substring(0, 7)}`,
          type: 'BONUS_25_DAYS',
          title: 'Bonus Milestone: 1 Day Away',
          message: `You have completed ${days} of ${target} working days. 1 more present day required for attendance bonus eligibility!`,
          osMessage: '1 DAY FROM BONUS ELIGIBILITY',
          severity: 'info',
        });
      } else if (days >= target) {
        results.push({
          milestoneKey: `bonus-26-${todayDate.substring(0, 7)}`,
          type: 'BONUS_26_DAYS',
          title: 'Bonus Eligibility Reached',
          message: `You have completed all ${target} present days! Attendance bonus eligibility unlocked (HR approval required at payroll cut-off).`,
          osMessage: 'BONUS ELIGIBILITY REACHED (HR APPROVAL REQUIRED)',
          severity: 'success',
        });
      }
    }

    // 5. Forgotten Punch Detection (>10 hours single open session or past midnight)
    if (settings.forgottenSession) {
      const openSession = todayAttendance.workSessions.find(s => !s.endTime);
      if (openSession) {
        const startMillis = new Date(openSession.startTime).getTime();
        const nowMillis = Date.now();
        const sessionHours = (nowMillis - startMillis) / (1000 * 3600);

        if (sessionHours >= 10) {
          const startTimeStr = new Date(openSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          results.push({
            milestoneKey: `forgotten-session-${openSession.id}`,
            type: 'FORGOTTEN_SESSION',
            title: 'Open Work Session Detected',
            message: `Active session started at ${startTimeStr} has been running for ${sessionHours.toFixed(1)} hours. If you forgot to clock out, you can end the session or correct the time.`,
            osMessage: `OPEN SESSION DETECTED: Active session running since ${startTimeStr}. Check punch status.`,
            severity: 'warning',
          });
        }
      }
    }

    // 6. Backup Reminder (>7 days since last backup)
    if (settings.backupReminder && lastBackupDate) {
      const lastBackupMillis = new Date(lastBackupDate).getTime();
      const nowMillis = Date.now();
      const daysSinceBackup = (nowMillis - lastBackupMillis) / (1000 * 3600 * 24);

      if (daysSinceBackup >= 7) {
        results.push({
          milestoneKey: `backup-reminder-${new Date().toISOString().substring(0, 10)}`,
          type: 'BACKUP_REMINDER',
          title: 'Weekly Backup Reminder',
          message: 'It has been over 7 days since your last encrypted local backup. Download a snapshot in Settings to keep your records secure.',
          osMessage: 'SalaryPulse: Recommended weekly backup reminder.',
          severity: 'info',
        });
      }
    }

    return results;
  }
}
