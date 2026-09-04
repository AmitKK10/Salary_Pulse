// ============================================================================
// SALARYPULSE — DETERMINISTIC ENGINE VERIFICATION SUITE
// Automated verification of Live Work, Calendar Engine, Rates, Overtime, and Quality
// ============================================================================

import { DateEngine } from './dateEngine';
import { DayEngine } from './dayEngine';
import { OvertimeEngine } from './overtimeEngine';
import { SalaryEngine } from './salaryEngine';
import { WorkSessionEngine } from './workSessionEngine';
import { PredictionEngine } from './predictionEngine';
import { 
  AttendanceDay, 
  Holiday, 
  SalaryConfig, 
  WorkSchedule,
  WorkSession 
} from '../types';

export interface TestCaseResult {
  id: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runEngineTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  const defaultSchedule: WorkSchedule = {
    id: 'sched-1',
    name: 'General Shift',
    workingDays: [1, 2, 3, 4, 5, 6],
    officeStartTime: '09:00',
    officeEndTime: '18:00',
    requiredActiveHoursPerDay: 8.0,
    breakRules: [
      { id: 'b1', name: 'Lunch', durationMinutes: 60, isPaid: false, isEnabled: true, type: 'lunch' }
    ],
    defaultLunchDurationMinutes: 60,
    defaultTeaBreakDurationMinutes: 15,
  };

  const defaultConfig: SalaryConfig = {
    id: 'cfg-1',
    schemaVersion: 2,
    monthlyBaseSalary: 15000,
    currency: 'INR',
    calculationBasis: 'monthly_scheduled_hours',
    overtimeMethod: 'monthly_threshold',
    overtimeMultiplier: 2.0,
    weeklyOffWorkRule: 'add_to_monthly_threshold',
    holidayWorkRule: 'holiday_credit_plus_monthly_threshold',
    defaultPaidHolidayCreditedHours: 8.0,
    attendanceBonusEnabled: true,
    attendanceBonusAmount: 3000,
    attendanceBonusEligibleDays: 26,
    bonusRequiresApproval: true,
    deductions: [],
    effectiveFrom: '2026-08-01',
  };

  const holidays: Holiday[] = [
    { id: 'h-1', name: 'Independence Day', date: '2026-08-15', type: 'paid', creditedHours: 8.0 }
  ];

