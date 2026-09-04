// ============================================================================
// SALARYPULSE — SCHEMA MIGRATION ENGINE (STEP 9)
// Deterministic multi-version migration pipeline (v1 → v9)
// Preserves all user financial records and ensures forward/backward compatibility
// ============================================================================

import {
  CURRENT_SCHEMA_VERSION,
  APPLICATION_VERSION,
  APP_IDENTIFIER,
  FullBackupPayload,
  SalaryConfig,
  WorkSchedule,
  AttendanceDay,
  User,
  Holiday,
  AppSettings,
  ProjectionScenario,
  SalaryReconciliationRecord
} from '../types';
import {
  INITIAL_USER,
  INITIAL_SALARY_CONFIG,
  INITIAL_SCHEDULE,
  INITIAL_HOLIDAYS,
  INITIAL_ATTENDANCE_DAYS,
  INITIAL_SALARY_RECONCILIATION_RECORDS
} from '../persistence/initialData';

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  data: FullBackupPayload;
  stepsApplied: string[];
  warnings: string[];
  error?: string;
}

export class MigrationEngine {
  /**
   * Migrate any raw state or backup payload to the target schema version (v9)
   */
  static migrate(raw: any): MigrationResult {
    const stepsApplied: string[] = [];
    const warnings: string[] = [];

    if (!raw || typeof raw !== 'object') {
      return {
        success: false,
        fromVersion: 0,
        toVersion: CURRENT_SCHEMA_VERSION,
        data: this.getCleanDefaultPayload(),
        stepsApplied: [],
        warnings: [],
        error: 'Invalid or empty data payload provided for migration.',
      };
    }

    // Determine initial version
    let detectedVersion = 1;
    if (typeof raw.schemaVersion === 'number') {
      detectedVersion = raw.schemaVersion;
    } else if (raw.metadata && typeof raw.metadata.schemaVersion === 'number') {
      detectedVersion = raw.metadata.schemaVersion;
    } else if (raw.salaryConfig && typeof raw.salaryConfig.schemaVersion === 'number') {
      detectedVersion = raw.salaryConfig.schemaVersion;
    }

    let payload: any = { ...raw };

    try {
      // Step 1: Migrate v1 → v2 (Salary Config & Schedule rules)
      if (detectedVersion < 2) {
        payload = this.migrateV1ToV2(payload);
        stepsApplied.push('v1 → v2: Normalizing salary deductions and schedule break rules');
      }

      // Step 2: Migrate v2 → v3 (Live Work sessions & Auditing)
      if (detectedVersion < 3) {
        payload = this.migrateV2ToV3(payload);
        stepsApplied.push('v2 → v3: Adding session source tracking and audit log identifiers');
      }

      // Step 3: Migrate v3 → v4 (Calendar status codes & Day Calculation models)
      if (detectedVersion < 4) {
        payload = this.migrateV3ToV4(payload);
        stepsApplied.push('v3 → v4: Standardizing WorkdayStatus and attendance status codes');
      }

      // Step 4: Migrate v4 → v5 (Scenario projection models)
      if (detectedVersion < 5) {
        payload = this.migrateV4ToV5(payload);
        stepsApplied.push('v4 → v5: Structuring projection scenarios and assumption types');
      }

      // Step 5: Migrate v5 → v6 (PDF Biometric reconciliation)
      if (detectedVersion < 6) {
        payload = this.migrateV5ToV6(payload);
        stepsApplied.push('v5 → v6: Adding biometric attendance report models');
      }

      // Step 6: Migrate v6 → v7 (3-Way Payroll & Bank reconciliation)
      if (detectedVersion < 7) {
        payload = this.migrateV6ToV7(payload);
        stepsApplied.push('v6 → v7: Structuring official slip, bank receipt and dispute models');
      }

      // Step 7: Migrate v7 → v8 (Analytics & Multi-period structures)
      if (detectedVersion < 8) {
        payload = this.migrateV7ToV8(payload);
        stepsApplied.push('v7 → v8: Structuring multi-period analytics and career milestones');
      }

      // Step 8: Migrate v8 → v9 (Production hardening & Unified backup metadata)
      if (detectedVersion < 9) {
        payload = this.migrateV8ToV9(payload);
        stepsApplied.push('v8 → v9: Upgrading to v9 Unified Persistence Schema with integrity metrics');
      }

      // Step 9: Migrate v9 → v10 (Official Biometric Entry/Exit Punches Dataset + ₹15,000 / 26d * 8h defaults)
      if (detectedVersion < 10) {
        payload = this.migrateV9ToV10(payload);
        stepsApplied.push('v9 → v10: Upgrading to official employee punch dataset and ₹15,000 / 26d * 8h defaults');
      }

      const finalizedData = this.finalizePayload(payload);

      return {
        success: true,
        fromVersion: detectedVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        data: finalizedData,
        stepsApplied,
        warnings,
      };
    } catch (e: any) {
      console.error('MigrationEngine fatal failure:', e);
      return {
        success: false,
        fromVersion: detectedVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        data: this.getCleanDefaultPayload(),
        stepsApplied,
        warnings,
        error: e.message || 'Fatal error during database migration.',
      };
    }
  }

