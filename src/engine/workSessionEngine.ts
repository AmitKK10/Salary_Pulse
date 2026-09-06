// ============================================================================
// SALARYPULSE — WORK SESSION & BREAK ENGINE
// Precision duration calculations: multiple punch in/out, paid/unpaid breaks,
// lunch countdowns, break overruns, dynamic completion times, and live OT transitions
// ============================================================================

import { BreakSession, WorkSchedule, WorkSession } from '../types';

export interface DayActiveResult {
  totalActiveSeconds: number;
  completedSeconds: number;
  currentSessionSeconds: number;
  isOpen: boolean;
  openSession?: WorkSession;
  isStale?: boolean;
  staleReason?: string;
  staleElapsedSeconds?: number;
  isSafetyCapped?: boolean;
  firstPunchIn?: string;
  lastPunchOut?: string;
  officeSpanSeconds?: number;
}

export interface LunchBreakStats {
  configuredSeconds: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  overrunSeconds: number;
  isComplete: boolean;
  isOverrun: boolean;
  isLunchActive: boolean;
}

export interface DayBreakResult {
  totalBreakSeconds: number;
  unpaidBreakSeconds: number;
  paidBreakSeconds: number;
  activeBreak?: BreakSession;
  lunchStats: LunchBreakStats;
}

export interface LiveOvertimeEvaluation {
  isOvertimeActive: boolean;
  normalSecondsToday: number;
  overtimeSecondsToday: number;
  totalMonthEligibleSeconds: number;
  monthOvertimeSeconds: number;
  surplusSeconds: number;
}

export class WorkSessionEngine {
  /**
   * Calculates the exact duration between two ISO timestamps in seconds
   */
  static getDurationSeconds(startTime: string, endTime?: string, nowIso?: string): number {
    if (!startTime) return 0;
    const start = new Date(startTime).getTime();
    if (isNaN(start)) return 0;
    
    const endStr = endTime || nowIso;
    if (!endStr) return 0;
    
    const end = new Date(endStr).getTime();
    if (isNaN(end)) return 0;
    
    // Safety against invalid negative intervals
    return Math.max(0, Math.floor((end - start) / 1000));
  }