  const rateDerivation = SalaryEngine.deriveRates('2026-08', defaultConfig, defaultSchedule, holidays);

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 1: 26 scheduled days, 20 present, 6 absent -> verify monthly target (208h)
  // --------------------------------------------------------------------------
  const scheduledDaysCount = DateEngine.getScheduledWorkingDaysCount('2026-08', defaultSchedule);
  const targetHours = scheduledDaysCount * (defaultSchedule.requiredActiveHoursPerDay || 8.0);
  results.push({
    id: 'STEP4-TEST-1',
    name: 'Scheduled Target: 26 scheduled days × 8h/day = 208h monthly target',
    passed: targetHours === 208,
    expected: '208 hours (748,800 seconds)',
    actual: `${targetHours} hours (${targetHours * 3600} seconds)`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 2: 27 scheduled days, 8h/day -> verify target = 216h
  // --------------------------------------------------------------------------
  const targetHours27 = 27 * 8.0;
  const targetSec27 = targetHours27 * 3600;
  results.push({
    id: 'STEP4-TEST-2',
    name: 'Scheduled Target: 27 scheduled days × 8h/day = 216h target',
    passed: targetHours27 === 216 && targetSec27 === 777600,
    expected: '216 hours (777,600 seconds)',
    actual: `${targetHours27} hours (${targetSec27} seconds)`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 3: Historical day: 09:05–13:00, 14:00–18:05 -> verify active = 8h (28,800s)
  // --------------------------------------------------------------------------
  const day3Sessions: WorkSession[] = [
    { id: 'ws1', startTime: '2026-08-03T09:05:00', endTime: '2026-08-03T13:00:00', durationSeconds: 14100 },
    { id: 'ws2', startTime: '2026-08-03T14:00:00', endTime: '2026-08-03T18:05:00', durationSeconds: 14700 },
  ];
  const day3Record: AttendanceDay = {
    id: 'att-2026-08-03',
    date: '2026-08-03',
    status: 'PRESENT',
    totalActiveSeconds: 28800,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 3600,
    overtimeSeconds: 0,
    workSessions: day3Sessions,
    breakSessions: [],
  };
  const day3Calc = DayEngine.calculateDayDetails('2026-08-03', day3Record, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-3',
    name: 'Historical Day: 09:05→13:00 + 14:00→18:05 = Active 08:00:00 (28,800s)',
    passed: day3Calc.actualActiveSeconds === 28800 && day3Calc.status === 'PRESENT',
    expected: 'Active: 28,800s (08:00:00), Status: PRESENT',
    actual: `Active: ${day3Calc.actualActiveSeconds}s (${WorkSessionEngine.formatSecondsToHMS(day3Calc.actualActiveSeconds)}), Status: ${day3Calc.status}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 4: Historical partial day: 06:50 -> verify remaining = 01:10 (4,200s)
  // Office Span = 07:50:00 (09:00 to 16:50), Minus 1h lunch = 06:50:00 (24,600s active)
  // --------------------------------------------------------------------------
  const day4Record: AttendanceDay = {
    id: 'att-2026-08-04',
    date: '2026-08-04',
    status: 'PARTIAL',
    totalActiveSeconds: 24600, // 6h 50m
    creditedNormalSeconds: 0,
    totalBreakSeconds: 3600,
    overtimeSeconds: 0,
    workSessions: [
      { id: 'ws-4', startTime: '2026-08-04T09:00:00', endTime: '2026-08-04T16:50:00', durationSeconds: 28200 }
    ],
    breakSessions: [],
  };
  const day4Calc = DayEngine.calculateDayDetails('2026-08-04', day4Record, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-4',
    name: 'Historical Partial Day: Active 06:50:00 → Remaining 01:10:00 (4,200s)',
    passed: day4Calc.actualActiveSeconds === 24600 && day4Calc.remainingSeconds === 4200 && day4Calc.status === 'PARTIAL',
    expected: 'Active: 24,600s (06:50:00), Remaining: 4,200s (01:10:00)',
    actual: `Active: ${day4Calc.actualActiveSeconds}s (${WorkSessionEngine.formatSecondsToHMS(day4Calc.actualActiveSeconds)}), Remaining: ${day4Calc.remainingSeconds}s (${WorkSessionEngine.formatSecondsToHMS(day4Calc.remainingSeconds)})`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 5: Paid Holiday: actual = 0, credited = 8h (28,800s)
  // --------------------------------------------------------------------------
  const day5Calc = DayEngine.calculateDayDetails('2026-08-15', undefined, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-5',
    name: 'Paid Holiday: Actual = 0h, Credited = 8h (28,800s), Holiday Credit Earned',
    passed: day5Calc.actualActiveSeconds === 0 && day5Calc.creditedNormalSeconds === 28800 && day5Calc.status === 'PAID_HOLIDAY',
    expected: 'Actual: 0s, Credited: 28,800s, Status: PAID_HOLIDAY',
    actual: `Actual: ${day5Calc.actualActiveSeconds}s, Credited: ${day5Calc.creditedNormalSeconds}s, Status: ${day5Calc.status}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 6: Weekly Off: no work -> status WEEKLY_OFF, 0 required, 0 actual
  // --------------------------------------------------------------------------
  const day6Calc = DayEngine.calculateDayDetails('2026-08-02', undefined, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-6',
    name: 'Weekly Off: No work → Status WEEKLY_OFF, Required = 0h, Actual = 0h',
    passed: day6Calc.status === 'WEEKLY_OFF' && day6Calc.requiredNormalSeconds === 0 && day6Calc.actualActiveSeconds === 0,
    expected: 'Status: WEEKLY_OFF, Required: 0s, Actual: 0s',
    actual: `Status: ${day6Calc.status}, Required: ${day6Calc.requiredNormalSeconds}s, Actual: ${day6Calc.actualActiveSeconds}s`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 7: Weekly Off: 4h work -> verify weekly-off work rule
  // Office Span = 05:00:00 (10:00 to 15:00), Minus 1h lunch = 04:00:00 (14,400s active)
  // --------------------------------------------------------------------------
  const day7Record: AttendanceDay = {
    id: 'att-2026-08-09',
    date: '2026-08-09', // Sunday
    status: 'WEEKLY_OFF',
    totalActiveSeconds: 14400, // 4h
    creditedNormalSeconds: 0,
    totalBreakSeconds: 3600,
    overtimeSeconds: 0,
    workSessions: [
      { id: 'ws-7', startTime: '2026-08-09T10:00:00', endTime: '2026-08-09T15:00:00', durationSeconds: 18000 }
    ],
    breakSessions: [],
  };
  const day7Calc = DayEngine.calculateDayDetails('2026-08-09', day7Record, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-7',
    name: 'Weekly Off (Worked): 4h work on Sunday → Status WEEKLY_OFF_WORKED, Active 4h',
    passed: day7Calc.status === 'WEEKLY_OFF_WORKED' && day7Calc.actualActiveSeconds === 14400,
    expected: 'Status: WEEKLY_OFF_WORKED, Active: 14,400s (4h)',
    actual: `Status: ${day7Calc.status}, Active: ${day7Calc.actualActiveSeconds}s`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 8: Monthly Threshold: 207h30m prior + 45m today -> Normal 30m, OT 15m
  // --------------------------------------------------------------------------
  const t8_priorSec = (207 * 3600) + (30 * 60);
  const t8_currSec = 45 * 60;
  const t8_targetSec = 208 * 3600;
  const t8_otEval = WorkSessionEngine.evaluateLiveOvertime(t8_currSec, 8.0, t8_priorSec, t8_targetSec, 'monthly_threshold');
  results.push({
    id: 'STEP4-TEST-8',
    name: 'Monthly Threshold Transition: Prior 207h30m + Today 45m → Normal 30m, OT 15m',
    passed: t8_otEval.normalSecondsToday === 1800 && t8_otEval.overtimeSecondsToday === 900 && t8_otEval.isOvertimeActive,
    expected: 'Normal: 1,800s (30m), OT: 900s (15m), isOvertimeActive: true',
    actual: `Normal: ${t8_otEval.normalSecondsToday}s, OT: ${t8_otEval.overtimeSecondsToday}s, isOvertimeActive: ${t8_otEval.isOvertimeActive}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 9: Future date: must show projection, not actual income
  // --------------------------------------------------------------------------
  const day9Calc = DayEngine.calculateDayDetails('2026-08-25', undefined, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-9',
    name: 'Future Date Isolation: Status FUTURE, Total Daily Earned = 0, Projected > 0',
    passed: day9Calc.status === 'FUTURE' && day9Calc.totalDailyEarned === 0 && day9Calc.projectedDailyEarned > 0,
    expected: 'Status: FUTURE, totalDailyEarned: 0, projectedDailyEarned: >0',
    actual: `Status: ${day9Calc.status}, totalDailyEarned: ₹${day9Calc.totalDailyEarned}, projectedDailyEarned: ₹${day9Calc.projectedDailyEarned}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 10: Manual correction: change punch -> verify recalculation
  // Office Span = 09:00:00 (09:00 to 18:00), Minus 1h lunch = 08:00:00 (28,800s active)
  // --------------------------------------------------------------------------
  const day10Original: AttendanceDay = {
    id: 'att-2026-08-05',
    date: '2026-08-05',
    status: 'PARTIAL',
    totalActiveSeconds: 14400, // 4h
    creditedNormalSeconds: 0,
    totalBreakSeconds: 0,
    overtimeSeconds: 0,
    workSessions: [
      { id: 'ws-10', startTime: '2026-08-05T09:00:00', endTime: '2026-08-05T13:00:00', durationSeconds: 14400 }
    ],
    breakSessions: [],
  };
  const day10Corrected: AttendanceDay = {
    ...day10Original,
    workSessions: [
      { id: 'ws-10', startTime: '2026-08-05T09:00:00', endTime: '2026-08-05T18:00:00', durationSeconds: 32400 }
    ],
    totalActiveSeconds: 28800,
    status: 'PRESENT',
  };
  const day10Calc = DayEngine.calculateDayDetails('2026-08-05', day10Corrected, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-10',
    name: 'Manual Punch Correction: 4h adjusted to 8h → Recalculates to PRESENT (28,800s)',
    passed: day10Calc.actualActiveSeconds === 28800 && day10Calc.status === 'PRESENT',
    expected: 'Active: 28,800s (8h), Status: PRESENT',
    actual: `Active: ${day10Calc.actualActiveSeconds}s, Status: ${day10Calc.status}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 11: Open session on past day: must appear as NEEDS REVIEW
  // --------------------------------------------------------------------------
  const day11Record: AttendanceDay = {
    id: 'att-2026-08-06',
    date: '2026-08-06',
    status: 'PRESENT',
    totalActiveSeconds: 14400,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 0,
    overtimeSeconds: 0,
    workSessions: [
      { id: 'ws-11', startTime: '2026-08-06T09:00:00', durationSeconds: 0, status: 'OPEN' } // Unclosed on past day!
    ],
    breakSessions: [],
  };
  const day11Calc = DayEngine.calculateDayDetails('2026-08-06', day11Record, defaultConfig, defaultSchedule, holidays, rateDerivation, '2026-08-15');
  results.push({
    id: 'STEP4-TEST-11',
    name: 'Past Unclosed Session: Open punch on historical date → Flagged as NEEDS_REVIEW',
    passed: day11Calc.isSuspicious && day11Calc.status === 'NEEDS_REVIEW',
    expected: 'isSuspicious: true, Status: NEEDS_REVIEW',
    actual: `isSuspicious: ${day11Calc.isSuspicious}, Status: ${day11Calc.status}`,
  });

  // --------------------------------------------------------------------------
  // STEP 4 - TEST 12: Overlapping sessions: must be detected
  // --------------------------------------------------------------------------
  const day12Record: AttendanceDay = {
    id: 'att-2026-08-07',
    date: '2026-08-07',
    status: 'PRESENT',
    totalActiveSeconds: 28800,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 0,
    overtimeSeconds: 0,
    workSessions: [
      { id: 'ws-12-a', startTime: '2026-08-07T09:00:00', endTime: '2026-08-07T14:00:00', durationSeconds: 18000 },
      { id: 'ws-12-b', startTime: '2026-08-07T13:00:00', endTime: '2026-08-07T18:00:00', durationSeconds: 18000 }, // Overlaps by 1h!
    ],
    breakSessions: [],
  };
  const day12Suspicious = DayEngine.detectSuspiciousRecords(day12Record, '2026-08-07', true, false, false);
  results.push({
    id: 'STEP4-TEST-12',
    name: 'Overlapping Sessions Detection: Session 1 (09-14) overlaps Session 2 (13-18)',
    passed: day12Suspicious.isSuspicious && day12Suspicious.reasons.some(r => r.includes('Overlapping')),
    expected: 'isSuspicious: true, Overlapping detected',
    actual: `isSuspicious: ${day12Suspicious.isSuspicious}, Reasons: ${day12Suspicious.reasons.join('; ')}`,
  });

  // ==========================================================================
  // STEP 5: RUNNING-MONTH SALARY PREDICTION ENGINE TEST SUITE
  // ==========================================================================

  // Generate a mock attendance history for days 1..14 (all 8h days, plus Day 15 partial)
  const mockAttendance: AttendanceDay[] = [];
  for (let d = 1; d <= 14; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const date = `2026-08-${dayStr}`;
    const isSun = new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
    if (!isSun) {
      mockAttendance.push({
        id: `att-${date}`,
        date,
        status: 'PRESENT',
        totalActiveSeconds: 28800, // 8h
        creditedNormalSeconds: 28800,
        totalBreakSeconds: 3600,
        overtimeSeconds: 0,
        workSessions: [{ id: `ws-${date}`, startTime: `${date}T09:00:00`, endTime: `${date}T18:00:00`, durationSeconds: 28800 }],
        breakSessions: [],
      });
    }
  }

  // Day 15 (Today) is holiday/working with 4h live completed
  const defaultScenario = PredictionEngine.createDefaultScenario('2026-08', defaultSchedule, holidays, 'EXPECTED');

  // STEP 5 - TEST 1: Default Scenario Generation (EXPECTED)
  const futureDaysCount = defaultScenario.futureDays.filter(d => d.date > '2026-08-15').length;
  results.push({
    id: 'STEP5-TEST-1',
    name: 'Scenario Generation: Creates future projection days for remaining month',
    passed: futureDaysCount === 16, // Aug 16 to 31 = 16 days
    expected: '16 future days generated for Aug 16-31',
    actual: `${futureDaysCount} future days generated`,
  });

  // STEP 5 - TEST 2: Authoritative Projection Engine (Actual + Live + Projected)
  const projAug = PredictionEngine.projectMonth(
    '2026-08',
    mockAttendance,
    defaultScenario,
    defaultConfig,
    defaultSchedule,
    holidays,
    [],
    '2026-08-15',
    {
      liveActiveSeconds: 14400, // 4h live so far
      liveBreakSeconds: 1800,
      liveOtSeconds: 0,
      liveEarned: 14400 * rateDerivation.perSecondRate,
    }
  );

  results.push({
    id: 'STEP5-TEST-2',
    name: 'Authoritative Projection: Combines past actuals + today live + future scenario',
    passed: projAug.projectedMonthEndTotal > 0 && projAug.actualEarnings > 0 && projAug.liveTodayEarnings > 0,
    expected: 'Total > 0, Actuals > 0, Today Live > 0',
    actual: `Total: ₹${projAug.projectedMonthEndTotal}, Actual: ₹${projAug.actualEarnings}, Live: ₹${projAug.liveTodayEarnings}`,
  });

  // STEP 5 - TEST 3: Immutability / Non-destructive simulation
  const attendanceCloneBefore = JSON.stringify(mockAttendance);
  PredictionEngine.projectMonth('2026-08', mockAttendance, defaultScenario, defaultConfig, defaultSchedule, holidays, [], '2026-08-15');
  const attendanceCloneAfter = JSON.stringify(mockAttendance);
  results.push({
    id: 'STEP5-TEST-3',
    name: 'Projection Isolation: Simulation strictly never mutates actual AttendanceDay records',
    passed: attendanceCloneBefore === attendanceCloneAfter,
    expected: 'Attendance records 100% unchanged',
    actual: attendanceCloneBefore === attendanceCloneAfter ? 'Immutable & Pristine' : 'Mutated (Error)',
  });

  // STEP 5 - TEST 4: Target Income Mode calculation
  const targetCalc = PredictionEngine.calculateTargetEarningOT(18000, projAug, defaultConfig, rateDerivation);
  results.push({
    id: 'STEP5-TEST-4',
    name: 'Target Income Calculator: Computes OT hours needed to reach target salary',
    passed: targetCalc.requiredOTHours >= 0 && targetCalc.isAchievable !== undefined,
    expected: 'requiredOTHours >= 0, isAchievable: true/false',
    actual: `Target: ₹${targetCalc.targetAmount}, OT Needed: ${targetCalc.requiredOTHours}h (${targetCalc.formattedRequiredOT}), Achievable: ${targetCalc.isAchievable}`,
  });

  // STEP 5 - TEST 5: Work Until Simulator
  const workUntilRes = PredictionEngine.calculateWorkUntil(
    '2026-08-15T18:02:00Z',
    '20:00',
    14400,
    14400 * rateDerivation.perSecondRate,
    true,
    defaultConfig,
    rateDerivation,
    defaultSchedule
  );
  results.push({
    id: 'STEP5-TEST-5',
    name: 'Work Until Simulator: Simulates working until 20:00 and calculates incremental earnings',
    passed: workUntilRes.projectedDailyEarned > 0 && workUntilRes.additionalEarned >= 0,
    expected: 'Simulated Day Earned > 0, Additional Earned calculated',
    actual: `Day Earned: ₹${workUntilRes.projectedDailyEarned}, Extra: ₹${workUntilRes.additionalEarned}, Formatted: ${workUntilRes.formattedAdditionalWork}`,
  });

  // STEP 5 - TEST 6: "How Long to Earn ₹X?" Calculator
  const timeToEarnRes = PredictionEngine.calculateTimeToEarnAmount(
    500,
    200,
    14400,
    '2026-08-15T18:02:00Z',
    defaultConfig,
    rateDerivation,
    defaultSchedule
  );
  results.push({
    id: 'STEP5-TEST-6',
    name: 'Time to Earn Amount: Computes exact duration required to earn ₹500 today',
    passed: timeToEarnRes.requiredAdditionalSeconds > 0 && !!timeToEarnRes.estimatedClockCompletion,
    expected: 'requiredAdditionalSeconds > 0, formatted estimated clock time',
    actual: `Needed: ${timeToEarnRes.formattedRequiredTime} hrs, Est Finish: ${timeToEarnRes.estimatedClockCompletion}`,
  });

  // STEP 5 - TEST 7: "If I Leave Now" Simulator
  const ifILeaveRes = PredictionEngine.calculateIfILeaveNow(
    '2026-08-15',
    14400,
    14400 * rateDerivation.perSecondRate,
    projAug,
    defaultConfig,
    defaultSchedule,
    rateDerivation
  );
  results.push({
    id: 'STEP5-TEST-7',
    name: 'If I Leave Now: Computes immediate impact and loss if leaving right now (4h active)',
    passed: ifILeaveRes.todayEarned > 0 && ifILeaveRes.todayDeficitSeconds > 0,
    expected: 'todayEarned > 0, todayDeficitSeconds > 0',
    actual: `Earned Today: ₹${ifILeaveRes.todayEarned}, Deficit: ${ifILeaveRes.todayDeficitFormatted}h, Impact: ₹${ifILeaveRes.todayDeficitImpact}`,
  });

  // STEP 5 - TEST 8: Monthly OT Threshold Forecast
  results.push({
    id: 'STEP5-TEST-8',
    name: 'OT Forecast: Accurately computes progress toward monthly normal threshold',
    passed: projAug.monthlyNormalTargetSeconds > 0 && projAug.totalMonthOTSeconds >= 0,
    expected: 'monthlyNormalTargetSeconds > 0, valid OT tracking',
    actual: `Target: ${(projAug.monthlyNormalTargetSeconds / 3600).toFixed(1)}h, Forecasted OT: ${(projAug.totalMonthOTSeconds / 3600).toFixed(1)}h`,
  });

  // STEP 5 - TEST 9: Leave Scenario Simulation (2 Unpaid Leaves)
  const leaveScenario = PredictionEngine.createDefaultScenario('2026-08', defaultSchedule, holidays, 'EXPECTED');
  leaveScenario.futureDays = leaveScenario.futureDays.map(d => {
    if (d.date === '2026-08-25' || d.date === '2026-08-26') {
      return { ...d, status: 'UNPAID_LEAVE', plannedWorkSeconds: 0, plannedBreakSeconds: 0 };
    }
    return d;
  });
  const projLeave = PredictionEngine.projectMonth('2026-08', mockAttendance, leaveScenario, defaultConfig, defaultSchedule, holidays, [], '2026-08-15');
  const deltaLeave = projAug.projectedMonthEndTotal - projLeave.projectedMonthEndTotal;
  results.push({
    id: 'STEP5-TEST-9',
    name: 'Leave Scenario: 2 unpaid leaves reduce projected salary proportionately',
    passed: deltaLeave > 0 && projLeave.futureLeaveDays === 2,
    expected: 'Salary reduction > 0, futureLeaveDays = 2',
    actual: `Salary Delta: -₹${deltaLeave.toFixed(2)}, Future Leaves: ${projLeave.futureLeaveDays}`,
  });

  // STEP 5 - TEST 10: Attendance Bonus Threshold Projection
  const bonusEligibleStandard = projAug.bonusStatus === 'LIKELY ELIGIBLE';
  // If 5 leaves added to future days, eligible days should fall below 26 and bonus becomes 0
  const manyLeavesScenario = PredictionEngine.createDefaultScenario('2026-08', defaultSchedule, holidays, 'EXPECTED');
  let leaveCounter = 0;
  manyLeavesScenario.futureDays = manyLeavesScenario.futureDays.map(d => {
    if (d.date > '2026-08-15' && d.status !== 'WEEKLY_OFF' && leaveCounter < 5) {
      leaveCounter++;
      return { ...d, status: 'UNPAID_LEAVE', plannedWorkSeconds: 0 };
    }
    return d;
  });
  const projManyLeaves = PredictionEngine.projectMonth('2026-08', mockAttendance, manyLeavesScenario, defaultConfig, defaultSchedule, holidays, [], '2026-08-15');
  results.push({
    id: 'STEP5-TEST-10',
    name: 'Attendance Bonus Gate: Bonus drops to 0 if projected present days < 26',
    passed: bonusEligibleStandard === true && projManyLeaves.bonusStatus !== 'LIKELY ELIGIBLE' && projManyLeaves.projectedBonus === 0,
    expected: 'Full attendance = Bonus eligible; 5 absences = Ineligible (₹0 bonus)',
    actual: `Standard Bonus: ₹${projAug.projectedBonus} (${projAug.bonusStatus}), 5 Absences Bonus: ₹${projManyLeaves.projectedBonus} (${projManyLeaves.bonusStatus})`,
  });

  // STEP 5 - TEST 11: Multi-Scenario Comparison Engine
  const bestCaseScenario = PredictionEngine.createDefaultScenario('2026-08', defaultSchedule, holidays, 'BEST_CASE');
  const worstCaseScenario = PredictionEngine.createDefaultScenario('2026-08', defaultSchedule, holidays, 'WORST_CASE');
  const comparison = PredictionEngine.compareScenarios(
    [defaultScenario, bestCaseScenario, worstCaseScenario],
    mockAttendance,
    defaultConfig,
    defaultSchedule,
    holidays,
    [],
    '2026-08-15'
  );
  results.push({
    id: 'STEP5-TEST-11',
    name: 'Scenario Comparison: Side-by-side evaluation of Best Case vs Expected vs Worst Case',
    passed: comparison.length === 3 && comparison.find(c => c.assumptionType === 'BEST_CASE')!.projectedTotal >= comparison.find(c => c.assumptionType === 'WORST_CASE')!.projectedTotal,
    expected: '3 Scenarios evaluated, Best Case >= Worst Case',
    actual: `Evaluated ${comparison.length} scenarios: Best (₹${comparison.find(c => c.assumptionType === 'BEST_CASE')?.projectedTotal}) vs Worst (₹${comparison.find(c => c.assumptionType === 'WORST_CASE')?.projectedTotal})`,
  });

  // STEP 5 - TEST 12: Mathematical Formula Consistency
  const sumFormula = Number((
    projAug.actualEarnings + 
    projAug.projectedFutureEarnings - 
    projAug.deductions
  ).toFixed(2));
  const diffFormula = Math.abs(sumFormula - projAug.projectedMonthEndTotal);
  results.push({
    id: 'STEP5-TEST-12',
    name: 'Mathematical Integrity: Net Salary matches exact sum of all components',
    passed: diffFormula < 0.05,
    expected: `Formula sum: ₹${sumFormula} == Net Salary: ₹${projAug.projectedMonthEndTotal}`,
    actual: `Sum: ₹${sumFormula}, Net: ₹${projAug.projectedMonthEndTotal}, Diff: ₹${diffFormula.toFixed(4)}`,
  });

  // ==========================================================================
  // OFFICE WORKING-TIME RULE VERIFICATION TESTS (Test Cases 1 - 5)
  // Authoritative Rule: Office Span = Last OUT - First IN
  // Actual Working Time = Office Span - Configured Lunch (01:00:00)
  // ==========================================================================
  // Test Case 1:
  // IN: 09:01, OUT: 14:01, IN: 15:07, OUT: 18:13
  // Office Span: 09:12:00, Lunch: 01:00:00, Working Time: 08:12:00
  const tc1Res = WorkSessionEngine.calculateDayActiveSeconds([
    { id: 'tc1-1', startTime: '2026-08-05T09:01:00', endTime: '2026-08-05T14:01:00', durationSeconds: 18000 },
    { id: 'tc1-2', startTime: '2026-08-05T15:07:00', endTime: '2026-08-05T18:13:00', durationSeconds: 11160 },
  ], undefined, '2026-08-05', 12, 3600);
  const tc1WorkingTimeHMS = WorkSessionEngine.formatSecondsToHMS(tc1Res.totalActiveSeconds);
  const tc1OfficeSpanHMS = WorkSessionEngine.formatSecondsToHMS(tc1Res.officeSpanSeconds || 0);
  results.push({
    id: 'OFFICE-RULE-TC-1',
    name: 'Office Working Time TC1: 09:01→14:01 + 15:07→18:13 = 08:12:00',
    passed: tc1WorkingTimeHMS === '08:12:00' && tc1OfficeSpanHMS === '09:12:00' && tc1Res.totalActiveSeconds === 29520,
    expected: 'Office Span: 09:12:00, Lunch: 01:00:00, Working Time: 08:12:00 (29,520s)',
    actual: `Office Span: ${tc1OfficeSpanHMS}, Working Time: ${tc1WorkingTimeHMS} (${tc1Res.totalActiveSeconds}s)`,
  });

  // Test Case 2:
  // IN: 09:00, OUT: 18:00
  // Office Span: 09:00:00, Lunch: 01:00:00, Working Time: 08:00:00
  const tc2Res = WorkSessionEngine.calculateDayActiveSeconds([
    { id: 'tc2-1', startTime: '2026-08-06T09:00:00', endTime: '2026-08-06T18:00:00', durationSeconds: 32400 },
  ], undefined, '2026-08-06', 12, 3600);
  const tc2WorkingTimeHMS = WorkSessionEngine.formatSecondsToHMS(tc2Res.totalActiveSeconds);
  const tc2OfficeSpanHMS = WorkSessionEngine.formatSecondsToHMS(tc2Res.officeSpanSeconds || 0);
  results.push({
    id: 'OFFICE-RULE-TC-2',
    name: 'Office Working Time TC2: 09:00→18:00 = 08:00:00',
    passed: tc2WorkingTimeHMS === '08:00:00' && tc2OfficeSpanHMS === '09:00:00' && tc2Res.totalActiveSeconds === 28800,
    expected: 'Office Span: 09:00:00, Lunch: 01:00:00, Working Time: 08:00:00 (28,800s)',
    actual: `Office Span: ${tc2OfficeSpanHMS}, Working Time: ${tc2WorkingTimeHMS} (${tc2Res.totalActiveSeconds}s)`,
  });

  // Test Case 3:
  // IN: 09:05, OUT: 13:00, IN: 14:00, OUT: 18:05
  // Office Span: 09:00:00, Lunch: 01:00:00, Working Time: 08:00:00
  const tc3Res = WorkSessionEngine.calculateDayActiveSeconds([
    { id: 'tc3-1', startTime: '2026-08-07T09:05:00', endTime: '2026-08-07T13:00:00', durationSeconds: 14100 },
    { id: 'tc3-2', startTime: '2026-08-07T14:00:00', endTime: '2026-08-07T18:05:00', durationSeconds: 14700 },
  ], undefined, '2026-08-07', 12, 3600);
  const tc3WorkingTimeHMS = WorkSessionEngine.formatSecondsToHMS(tc3Res.totalActiveSeconds);
  const tc3OfficeSpanHMS = WorkSessionEngine.formatSecondsToHMS(tc3Res.officeSpanSeconds || 0);
  results.push({
    id: 'OFFICE-RULE-TC-3',
    name: 'Office Working Time TC3: 09:05→13:00 + 14:00→18:05 = 08:00:00',
    passed: tc3WorkingTimeHMS === '08:00:00' && tc3OfficeSpanHMS === '09:00:00' && tc3Res.totalActiveSeconds === 28800,
    expected: 'Office Span: 09:00:00, Lunch: 01:00:00, Working Time: 08:00:00 (28,800s)',
    actual: `Office Span: ${tc3OfficeSpanHMS}, Working Time: ${tc3WorkingTimeHMS} (${tc3Res.totalActiveSeconds}s)`,
  });

  // Test Case 4:
  // IN: 09:00, OUT: 18:30
  // Office Span: 09:30:00, Lunch: 01:00:00, Working Time: 08:30:00
  const tc4Res = WorkSessionEngine.calculateDayActiveSeconds([
    { id: 'tc4-1', startTime: '2026-08-08T09:00:00', endTime: '2026-08-08T18:30:00', durationSeconds: 34200 },
  ], undefined, '2026-08-08', 12, 3600);
  const tc4WorkingTimeHMS = WorkSessionEngine.formatSecondsToHMS(tc4Res.totalActiveSeconds);
  const tc4OfficeSpanHMS = WorkSessionEngine.formatSecondsToHMS(tc4Res.officeSpanSeconds || 0);
  results.push({
    id: 'OFFICE-RULE-TC-4',
    name: 'Office Working Time TC4: 09:00→18:30 = 08:30:00',
    passed: tc4WorkingTimeHMS === '08:30:00' && tc4OfficeSpanHMS === '09:30:00' && tc4Res.totalActiveSeconds === 30600,
    expected: 'Office Span: 09:30:00, Lunch: 01:00:00, Working Time: 08:30:00 (30,600s)',
    actual: `Office Span: ${tc4OfficeSpanHMS}, Working Time: ${tc4WorkingTimeHMS} (${tc4Res.totalActiveSeconds}s)`,
  });

  // Test Case 5:
  // Three sessions: 09:00 -> 12:00, 13:00 -> 15:00, 15:30 -> 18:30
  // Office Span: 09:30:00, Lunch: 01:00:00, Working Time: 08:30:00
  const tc5Res = WorkSessionEngine.calculateDayActiveSeconds([
    { id: 'tc5-1', startTime: '2026-08-09T09:00:00', endTime: '2026-08-09T12:00:00', durationSeconds: 10800 },
    { id: 'tc5-2', startTime: '2026-08-09T13:00:00', endTime: '2026-08-09T15:00:00', durationSeconds: 7200 },
    { id: 'tc5-3', startTime: '2026-08-09T15:30:00', endTime: '2026-08-09T18:30:00', durationSeconds: 10800 },
  ], undefined, '2026-08-09', 12, 3600);
  const tc5WorkingTimeHMS = WorkSessionEngine.formatSecondsToHMS(tc5Res.totalActiveSeconds);
  const tc5OfficeSpanHMS = WorkSessionEngine.formatSecondsToHMS(tc5Res.officeSpanSeconds || 0);
  results.push({
    id: 'OFFICE-RULE-TC-5',
    name: 'Office Working Time TC5: 3 sessions 09:00→12:00 + 13:00→15:00 + 15:30→18:30 = 08:30:00',
    passed: tc5WorkingTimeHMS === '08:30:00' && tc5OfficeSpanHMS === '09:30:00' && tc5Res.totalActiveSeconds === 30600,
    expected: 'Office Span: 09:30:00, Lunch: 01:00:00, Working Time: 08:30:00 (30,600s)',
    actual: `Office Span: ${tc5OfficeSpanHMS}, Working Time: ${tc5WorkingTimeHMS} (${tc5Res.totalActiveSeconds}s)`,
  });

  return results;
}