  // --- INDIVIDUAL MIGRATION PHASES ---

  private static migrateV1ToV2(data: any): any {
    const salaryConfig = data.salaryConfig || INITIAL_SALARY_CONFIG;
    const schedule = data.schedule || INITIAL_SCHEDULE;

    return {
      ...data,
      salaryConfig: {
        ...INITIAL_SALARY_CONFIG,
        ...salaryConfig,
        deductions: salaryConfig.deductions || [],
        calculationBasis: salaryConfig.calculationBasis || 'monthly_scheduled_hours',
        overtimeMethod: salaryConfig.overtimeMethod || 'monthly_threshold',
        overtimeMultiplier: salaryConfig.overtimeMultiplier || 2.0,
      },
      schedule: {
        ...INITIAL_SCHEDULE,
        ...schedule,
        workingDays: schedule.workingDays || [1, 2, 3, 4, 5, 6],
        breakRules: schedule.breakRules || INITIAL_SCHEDULE.breakRules,
      },
    };
  }

  private static migrateV2ToV3(data: any): any {
    const days: AttendanceDay[] = (data.attendanceDays || []).map((d: any) => ({
      ...d,
      workSessions: (d.workSessions || []).map((ws: any) => ({
        ...ws,
        source: ws.source || 'LIVE',
        status: ws.status || 'COMPLETED',
      })),
      breakSessions: (d.breakSessions || []).map((bs: any) => ({
        ...bs,
        source: bs.source || 'LIVE',
        isPaid: bs.isPaid !== undefined ? bs.isPaid : false,
      })),
    }));

    return {
      ...data,
      attendanceDays: days,
      auditLogs: data.auditLogs || [],
    };
  }

  private static migrateV3ToV4(data: any): any {
    const days: AttendanceDay[] = (data.attendanceDays || []).map((d: any) => {
      let st = d.status || 'PRESENT';
      if (st === 'present') st = 'PRESENT';
      if (st === 'absent') st = 'ABSENT';
      if (st === 'half_day') st = 'PARTIAL';
      if (st === 'leave') st = 'PAID_LEAVE';
      if (st === 'holiday') st = 'PAID_HOLIDAY';
      if (st === 'weekly_off') st = 'WEEKLY_OFF';

      return {
        ...d,
        status: st,
        workdayStatus: d.workdayStatus || st,
      };
    });

    return {
      ...data,
      attendanceDays: days,
    };
  }

  private static migrateV4ToV5(data: any): any {
    return {
      ...data,
      projectionScenarios: data.projectionScenarios || [],
    };
  }

  private static migrateV5ToV6(data: any): any {
    return {
      ...data,
      reconciliationReport: data.reconciliationReport || null,
      reconciliationAuditLogs: data.reconciliationAuditLogs || [],
    };
  }

  private static migrateV6ToV7(data: any): any {
    const records: SalaryReconciliationRecord[] = data.salaryReconciliationRecords || INITIAL_SALARY_RECONCILIATION_RECORDS;
    return {
      ...data,
      salaryReconciliationRecords: records,
    };
  }

  private static migrateV7ToV8(data: any): any {
    return {
      ...data,
      appSettings: {
        ...data.appSettings,
        schemaVersion: 8,
      },
    };
  }

  private static migrateV8ToV9(data: any): any {
    const attendanceDays: AttendanceDay[] = data.attendanceDays || INITIAL_ATTENDANCE_DAYS;
    
    // Calculate accurate record counts
    let totalWorkSessions = 0;
    let totalBreakSessions = 0;
    for (const d of attendanceDays) {
      totalWorkSessions += (d.workSessions || []).length;
      totalBreakSessions += (d.breakSessions || []).length;
    }

    const metadata = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportVersion: '9.0',
      applicationVersion: APPLICATION_VERSION,
      appIdentifier: APP_IDENTIFIER,
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      isEncrypted: false,
      recordCounts: {
        attendanceDays: attendanceDays.length,
        workSessions: totalWorkSessions,
        breakSessions: totalBreakSessions,
        holidays: (data.holidays || INITIAL_HOLIDAYS).length,
        scenarios: (data.projectionScenarios || []).length,
        salaryReconciliations: (data.salaryReconciliationRecords || INITIAL_SALARY_RECONCILIATION_RECORDS).length,
        auditLogs: (data.auditLogs || []).length,
        pdfReports: data.reconciliationReport ? 1 : 0,
      },
      notes: data.metadata?.notes || 'Upgraded to v9 Unified Persistence Schema',
    };

    return {
      ...data,
      metadata,
      appSettings: {
        ...data.appSettings,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
    };
  }

