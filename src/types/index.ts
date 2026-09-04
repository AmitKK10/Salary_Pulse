// ============================================================================
// SALARYPULSE — COMPREHENSIVE DATA MODELS & TYPE DEFINITIONS
// ============================================================================

export type NavigationTab = 
  | 'dashboard' 
  | 'live-work' 
  | 'calendar' 
  | 'salary' 
  | 'simulator' 
  | 'analytics' 
  | 'attendance' 
  | 'reconciliation'
  | 'salary-reconciliation'
  | 'widget'
  | 'settings';

export * from './reconciliation';
export * from './salaryReconciliation';
export * from './analytics';
export * from './dataManagement';
export * from './pwa';

import { NotificationSettings } from './pwa';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export type SalaryCalculationBasis = 
  | 'calendar_days_30' 
  | 'monthly_scheduled_hours' 
  | 'actual_hours'
  | 'calendar_days_full_ot'
  | 'fixed_monthly' 
  | 'daily_rate' 
  | 'hourly_rate' 
  | 'custom';

export type OvertimeMethod = 
  | 'monthly_threshold' 
  | 'daily_threshold' 
  | 'custom_rule';

export type WeeklyOffWorkRule = 
  | 'add_to_monthly_threshold' 
  | 'always_overtime' 
  | 'ignore' 
  | 'custom';

export type HolidayWorkRule = 
  | 'holiday_credit_plus_monthly_threshold' 
  | 'always_overtime' 
  | 'custom_multiplier' 
  | 'custom';

export type BonusStatus = 
  | 'NOT_ELIGIBLE' 
  | 'ELIGIBLE' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PAID';

export type SessionSource = 'LIVE' | 'MANUAL' | 'IMPORTED' | 'OFFICIAL' | 'CORRECTED' | 'DEVICE' | 'SYSTEM';

export interface DailyWorkProgress {
  date: string;
  requiredSeconds: number;
  completedSeconds: number;
  remainingSeconds: number;
  overtimeSeconds: number;
  progressPercentage: number;
  remainingPercentage: number;
  isCompleted: boolean;
  formattedRequired: string;
  formattedCompleted: string;
  formattedRemaining: string;
  formattedOvertime: string;
}

export interface WeeklyWorkProgress {
  weekLabel: string;
  startDate: string;
  endDate: string;
  requiredSeconds: number;
  completedSeconds: number;
  remainingSeconds: number;
  overtimeSeconds: number;
  progressPercentage: number;
  formattedRequired: string;
  formattedCompleted: string;
  formattedRemaining: string;
  formattedOvertime: string;
}

export interface MonthlyWorkProgress {
  yearMonth: string;
  targetNormalSeconds: number;
  completedEligibleSeconds: number;
  remainingNormalSeconds: number;
  overtimeSeconds: number;
  progressPercentage: number;
  isThresholdReached: boolean;
  formattedTarget: string;
  formattedCompleted: string;
  formattedRemaining: string;
  formattedOvertime: string;
}

export type WorkdayStatus =
  | 'NOT_STARTED'
  | 'WORKING'
  | 'ON_BREAK'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'PRESENT'
  | 'ABSENT'
  | 'PAID_HOLIDAY'
  | 'UNPAID_HOLIDAY'
  | 'WEEKLY_OFF'
  | 'WEEKLY_OFF_WORKED'
  | 'PAID_LEAVE'
  | 'UNPAID_LEAVE'
  | 'FUTURE'
  | 'NEEDS_REVIEW';


export interface SalaryGapItem {
  reason: string;
  durationSeconds: number;
  estimatedImpact: number;
}

export interface DayCalculationDetails {
  date: string;
  dayNumber: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  dayName: string;
  status: WorkdayStatus;
  statusLabel: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isWeeklyOff: boolean;
  isHoliday: boolean;
  isHolidayWorked?: boolean;
  holidayInfo?: Holiday;
  requiredNormalSeconds: number;
  actualActiveSeconds: number;
  creditedNormalSeconds: number;
  totalBreakSeconds: number;
  normalSecondsWorked: number;
  overtimeSeconds: number;
  remainingSeconds: number;
  deficitSeconds: number;
  
