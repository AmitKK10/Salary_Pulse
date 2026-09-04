import { AttendanceDay, AttendanceStatus, DayCalculationDetails, WorkSchedule } from '../types';

export interface AttendanceMetrics {
  totalCalendarDays: number;
  presentDaysCount: number;
  halfDaysCount: number;
  absentDaysCount: number;
  leaveDaysCount: number;
  weeklyOffCount: number;
  holidaysCount: number;
  totalActiveSeconds: number;
  totalBreakSeconds: number;
  lateArrivalsCount: number;
  earlyDeparturesCount: number;
  attendanceRatePercentage: number;
}

export interface ClockInLogItem {
  date: string;
  dayName: string;
  status: string;
  firstPunchIn?: string;
  lastPunchOut?: string;
  actualActiveSeconds: number;
  
  // Arrival (Late after 09:00 AM)
  arrivalPunctuality: 'ON_TIME' | 'LATE_ENTRY' | 'EARLY_ENTRY' | 'NOT_PUNCHED';
  lateArrivalMinutes: number;
  earlyArrivalMinutes: number;
  arrivalLabel: string;
  
  // Departure (Early before 06:00 PM)
  departurePunctuality: 'ON_TIME' | 'EARLY_GOING' | 'LATE_LEAVING' | 'NOT_PUNCHED';
  earlyDepartureMinutes: number;
  lateDepartureMinutes: number;
  departureLabel: string;

  // Lunch & Target Flags
  lunchOverrunMinutes: number;
  isShortWorkDay: boolean;
  notes?: string;
}

export interface ClockInAnalysisReport {
  totalLoggedDays: number;
  punctualArrivalsCount: number;
  lateArrivalsCount: number;
  earlyArrivalsCount: number;
  
  punctualDeparturesCount: number;
  earlyDeparturesCount: number;
  lateDeparturesCount: number;

  totalLateArrivalMinutes: number;
  totalEarlyDepartureMinutes: number;
  avgLateArrivalMinutes: number;
  avgEarlyDepartureMinutes: number;
  
  lunchOverrunsCount: number;
  totalLunchOverrunMinutes: number;
  shortDaysCount: number;

  arrivalPunctualityScore: number; // 0-100%
  overallPunctualityScore: number; // 0-100%
  
  logs: ClockInLogItem[];
}

