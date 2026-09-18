// ============================================================================
// SALARYPULSE — AUTHORITATIVE BOSS SALARY CALCULATION TEST SUITE
// Validates all confirmed company/boss rules against official payroll benchmarks
// ============================================================================

import { SalaryEngine } from './salaryEngine';
import { AttendanceDay } from '../types';
import { 
  INITIAL_ATTENDANCE_DAYS, 
  INITIAL_HOLIDAYS, 
  INITIAL_SALARY_CONFIG, 
  INITIAL_SCHEDULE 
} from '../persistence/initialData';

describe('Authoritative Boss Salary Calculation Suite', () => {
  // Test 1: Daily Rates for all month lengths (28, 29, 30, 31)
  test('Daily rates match exact decimal values', () => {
    const rate28 = SalaryEngine.deriveRates('2026-02', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);
    const rate30 = SalaryEngine.deriveRates('2026-06', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);
    const rate31 = SalaryEngine.deriveRates('2026-08', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);

    console.log('28-day daily rate:', rate28.dailyRate, 'expected: 535.7142857...');
    console.log('30-day daily rate:', rate30.dailyRate, 'expected: 500.00');
    console.log('31-day daily rate:', rate31.dailyRate, 'expected: 483.8709677...');

    if (Math.abs(rate28.dailyRate - (15000 / 28)) > 0.0001) throw new Error('28-day rate mismatch');
    if (Math.abs(rate30.dailyRate - 500.0) > 0.0001) throw new Error('30-day rate mismatch');
    if (Math.abs(rate31.dailyRate - (15000 / 31)) > 0.0001) throw new Error('31-day rate mismatch');
  });

  // Test 2: Working Days = Calendar Days - Sundays
  test('Working days equals Calendar Days minus Sundays', () => {
    // June 2026: 30 days, 4 Sundays (June 7, 14, 21, 28) -> 26 working days
    const juneRates = SalaryEngine.deriveRates('2026-06', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);
    if (juneRates.calendarDays !== 30) throw new Error('June calendar days mismatch');
    if (juneRates.sundaysCount !== 4) throw new Error('June sundays count mismatch');
    if (juneRates.workingDays !== 26) throw new Error('June working days mismatch');
    if (juneRates.totalRequiredMonthlyHours !== 208) throw new Error('June required hours mismatch');

    // August 2026: 31 days, 5 Sundays (Aug 2, 9, 16, 23, 30) -> 26 working days
    const augRates = SalaryEngine.deriveRates('2026-08', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);
    if (augRates.calendarDays !== 31) throw new Error('August calendar days mismatch');
    if (augRates.sundaysCount !== 5) throw new Error('August sundays count mismatch');
    if (augRates.workingDays !== 26) throw new Error('August working days mismatch');
    if (augRates.totalRequiredMonthlyHours !== 208) throw new Error('August required hours mismatch');
  });

  // Test 3: June Official Benchmark exact reproduction
  test('June 2026 Official Benchmark matches exact ₹12,073', () => {
    // 169h 10m worked (609,000s)
    const calc = SalaryEngine.calculateWithOfficialBenchmark(
      '2026-06',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS
    );

    if (!calc) throw new Error('Calculation returned null');

    console.log('June Official Calc Result:');
    console.log('  Required Hours:', calc.requiredWorkingHoursFormatted, '(Expected: 208:00:00)');
    console.log('  Actual Worked Hours:', calc.actualWorkedHoursFormatted, '(Expected: 169:10:00)');
    console.log('  Shortfall Hours:', calc.shortfallHoursFormatted, '(Expected: 38:50:00)');
    console.log('  Shortfall Deduction:', calc.shortfallDeduction.toFixed(4), '(Expected: ~2427.0833)');
    console.log('  Sandwich Sundays:', calc.sandwichSundaysCount, '(Expected: 1)');
    console.log('  Sandwich Deduction:', calc.sandwichSundayDeduction, '(Expected: 500)');
    console.log('  Unrounded Final:', calc.unroundedFinalSalary.toFixed(4), '(Expected: ~12072.9167)');
    console.log('  Final Salary:', calc.finalSalary, '(Expected: 12073)');

    if (calc.requiredWorkingHoursFormatted !== '208:00:00') throw new Error('June required hours mismatch');
    if (calc.shortfallHoursFormatted !== '38:50:00') throw new Error('June shortfall mismatch');
    if (Math.abs(calc.shortfallDeduction - 2427.0833) > 0.01) throw new Error('June shortfall deduction mismatch');
    if (calc.sandwichSundaysCount !== 1) throw new Error('June sandwich sunday count mismatch');
    if (calc.sandwichSundayDeduction !== 500) throw new Error('June sandwich deduction mismatch');
    if (calc.finalSalary !== 12073) throw new Error(`June final salary mismatch: got ${calc.finalSalary}`);
  });

  // Test 4: August Official Benchmark exact reproduction
  test('August 2026 Official Benchmark matches exact ₹15,102', () => {
    const calc = SalaryEngine.calculateWithOfficialBenchmark(
      '2026-08',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS
    );

    if (!calc) throw new Error('Calculation returned null');

    console.log('August Official Calc Result:');
    console.log('  Required Hours:', calc.requiredWorkingHoursFormatted);
    console.log('  Actual Worked Hours:', calc.actualWorkedHoursFormatted);
    console.log('  Shortfall Hours:', calc.shortfallHoursFormatted);
    console.log('  Shortfall Deduction:', calc.shortfallDeduction.toFixed(2), '(Expected: ~382.06)');
    console.log('  Credited Holiday Pay:', calc.creditedHolidayPay.toFixed(2), '(Expected: ~483.87)');
    console.log('  Final Salary:', calc.finalSalary, '(Expected: 15102)');

    if (calc.finalSalary !== 15102) throw new Error(`August final salary mismatch: got ${calc.finalSalary}`);
  });

  // Test 4b: May 2026 Confirmed Result (Partial Joining Month -> ₹3,016)
  test('May 2026 Confirmed Result matches exact ₹3,016 for partial joining month', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-05',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS
    );

    console.log('May Official Calc Result:');
    console.log('  Scheduled Working Days:', calc.scheduledWorkingDays, '(Expected: 6)');
    console.log('  Required Hours:', calc.requiredWorkingHoursFormatted, '(Expected: 48:00:00)');
    console.log('  Actual Worked Hours:', calc.actualWorkedHoursFormatted, '(Expected: 49:52:00)');
    console.log('  Overtime Hours:', calc.overtimeHoursFormatted, '(Expected: 01:52:00)');
    console.log('  Base Salary:', calc.baseSalary.toFixed(2), '(Expected: ~2903.23)');
    console.log('  Overtime Pay:', calc.overtimePay.toFixed(2), '(Expected: ~112.90)');
    console.log('  Final Salary:', calc.finalSalary, '(Expected: 3016)');

    if (calc.scheduledWorkingDays !== 6) throw new Error(`Expected 6 scheduled working days, got ${calc.scheduledWorkingDays}`);
    if (calc.finalSalary !== 3016) throw new Error(`Expected final salary 3016, got ${calc.finalSalary}`);
    if (calc.benchmarkAudit && !calc.benchmarkAudit.isExactMatch) throw new Error('Expected benchmarkAudit to be exact match');
  });

  // Test 5: Validation Case 2 — Normal Full Attendance (30-day month, 208h actual)
  test('Validation Case 2: Normal Full Attendance (208h target = 208h actual -> ₹15,000)', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-06',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [], // no raw days, override active seconds to exactly 208h
      INITIAL_HOLIDAYS,
      undefined,
      undefined,
      undefined,
      208 * 3600
    );

    if (calc.shortfallMinutes !== 0) throw new Error('Expected shortfallMinutes to be 0');
    if (calc.overtimeMinutes !== 0) throw new Error('Expected overtimeMinutes to be 0');
    if (calc.shortfallDeduction !== 0) throw new Error('Expected shortfallDeduction to be 0');
    if (calc.overtimePay !== 0) throw new Error('Expected overtimePay to be 0');
    if (calc.finalSalary !== 15000) throw new Error(`Expected finalSalary 15000, got ${calc.finalSalary}`);
  });

  // Test 6: Validation Case 3 — 2 Hours OT (30-day month, 210h actual -> ₹15,150)
  test('Validation Case 3: 2 Hours Overtime (208h target, 210h actual -> OT pay ₹150 -> ₹15,150)', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-06',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [],
      INITIAL_HOLIDAYS,
      undefined,
      undefined,
      undefined,
      210 * 3600
    );

    if (calc.overtimeMinutes !== 120) throw new Error(`Expected 120 OT minutes, got ${calc.overtimeMinutes}`);
    if (calc.shortfallMinutes !== 0) throw new Error('Expected shortfallMinutes to be 0');
    if (calc.overtimePay !== 150) throw new Error(`Expected OT pay 150, got ${calc.overtimePay}`);
    if (calc.finalSalary !== 15150) throw new Error(`Expected finalSalary 15150, got ${calc.finalSalary}`);
  });

  // Test 7: Validation Case 4 — Shortfall (30-day month, 200h actual -> 1 day shortfall = ₹500 deduction -> ₹14,500)
  test('Validation Case 4: 8 Hours Shortfall (208h target, 200h actual -> ₹500 deduction -> ₹14,500)', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-06',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [],
      INITIAL_HOLIDAYS,
      undefined,
      undefined,
      undefined,
      200 * 3600
    );

    if (calc.shortfallMinutes !== 480) throw new Error(`Expected 480 shortfall minutes, got ${calc.shortfallMinutes}`);
    if (calc.overtimeMinutes !== 0) throw new Error('Expected overtimeMinutes to be 0');
    if (calc.shortfallDeduction !== 500) throw new Error(`Expected shortfallDeduction 500, got ${calc.shortfallDeduction}`);
    if (calc.finalSalary !== 14500) throw new Error(`Expected finalSalary 14500, got ${calc.finalSalary}`);
  });

  // Test 8: Validation Case 5 — 31-Day Month with 4 Sundays (27 working days = 216h, 212h actual -> ₹14,758)
  test('Validation Case 5: 31-Day Month with 4h Shortfall (216h target, 212h actual -> ₹14,758)', () => {
    // July 2026 has 31 days and 4 Sundays (July 5, 12, 19, 26) -> 27 working days = 216 hours
    const rates = SalaryEngine.deriveRates('2026-07', INITIAL_SALARY_CONFIG, INITIAL_SCHEDULE);
    if (rates.calendarDays !== 31) throw new Error('July calendar days should be 31');
    if (rates.sundaysCount !== 4) throw new Error('July sundays should be 4');
    if (rates.scheduledWorkingDays !== 27) throw new Error('July working days should be 27');
    if (rates.totalRequiredMonthlyHours !== 216) throw new Error('July target hours should be 216');

    const expectedDailyRate = 15000 / 31;
    if (Math.abs(rates.dailyRate - expectedDailyRate) > 0.0001) throw new Error('July daily rate mismatch');

    // Actual 212 hours = 4h shortfall = 0.5 day shortage
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-07',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [],
      INITIAL_HOLIDAYS,
      undefined,
      undefined,
      undefined,
      212 * 3600
    );

    const expectedShortfallDeduction = 0.5 * expectedDailyRate; // ~241.9355
    if (Math.abs(calc.shortfallDeduction - expectedShortfallDeduction) > 0.01) {
      throw new Error(`Shortfall deduction mismatch: got ${calc.shortfallDeduction}, expected ${expectedShortfallDeduction}`);
    }

    const expectedUnroundedSalary = 15000 - expectedShortfallDeduction; // ~14758.0645
    if (Math.abs(calc.unroundedFinalSalary - expectedUnroundedSalary) > 0.01) {
      throw new Error(`Unrounded salary mismatch: got ${calc.unroundedFinalSalary}, expected ${expectedUnroundedSalary}`);
    }
    if (calc.finalSalary !== 14758) {
      throw new Error(`Final salary mismatch: got ${calc.finalSalary}, expected 14758`);
    }
  });

  // Test 9: Authoritative Salary Result Object Property Check (All 16 required fields)
  test('Authoritative Salary Result Object contains all 16 required numeric fields', () => {
    const calc = SalaryEngine.calculateWithOfficialBenchmark(
      '2026-06',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS
    );

    if (!calc) throw new Error('Calculation returned null');

    const requiredKeys: (keyof typeof calc)[] = [
      'calendarDays',
      'sundayCount',
      'scheduledWorkingDays',
      'requiredMinutes',
      'actualMinutes',
      'shortfallMinutes',
      'overtimeMinutes',
      'dailyRate',
      'shortfallHourlyRate',
      'shortfallDeduction',
      'overtimeRate',
      'overtimePay',
      'sandwichSundayCount',
      'sandwichSundayDeduction',
      'baseSalary',
      'finalSalary',
    ];

    for (const key of requiredKeys) {
      if (typeof calc[key] !== 'number') {
        throw new Error(`Missing or non-numeric field: ${String(key)}, value is: ${calc[key]}`);
      }
    }

    console.log('All 16 required authoritative salary result properties validated successfully:');
    console.log({
      calendarDays: calc.calendarDays,
      sundayCount: calc.sundayCount,
      scheduledWorkingDays: calc.scheduledWorkingDays,
      requiredMinutes: calc.requiredMinutes,
      actualMinutes: calc.actualMinutes,
      shortfallMinutes: calc.shortfallMinutes,
      overtimeMinutes: calc.overtimeMinutes,
      dailyRate: calc.dailyRate,
      shortfallHourlyRate: calc.shortfallHourlyRate,
      shortfallDeduction: calc.shortfallDeduction,
      overtimeRate: calc.overtimeRate,
      overtimePay: calc.overtimePay,
      sandwichSundayCount: calc.sandwichSundayCount,
      sandwichSundayDeduction: calc.sandwichSundayDeduction,
      baseSalary: calc.baseSalary,
      finalSalary: calc.finalSalary,
    });
  });

  // Test 10: July 2026 Zero Attendance Test
  test('July 2026 Zero Attendance returns ₹0 salary (not ₹1,935)', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-07',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [], // zero attendance records
      INITIAL_HOLIDAYS
    );

    console.log('July Zero Attendance Result:');
    console.log('  Actual Minutes:', calc.actualMinutes, '(Expected: 0)');
    console.log('  Shortfall Minutes:', calc.shortfallMinutes, '(Expected: 12960 = 216h)');
    console.log('  Final Salary:', calc.finalSalary, '(Expected: 0)');

    if (calc.actualMinutes !== 0) throw new Error(`Expected 0 actual minutes, got ${calc.actualMinutes}`);
    if (calc.shortfallMinutes !== 12960) throw new Error(`Expected 12960 shortfall minutes, got ${calc.shortfallMinutes}`);
    if (calc.finalSalary !== 0) throw new Error(`Expected ₹0 salary, got ${calc.finalSalary}`);
  });

  // Test 11: August 2026 Biometric Punches (without holiday credit)
  test('August 2026 Biometric Punches (200h41m work, 0 holiday credit) yields ₹14,557', () => {
    // 200h 41m = 722,460 seconds
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-08',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [],
      [], // no holiday pay in this baseline comparison
      undefined,
      undefined,
      undefined,
      200 * 3600 + 41 * 60 // 722,460 seconds
    );

    console.log('August Raw Punches Result:');
    console.log('  Actual Work:', calc.actualWorkedHoursFormatted);
    console.log('  Shortfall Minutes:', calc.shortfallMinutes, '(Expected: 439 min = 7h19m)');
    console.log('  Shortfall Deduction:', calc.shortfallDeduction.toFixed(2), '(Expected: ~442.53)');
    console.log('  Final Salary:', calc.finalSalary, '(Expected: 14557)');
    console.log('  Holiday Credit Minutes:', calc.holidayCreditMinutes, '(Expected: 0)');

    if (calc.holidayCreditMinutes !== 0) throw new Error(`Holiday credit must be 0, got ${calc.holidayCreditMinutes}`);
    if (calc.finalSalary !== 14557) throw new Error(`Expected ₹14,557, got ${calc.finalSalary}`);
  });

  // Test 12: Sandwich Sunday Detection with 'Absent' records (surrounding Saturday & Monday)
  test('Sandwich Sunday Detection accurately identifies Absent records (surrounding Saturday and Monday)', () => {
    // June 2026: June 27 is Saturday, June 28 is Sunday, June 29 is Monday
    // Test with mixed casing ('Absent', 'absent', 'ABSENT')
    const sampleDays = [
      {
        id: 'test-sat',
        date: '2026-06-27',
        status: 'Absent' as any,
        workdayStatus: 'ABSENT',
        totalActiveSeconds: 0,
        creditedNormalSeconds: 0,
        totalBreakSeconds: 0,
        overtimeSeconds: 0,
        workSessions: [],
        breakSessions: [],
        source: 'DEVICE' as any,
      },
      {
        id: 'test-sun',
        date: '2026-06-28',
        status: 'WEEKLY_OFF' as any,
        workdayStatus: 'WEEKLY_OFF',
        totalActiveSeconds: 0,
        creditedNormalSeconds: 0,
        totalBreakSeconds: 0,
        overtimeSeconds: 0,
        workSessions: [],
        breakSessions: [],
        source: 'DEVICE' as any,
      },
      {
        id: 'test-mon',
        date: '2026-06-29',
        status: 'absent' as any,
        workdayStatus: 'Absent',
        totalActiveSeconds: 0,
        creditedNormalSeconds: 0,
        totalBreakSeconds: 0,
        overtimeSeconds: 0,
        workSessions: [],
        breakSessions: [],
        source: 'DEVICE' as any,
      },
    ];

    const result = SalaryEngine.calculateSandwichSundays('2026-06', sampleDays as any as AttendanceDay[], 500);
    console.log('Sandwich Detection Test Result:');
    console.log('  Count:', result.count, '(Expected: 1)');
    console.log('  Deduction:', result.deduction, '(Expected: 500)');
    console.log('  Dates:', result.dates);

    if (result.count !== 1) throw new Error(`Expected count 1, got ${result.count}`);
    if (result.deduction !== 500) throw new Error(`Expected deduction 500, got ${result.deduction}`);
    if (!result.dates.includes('2026-06-28')) throw new Error(`Expected 2026-06-28 in dates, got ${result.dates}`);
  });

  // Test 13: August 2026 Reconciliation: 14,557 + 61 (missing 1h on Aug 1st) + 484 (Aug 15 Holiday) = 15,102
  test('August 2026 User Reconciliation: ₹14,557 + ₹60.48 (missing 1h) + ₹483.87 (Aug 15 Holiday) = ₹15,102', () => {
    // 1. Calculation with August 1st having 1 hour lunch deducted (200h 41m) and no holiday:
    const calcWithoutFix = SalaryEngine.calculateMonthlySalary(
      '2026-08',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      [],
      [],
      undefined,
      undefined,
      undefined,
      200 * 3600 + 41 * 60 // 722,460 seconds (200h 41m)
    );
    if (calcWithoutFix.finalSalary !== 14557) {
      throw new Error(`Expected baseline 14,557, got ${calcWithoutFix.finalSalary}`);
    }

    // 2. Calculation with single punch in/out on Aug 1st (full 3h 45m = 201h 41m) and Aug 15th Holiday Pay:
    const calcFull = SalaryEngine.calculateMonthlySalary(
      '2026-08',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS
    );

    const recoveredHourAmount = calcWithoutFix.shortfallDeduction - calcFull.shortfallDeduction;
    console.log('August Reconciliation Steps:');
    console.log('  Base with 1h Lunch Deducted & No Holiday:', calcWithoutFix.finalSalary, '(Expected: 14557)');
    console.log('  Recovered Missing 1 Hour on Aug 1st:', recoveredHourAmount.toFixed(2), '(Expected: ~60.48)');
    console.log('  Aug 15th Paid Holiday Pay:', calcFull.creditedHolidayPay.toFixed(2), '(Expected: ~483.87)');
    console.log('  Final Reconciled Salary:', calcFull.finalSalary, '(Expected: 15102)');

    if (calcFull.finalSalary !== 15102) {
      throw new Error(`Expected reconciled salary 15,102, got ${calcFull.finalSalary}`);
    }
    if (Math.abs(recoveredHourAmount - 60.48) > 0.05) {
      throw new Error(`Expected ~60.48 recovered hour amount, got ${recoveredHourAmount}`);
    }
    if (Math.abs(calcFull.creditedHolidayPay - 483.87) > 0.05) {
      throw new Error(`Expected ~483.87 holiday pay, got ${calcFull.creditedHolidayPay}`);
    }
  });

  // Test 13: September 2026 In-Progress Running Month Calculation (5 Days Worked = ₹2,647)
  test('September 2026 In-Progress Running Month matches exact 5 days earned ₹2,647', () => {
    const calc = SalaryEngine.calculateMonthlySalary(
      '2026-09',
      INITIAL_SALARY_CONFIG,
      INITIAL_SCHEDULE,
      INITIAL_ATTENDANCE_DAYS,
      INITIAL_HOLIDAYS,
      INITIAL_SALARY_CONFIG.deductions,
      true,
      { todayDate: '2026-09-05', liveActiveSeconds: 30060, liveBreakSeconds: 4740, liveOtSeconds: 1260, liveEarned: 550 }
    );

    console.log('September Running Month Result:');
    console.log('  Working Days Elapsed:', calc.scheduledWorkingDays, '(Expected: 5)');
    console.log('  Base Salary for 5 Days:', calc.baseSalary, '(Expected: 2500)');
    console.log('  Overtime Pay:', calc.overtimePay, '(Expected: 147)');
    console.log('  Shortfall Deduction:', calc.shortfallDeduction, '(Expected: 0)');
    console.log('  Final Salary Earned:', calc.finalSalary, '(Expected: 2647)');
    console.log('  Is Running Month:', calc.isRunningMonth, '(Expected: true)');

    if (calc.scheduledWorkingDays !== 5) {
      throw new Error(`Expected 5 scheduled working days, got ${calc.scheduledWorkingDays}`);
    }
    if (calc.baseSalary !== 2500) {
      throw new Error(`Expected ₹2,500 base salary, got ${calc.baseSalary}`);
    }
    if (calc.shortfallDeduction !== 0) {
      throw new Error(`Expected ₹0 shortfall deduction, got ${calc.shortfallDeduction}`);
    }
    if (calc.overtimePay !== 147) {
      throw new Error(`Expected ₹147 overtime pay, got ${calc.overtimePay}`);
    }
    if (calc.finalSalary !== 2647) {
      throw new Error(`Expected final salary 2,647, got ${calc.finalSalary}`);
    }
  });
});

// Run all test functions
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASSED: ${name}`);
  } catch (err: any) {
    console.error(`❌ FAILED: ${name}`, err.message);
    process.exit(1);
  }
}

function describe(suite: string, fn: () => void) {
  console.log(`\n=== SUITE: ${suite} ===`);
  fn();
}
