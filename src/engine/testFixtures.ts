// ============================================================================
// SALARYPULSE — TEST FIXTURE SYSTEM
// Deterministic, Reusable, Strongly-Typed Test Fixtures
// ============================================================================

import { 
  User, 
  SalaryConfig, 
  WorkSchedule, 
  Holiday, 
  AttendanceDay, 
  ProjectionScenario, 
  OfficialPayrollSlip, 
  ActualBankReceipt, 
  SalaryReconciliationRecord, 
  AuditLog
} from '../types';

export const IS_TEST_FIXTURE_FLAG = true;

// ----------------------------------------------------------------------------
// 1. BASELINE TEST USER
// ----------------------------------------------------------------------------
export const TEST_USER: User = {
  id: 'test-user-e2e-001',
  name: 'Alex Mercer (TEST)',
  email: 'alex.test@salarypulse.internal',
  role: 'Senior Systems Engineer',
  employeeId: 'EMP-TEST-2026',
  designation: 'Senior Systems Engineer (TEST)',
  department: 'Core Platform (TEST)',
  joiningDate: '2025-01-01',
};

// ----------------------------------------------------------------------------
// 2. BASELINE TEST WORK SCHEDULE
// Mon–Sat: 09:00–18:00 (9h span), 8h active required, 60m unpaid lunch break, Sunday off
// ----------------------------------------------------------------------------
export const TEST_SCHEDULE_BASELINE: WorkSchedule = {
  id: 'test-sched-baseline',
  name: 'Standard General Shift (TEST)',
  workingDays: [1, 2, 3, 4, 5, 6], // Mon(1) to Sat(6)
  officeStartTime: '09:00',
  officeEndTime: '18:00',
  requiredActiveHoursPerDay: 8.0, // 28,800 seconds
  breakRules: [
    {
      id: 'test-brk-lunch-60',
      name: 'Lunch Break (TEST)',
      durationMinutes: 60,
      isPaid: false,
      isEnabled: true,
      type: 'lunch'
    }
  ],
  defaultLunchDurationMinutes: 60,
  defaultTeaBreakDurationMinutes: 15,
};

// ----------------------------------------------------------------------------
// 3. BASELINE SALARY CONFIGURATION
// Monthly Base Salary: ₹15,000, INR, Monthly Scheduled Hours, Monthly Threshold OT (2.0x), Bonus ₹3,000 for 26 days
// ----------------------------------------------------------------------------
export const TEST_SALARY_CONFIG_BASELINE: SalaryConfig = {
  id: 'test-cfg-baseline',
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
  autoApproveBonusOnEligible: false,
  deductions: [],
  effectiveFrom: '2026-01-01',
};

// ----------------------------------------------------------------------------
// 4. BASELINE HOLIDAYS (AUGUST 2026)
// Independence Day: 15 August 2026 (Paid Holiday)
// ----------------------------------------------------------------------------
export const TEST_HOLIDAYS_BASELINE: Holiday[] = [
  {
    id: 'test-hol-2026-08-15',
    date: '2026-08-15',
    name: 'Independence Day (TEST)',
    type: 'paid',
    creditedHours: 8.0,
  }
];

// ----------------------------------------------------------------------------
// 5. TEST ATTENDANCE DAY: STANDARD FULL DAY
// 09:05 - 13:55 (4h 50m = 17,400s) + 15:05 - 18:15 (3h 10m = 11,400s) = 28,800s (8.0h)
// Break: 13:55 - 15:05 (70m = 4,200s, 10m overrun)
// ----------------------------------------------------------------------------
export const TEST_DAY_STANDARD_FULL: AttendanceDay = {
  id: 'test-att-2026-08-03',
  date: '2026-08-03',
  status: 'PRESENT',
  workdayStatus: 'COMPLETED',
  totalActiveSeconds: 28800,
  creditedNormalSeconds: 0,
  totalBreakSeconds: 4200,
  overtimeSeconds: 0,
  firstPunchIn: '2026-08-03T09:05:00.000Z',
  lastPunchOut: '2026-08-03T18:15:00.000Z',
  workSessions: [
    {
      id: 'test-ws-03-1',
      startTime: '2026-08-03T09:05:00.000Z',
      endTime: '2026-08-03T13:55:00.000Z',
      durationSeconds: 17400,
      status: 'COMPLETED',
      source: 'DEVICE',
      createdAt: '2026-08-03T09:05:00.000Z',
      updatedAt: '2026-08-03T13:55:00.000Z',
    },
    {
      id: 'test-ws-03-2',
      startTime: '2026-08-03T15:05:00.000Z',
      endTime: '2026-08-03T18:15:00.000Z',
      durationSeconds: 11400,
      status: 'COMPLETED',
      source: 'DEVICE',
      createdAt: '2026-08-03T15:05:00.000Z',
      updatedAt: '2026-08-03T18:15:00.000Z',
    }
  ],
  breakSessions: [
    {
      id: 'test-brk-03-1',
      type: 'lunch',
      startTime: '2026-08-03T13:55:00.000Z',
      endTime: '2026-08-03T15:05:00.000Z',
      durationSeconds: 4200,
      isPaid: false,
    }
  ]
};

