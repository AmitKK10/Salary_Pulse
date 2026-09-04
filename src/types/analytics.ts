// ============================================================================
// SALARYPULSE — ADVANCED ANALYTICS & SALARY INTELLIGENCE TYPES
// Structured models for multi-period metrics, trends, OT efficiency,
// attendance dynamics, reconciliation statistics, and historical records
// ============================================================================

import { WorkdayStatus } from './index';

export type AnalyticsTimeframe = 
  | 'today' 
  | 'this_week' 
  | 'this_month' 
  | 'this_year' 
  | 'financial_year' 
  | 'lifetime' 
  | 'custom_range';

export type AnalyticsSectionTab = 
  | 'overview' 
  | 'salary' 
  | 'work_hours' 
  | 'overtime' 
  | 'attendance' 
  | 'bonus' 
  | 'reconciliation' 
  | 'history';

export type AnalyticsTabSection = AnalyticsSectionTab;

export type PaceStatus = 'AHEAD' | 'ON_TRACK' | 'BEHIND';

export interface BaseSalaryHistoryItem {
  id: string;
  effectiveFrom: string; // YYYY-MM-DD
  monthlyBaseSalary: number;
  reason?: string;
  isCurrent?: boolean;
}

export interface PeriodCoreKPIs {
  timeframe: AnalyticsTimeframe;
  startDate: string;
  endDate: string;
  
  // Financials (Actual vs Accrued vs Received)
  totalSalaryEarned: number; // SalaryPulse calculated gross earned
  totalActualSalaryReceived: number; // Confirmed bank/official paid receipts
  totalNormalEarnings: number;
  totalOTEarnings: number;
  totalBonuses: number;
  totalDeductions: number;
  netEarnedSalary: number;
  
  // Separate Future/Potential (Do NOT blend into actuals)
  projectedFutureEarnings: number;
  potentialBonusAmount: number;

  // Work & Time
  totalWorkingSeconds: number;
  totalWorkingHours: number;
  totalActiveSeconds: number;
  totalBreakSeconds: number;
  totalOfficeSpanSeconds: number;
  totalOTSeconds: number;
  totalOTHours: number;

  // Attendance tallies
  scheduledWorkingDaysCount: number;
  totalAttendanceDays: number;
  totalPresentDays: number;
  totalPartialDays: number;
  totalAbsentDays: number;
  totalPaidLeaveDays: number;
  totalUnpaidLeaveDays: number;
  totalPaidHolidaysCount: number;
  totalWeeklyOffDays: number;
  totalWeeklyOffWorkedDays: number;
  totalHolidaysWorkedCount: number;

  // Averages & Extremes
  averageWorkHoursPerScheduledDay: number;
  averageBreakDurationMinutes: number;
  longestWorkDaySeconds: number;
  longestWorkDayDate: string;
  shortestWorkDaySeconds: number;
  shortestWorkDayDate: string;
}

export interface MonthlySalaryGrowthPoint {
  month: string; // YYYY-MM
  monthLabel: string;
  calculatedNet: number;
  officialNet: number | null;
  actualReceived: number | null;
  basePay: number;
  normalEarnings: number;
  otEarnings: number;
  bonus: number;
  deductions: number;
  hasReconciliationDiff: boolean;
  reconciliationVariance: number;
  isCompleted: boolean;
  isCurrentMonth: boolean;
  status: string;
  disputeNotes?: string;
}

export interface SalaryTrendMetric {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentAmount: number;
  previousAmount: number;
  changeAmount: number;
  changePercentage: number;
  yoyChangeAmount: number | null;
  yoyChangePercentage: number | null;
  averageMonthlyActualReceived: number;
  highestEarningMonth: { month: string; amount: number };
  lowestEarningMonth: { month: string; amount: number };
  narrative: string;
}