  /**
   * Authoritative Office Working-Time Rule:
   * For a completed working day:
   *   Office Span = Last Punch-Out - First Punch-In
   *   Actual Working Time = Office Span - Configured Lunch Duration
   *   Default Lunch Duration: 01:00:00 (3600 seconds)
   * 
   * Protects against stale sessions crossing calendar day boundaries or exceeding safety limits.
   * Does NOT produce negative working time if Last OUT < First IN or Office Span < Lunch.
   */
  static calculateDayActiveSeconds(
    workSessions: WorkSession[] = [],
    nowIso?: string,
    attendanceDate?: string,
    safetyMaxHours: number = 12,
    configuredLunchSeconds: number = 3600,
    breakSessions: BreakSession[] = [],
    firstPunchInOverride?: string,
    lastPunchOutOverride?: string
  ): DayActiveResult {
    // Gather all valid IN punch timestamps and OUT punch timestamps
    const inTimestamps: { timeMs: number; iso: string }[] = [];
    const outTimestamps: { timeMs: number; iso: string }[] = [];

    if (firstPunchInOverride) {
      const ms = new Date(firstPunchInOverride).getTime();
      if (!isNaN(ms)) inTimestamps.push({ timeMs: ms, iso: firstPunchInOverride });
    }
    if (lastPunchOutOverride) {
      const ms = new Date(lastPunchOutOverride).getTime();
      if (!isNaN(ms)) outTimestamps.push({ timeMs: ms, iso: lastPunchOutOverride });
    }

    let isOpen = false;
    let openSession: WorkSession | undefined;

    for (const session of workSessions) {
      if (session.startTime) {
        const ms = new Date(session.startTime).getTime();
        if (!isNaN(ms)) inTimestamps.push({ timeMs: ms, iso: session.startTime });
      }
      if (session.endTime) {
        const ms = new Date(session.endTime).getTime();
        if (!isNaN(ms)) outTimestamps.push({ timeMs: ms, iso: session.endTime });
      } else {
        isOpen = true;
        openSession = session;
      }
    }

    inTimestamps.sort((a, b) => a.timeMs - b.timeMs);
    outTimestamps.sort((a, b) => a.timeMs - b.timeMs);

    const firstPunchIn = inTimestamps.length > 0 ? inTimestamps[0].iso : undefined;
    const lastPunchOut = outTimestamps.length > 0 ? outTimestamps[outTimestamps.length - 1].iso : undefined;

    // Case A: Completed working day (!isOpen)
    if (!isOpen) {
      let totalActiveSeconds = 0;
      let completedSeconds = 0;
      let officeSpanSeconds = 0;

      if (firstPunchIn && lastPunchOut) {
        const startMs = new Date(firstPunchIn).getTime();
        const endMs = new Date(lastPunchOut).getTime();

        if (endMs < startMs) {
          // Negative office span: Last OUT < First IN (invalid, handled by NEEDS_REVIEW)
          officeSpanSeconds = 0;
          totalActiveSeconds = 0;
          completedSeconds = 0;
        } else {
          officeSpanSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));

          // Deduct other non-lunch unpaid breaks if explicitly recorded
          let otherUnpaidBreaks = 0;
          for (const b of breakSessions) {
            if (b.type !== 'lunch' && !b.isPaid && b.durationSeconds > 0) {
              otherUnpaidBreaks += b.durationSeconds;
            }
          }

          // Authoritative Rule: One punch in and punch out means no lunch time is taken, hence no lunch deduction.
          // (e.g. On August 1st, single punch session 14:37 to 18:22 yields 3h 45m - 0h = 3h 45m).
          // Standard full-day shifts with 4 punches or days with explicit lunch sessions deduct lunch.
          const hasExplicitLunchBreak = breakSessions.some(b => b.type === 'lunch' && b.durationSeconds > 0);
          const isSinglePunchSession = workSessions.length <= 1;
          const isNoLunchTaken = isSinglePunchSession && !hasExplicitLunchBreak;
          const applicableLunchSeconds = isNoLunchTaken ? 0 : configuredLunchSeconds;

          // Authoritative Rule: Actual Working Time = Office Span - Applicable Lunch - Other Unpaid Breaks
          totalActiveSeconds = Math.max(0, officeSpanSeconds - applicableLunchSeconds - otherUnpaidBreaks);
          completedSeconds = totalActiveSeconds;
        }
      } else if (workSessions.length > 0) {
        // Fallback for isolated single session with duration
        let rawSum = 0;
        for (const s of workSessions) {
          if (s.durationSeconds > 0) rawSum += s.durationSeconds;
          else if (s.startTime && s.endTime) rawSum += this.getDurationSeconds(s.startTime, s.endTime);
        }
        const hasExplicitLunchBreak = breakSessions.some(b => b.type === 'lunch' && b.durationSeconds > 0);
        const isSinglePunchSession = workSessions.length <= 1;
        const isNoLunchTaken = isSinglePunchSession && !hasExplicitLunchBreak;
        const applicableLunchSeconds = isNoLunchTaken ? 0 : (rawSum > configuredLunchSeconds ? configuredLunchSeconds : 0);
        totalActiveSeconds = Math.max(0, rawSum - applicableLunchSeconds);
        completedSeconds = totalActiveSeconds;
      }