  // Earnings
  baseSalaryEarned: number;
  overtimeEarned: number;
  holidayCreditEarned: number;
  totalDailyEarned: number;
  projectedDailyEarned: number;
  expectedNormalDaySalary: number;
  salaryGap: number;
  salaryGapReasons: SalaryGapItem[];
  
  // Quality & Review
  isSuspicious: boolean;
  suspiciousReasons: string[];
  
  // Punches
  firstPunchIn?: string;
  lastPunchOut?: string;
  finishedAt?: string; // ISO timestamp captured when 'End Work' is explicitly triggered
  isWorkdayConcluded?: boolean;
  workSessions: WorkSession[];
  breakSessions: BreakSession[];
  notes?: string;
  source: SessionSource;

  // Shift Punctuality & 8-Hour Target Analysis
  entryPunctuality?: 'ON_TIME' | 'LATE_ENTRY' | 'EARLY_ENTRY' | 'NONE';
  entryDiffMinutes?: number;
  entryLabel?: string;
  exitPunctuality?: 'ON_TIME' | 'EARLY_GOING' | 'LATE_LEAVING' | 'NONE';
  exitDiffMinutes?: number;
  exitLabel?: string;
  lunchOverrunMinutes?: number;
  lunchOverrunLabel?: string;
  isShortWorkDay?: boolean;
  shortWorkDeficitSeconds?: number;
}

export type { ClockInAnalysisReport, ClockInLogItem } from '../engine/attendanceEngine';

export interface MonthlyRunningBreakdown {
  yearMonth: string;
  scheduledWorkDaysCount: number;
  presentDaysCount: number;
  partialDaysCount: number;
  absentDaysCount: number;
  paidHolidaysCount: number;
  weeklyOffsCount: number;
  paidLeaveCount: number;
  unpaidLeaveCount: number;
  workedOnWeeklyOffCount: number;
  workedOnHolidayCount: number;
  needsReviewCount: number;
  
  // Time metrics
  actualWorkSeconds: number;
  requiredNormalSeconds: number;
  remainingNormalSeconds: number;
  overtimeSeconds: number;
  isThresholdReached: boolean;
  normalHoursPercentage: number;
  
  // Financial metrics (Strict Actual vs Projected separation)
  actualEarnedSoFar: number;
  liveEarnedToday: number;
  currentConfirmedTotal: number;
  otEarnedSoFar: number;
  holidayCreditsTotal: number;
  approvedBonusAmount: number;
  potentialBonusAmount: number;
  deductionsTotal: number;
  projectedFutureEarnings: number;
  projectedFutureOT: number;
  projectedMonthEndTotal: number;
}

export type AttendanceStatus = 
  | 'PRESENT' 
  | 'PARTIAL' 
  | 'ABSENT' 
  | 'PAID_HOLIDAY' 
  | 'UNPAID_HOLIDAY' 
  | 'WEEKLY_OFF' 
  | 'PAID_LEAVE' 
  | 'UNPAID_LEAVE' 
  | 'FUTURE' 
  | 'UNKNOWN'
  | 'NEEDS_REVIEW'
  // Legacy aliases for backward compatibility:
  | 'present' 
  | 'half_day' 
  | 'absent' 
  | 'leave' 
  | 'holiday' 
  | 'weekly_off';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joiningDate: string;
  avatarUrl?: string;
  employeeId?: string;
  designation?: string;
}

export interface BreakRule {
  id: string;
  name: string;
  durationMinutes: number;
  isPaid: boolean;
  isEnabled: boolean;
  type: 'lunch' | 'tea' | 'personal' | 'custom';
}