export interface DailyWorkHourPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  dayOfWeek: string;
  activeSeconds: number;
  activeHours: number;
  targetHours: number;
  breakSeconds: number;
  officeSpanSeconds: number;
  dailySurplusHours: number; // active - 8h (positive surplus)
  actualOTHours: number;     // calculated OT by authoritative engine
  status: WorkdayStatus;
  targetComparison: 'below_target' | 'target_reached' | 'above_target';
  dailyEarnings: number;
  firstPunchIn?: string;
  lastPunchOut?: string;
}

export interface MonthlyNormalHourProgress {
  month: string;
  targetHours: number;
  targetSeconds: number;
  eligibleHours: number;
  eligibleSeconds: number;
  remainingNormalHours: number;
  remainingNormalSeconds: number;
  otHours: number;
  otSeconds: number;
  isThresholdCrossed: boolean;
  progressPercentage: number;
}

export interface OvertimeAnalyticsData {
  totalOTHours: number;
  totalOTSeconds: number;
  otEarnings: number;
  averageOTPerMonth: number;
  highestOTMonth: { month: string; hours: number; earnings: number };
  highestOTDay: { date: string; hours: number; earnings: number };
  currentMonthOT: number;
  projectedOT: number;
  officialReportedOT: number | null;
  salaryPulseCalculatedOT: number;
  
  // OT Contribution / Efficiency
  earningsPerOTHour: number;
  otPercentOfTotalHours: number;
  otPercentOfTotalEarnings: number;
  otMultiplier: number;
  normalHourlyRate: number;

  // Comparison between Daily vs Monthly rule
  dailyModel: { hours: number; earnings: number };
  monthlyModel: { hours: number; earnings: number };
  officialModel: { hours: number | null; earnings: number | null };
}

export interface AttendanceAnalyticsData {
  scheduledWorkingDays: number;
  presentDays: number;
  partialDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  paidHolidays: number;
  weeklyOffDays: number;
  weeklyOffWorkedDays: number;
  holidayWorkedDays: number;
  attendanceRate: number; // percentage
  distribution: {
    name: string;
    value: number;
    color: string;
    description: string;
  }[];
}

export interface AttendanceBonusAnalyticsData {
  qualifyingAttendance: number;
  requiredAttendance: number;
  progressPercentage: number;
  potentialBonus: number;
  status: 'NOT_ELIGIBLE' | 'AT RISK' | 'ELIGIBLE' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID';
  statusNote: string;
  bonusAmountConfigured: number;
}

export interface AbsenceImpactData {
  absentDays: number;
  scheduledHoursMissed: number;
  estimatedSalaryImpact: number;
  bonusEligibilityImpact: string;
  explanation: string;
}

export interface SalaryGapHistoryItem {
  month: string;
  monthLabel: string;
  calculated: number;
  actualReceived: number | null;
  variance: number | null;
  breakdown: {
    attendance: number;
    ot: number;
    bonus: number;
    deductions: number;
    payrollAdjustments: number;
    unexplained: number;
  };
  disputeStatus?: string;
}

export interface PayrollReconciliationStats {
  monthsReconciled: number;
  monthsWithDifferences: number;
  totalCalculated: number;
  totalOfficialPayroll: number;
  totalActualReceived: number;
  totalKnownAdjustments: number;
  totalUnexplainedDifference: number;
  hasMissingPayrollMonths: boolean;
}

export interface ProjectionAccuracyItem {
  month: string;
  monthLabel: string;
  projected: number;
  actual: number;
  difference: number;
  accuracyPercentage: number;
  isCompleted: boolean;
}

export interface MonthEndPaceData {
  month: string;
  daysElapsed: number;
  scheduledDaysElapsed: number;
  attendanceAchieved: number;
  hoursWorked: number;
  expectedHoursAtCurrentPace: number;
  projectedMonthEndHours: number;
  targetMonthHours: number;
  paceStatus: PaceStatus;
  paceDifferenceHours: number;
}

export interface DailyEarningTrajectoryPoint {
  dayNumber: number;
  date: string;
  dayLabel: string;
  actualCumulative: number | null;
  projectedCumulative: number;
  scheduledLinearPace: number;
  isPastOrToday: boolean;
}

