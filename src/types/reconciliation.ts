// ============================================================================
// SALARYPULSE — PDF ATTENDANCE RECONCILIATION TYPES & INTERFACES
// ============================================================================

import { WorkdayStatus } from './index';

export type DiscrepancyType = 
  | 'MATCH'
  | 'STATUS_MISMATCH'
  | 'PUNCH_TIME_DIFF'
  | 'DURATION_DIFF'
  | 'OT_DIFF'
  | 'MISSING_IN_APP'
  | 'EXTRA_IN_APP';

export type ResolutionChoice = 'USE_PDF' | 'KEEP_APP' | 'CUSTOM';

export interface ExtractedEmployee {
  employeeId: string;
  name: string;
  department?: string;
  designation?: string;
  totalRecordsCount: number;
  isTargetMatch?: boolean;
}

export interface ExtractedDayRecord {
  date: string; // YYYY-MM-DD
  dayName: string; // Monday, Tuesday, etc.
  shift: string; // e.g. "09:00 - 18:00"
  inTime: string; // e.g. "09:04 AM"
  outTime: string; // e.g. "07:42 PM"
  totalDurationHours: number;
  workDurationSeconds: number;
  overtimeSeconds: number;
  overtimeHours: number;
  status: WorkdayStatus;
  remarks?: string;
  rawPunches?: string[];
}

export interface ReconciliationItem {
  id: string;
  date: string;
  dayName: string;
  discrepancyType: DiscrepancyType;
  discrepancyLabel: string;
  discrepancyDescription: string;
  
  // App's existing recorded values
  appData: {
    exists: boolean;
    status: WorkdayStatus;
    inTime: string;
    outTime: string;
    workDurationSeconds: number;
    overtimeSeconds: number;
    dailyEarnings: number;
    otEarnings: number;
    totalEarnings: number;
  };

  // Office PDF extracted values
  pdfData: {
    exists: boolean;
    status: WorkdayStatus;
    shift: string;
    inTime: string;
    outTime: string;
    workDurationSeconds: number;
    overtimeSeconds: number;
    remarks: string;
    rawPunches: string[];
    calculatedDailyEarnings: number;
    calculatedOTEarnings: number;
    calculatedTotalEarnings: number;
  };

  // Financial delta if PDF correction is applied
  financialDelta: {
    baseSalaryDifference: number; // e.g. +₹250.00
    otDifference: number;         // e.g. +₹180.00
    netEarningsDifference: number; // e.g. +₹430.00
    attendanceBonusImpact: string; // e.g. "Brings total present days to 26 (Qualifies for ₹5,000 Bonus!)"
  };

  isSelected: boolean;
  resolution: ResolutionChoice;
  customNotes?: string;
}

export interface ReconciliationReport {
  id: string;
  fileName: string;
  fileSizeFormatted: string;
  extractedAt: string;
  documentTitle: string;
  companyName: string;
  monthPeriod: string;
  
  selectedEmployee: ExtractedEmployee;
  allEmployeesFound: ExtractedEmployee[];
  
  items: ReconciliationItem[];
  
  // Computed summary
  summary: {
    totalEvaluatedDays: number;
    matchedDaysCount: number;
    discrepanciesCount: number;
    missingInAppCount: number;
    extraInAppCount: number;
    totalOTDeltaSeconds: number;
    totalFinancialDelta: number;
    currentPresentDays: number;
    projectedPresentDaysAfterSync: number;
    bonusStatusBefore: string;
    bonusStatusAfter: string;
    bonusFinancialImpact: number;
  };
}

export interface ReconciliationAuditLog {
  id: string;
  timestamp: string;
  formattedTime: string;
  sourceDocument: string;
  employeeName: string;
  employeeId: string;
  totalCorrectedDates: number;
  correctedDatesList: string[];
  
  // Financial Snapshot
  grossBefore: number;
  grossAfter: number;
  netBefore: number;
  netAfter: number;
  otHoursBefore: number;
  otHoursAfter: number;
  bonusBefore: number;
  bonusAfter: number;
  
  itemizedChanges: Array<{
    date: string;
    field: string;
    previousValue: string;
    newValue: string;
    financialDelta: number;
    reason: string;
  }>;
}