export interface WorkSchedule {
  id: string;
  name: string;
  workingDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat. Default: [1,2,3,4,5,6]
  officeStartTime: string; // e.g. "09:00"
  officeEndTime: string;   // e.g. "18:00"
  requiredActiveHoursPerDay: number; // e.g. 8.0
  breakRules: BreakRule[];
  defaultLunchDurationMinutes: number; // e.g. 60
  defaultTeaBreakDurationMinutes: number; // e.g. 15
}

export interface DeductionRule {
  id: string;
  name: string;
  type: 'fixed' | 'percentage' | 'manual';
  category: 'PF' | 'ESI' | 'Tax' | 'Advance' | 'Penalty' | 'Other';
  value: number; // Fixed amount in currency or percentage (0-100)
  isEnabled: boolean;
  description?: string;
}

export interface SalaryConfig {
  id: string;
  schemaVersion: number;
  monthlyBaseSalary: number; // default 15000
  currency: CurrencyCode; // default 'INR'
  calculationBasis: SalaryCalculationBasis; // default 'monthly_scheduled_hours'
  
  // Overtime configurations
  overtimeMethod: OvertimeMethod; // default 'daily_threshold'
  overtimeMultiplier: number; // default 1.0
  customOtHourlyRate?: number;
  overtimeThresholdMinutes?: number; // Minimum daily OT required to qualify (e.g. 0 = all minutes, 60 = >=1h OT like June 9 yielding ₹73)
  weeklyOffWorkRule: WeeklyOffWorkRule; // default 'add_to_monthly_threshold'
  holidayWorkRule: HolidayWorkRule; // default 'holiday_credit_plus_monthly_threshold'

  // Holiday rule configs
  defaultPaidHolidayCreditedHours: number; // default 8.0
  holidayPayType?: 'daily_rate' | 'fixed_amount'; // default 'daily_rate'
  defaultHolidayAmount?: number; // e.g. 500

  // Attendance bonus configurations
  attendanceBonusEnabled: boolean; // default true
  attendanceBonusAmount: number; // default 3000
  attendanceBonusEligibleDays: number; // default 26
  bonusRequiresApproval: boolean; // default true
  autoApproveBonusOnEligible?: boolean; // default false

  // Deductions list (defaults to empty)
  deductions: DeductionRule[];

  // Effective date management
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string;   // YYYY-MM-DD (optional, ongoing if undefined)
}