  /**
   * Finalize and construct fully valid TypeScript typed FullBackupPayload
   */
  private static finalizePayload(data: any): FullBackupPayload {
    const user: User = data.user || INITIAL_USER;
    const salaryConfig: SalaryConfig = {
      ...INITIAL_SALARY_CONFIG,
      ...(data.salaryConfig || {}),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    const schedule: WorkSchedule = {
      ...INITIAL_SCHEDULE,
      ...(data.schedule || {}),
    };
    const holidays: Holiday[] = data.holidays || INITIAL_HOLIDAYS;
    const attendanceDays: AttendanceDay[] = data.attendanceDays || INITIAL_ATTENDANCE_DAYS;
    const appSettings: AppSettings = {
      theme: 'dark',
      soundEnabled: true,
      hapticEnabled: true,
      autoSaveIntervalSeconds: 15,
      lastBackupDate: new Date().toISOString(),
      ...(data.appSettings || {}),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    const projectionScenarios: ProjectionScenario[] = data.projectionScenarios || [];
    const salaryReconciliationRecords: SalaryReconciliationRecord[] = 
      data.salaryReconciliationRecords || INITIAL_SALARY_RECONCILIATION_RECORDS;
    const reconciliationReport = data.reconciliationReport || null;
    const reconciliationAuditLogs = data.reconciliationAuditLogs || [];
    const auditLogs = data.auditLogs || [];

    let totalWorkSessions = 0;
    let totalBreakSessions = 0;
    for (const d of attendanceDays) {
      totalWorkSessions += (d.workSessions || []).length;
      totalBreakSessions += (d.breakSessions || []).length;
    }

    const metadata = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportVersion: '9.0',
      applicationVersion: APPLICATION_VERSION,
      appIdentifier: APP_IDENTIFIER,
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      isEncrypted: !!data.metadata?.isEncrypted,
      recordCounts: {
        attendanceDays: attendanceDays.length,
        workSessions: totalWorkSessions,
        breakSessions: totalBreakSessions,
        holidays: holidays.length,
        scenarios: projectionScenarios.length,
        salaryReconciliations: salaryReconciliationRecords.length,
        auditLogs: auditLogs.length,
        pdfReports: reconciliationReport ? 1 : 0,
      },
      notes: data.metadata?.notes,
    };

    return {
      metadata,
      user,
      salaryConfig,
      schedule,
      holidays,
      attendanceDays,
      appSettings,
      projectionScenarios,
      salaryReconciliationRecords,
      reconciliationReport,
      reconciliationAuditLogs,
      auditLogs,
      selectedMonth: data.selectedMonth || '2026-08',
      bonusApprovalState: data.bonusApprovalState,
    };
  }

  private static migrateV9ToV10(data: any): any {
    return {
      ...data,
      salaryConfig: {
        ...INITIAL_SALARY_CONFIG,
        ...(data.salaryConfig || {}),
        monthlyBaseSalary: data.salaryConfig?.monthlyBaseSalary ?? 15000,
        calculationBasis: data.salaryConfig?.calculationBasis || 'monthly_scheduled_hours',
      },
      schedule: {
        ...INITIAL_SCHEDULE,
        ...(data.schedule || {}),
        requiredActiveHoursPerDay: data.schedule?.requiredActiveHoursPerDay ?? 8.0,
      },
      attendanceDays: data.attendanceDays || INITIAL_ATTENDANCE_DAYS,
      user: {
        ...INITIAL_USER,
        ...(data.user || {}),
      },
      selectedMonth: data.selectedMonth || '2026-08',
    };
  }

  private static getCleanDefaultPayload(): FullBackupPayload {
    return {
      metadata: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportVersion: '9.0',
        applicationVersion: APPLICATION_VERSION,
        appIdentifier: APP_IDENTIFIER,
        createdAt: new Date().toISOString(),
        isEncrypted: false,
        recordCounts: {
          attendanceDays: INITIAL_ATTENDANCE_DAYS.length,
          workSessions: 0,
          breakSessions: 0,
          holidays: INITIAL_HOLIDAYS.length,
          scenarios: 0,
          salaryReconciliations: INITIAL_SALARY_RECONCILIATION_RECORDS.length,
          auditLogs: 0,
          pdfReports: 0,
        },
      },
      user: INITIAL_USER,
      salaryConfig: INITIAL_SALARY_CONFIG,
      schedule: INITIAL_SCHEDULE,
      holidays: INITIAL_HOLIDAYS,
      attendanceDays: INITIAL_ATTENDANCE_DAYS,
      appSettings: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        theme: 'dark',
        soundEnabled: true,
        hapticEnabled: true,
        autoSaveIntervalSeconds: 15,
        lastBackupDate: new Date().toISOString(),
      },
      projectionScenarios: [],
      salaryReconciliationRecords: INITIAL_SALARY_RECONCILIATION_RECORDS,
      reconciliationReport: null,
      reconciliationAuditLogs: [],
      auditLogs: [],
      selectedMonth: '2026-08',
    };
  }
}