// ----------------------------------------------------------------------------
// 6. TEST ATTENDANCE DAY: MULTI-BREAK DAY (4 WORK SESSIONS, 3 BREAKS)
// ----------------------------------------------------------------------------
export const TEST_DAY_MULTI_BREAK: AttendanceDay = {
  id: 'test-att-2026-08-04',
  date: '2026-08-04',
  status: 'PRESENT',
  workdayStatus: 'COMPLETED',
  totalActiveSeconds: 28800,
  creditedNormalSeconds: 0,
  totalBreakSeconds: 5400,
  overtimeSeconds: 0,
  firstPunchIn: '2026-08-04T09:00:00.000Z',
  lastPunchOut: '2026-08-04T18:30:00.000Z',
  workSessions: [
    { id: 'test-ws-04-1', startTime: '2026-08-04T09:00:00.000Z', endTime: '2026-08-04T11:00:00.000Z', durationSeconds: 7200, status: 'COMPLETED', source: 'DEVICE' },
    { id: 'test-ws-04-2', startTime: '2026-08-04T11:15:00.000Z', endTime: '2026-08-04T13:30:00.000Z', durationSeconds: 8100, status: 'COMPLETED', source: 'DEVICE' },
    { id: 'test-ws-04-3', startTime: '2026-08-04T14:30:00.000Z', endTime: '2026-08-04T16:45:00.000Z', durationSeconds: 8100, status: 'COMPLETED', source: 'DEVICE' },
    { id: 'test-ws-04-4', startTime: '2026-08-04T17:00:00.000Z', endTime: '2026-08-04T18:30:00.000Z', durationSeconds: 5400, status: 'COMPLETED', source: 'DEVICE' },
  ],
  breakSessions: [
    { id: 'test-brk-04-1', type: 'tea', startTime: '2026-08-04T11:00:00.000Z', endTime: '2026-08-04T11:15:00.000Z', durationSeconds: 900, isPaid: false },
    { id: 'test-brk-04-2', type: 'lunch', startTime: '2026-08-04T13:30:00.000Z', endTime: '2026-08-04T14:30:00.000Z', durationSeconds: 3600, isPaid: false },
    { id: 'test-brk-04-3', type: 'tea', startTime: '2026-08-04T16:45:00.000Z', endTime: '2026-08-04T17:00:00.000Z', durationSeconds: 900, isPaid: false },
  ]
};

// ----------------------------------------------------------------------------
// 7. TEST ATTENDANCE DAY: ABSENT DAY
// ----------------------------------------------------------------------------
export const TEST_DAY_ABSENT: AttendanceDay = {
  id: 'test-att-2026-08-05',
  date: '2026-08-05',
  status: 'ABSENT',
  workdayStatus: 'NOT_STARTED',
  totalActiveSeconds: 0,
  creditedNormalSeconds: 0,
  totalBreakSeconds: 0,
  overtimeSeconds: 0,
  workSessions: [],
  breakSessions: []
};

// ----------------------------------------------------------------------------
// 8. TEST ATTENDANCE DAY: OVERTIME DAY (10h active work = 36,000s)
// ----------------------------------------------------------------------------
export const TEST_DAY_OVERTIME: AttendanceDay = {
  id: 'test-att-2026-08-06',
  date: '2026-08-06',
  status: 'PRESENT',
  workdayStatus: 'COMPLETED',
  totalActiveSeconds: 36000, // 10h (8h normal + 2h OT)
  creditedNormalSeconds: 0,
  totalBreakSeconds: 3600,
  overtimeSeconds: 7200, // 2.0h OT
  firstPunchIn: '2026-08-06T09:00:00.000Z',
  lastPunchOut: '2026-08-06T20:00:00.000Z',
  workSessions: [
    {
      id: 'test-ws-06-1',
      startTime: '2026-08-06T09:00:00.000Z',
      endTime: '2026-08-06T14:00:00.000Z',
      durationSeconds: 18000,
      status: 'COMPLETED',
      source: 'DEVICE',
    },
    {
      id: 'test-ws-06-2',
      startTime: '2026-08-06T15:00:00.000Z',
      endTime: '2026-08-06T20:00:00.000Z',
      durationSeconds: 18000,
      status: 'COMPLETED',
      source: 'DEVICE',
    }
  ],
  breakSessions: [
    {
      id: 'test-brk-06-1',
      type: 'lunch',
      startTime: '2026-08-06T14:00:00.000Z',
      endTime: '2026-08-06T15:00:00.000Z',
      durationSeconds: 3600,
      isPaid: false,
    }
  ]
};