export interface BreakSession {
  id: string;
  breakRuleId?: string;
  type: 'lunch' | 'tea' | 'personal' | 'custom' | string;
  startTime: string; // ISO
  endTime?: string;  // ISO (undefined if ongoing)
  durationSeconds: number;
  isPaid: boolean;
  source?: SessionSource;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkSession {
  id: string;
  attendanceDayId?: string;
  startTime: string; // ISO (with exact seconds, e.g. 2026-08-15T09:05:37)
  endTime?: string;  // ISO (undefined if ongoing)
  durationSeconds: number; // Active working duration (excluding unpaid breaks)
  status?: 'OPEN' | 'COMPLETED' | 'CORRECTED';
  source?: SessionSource;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceDay {
  id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  workdayStatus?: WorkdayStatus;
  
  // High-precision seconds tracking
  totalActiveSeconds: number;     // Physical active work (excluding unpaid breaks)
  creditedNormalSeconds: number;  // Paid holiday or paid leave credited normal time
  totalBreakSeconds: number;      // Total time spent on breaks
  overtimeSeconds: number;        // Overtime accrued for this day (if daily threshold mode or Sunday work)
  
  firstPunchIn?: string;          // ISO
  lastPunchOut?: string;          // ISO
  finishedAt?: string;            // ISO timestamp captured when 'End Work' is explicitly triggered
  
  workSessions: WorkSession[];
  breakSessions: BreakSession[];
  
  source?: SessionSource;
  notes?: string;
  isLocked?: boolean;
  isLateEntry?: boolean;
  isEarlyExit?: boolean;
  overrideHoliday?: boolean;
  customHolidayAmount?: number; // e.g. ₹500
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO
  entityType: 'attendance' | 'work_session' | 'break_session' | 'salary_config' | 'reconciliation' | 'salary_reconciliation' | 'backup' | 'system' | 'calculation_engine' | 'integrity_engine' | 'export' | string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CORRECTION' | 'PUNCH_IN' | 'PUNCH_OUT' | 'START_BREAK' | 'END_BREAK' | 'END_DAY' | 'LOCK' | 'UNLOCK' | 'BACKUP_CREATED' | 'BACKUP_RESTORED' | 'BACKUP_MERGED' | 'DATA_RESET' | 'DATA_REBUILD' | 'INTEGRITY_CHECK' | 'EXPORT_CREATED' | string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  userId?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'paid' | 'unpaid' | 'optional';
  creditedHours: number; // default 8.0
  customAmount?: number; // e.g. 500
}

export interface RateDerivation {
  yearMonth: string;
  scheduledWorkingDays: number;
  requiredDailyHours: number;
  totalRequiredMonthlyHours: number;
  totalRequiredMonthlySeconds: number;
  
  monthlyBaseSalary: number;
  perDayRate: number;
  perHourRate: number;
  perMinuteRate: number;
  perSecondRate: number;
  
  overtimeMultiplier: number;
  overtimeHourlyRate: number;
  overtimeSecondRate: number;
}

export interface SalaryCalculation {
  yearMonth: string;
  monthKey?: string; // alias
  
  // Rate matrix
  rates: RateDerivation;
  perDayRate: number;
  perHourRate: number;
  perMinuteRate: number;
  perSecondRate: number;
  overtimeHourlyRate: number;
  
  // Scheduled & Active Metrics
  scheduledWorkingDays: number;
  totalRequiredHours: number;
  totalRequiredSeconds: number;
  
  actualPresentDays: number;
  halfDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  weeklyOffDays: number;
  holidaysCount: number;
  
  // Work time metrics (in seconds)
  totalActiveSecondsWorked: number;
  totalActiveHoursWorked: number;
  creditedNormalSeconds: number;
  totalBreakSeconds: number;
  
  // Overtime metrics
  overtimeSeconds: number;
  overtimePay: number;
  
  // Wage components
  grossEarnedBasePay: number;
  creditedHolidayPay: number;
  
  // Bonus details
  attendanceBonusEligible: boolean;
  attendanceBonusStatus: BonusStatus;
  attendanceBonusAmount: number;
  attendanceBonusApproved: boolean;
  potentialBonusAmount: number;
  
  // Deductions
  totalDeductions: number;
  itemizedDeductions: { id: string; name: string; amount: number }[];
  
  // Final wage totals
  grossPay: number;
  netSalary: number;
  
  // Real-time live accrued metrics
  realtimeEarnedSoFar: number;
}

export interface SalaryPrediction {
  yearMonth: string;
  monthKey?: string;
  currentDayOfMonth?: number;
  totalDaysInMonth?: number;
  remainingWorkingDays?: number;
  projectedPresentDays: number;
  projectedTotalHours?: number;
  projectedRegularPay: number;
  projectedOvertimeHours: number;
  projectedOvertimePay: number;
  projectedAttendanceBonus: number;
  projectedGrossPay?: number;
  projectedGrossSalary?: number;
  projectedNetSalary: number;
  pacingPercentage?: number;
  pacingStatus?: 'ahead' | 'on_track' | 'behind' | 'at_risk';
  confidenceScore: number;
  insights?: string[];
}

export interface AppSettings {
  schemaVersion: number;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoSaveIntervalSeconds: number;
  lastBackupDate?: string;
  notificationSettings?: NotificationSettings;
}

// ============================================================================
// STEP 5: RUNNING-MONTH SALARY PREDICTION & SCENARIO TYPES
// ============================================================================

export type AssumptionType = 'EXPECTED' | 'BEST_CASE' | 'WORST_CASE' | 'CUSTOM';

export type ProjectionConfidenceLabel = 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'LOW CONFIDENCE';

export interface ProjectionDay {
  date: string; // YYYY-MM-DD
  status: WorkdayStatus | AttendanceStatus;
  plannedWorkSeconds: number;
  plannedBreakSeconds: number;
  plannedOvertimeSeconds?: number;
  plannedStart?: string;
  plannedEnd?: string;
  holidayId?: string;
  notes?: string;
  isUserModified?: boolean;
}

export interface ProjectionScenario {
  id: string;
  name: string;
  targetMonth: string; // YYYY-MM
  assumptionType: AssumptionType;
  futureDays: ProjectionDay[];
  targetIncome?: number;
  customOtHourlyRate?: number;
  customBonusEligibility?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyProjectionResult {
  yearMonth: string;
  scenarioId?: string;
  scenarioName?: string;
  assumptionType: AssumptionType;
  confidenceLabel: ProjectionConfidenceLabel;
  confidenceReason: string;

  // Day counts
  scheduledWorkingDays: number;
  actualWorkingDays: number;
  futureWorkingDays: number;
  futureLeaveDays: number;
  futureHolidayDays: number;

  // Seconds & Hours
  actualWorkSeconds: number;
  projectedWorkSeconds: number;
  totalMonthWorkSeconds: number;
  
  actualNormalSeconds: number;
  projectedNormalSeconds: number;
  totalMonthNormalSeconds: number;
  requiredMonthlyNormalSeconds: number;

  actualOTSeconds: number;
  projectedOTSeconds: number;
  totalMonthOTSeconds: number;

  // Financials (Strict separation of ACTUAL, LIVE, PROJECTED, POTENTIAL, CONFIRMED)
  actualEarnings: number; // base + confirmed ot + confirmed holidays up to today/past
  actualNormalEarnings: number;
  actualOTEarnings: number;
  actualHolidayCreditEarnings: number;
  liveTodayEarnings: number;

  projectedFutureEarnings: number; // future normal + future holiday credits + future OT
  projectedFutureNormalEarnings: number;
  projectedFutureOTEarnings: number;
  projectedFutureHolidayCredit: number;

  potentialBonus: number;
  projectedBonus: number;
  bonusStatus: 'LIKELY ELIGIBLE' | 'AT RISK' | 'NOT ELIGIBLE';
  bonusRequiresApproval: boolean;
  bonusApprovalState?: boolean;
  qualifyingAttendanceDays: number;
  bonusTargetDays: number;

  deductions: number;
  itemizedDeductions: { id: string; name: string; amount: number }[];

  projectedMonthEndTotal: number;
  projectedMonthEndWithBonus: number;

  // Salary Gap Analysis
  expectedMonthEndTarget: number;
  projectedSalaryGap: number;
  salaryGapBreakdown: {
    leaveImpact: number;
    partialDayImpact: number;
    otDifference: number;
    bonusDifference: number;
  };

  // Overtime pacing / threshold breakdown
  otMode: OvertimeMethod;
  monthlyNormalTargetSeconds: number;
  actualEligibleSeconds: number;
  remainingNormalTargetSeconds: number;
  projectedFutureEligibleSeconds: number;
  otThresholdCrossed: boolean;

  // Day by day timeline details
  days: DayCalculationDetails[];

  // Explanations for "How this was calculated"
  calculationSteps: {
    label: string;
    amount: number;
    type: 'ACTUAL' | 'LIVE' | 'PROJECTED' | 'POTENTIAL' | 'DEDUCTION';
    description: string;
  }[];
}

export interface ScenarioComparisonItem {
  scenarioId: string;
  scenarioName: string;
  assumptionType: AssumptionType;
  projectedTotal: number;
  projectedTotalWithBonus: number;
  projectedOT: number; // in hours
  projectedOTPay: number;
  projectedHours: number; // in hours
  projectedAttendance: number; // in days
  bonusStatus: string;
  salaryGap: number;
}
