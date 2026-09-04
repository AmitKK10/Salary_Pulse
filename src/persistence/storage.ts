// ============================================================================
// SALARYPULSE — PERSISTENCE & STORAGE MANAGER (STEP 9)
// Unified v9 persistence schema, safety rollback snapshotting, and MigrationEngine integration
// ============================================================================

import { 
  AppSettings, 
  AttendanceDay, 
  AuditLog, 
  Holiday, 
  SalaryConfig, 
  User, 
  WorkSchedule,
  ProjectionScenario,
  SalaryReconciliationRecord,
  ReconciliationReport,
  ReconciliationAuditLog,
  FullBackupPayload,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_NOTIFICATION_SETTINGS
} from '../types';
import { 
  INITIAL_ATTENDANCE_DAYS, 
  INITIAL_HOLIDAYS, 
  INITIAL_SALARY_CONFIG, 
  INITIAL_SCHEDULE, 
  INITIAL_USER,
  INITIAL_SALARY_RECONCILIATION_RECORDS
} from './initialData';
import { MigrationEngine } from '../engine/migrationEngine';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'salarypulse_schema_version',
  USER: 'salarypulse_user',
  SALARY_CONFIG: 'salarypulse_salary_config',
  SCHEDULE: 'salarypulse_schedule',
  HOLIDAYS: 'salarypulse_holidays',
  ATTENDANCE_DAYS: 'salarypulse_attendance_days',
  APP_SETTINGS: 'salarypulse_app_settings',
  SELECTED_MONTH: 'salarypulse_selected_month',
  ACTIVE_TAB: 'salarypulse_active_tab',
  AUDIT_LOGS: 'salarypulse_audit_logs',
  PROJECTION_SCENARIOS: 'salarypulse_projection_scenarios',
  RECONCILIATION_REPORT: 'salarypulse_reconciliation_report',
  RECONCILIATION_AUDIT_LOGS: 'salarypulse_reconciliation_audit_logs',
  SALARY_RECONCILIATION_RECORDS: 'salarypulse_salary_reconciliation_records',
  ROLLBACK_SNAPSHOT: 'salarypulse_rollback_snapshot',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  autoSaveIntervalSeconds: 15,
  lastBackupDate: new Date().toISOString(),
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
};