export const AttendanceEngine = {
  /**
   * Comprehensive Clock-in & Clock-out Punctuality Analysis
   * Strictly flags late arrivals after 09:00 AM and early departures before 06:00 PM.
   */
  analyzeClockInPunctuality(
    days: DayCalculationDetails[],
    schedule: WorkSchedule = {
      id: 'default-schedule',
      name: 'Default Shift',
      officeStartTime: '09:00',
      officeEndTime: '18:00',
      requiredActiveHoursPerDay: 8,
      breakRules: [],
      defaultLunchDurationMinutes: 60,
      defaultTeaBreakDurationMinutes: 15,
      workingDays: [1, 2, 3, 4, 5, 6],
    }
  ): ClockInAnalysisReport {
    const schedStart = schedule.officeStartTime || '09:00';
    const schedEnd = schedule.officeEndTime || '18:00';
    const [startH, startM] = schedStart.split(':').map(Number);
    const [endH, endM] = schedEnd.split(':').map(Number);
    const targetStartMin = startH * 60 + startM; // e.g. 540 for 09:00
    const targetEndMin = endH * 60 + endM; // e.g. 1080 for 18:00

    let totalLoggedDays = 0;
    let punctualArrivalsCount = 0;
    let lateArrivalsCount = 0;
    let earlyArrivalsCount = 0;

    let punctualDeparturesCount = 0;
    let earlyDeparturesCount = 0;
    let lateDeparturesCount = 0;

    let totalLateArrivalMinutes = 0;
    let totalEarlyDepartureMinutes = 0;
    let lunchOverrunsCount = 0;
    let totalLunchOverrunMinutes = 0;
    let shortDaysCount = 0;

    const logs: ClockInLogItem[] = [];

    days.forEach((day) => {
      // Only process days where attendance occurred or was scheduled
      if (day.isWeeklyOff || day.isHoliday) {
        if (!day.firstPunchIn && !day.lastPunchOut) return;
      }

      if (day.firstPunchIn || day.lastPunchOut || day.actualActiveSeconds > 0) {
        totalLoggedDays++;
      }

      // 1. Analyze Clock-In / Arrival
      let arrivalPunctuality: 'ON_TIME' | 'LATE_ENTRY' | 'EARLY_ENTRY' | 'NOT_PUNCHED' = 'NOT_PUNCHED';
      let lateArrivalMinutes = 0;
      let earlyArrivalMinutes = 0;
      let arrivalLabel = 'No Punch In';

      if (day.firstPunchIn) {
        const timePart = day.firstPunchIn.includes('T') ? day.firstPunchIn.split('T')[1].substring(0, 5) : day.firstPunchIn.substring(0, 5);
        const [pH, pM] = timePart.split(':').map(Number);
        if (!isNaN(pH) && !isNaN(pM)) {
          const punchMin = pH * 60 + pM;
          const diff = punchMin - targetStartMin;

          if (diff > 0) {
            arrivalPunctuality = 'LATE_ENTRY';
            lateArrivalMinutes = diff;
            totalLateArrivalMinutes += diff;
            lateArrivalsCount++;
            arrivalLabel = `Late Arrival by ${diff}m (${timePart} vs ${schedStart})`;
          } else if (diff < 0) {
            arrivalPunctuality = 'EARLY_ENTRY';
            earlyArrivalMinutes = Math.abs(diff);
            earlyArrivalsCount++;
            arrivalLabel = `Early Arrival by ${Math.abs(diff)}m (${timePart})`;
          } else {
            arrivalPunctuality = 'ON_TIME';
            punctualArrivalsCount++;
            arrivalLabel = `On Time (${timePart})`;
          }
        }
      }

      // 2. Analyze Clock-Out / Departure
      let departurePunctuality: 'ON_TIME' | 'EARLY_GOING' | 'LATE_LEAVING' | 'NOT_PUNCHED' = 'NOT_PUNCHED';
      let earlyDepartureMinutes = 0;
      let lateDepartureMinutes = 0;
      let departureLabel = 'No Punch Out';

      if (day.lastPunchOut) {
        const timePart = day.lastPunchOut.includes('T') ? day.lastPunchOut.split('T')[1].substring(0, 5) : day.lastPunchOut.substring(0, 5);
        const [pH, pM] = timePart.split(':').map(Number);
        if (!isNaN(pH) && !isNaN(pM)) {
          const punchMin = pH * 60 + pM;
          const diff = punchMin - targetEndMin;

          if (diff < 0) {
            departurePunctuality = 'EARLY_GOING';
            earlyDepartureMinutes = Math.abs(diff);
            totalEarlyDepartureMinutes += Math.abs(diff);
            earlyDeparturesCount++;
            departureLabel = `Early Departure by ${Math.abs(diff)}m (${timePart} vs ${schedEnd})`;
          } else if (diff > 0) {
            departurePunctuality = 'LATE_LEAVING';
            lateDepartureMinutes = diff;
            lateDeparturesCount++;
            departureLabel = `Late Leaving by +${diff}m (${timePart})`;
          } else {
            departurePunctuality = 'ON_TIME';
            punctualDeparturesCount++;
            departureLabel = `On Time (${timePart})`;
          }
        }
      }

      // 3. Lunch Overrun & Short Day Check
      const overrunMin = day.lunchOverrunMinutes || 0;
      if (overrunMin > 0) {
        lunchOverrunsCount++;
        totalLunchOverrunMinutes += overrunMin;
      }

      if (day.isShortWorkDay) {
        shortDaysCount++;
      }

      logs.push({
        date: day.date,
        dayName: day.dayName,
        status: day.status,
        firstPunchIn: day.firstPunchIn,
        lastPunchOut: day.lastPunchOut,
        actualActiveSeconds: day.actualActiveSeconds,
        arrivalPunctuality,
        lateArrivalMinutes,
        earlyArrivalMinutes,
        arrivalLabel,
        departurePunctuality,
        earlyDepartureMinutes,
        lateDepartureMinutes,
        departureLabel,
        lunchOverrunMinutes: overrunMin,
        isShortWorkDay: !!day.isShortWorkDay,
        notes: day.notes,
      });
    });

    const evaluatedArrivals = punctualArrivalsCount + lateArrivalsCount + earlyArrivalsCount;
    const evaluatedDepartures = punctualDeparturesCount + earlyDeparturesCount + lateDeparturesCount;

    const arrivalPunctualityScore = evaluatedArrivals > 0
      ? Math.round(((evaluatedArrivals - lateArrivalsCount) / evaluatedArrivals) * 100)
      : 100;

    const overallPunctualityScore = (evaluatedArrivals + evaluatedDepartures) > 0
      ? Math.round((((evaluatedArrivals - lateArrivalsCount) + (evaluatedDepartures - earlyDeparturesCount)) / (evaluatedArrivals + evaluatedDepartures)) * 100)
      : 100;

    return {
      totalLoggedDays,
      punctualArrivalsCount,
      lateArrivalsCount,
      earlyArrivalsCount,
      punctualDeparturesCount,
      earlyDeparturesCount,
      lateDeparturesCount,
      totalLateArrivalMinutes,
      totalEarlyDepartureMinutes,
      avgLateArrivalMinutes: lateArrivalsCount > 0 ? Math.round(totalLateArrivalMinutes / lateArrivalsCount) : 0,
      avgEarlyDepartureMinutes: earlyDeparturesCount > 0 ? Math.round(totalEarlyDepartureMinutes / earlyDeparturesCount) : 0,
      lunchOverrunsCount,
      totalLunchOverrunMinutes,
      shortDaysCount,
      arrivalPunctualityScore,
      overallPunctualityScore,
      logs,
    };
  },

  /**
   * Computes comprehensive metrics across a collection of attendance days
   */
  calculateMetrics(
    days: AttendanceDay[],
    scheduledWorkingDaysCount: number
  ): AttendanceMetrics {
    let presentDaysCount = 0;
    let halfDaysCount = 0;
    let absentDaysCount = 0;
    let leaveDaysCount = 0;
    let weeklyOffCount = 0;
    let holidaysCount = 0;
    let totalActiveSeconds = 0;
    let totalBreakSeconds = 0;
    let lateArrivalsCount = 0;
    let earlyDeparturesCount = 0;

    days.forEach(day => {
      totalActiveSeconds += (day.totalActiveSeconds || 0);
      totalBreakSeconds += (day.totalBreakSeconds || 0);

      if (day.isLateEntry) lateArrivalsCount++;
      if (day.isEarlyExit) earlyDeparturesCount++;

      switch (day.status) {
        case 'present':
          presentDaysCount++;
          break;
        case 'half_day':
          halfDaysCount++;
          break;
        case 'absent':
          absentDaysCount++;
          break;
        case 'leave':
          leaveDaysCount++;
          break;
        case 'weekly_off':
          weeklyOffCount++;
          break;
        case 'holiday':
          holidaysCount++;
          break;
      }
    });

    // Effective present score (half day = 0.5)
    const effectivePresent = presentDaysCount + (halfDaysCount * 0.5);
    const attendanceRatePercentage = scheduledWorkingDaysCount > 0 
      ? Math.min(100, Math.round((effectivePresent / scheduledWorkingDaysCount) * 100))
      : 0;

    return {
      totalCalendarDays: days.length,
      presentDaysCount,
      halfDaysCount,
      absentDaysCount,
      leaveDaysCount,
      weeklyOffCount,
      holidaysCount,
      totalActiveSeconds,
      totalBreakSeconds,
      lateArrivalsCount,
      earlyDeparturesCount,
      attendanceRatePercentage,
    };
  },

  /**
   * Evaluates if working seconds meet full-day or half-day thresholds
   */
  evaluateDayStatus(
    activeSeconds: number,
    requiredActiveHours: number = 8
  ): AttendanceStatus {
    const requiredSec = requiredActiveHours * 3600;
    const halfDaySec = (requiredActiveHours / 2) * 3600;

    if (activeSeconds >= requiredSec * 0.85) {
      return 'present';
    } else if (activeSeconds >= halfDaySec * 0.8) {
      return 'half_day';
    } else if (activeSeconds > 0) {
      return 'half_day';
    } else {
      return 'absent';
    }
  }
};