      return {
        totalActiveSeconds,
        completedSeconds,
        currentSessionSeconds: 0,
        isOpen: false,
        openSession: undefined,
        isStale: false,
        isSafetyCapped: false,
        firstPunchIn,
        lastPunchOut,
        officeSpanSeconds,
      };
    }

    // Case B: Currently Open / Live Working Day (isOpen === true)
    const refTime = nowIso ? new Date(nowIso).getTime() : Date.now();
    const todayIsoDate = new Date(refTime).toISOString().slice(0, 10);
    let totalActiveSeconds = 0;
    let completedSeconds = 0;
    let currentSessionSeconds = 0;
    let officeSpanSeconds = 0;
    let isStale = false;
    let staleReason: string | undefined;
    let staleElapsedSeconds: number | undefined;
    let isSafetyCapped = false;

    if (openSession) {
      const startTimestamp = new Date(openSession.startTime).getTime();
      const rawElapsed = !isNaN(startTimestamp)
        ? Math.max(0, Math.floor((refTime - startTimestamp) / 1000))
        : 0;

      const sessionStartDate = openSession.startTime.includes('T')
        ? openSession.startTime.split('T')[0]
        : (attendanceDate || todayIsoDate);

      const isFromPastDate = Boolean(sessionStartDate && sessionStartDate < todayIsoDate);
      const exceedsSafetyLimit = rawElapsed > (safetyMaxHours * 3600);

      if (isFromPastDate || exceedsSafetyLimit) {
        isStale = true;
        staleReason = isFromPastDate
          ? `Open session belongs to a previous date (${sessionStartDate}). Punch-out was not recorded.`
          : `Open session exceeds normal workday safety threshold (${(rawElapsed / 3600).toFixed(1)}h elapsed).`;
        staleElapsedSeconds = rawElapsed;
        isSafetyCapped = true;
      }
    }

    if (firstPunchIn) {
      const firstInMs = new Date(firstPunchIn).getTime();
      const rawSpan = Math.max(0, Math.floor((refTime - firstInMs) / 1000));
      officeSpanSeconds = rawSpan;

      const activeBreak = breakSessions.find(b => !b.endTime);
      const hasCompletedLunch = breakSessions.some(b => b.type === 'lunch' && b.endTime && (b.durationSeconds || 0) > 0);

      // Check inter-session gaps
      let hasSessionGap = false;
      const sortedSessions = [...workSessions].filter(s => s.startTime).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      for (let i = 0; i < sortedSessions.length - 1; i++) {
        const currEnd = sortedSessions[i].endTime;
        const nextStart = sortedSessions[i + 1].startTime;
        if (currEnd && nextStart) {
          const gap = (new Date(nextStart).getTime() - new Date(currEnd).getTime()) / 1000;
          if (gap >= 15 * 60) {
            hasSessionGap = true;
            break;
          }
        }
      }

      if (activeBreak) {
        // Currently inside break: deduct break duration elapsed so far
        const breakStartMs = new Date(activeBreak.startTime).getTime();
        const activeBreakElapsed = Math.max(0, Math.floor((refTime - breakStartMs) / 1000));
        let priorBreaks = 0;
        for (const b of breakSessions) {
          if (b !== activeBreak && b.durationSeconds > 0) {
            priorBreaks += b.durationSeconds;
          }
        }
        const totalBreakElapsed = priorBreaks + activeBreakElapsed;
        totalActiveSeconds = Math.max(0, rawSpan - totalBreakElapsed);
      } else if (hasCompletedLunch || hasSessionGap) {
        // Lunch occurred: apply configured lunch deduction once
        totalActiveSeconds = Math.max(0, rawSpan - configuredLunchSeconds);
      } else {
        // Continuous single session so far
        const halfShiftSeconds = 4 * 3600;
        if (rawSpan <= halfShiftSeconds) {
          totalActiveSeconds = rawSpan;
        } else if (rawSpan < halfShiftSeconds + configuredLunchSeconds) {
          totalActiveSeconds = halfShiftSeconds;
        } else {
          totalActiveSeconds = Math.max(0, rawSpan - configuredLunchSeconds);
        }
      }

      if (isSafetyCapped) {
        totalActiveSeconds = Math.min(totalActiveSeconds, 8 * 3600);
      }

      if (openSession) {
        const openStartMs = new Date(openSession.startTime).getTime();
        currentSessionSeconds = !isNaN(openStartMs)
          ? Math.max(0, Math.floor((refTime - openStartMs) / 1000))
          : 0;
        completedSeconds = Math.max(0, totalActiveSeconds - currentSessionSeconds);
      } else {
        completedSeconds = totalActiveSeconds;
        currentSessionSeconds = 0;
      }
    }

    return {
      totalActiveSeconds,
      completedSeconds,
      currentSessionSeconds,
      isOpen: true,
      openSession,
      isStale,
      staleReason,
      staleElapsedSeconds,
      isSafetyCapped,
      firstPunchIn,
      lastPunchOut,
      officeSpanSeconds,
    };
  }

  /**
   * Calculates total active working duration (backward-compatible number return)
   */
  static calculateTotalActiveSeconds(
    workSessions: WorkSession[] = [],
    breakSessions: BreakSession[] = [],
    attendanceDate?: string,
    configuredLunchSeconds: number = 3600,
    firstPunchInOverride?: string,
    lastPunchOutOverride?: string
  ): number {
    return this.calculateDayActiveSeconds(
      workSessions,
      undefined,
      attendanceDate,
      12,
      configuredLunchSeconds,
      breakSessions,
      firstPunchInOverride,
      lastPunchOutOverride
    ).totalActiveSeconds;
  }

  /**
   * Calculates total break duration in seconds (separating paid and unpaid),
   * and tracks lunch countdowns and overruns.
   */
  static calculateDayBreakSeconds(
    breakSessions: BreakSession[] = [],
    schedule?: WorkSchedule,
    nowIso?: string
  ): DayBreakResult {
    let total = 0;
    let unpaid = 0;
    let paid = 0;
    let activeBreak: BreakSession | undefined;

    const lunchRule = schedule?.breakRules?.find(r => r.type === 'lunch' || r.id === 'brk-lunch');
    const configuredLunchMinutes = schedule?.defaultLunchDurationMinutes || lunchRule?.durationMinutes || 60;
    const configuredLunchSeconds = configuredLunchMinutes * 60;

    let totalLunchElapsedSeconds = 0;
    let isLunchActive = false;

    for (const b of breakSessions) {
      let dur = 0;
      if (b.endTime) {
        dur = b.durationSeconds > 0
          ? b.durationSeconds
          : this.getDurationSeconds(b.startTime, b.endTime);
      } else {
        activeBreak = b;
        dur = this.getDurationSeconds(b.startTime, undefined, nowIso || new Date().toISOString());
      }

      total += dur;
      if (b.isPaid) {
        paid += dur;
      } else {
        unpaid += dur;
      }

      if (b.type === 'lunch') {
        totalLunchElapsedSeconds += dur;
        if (!b.endTime) {
          isLunchActive = true;
        }
      }
    }

    const lunchRemainingSeconds = Math.max(0, configuredLunchSeconds - totalLunchElapsedSeconds);
    const lunchOverrunSeconds = Math.max(0, totalLunchElapsedSeconds - configuredLunchSeconds);
    const isLunchOverrun = lunchOverrunSeconds > 0;
    const isLunchComplete = totalLunchElapsedSeconds >= configuredLunchSeconds && !isLunchActive;

    return {
      totalBreakSeconds: total,
      unpaidBreakSeconds: unpaid,
      paidBreakSeconds: paid,
      activeBreak,
      lunchStats: {
        configuredSeconds: configuredLunchSeconds,
        elapsedSeconds: totalLunchElapsedSeconds,
        remainingSeconds: lunchRemainingSeconds,
        overrunSeconds: lunchOverrunSeconds,
        isComplete: isLunchComplete,
        isOverrun: isLunchOverrun,
        isLunchActive,
      },
    };
  }

  /**
   * Backward-compatible break calculation
   */
  static calculateBreakSeconds(breakSessions: BreakSession[]): {
    totalBreakSeconds: number;
    unpaidBreakSeconds: number;
    paidBreakSeconds: number;
  } {
    const res = this.calculateDayBreakSeconds(breakSessions);
    return {
      totalBreakSeconds: res.totalBreakSeconds,
      unpaidBreakSeconds: res.unpaidBreakSeconds,
      paidBreakSeconds: res.paidBreakSeconds,
    };
  }

  /**
   * Calculates remaining required active work seconds for today
   */
  static calculateRemainingActiveSeconds(
    requiredDailyHours: number,
    currentActiveSeconds: number
  ): number {
    const targetSeconds = Math.round(requiredDailyHours * 3600);
    return Math.max(0, targetSeconds - currentActiveSeconds);
  }

  /**
   * Dynamic completion time estimation (accounting for remaining active work & planned/ongoing unpaid breaks)
   */
  static estimateCompletionTime(
    currentTime: Date,
    remainingActiveSeconds: number,
    remainingUnpaidBreakSeconds: number = 0
  ): {
    completionDate: Date;
    formattedTime: string;
    formattedClockTime: string;
    totalRemainingClockSeconds: number;
    isCompleted?: boolean;
  } {
    const isCompleted = remainingActiveSeconds <= 0;
    const totalRemainingClockSeconds = Math.max(0, remainingActiveSeconds + remainingUnpaidBreakSeconds);

    if (isCompleted) {
      return {
        completionDate: currentTime,
        formattedTime: '',
        formattedClockTime: '--:--:--',
        totalRemainingClockSeconds: 0,
        isCompleted: true,
      };
    }

    const completionDate = new Date(currentTime.getTime() + totalRemainingClockSeconds * 1000);

    let hours = completionDate.getHours();
    const minutes = completionDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 => 12
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

    const hh = String(completionDate.getHours()).padStart(2, '0');
    const mm = String(completionDate.getMinutes()).padStart(2, '0');
    const ss = String(completionDate.getSeconds()).padStart(2, '0');
    const formattedClockTime = `${hh}:${mm}:${ss}`;

    return {
      completionDate,
      formattedTime,
      formattedClockTime,
      totalRemainingClockSeconds,
      isCompleted: false,
    };
  }

  /**
   * Evaluates live overtime transition based on configuration and monthly/daily thresholds
   */
  static evaluateLiveOvertime(
    currentDayActiveSeconds: number,
    requiredDailyHours: number,
    monthEligibleSecondsPrior: number,
    monthTargetSeconds: number,
    overtimeMethod: 'monthly_threshold' | 'daily_threshold' = 'monthly_threshold',
    isWeeklyOff: boolean = false,
    weeklyOffWorkRule: string = 'add_to_monthly_threshold'
  ): LiveOvertimeEvaluation {
    const dayRequiredSeconds = Math.round(requiredDailyHours * 3600);

    if (overtimeMethod === 'daily_threshold') {
      let normalSecondsToday = 0;
      let overtimeSecondsToday = 0;

      if (isWeeklyOff) {
        if (weeklyOffWorkRule === 'always_overtime') {
          overtimeSecondsToday = currentDayActiveSeconds;
          normalSecondsToday = 0;
        } else {
          normalSecondsToday = Math.min(currentDayActiveSeconds, dayRequiredSeconds);
          overtimeSecondsToday = Math.max(0, currentDayActiveSeconds - dayRequiredSeconds);
        }
      } else {
        normalSecondsToday = Math.min(currentDayActiveSeconds, dayRequiredSeconds);
        overtimeSecondsToday = Math.max(0, currentDayActiveSeconds - dayRequiredSeconds);
      }

      return {
        isOvertimeActive: overtimeSecondsToday > 0,
        normalSecondsToday,
        overtimeSecondsToday,
        totalMonthEligibleSeconds: monthEligibleSecondsPrior + currentDayActiveSeconds,
        monthOvertimeSeconds: overtimeSecondsToday,
        surplusSeconds: overtimeSecondsToday,
      };
    } else {
      // Monthly Threshold Mode (Default)
      const totalMonthEligible = monthEligibleSecondsPrior + currentDayActiveSeconds;
      const isThresholdCrossed = totalMonthEligible > monthTargetSeconds;
      const monthOvertimeSeconds = Math.max(0, totalMonthEligible - monthTargetSeconds);

      // How many seconds of today's work pushed us past the monthly target
      const normalSecondsToday = Math.max(0, currentDayActiveSeconds - monthOvertimeSeconds);
      const overtimeSecondsToday = monthOvertimeSeconds;

      return {
        isOvertimeActive: isThresholdCrossed,
        normalSecondsToday,
        overtimeSecondsToday,
        totalMonthEligibleSeconds: totalMonthEligible,
        monthOvertimeSeconds,
        surplusSeconds: monthOvertimeSeconds,
      };
    }
  }

  /**
   * Calculates total office presence span (from earliest punch in to latest punch out)
   */
  static calculatePresenceSpanSeconds(
    firstPunchIn?: string,
    lastPunchOut?: string
  ): number {
    if (!firstPunchIn || !lastPunchOut) return 0;
    return this.getDurationSeconds(firstPunchIn, lastPunchOut);
  }

  /**
   * Formats seconds into HH:MM:SS
   */
  static formatSecondsToHMS(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
