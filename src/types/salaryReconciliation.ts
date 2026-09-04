// ============================================================================
// SALARYPULSE — 3-WAY SALARY RECONCILIATION DATA TYPES & INTERFACES (STEP 7)
// Authoritative comparison between SalaryPulse Calculation, Official HR Payroll Slip,
// and Actual Bank Receipt with Forensic Difference Engine & Audit Snapshotting
// ============================================================================

export type SalaryReconciliationStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'RECONCILED_MATCH'
  | 'DISCREPANCY_EXPLAINED'
  | 'DISPUTE_RAISED'
  | 'LOCKED_FINAL';

export type DiscrepancySeverity = 'MATCH' | 'INFO' | 'WARNING' | 'CRITICAL';

export type DiscrepancyCategory = 
  | 'BASE_PAY'
  | 'OVERTIME'
  | 'ATTENDANCE_BONUS'
  | 'PERFORMANCE_BONUS'
  | 'SPECIAL_ALLOWANCE'
  | 'TAX_TDS'
  | 'PF_STATUTORY'
  | 'PT_TAX'
  | 'ESI_DEDUCTION'
  | 'PENALTY_LOP'
  | 'OTHER_DEDUCTIONS'
  | 'BANK_TRANSFER'
  | 'UNEXPLAINED';

export type ResolutionStatus = 
  | 'ACCEPTED_OFFICIAL'
  | 'DISPUTED_WITH_HR'
  | 'TIMING_DIFFERENCE'
  | 'PENDING_CLARIFICATION'
  | 'RECONCILED'
  | 'UNRESOLVED';

export interface OfficialPayrollDeductions {
  pf: number;            // Provident Fund
  pt: number;            // Professional Tax
  tds: number;           // Tax Deducted at Source
  esi: number;           // Employee State Insurance
  lop: number;           // Loss of Pay / Late Penalty
  other: number;         // Other miscellaneous deductions
  otherDescription?: string;
}

export interface OfficialPayrollSlip {
  isProvided: boolean;
  slipNumber?: string;
  disbursalDate?: string;
  employerName?: string;
  employeeId?: string;
  
  // Earnings
  basePay: number;
  overtimePay: number;
  attendanceBonus: number;
  performanceBonus: number;
  specialAllowance: number;
  otherEarnings: number;
  grossPay: number;
  
  // Deductions
  deductions: OfficialPayrollDeductions;
  totalDeductions: number;
  
  // Net
  netSalary: number;
  
  // Metadata / Attendance recorded by HR
  reportedWorkDays?: number;
  reportedPresentDays?: number;
  reportedOTHours?: number;
  remarks?: string;
}

export interface ActualBankReceipt {
  isProvided: boolean;
  amountReceived: number;
  depositDate: string;
  bankName: string;
  accountLast4: string;
  transactionRef: string; // UTR or Ref number
  depositStatus: 'RECEIVED' | 'PENDING' | 'SPLIT_RECEIVED' | 'BANK_FEES_DEDUCTED';
  notes?: string;
}

export interface PulseCalculatedSummary {
  grossSalary: number;
  basePay: number;
  overtimePay: number;
  attendanceBonus: number;
  performanceBonus: number;
  specialAllowance: number;
  totalDeductions: number;
  itemizedDeductions: Array<{ name: string; amount: number; type: string }>;
  netPay: number;
  scheduledWorkingDays: number;
  presentDays: number;
  otHours: number;
  perDayRate: number;
  perHourRate: number;
  calculationBasis: string;
}

export interface ItemizedSalaryDiscrepancy {
  id: string;
  category: DiscrepancyCategory;
  title: string;
  description: string;
  pulseAmount: number;
  officialAmount: number;
  variance: number; // official - pulse
  severity: DiscrepancySeverity;
  driver: string;
  impactNote: string;
  userResolution: ResolutionStatus;
  userNote?: string;
}

export interface ForensicSalaryNarrative {
  headline: string;
  netVariance: number; // Official Net - Pulse Net
  bankVariance: number; // Bank Received - Official Net
  totalDiscrepanciesCount: number;
  criticalCount: number;
  warningCount: number;
  explanationSteps: string[];
  keyFinancialDrivers: Array<{ label: string; amount: number; direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }>;
  actionRecommendations: string[];
  suggestedHRDisputeTemplate: string;
}

export interface SalaryReconciliationRecord {
  id: string;
  month: string; // YYYY-MM
  status: SalaryReconciliationStatus;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  lastUpdated: string;
  
  // Three Comparison Pillars
  pulseData: PulseCalculatedSummary;
  officialSlip: OfficialPayrollSlip;
  bankReceipt: ActualBankReceipt;
  
  // Discrepancies & Explanations
  itemizedDiscrepancies: ItemizedSalaryDiscrepancy[];
  forensicSummary: ForensicSalaryNarrative;
  
  // Dispute & HR Query Management
  disputeNotes?: string;
  disputeTicketRef?: string;
  disputeStatus?: 'NONE' | 'DRAFTED' | 'SUBMITTED' | 'RESOLVED_ACCEPTED' | 'ADJUSTED_NEXT_MONTH';
  
  // Audit metadata
  auditNotes?: string;
}

export interface YearlySalarySummaryItem {
  month: string;
  monthLabel: string;
  pulseNet: number;
  officialNet: number;
  bankReceived: number;
  variance: number;
  status: SalaryReconciliationStatus;
  isLocked: boolean;
}