export interface TimeMoneyConversionData {
  normalHourlyRate: number;
  normalMinuteRate: number;
  normalSecondRate: number;
  otHourlyRate: number;
  otMinuteRate: number;
  otSecondRate: number;
  oneHourNormalPay: number;
  oneHourOTPay: number;
  eightHoursNormalPay: number;
  thirtyMinLunchValue: number;
}

export interface BreakAnalyticsData {
  totalBreakSeconds: number;
  totalBreakHours: number;
  averageBreakMinutesPerWorkday: number;
  lunchBreakSeconds: number;
  teaBreakSeconds: number;
  customBreakSeconds: number;
  longestBreakMinutes: number;
  configuredLunchMinutes: number;
  averageActualLunchMinutes: number;
  lunchDifferenceMinutes: number; // actual - configured
}

export interface PunctualityAnalyticsData {
  lateArrivalsCount: number;
  totalLateMinutes: number;
  averageLateMinutes: number;
  earliestArrival: string;
  latestArrival: string;
  earlyDeparturesCount: number;
  totalEarlyDepartureMinutes: number;
  averageEarlyDepartureMinutes: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export interface BestWorstRecordsData {
  bestEarningDay: { date: string; amount: number };
  highestOTDay: { date: string; hours: number };
  longestActiveWorkDay: { date: string; hours: number };
  lowestWorkDay: { date: string; hours: number };
}

export interface PersonalRecordsData {
  highestSingleDayEarnings: { date: string; amount: number };
  highestMonthlyEarnings: { month: string; amount: number };
  highestOTHoursInMonth: { month: string; hours: number };
  longestWorkSessionMinutes: { date: string; minutes: number };
  longestActiveWorkDayHours: { date: string; hours: number };
  longestAttendanceStreak: number;
  mostConsecutivePresentDays: number;
  mostOTHoursInOneDay: { date: string; hours: number };
}

export interface YearlyMonthSummary {
  monthKey: string; // YYYY-MM
  monthName: string;
  hasData: boolean;
  calculated: number | null;
  official: number | null;
  actualReceived: number | null;
  ot: number | null;
  bonus: number | null;
  deductions: number | null;
  workingHours: number | null;
  presentDays: number | null;
}

export interface YearlyDashboardData {
  year: number;
  totalActualReceived: number;
  totalCalculatedSalary: number;
  totalOT: number;
  totalBonuses: number;
  totalDeductions: number;
  totalWorkingHours: number;
  totalAbsentDays: number;
  averageMonthlyIncome: number;
  months: YearlyMonthSummary[];
}

export interface FinancialYearData {
  fyLabel: string; // e.g. "FY 2026–27"
  startYear: number;
  startMonth: string; // "2026-04"
  endMonth: string;   // "2027-03"
  totalActualReceived: number;
  totalCalculated: number;
  totalOT: number;
  totalBonus: number;
  totalDeductions: number;
  totalWorkingHours: number;
  months: YearlyMonthSummary[];
}

export interface LifetimeDashboardData {
  lifetimeActualReceived: number;
  lifetimeCalculatedEarnings: number;
  lifetimeOT: number;
  lifetimeBonus: number;
  lifetimeDeductions: number;
  lifetimeWorkingHours: number;
  lifetimeAttendanceDays: number;
  lifetimeAbsentDays: number;
  lifetimeSalaryVariance: number;
  firstRecordedWorkDate: string;
  mostRecentWorkDate: string;
}

export interface DeterministicMonthlySummary {
  month: string;
  monthLabel: string;
  attendanceDaysFraction: string; // e.g. "26 / 26"
  activeWorkHoursFormatted: string; // e.g. "208h 00m"
  otHoursFormatted: string;
  normalEarningsFormatted: string;
  otEarningsFormatted: string;
  bonusFormatted: string;
  deductionsFormatted: string;
  actualReceivedFormatted: string;
  calculatedNetFormatted: string;
  varianceFormatted: string;
  narrativeText: string;
  bulletInsights: string[];
}
