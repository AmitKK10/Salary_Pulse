// ============================================================================
// SALARYPULSE — DATA MANAGEMENT, BACKUP, RESTORE & DATA INTEGRITY TYPES (STEP 9)
// ============================================================================

import {
  AppSettings,
  AttendanceDay,
  AuditLog,
  Holiday,
  ProjectionScenario,
  SalaryConfig,
  User,
  WorkSchedule,
  SalaryReconciliationRecord,
  ReconciliationReport,
  ReconciliationAuditLog
} from './index';

export const CURRENT_SCHEMA_VERSION = 10;
export const APPLICATION_VERSION = '2.0.0';
export const APP_IDENTIFIER = 'SalaryPulse';

export interface BackupMetadata {
  schemaVersion: number;
  exportVersion: string;
  applicationVersion: string;
  appIdentifier: string;
  createdAt: string; // ISO
  createdBy?: string;
  isEncrypted: boolean;
  checksum?: string; // SHA-256 hex string
  recordCounts: {
    attendanceDays: number;
    workSessions: number;
    breakSessions: number;
    holidays: number;
    scenarios: number;
    salaryReconciliations: number;
    auditLogs: number;
    pdfReports: number;
  };
  notes?: string;
}

export interface FullBackupPayload {
  metadata: BackupMetadata;
  user: User;
  salaryConfig: SalaryConfig;
  schedule: WorkSchedule;
  holidays: Holiday[];
  attendanceDays: AttendanceDay[];
  appSettings: AppSettings;
  projectionScenarios: ProjectionScenario[];
  salaryReconciliationRecords: SalaryReconciliationRecord[];
  reconciliationReport: ReconciliationReport | null;
  reconciliationAuditLogs: ReconciliationAuditLog[];
  auditLogs: AuditLog[];
  selectedMonth?: string;
  bonusApprovalState?: boolean;
}

export interface EncryptedBackupPayload {
  metadata: BackupMetadata;
  encryptedData: string; // Base64 ciphertext
  salt: string;          // Base64 salt for PBKDF2
  iv: string;            // Base64 initialization vector
  algorithm: 'AES-GCM-256-PBKDF2';
}

export interface EntityCountComparison {
  entity: string;
  currentCount: number;
  backupCount: number;
  difference: number;
}

export interface RestoreInspectionResult {
  isValid: boolean;
  isEncrypted: boolean;
  requiresPassword?: boolean;
  schemaVersion: number;
  createdAt: string;
  checksumVerified?: boolean;
  computedChecksum?: string;
  storedChecksum?: string;
  comparison: EntityCountComparison[];
  backupPayload?: FullBackupPayload;
  payload?: FullBackupPayload;
  encryptedPayload?: EncryptedBackupPayload;
  errors: string[];
  warnings: string[];
}

export type MergeConflictResolution = 'KEEP_CURRENT' | 'USE_BACKUP' | 'CREATE_COPY';

export interface MergeConflictItem {
  id: string;
  entityType: 'attendance_day' | 'salary_config' | 'schedule' | 'reconciliation_record' | 'projection_scenario';
  entityKey: string;
  currentSummary: string;
  backupSummary: string;
  differences: string[];
  currentRecord: any;
  backupRecord: any;
  resolution: MergeConflictResolution;
}

export interface MergeInspectionResult {
  identicalCount: number;
  newInBackupCount: number;
  conflictCount: number;
  conflicts: MergeConflictItem[];
}

export type IntegritySeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface IntegrityIssue {
  id: string;
  category: 
    | 'ATTENDANCE_REFERENCE'
    | 'SESSION_INTEGRITY'
    | 'TIMESTAMPS'
    | 'OVERTIME_MATH'
    | 'BONUS_LIFECYCLE'
    | 'SALARY_CONFIG'
    | 'RECONCILIATION_SYNC'
    | 'HISTORICAL_IMMUTABILITY'
    | 'DUPLICATE_RECORD';
  severity: IntegritySeverity;
  title: string;
  description: string;
  entityId?: string;
  entityDate?: string;
  suggestedAction?: string;
  suggestedFix?: string;
}

export interface DataIntegrityReport {
  timestamp: string;
  status: 'PASS' | 'WARNING' | 'ERROR';
  totalChecksCount: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  issues: IntegrityIssue[];
  metrics: {
    totalWorkSecondsChecked: number;
    totalOTSecondsChecked: number;
    reconciledMonthsChecked: number;
    attendanceDaysChecked: number;
  };
}

export interface HistoricalConfigDiff {
  month: string;
  hasDiff: boolean;
  currentSalary: number;
  snapshotSalary: number;
  currentOtMultiplier: number;
  snapshotOtMultiplier: number;
  currentBasis: string;
  snapshotBasis: string;
  differences: string[];
  diffSummary?: string;
  snapshotNetPay?: number;
  currentConfigBaseSalary?: number;
}

export interface SystemHealthStatus {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  storageHealthy: boolean;
  storageUsageBytes: number;
  storageSizeBytes: number;
  storageUsageFormatted: string;
  schemaVersion: number;
  lastBackupDate?: string;
  backupStatus: 'UP_TO_DATE' | 'RECOMMENDED' | 'NEVER';
  integrityStatus: 'PASS' | 'WARNING' | 'ERROR';
  openSessionsCount: number;
  needsReviewDaysCount: number;
  unresolvedPayrollDiffsCount: number;
  totalDaysCount: number;
  totalSessionsCount: number;
  totalReconciledMonthsCount: number;
  configDriftsCount: number;
  configDriftCount: number;
  recordCounts: {
    attendanceDays: number;
    workSessions: number;
    salaryReconciliations: number;
    auditLogs: number;
  };
}