export class StorageService {
  /**
   * Initialize and run unified migration pipeline if version upgraded
   */
  static initStorage(): void {
    try {
      const seedMarker = localStorage.getItem('salarypulse_seeded_aug2026_v4');
      const existingConfig = localStorage.getItem(STORAGE_KEYS.SALARY_CONFIG);
      const existingSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      const existingDays = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_DAYS);

      if (!seedMarker) {
        // Only seed initial default data if NO existing saved configuration is found in localStorage
        if (!existingConfig && !existingSchedule && !existingDays) {
          this.resetAll();
          localStorage.removeItem('salarypulse_active_today_date');
          localStorage.setItem('salarypulse_active_today_date', '2026-08-31');
          localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, '2026-08');
          localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, 'live-work');
          this.saveAttendanceDays(INITIAL_ATTENDANCE_DAYS);
          this.saveSalaryConfig(INITIAL_SALARY_CONFIG);
          this.saveSchedule(INITIAL_SCHEDULE);
          this.saveHolidays(INITIAL_HOLIDAYS);
        }
        localStorage.setItem('salarypulse_seeded_aug2026_v4', 'true');
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
        return;
      }

      const storedVersionStr = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
      const storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 0;

      if (storedVersion < CURRENT_SCHEMA_VERSION) {
        // Build state object and run MigrationEngine
        const currentState = this.getFullState();
        const migration = MigrationEngine.migrate(currentState);
        if (migration.success) {
          this.saveFullState(migration.data);
          this.addAuditLog({
            entityType: 'salary_config',
            entityId: 'SYSTEM',
            action: 'UPDATE',
            fieldChanged: 'schemaVersion',
            oldValue: `v${storedVersion}`,
            newValue: `v${CURRENT_SCHEMA_VERSION}`,
            reason: `Automatic database upgrade: ${migration.stepsApplied.join('; ')}`,
          });
        }
        localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
      }
    } catch (e) {
      console.warn('StorageService: Failed to access localStorage', e);
    }
  }

  /**
   * Create an emergency temporary rollback snapshot in localStorage
   */
  static createRollbackSnapshot(): void {
    try {
      const state = this.getFullState();
      localStorage.setItem(STORAGE_KEYS.ROLLBACK_SNAPSHOT, JSON.stringify(state));
    } catch (e) {
      console.warn('StorageService: Failed to create rollback snapshot', e);
    }
  }

  /**
   * Restore from the emergency rollback snapshot
   */
  static restoreRollbackSnapshot(): boolean {
    try {
      const snapStr = localStorage.getItem(STORAGE_KEYS.ROLLBACK_SNAPSHOT);
      if (!snapStr) return false;
      const parsed = JSON.parse(snapStr);
      this.saveFullState(parsed);
      return true;
    } catch (e) {
      console.error('StorageService: Rollback failed', e);
      return false;
    }
  }

  /**
   * Extract complete FullBackupPayload representation of all local entities
   */
  static getFullState(): FullBackupPayload {
    const user = this.getUser();
    const salaryConfig = this.getSalaryConfig();
    const schedule = this.getSchedule();
    const holidays = this.getHolidays();
    const attendanceDays = this.getAttendanceDays();
    const appSettings = this.getAppSettings();
    const projectionScenarios = this.getScenarios();
    const salaryReconciliationRecords = this.getSalaryReconciliationRecords();
    const reconciliationReport = this.getReconciliationReport();
    const reconciliationAuditLogs = this.getReconciliationAuditLogs();
    const auditLogs = this.getAuditLogs();
    const selectedMonth = this.getSelectedMonth();

    let totalWorkSessions = 0;
    let totalBreakSessions = 0;
    for (const d of attendanceDays) {
      totalWorkSessions += (d.workSessions || []).length;
      totalBreakSessions += (d.breakSessions || []).length;
    }

    return {
      metadata: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportVersion: '9.0',
        applicationVersion: '1.9.0',
        appIdentifier: 'SalaryPulse',
        createdAt: new Date().toISOString(),
        createdBy: user.name,
        isEncrypted: false,
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
      },
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
      selectedMonth,
    };
  }

  /**
   * Persist a full state payload cleanly across all storage keys
   */
  static saveFullState(state: FullBackupPayload): void {
    if (state.user) this.saveUser(state.user);
    if (state.salaryConfig) this.saveSalaryConfig(state.salaryConfig);
    if (state.schedule) this.saveSchedule(state.schedule);
    if (state.holidays) this.saveHolidays(state.holidays);
    if (state.attendanceDays) this.saveAttendanceDays(state.attendanceDays);
    if (state.appSettings) this.saveAppSettings(state.appSettings);
    if (state.projectionScenarios) this.saveScenarios(state.projectionScenarios);
    if (state.salaryReconciliationRecords) this.saveSalaryReconciliationRecords(state.salaryReconciliationRecords);
    if (state.reconciliationReport !== undefined) this.saveReconciliationReport(state.reconciliationReport);
    if (state.reconciliationAuditLogs) this.saveReconciliationAuditLogs(state.reconciliationAuditLogs);
    if (state.auditLogs) this.saveAuditLogs(state.auditLogs);
    if (state.selectedMonth) this.saveSelectedMonth(state.selectedMonth);
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
  }

  // --- GETTERS ---
  static getUser(): User {
    return this.getItem(STORAGE_KEYS.USER, INITIAL_USER);
  }

  static getSalaryConfig(): SalaryConfig {
    const raw = this.getItem<Partial<SalaryConfig> | null>(STORAGE_KEYS.SALARY_CONFIG, null);
    if (!raw || typeof raw !== 'object') {
      return { ...INITIAL_SALARY_CONFIG };
    }

    // Merge saved config on top of initial defaults so any missing properties have safe fallbacks,
    // while faithfully preserving all user-selected settings.
    return {
      ...INITIAL_SALARY_CONFIG,
      ...raw,
      deductions: Array.isArray(raw.deductions) ? raw.deductions : (INITIAL_SALARY_CONFIG.deductions || []),
      schemaVersion: raw.schemaVersion || CURRENT_SCHEMA_VERSION,
    };
  }

  static getSchedule(): WorkSchedule {
    const raw = this.getItem<Partial<WorkSchedule> | null>(STORAGE_KEYS.SCHEDULE, null);
    if (!raw || typeof raw !== 'object') {
      return { ...INITIAL_SCHEDULE };
    }
    return {
      ...INITIAL_SCHEDULE,
      ...raw,
      workingDays: Array.isArray(raw.workingDays) && raw.workingDays.length > 0
        ? raw.workingDays
        : INITIAL_SCHEDULE.workingDays,
      breakRules: Array.isArray(raw.breakRules) ? raw.breakRules : INITIAL_SCHEDULE.breakRules,
    };
  }

  static getHolidays(): Holiday[] {
    const raw = this.getItem<Holiday[] | null>(STORAGE_KEYS.HOLIDAYS, null);
    if (!raw || !Array.isArray(raw)) {
      return [...INITIAL_HOLIDAYS];
    }
    return raw;
  }

  static getAttendanceDays(): AttendanceDay[] {
    return this.getItem(STORAGE_KEYS.ATTENDANCE_DAYS, INITIAL_ATTENDANCE_DAYS);
  }

  static getAppSettings(): AppSettings {
    return this.getItem(STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS);
  }

  static getSelectedMonth(): string {
    return this.getItem(STORAGE_KEYS.SELECTED_MONTH, '2026-08');
  }

  static getActiveTab(): string {
    return this.getItem(STORAGE_KEYS.ACTIVE_TAB, 'dashboard');
  }

  static getAuditLogs(): AuditLog[] {
    return this.getItem(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  static getScenarios(): ProjectionScenario[] {
    return this.getItem(STORAGE_KEYS.PROJECTION_SCENARIOS, []);
  }

  // --- SETTERS ---
  static saveUser(user: User): void {
    this.setItem(STORAGE_KEYS.USER, user);
  }

  static saveSalaryConfig(config: SalaryConfig): void {
    this.setItem(STORAGE_KEYS.SALARY_CONFIG, config);
  }

  static saveSchedule(schedule: WorkSchedule): void {
    this.setItem(STORAGE_KEYS.SCHEDULE, schedule);
  }

  static saveHolidays(holidays: Holiday[]): void {
    this.setItem(STORAGE_KEYS.HOLIDAYS, holidays);
  }

  static saveAttendanceDays(days: AttendanceDay[]): void {
    this.setItem(STORAGE_KEYS.ATTENDANCE_DAYS, days);
  }

  static saveAppSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.APP_SETTINGS, settings);
  }

  static saveSelectedMonth(month: string): void {
    this.setItem(STORAGE_KEYS.SELECTED_MONTH, month);
  }

  static saveActiveTab(tab: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
  }

  static saveAuditLogs(logs: AuditLog[]): void {
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  static saveScenarios(scenarios: ProjectionScenario[]): void {
    this.setItem(STORAGE_KEYS.PROJECTION_SCENARIOS, scenarios);
  }

  static getReconciliationReport(): ReconciliationReport | null {
    return this.getItem<ReconciliationReport | null>(STORAGE_KEYS.RECONCILIATION_REPORT, null);
  }

  static saveReconciliationReport(report: ReconciliationReport | null): void {
    this.setItem(STORAGE_KEYS.RECONCILIATION_REPORT, report);
  }

  static getReconciliationAuditLogs(): ReconciliationAuditLog[] {
    return this.getItem<ReconciliationAuditLog[]>(STORAGE_KEYS.RECONCILIATION_AUDIT_LOGS, []);
  }

  static saveReconciliationAuditLogs(logs: ReconciliationAuditLog[]): void {
    this.setItem(STORAGE_KEYS.RECONCILIATION_AUDIT_LOGS, logs);
  }

  static getSalaryReconciliationRecords(): SalaryReconciliationRecord[] {
    return this.getItem<SalaryReconciliationRecord[]>(
      STORAGE_KEYS.SALARY_RECONCILIATION_RECORDS, 
      INITIAL_SALARY_RECONCILIATION_RECORDS
    );
  }

  static saveSalaryReconciliationRecords(records: SalaryReconciliationRecord[]): void {
    this.setItem(STORAGE_KEYS.SALARY_RECONCILIATION_RECORDS, records);
  }

  static getSalaryReconciliationRecord(month: string): SalaryReconciliationRecord | undefined {
    const records = this.getSalaryReconciliationRecords();
    return records.find(r => r.month === month);
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AuditLog {
    const existing = this.getAuditLogs();
    const newEntry: AuditLog = {
      id: log.id || `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      fieldChanged: log.fieldChanged,
      oldValue: log.oldValue,
      newValue: log.newValue,
      reason: log.reason,
      userId: log.userId || 'EMP-2026-884',
    };
    const updated = [newEntry, ...existing];
    this.saveAuditLogs(updated);
    return newEntry;
  }

  /**
   * Approximate total storage footprint in bytes used in localStorage
   */
  static getStorageFootprintBytes(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('salarypulse_')) {
          total += (localStorage[key].length * 2); // 2 bytes per char in UTF-16
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  /**
   * Reset everything back to pristine factory defaults
   */
  static resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SALARY_CONFIG);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_DAYS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_MONTH);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTION_SCENARIOS);
      localStorage.removeItem(STORAGE_KEYS.RECONCILIATION_REPORT);
      localStorage.removeItem(STORAGE_KEYS.RECONCILIATION_AUDIT_LOGS);
      localStorage.removeItem(STORAGE_KEYS.SALARY_RECONCILIATION_RECORDS);
      localStorage.removeItem(STORAGE_KEYS.ROLLBACK_SNAPSHOT);
      localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    } catch (e) {
      console.warn('StorageService: Failed to clear storage', e);
    }
  }

  // --- HELPER UTILITIES ---
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`StorageService: Failed to save ${key}`, e);
    }
  }
}