// ----------------------------------------------------------------------------
// 9. TEST ATTENDANCE DAY: SUNDAY WORK (WEEKLY OFF WORKED, 6h = 21,600s)
// ----------------------------------------------------------------------------
export const TEST_DAY_SUNDAY_WORKED: AttendanceDay = {
  id: 'test-att-2026-08-09',
  date: '2026-08-09', // Sunday
  status: 'PRESENT',
  workdayStatus: 'WEEKLY_OFF_WORKED',
  totalActiveSeconds: 21600, // 6h active work on Sunday
  creditedNormalSeconds: 0,
  totalBreakSeconds: 0,
  overtimeSeconds: 0,
  workSessions: [
    {
      id: 'test-ws-09-1',
      startTime: '2026-08-09T10:00:00.000Z',
      endTime: '2026-08-09T16:00:00.000Z',
      durationSeconds: 21600,
      status: 'COMPLETED',
      source: 'DEVICE',
    }
  ],
  breakSessions: []
};

// ----------------------------------------------------------------------------
// 10. TEST PROJECTION SCENARIO (ISOLATION FIXTURE)
// ----------------------------------------------------------------------------
export const TEST_PROJECTION_SCENARIO: ProjectionScenario = {
  id: 'test-scen-baseline',
  name: 'Standard Target Baseline (TEST)',
  targetMonth: '2026-08',
  assumptionType: 'EXPECTED',
  futureDays: [],
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

// ----------------------------------------------------------------------------
// 11. TEST RECONCILIATION DATASET: MOCK OFFICIAL ATTENDANCE & PAYROLL SLIP
// ----------------------------------------------------------------------------
export const TEST_OFFICIAL_PAYROLL_SLIP: OfficialPayrollSlip = {
  isProvided: true,
  basePay: 15000,
  overtimePay: 0,
  attendanceBonus: 0,
  performanceBonus: 0,
  specialAllowance: 0,
  otherEarnings: 0,
  grossPay: 15000,
  deductions: {
    pf: 0,
    pt: 0,
    tds: 0,
    esi: 0,
    lop: 2800.48,
    other: 0,
  },
  totalDeductions: 2800.48,
  netSalary: 12199.52,
  disbursalDate: '2026-08-05',
  remarks: 'Official payroll slip with salary cut (TEST)',
};

export const TEST_BANK_RECEIPT: ActualBankReceipt = {
  isProvided: true,
  amountReceived: 12073.00,
  depositDate: '2026-08-07',
  bankName: 'HDFC Bank (TEST)',
  accountLast4: '4321',
  transactionRef: 'TXN-TEST-99881234',
  depositStatus: 'RECEIVED',
  notes: 'Direct Salary Credit NEFT (TEST)',
};

export const TEST_SALARY_RECONCILIATION_RECORD: SalaryReconciliationRecord = {
  id: 'test-recon-2026-07',
  month: '2026-07',
  status: 'DISCREPANCY_EXPLAINED',
  isLocked: false,
  lastUpdated: '2026-08-10T10:00:00.000Z',
  pulseData: {
    grossSalary: 15000,
    basePay: 15000,
    overtimePay: 0,
    attendanceBonus: 0,
    performanceBonus: 0,
    specialAllowance: 0,
    totalDeductions: 2800.48,
    itemizedDeductions: [],
    netPay: 12199.52,
    scheduledWorkingDays: 26,
    presentDays: 21,
    otHours: 0,
    perDayRate: 576.92,
    perHourRate: 72.115,
    calculationBasis: 'monthly_scheduled_hours'
  },
  officialSlip: TEST_OFFICIAL_PAYROLL_SLIP,
  bankReceipt: TEST_BANK_RECEIPT,
  itemizedDiscrepancies: [
    {
      id: 'test-disc-1',
      category: 'BANK_TRANSFER',
      title: 'Net Bank Discrepancy',
      description: '₹126.52 bank transaction fee or unexplained deduction',
      pulseAmount: 12199.52,
      officialAmount: 12073.00,
      variance: -126.52,
      severity: 'WARNING',
      driver: '₹126.52 bank transaction fee or unexplained deduction',
      impactNote: 'Bank receipt lower than official net salary',
      userResolution: 'PENDING_CLARIFICATION',
    }
  ],
  forensicSummary: {
    headline: 'Net Variance ₹126.52',
    netVariance: 0,
    bankVariance: -126.52,
    totalDiscrepanciesCount: 1,
    criticalCount: 0,
    warningCount: 1,
    explanationSteps: ['Bank received ₹12,073 vs official ₹12,199.52'],
    keyFinancialDrivers: [{ label: 'Bank Variance', amount: 126.52, direction: 'NEGATIVE' }],
    actionRecommendations: ['Clarify bank processing charge with payroll'],
    suggestedHRDisputeTemplate: 'Kindly provide itemized bank transfer details for July 2026.'
  },
  auditNotes: 'Initial July 2026 Test Reconciliation',
};

export const TEST_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'test-audit-001',
    entityId: 'test-att-2026-08-03',
    entityType: 'attendance',
    action: 'CREATE',
    timestamp: '2026-08-03T18:15:00.000Z',
    reason: 'Initial day completion audit (TEST)',
    newValue: JSON.stringify({ status: 'PRESENT', totalActiveSeconds: 28800 }),
  }
];
