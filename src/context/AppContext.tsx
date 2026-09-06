// ============================================================================
// SALARYPULSE — GLOBAL APPLICATION CONTEXT & LIVE ATTENDANCE ENGINE
// Authoritative calculation state, persistence binding, multi-session tracker,
// drift-free live timers, break countdowns, live salary tickers, and audit logging
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  AppSettings, 
  AttendanceDay, 
  AuditLog,
  BreakSession,
  DayCalculationDetails,
  DeductionRule,
  Holiday, 
  MonthlyRunningBreakdown,
  NavigationTab, 
  RateDerivation, 
  SalaryCalculation, 
  SalaryConfig, 
  SalaryPrediction, 
  User, 
  WorkdayStatus,
  WorkSchedule, 
  WorkSession,
  AssumptionType,
  ProjectionDay,
  ProjectionScenario,
  MonthlyProjectionResult,
  ScenarioComparisonItem,
  ExtractedDayRecord,
  ExtractedEmployee,
  ReconciliationAuditLog,
  ReconciliationItem,
  ReconciliationReport,
  ResolutionChoice,
  SalaryReconciliationRecord,
  OfficialPayrollSlip,
  ActualBankReceipt,
  ResolutionStatus,
  YearlySalarySummaryItem,
  PulseCalculatedSummary
} from '../types';
import { StorageService, DEFAULT_APP_SETTINGS } from '../persistence/storage';
import { SalaryEngine } from '../engine/salaryEngine';
import { PredictionEngine } from '../engine/predictionEngine';
import { DayEngine } from '../engine/dayEngine';
import { ReconciliationEngine } from '../engine/reconciliationEngine';
import { SalaryReconciliationEngine } from '../engine/salaryReconciliationEngine';
import { SAMPLE_OFFICE_REPORTS } from '../data/sampleAttendancePdfs';
import { AttendanceEngine, ClockInAnalysisReport, ClockInLogItem } from '../engine/attendanceEngine';
import { WorkSessionEngine, LunchBreakStats, LiveOvertimeEvaluation, DayActiveResult } from '../engine/workSessionEngine';
import { runEngineTests, TestCaseResult } from '../engine/testCases';
import { BackupRestoreEngine } from '../engine/backupRestoreEngine';
import { DataIntegrityEngine } from '../engine/dataIntegrityEngine';
import { AnalyticsEngine } from '../engine/analyticsEngine';
import { NotificationEngine } from '../engine/notificationEngine';
import { NotificationService } from '../services/notificationService';
import { formatTimeDisplay, formatDurationHM } from '../utils/formatters';
import { runStep9Tests, Step9TestCaseResult } from '../engine/step9TestCases';
import { runStep11ComprehensiveQA, Step11TestCaseResult } from '../engine/step11VerificationRunner';
import { 
  FullBackupPayload, 
  EncryptedBackupPayload,
  RestoreInspectionResult, 
  MergeInspectionResult, 
  MergeConflictResolution,
  DataIntegrityReport,
  SystemHealthStatus,
  HistoricalConfigDiff
} from '../types';
import {
  INITIAL_ATTENDANCE_DAYS,
  INITIAL_HOLIDAYS,
  INITIAL_SALARY_CONFIG,
  INITIAL_SCHEDULE,
  INITIAL_USER,
  INITIAL_SALARY_RECONCILIATION_RECORDS
} from '../persistence/initialData';

export interface TodayEstimatedTime {
  completionDate: Date | null;
  formattedTime: string | null;
  formattedClockTime: string | null;
  totalRemainingClockSeconds: number;
  isCompleted?: boolean;
}

interface AppContextType {
  // Navigation & Active Month
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;

  // Domain Entities
  user: User;
  updateUser: (user: User) => void;
  salaryConfig: SalaryConfig;
  updateSalaryConfig: (config: Partial<SalaryConfig>) => void;
  schedule: WorkSchedule;
  updateSchedule: (schedule: Partial<WorkSchedule>) => void;
  holidays: Holiday[];
  updateHolidays: (holidays: Holiday[]) => void;
  attendanceDays: AttendanceDay[];
  updateAttendanceDay: (day: AttendanceDay) => void;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;

  // Deductions alias
  deductions: DeductionRule[];

  // Bonus Manual Override
  bonusApprovalState: boolean | undefined;
  setBonusApproval: (approved: boolean) => void;

  // Authoritative Derived Calculations (From SalaryEngine)
  rateDerivation: RateDerivation;
  salaryCalculation: SalaryCalculation;
  getRatesForMonth: (yearMonth: string) => RateDerivation;

  // Step 4: Authoritative Calendar & Running-Month Engine
  monthlyDaysDetails: DayCalculationDetails[];
  monthlyRunningSummary: MonthlyRunningBreakdown;
  getDayDetails: (dateStr: string) => DayCalculationDetails;
  editAttendanceDayWithAudit: (updatedDay: AttendanceDay, reason: string) => void;

  // Step 5: Scenario & Running-Month Salary Prediction
  scenarios: ProjectionScenario[];
  activeScenarioId: string;
  activeScenario: ProjectionScenario;
  selectedMonthProjection: MonthlyProjectionResult;
  createScenario: (name: string, assumptionType?: AssumptionType) => ProjectionScenario;
  updateScenario: (scenario: ProjectionScenario) => void;
  updateScenarioFutureDay: (dateStr: string, updates: Partial<ProjectionDay>) => void;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string) => ProjectionScenario;
  resetScenarioToDefault: (id: string) => void;
  setActiveScenarioId: (id: string) => void;
  scenarioComparison: ScenarioComparisonItem[];

  // Real-Time Live Work & Attendance State (Drift-Free Timestamp Engine)
  todayDate: string;
  setTodayDate: (date: string) => void;
  startNewDay: (dateStr?: string) => { success: boolean; date: string };
  deleteAttendanceDay: (dateStr: string, reason?: string) => { success: boolean; message?: string };
  reopenDay: (dateStr?: string, reason?: string) => { success: boolean };
  todayAttendance: AttendanceDay;
  isWorking: boolean;
  isCurrentlyWorking: boolean;
  isOnBreak: boolean;
  currentWorkdayStatus: WorkdayStatus;
  openWorkSession: WorkSession | undefined;
  openBreakSession: BreakSession | undefined;
  activeWorkResult: DayActiveResult;
  
  // Real-time metrics
  todayCompletedActiveSeconds: number;
  todayLiveActiveSeconds: number;
  todayLiveBreakSeconds: number;
  todayLiveEarned: number;
  todayRemainingActiveSeconds: number;
  todayEstimatedCompletion: TodayEstimatedTime;
  projectedFinishTime: string | null;
  lunchStats: LunchBreakStats;
  liveOtInfo: LiveOvertimeEvaluation;
  
  // High-Precision Punch & Session Actions
  startWork: (note?: string, customStartTime?: string) => { success: boolean; message?: string };
  pauseWork: (note?: string, customEndTime?: string) => { success: boolean; message?: string };
  startBreak: (type?: 'lunch' | 'tea' | 'personal' | 'custom' | string, note?: string, customStartTime?: string) => { success: boolean; message?: string };
  endBreak: (note?: string, customEndTime?: string) => { success: boolean; message?: string };
  resumeWork: (note?: string, customTimestamp?: string) => { success: boolean; message?: string };
  endWork: (note?: string, customEndTime?: string) => { success: boolean; summary?: Record<string, number | string>; message?: string };
  endDay: (note?: string, customEndTime?: string) => { success: boolean; summary?: Record<string, number | string>; message?: string };
  editPunchOut: (dateStr: string, newPunchOutIso: string, reason: string) => { success: boolean; message?: string };
  editPunchIn: (dateStr: string, newPunchInIso: string, reason: string) => { success: boolean; message?: string };
  
  // Manual Time Entry & Audit Management
  correctWorkSession: (sessionId: string, updates: Partial<WorkSession>, reason: string) => void;
  correctBreakSession: (sessionId: string, updates: Partial<BreakSession>, reason: string) => void;
  addManualWorkSession: (session: Omit<WorkSession, 'id'>, reason: string) => void;
  addManualBreakSession: (breakSession: Omit<BreakSession, 'id'>, reason: string) => void;
  deleteSession: (sessionId: string, isBreak: boolean, reason: string) => void;
  auditLogs: AuditLog[];
  
  // Step 6: PDF Biometric Attendance Reconciliation Engine
  reconciliationReport: ReconciliationReport | null;
  reconciliationAuditLogs: ReconciliationAuditLog[];
  runReconciliation: (fileName: string, targetEmployeeName: string, records: ExtractedDayRecord[], employees: ExtractedEmployee[]) => ReconciliationReport;
  toggleReconciliationItemSelection: (itemId: string, selected?: boolean) => void;
  selectAllReconciliationItems: (selected: boolean, onlyDiscrepancies?: boolean) => void;
  setReconciliationItemResolution: (itemId: string, resolution: ResolutionChoice) => void;
  applyReconciliationCorrections: (selectedItemIds?: string[]) => { updatedCount: number; netGain: number; auditLog: ReconciliationAuditLog };
  rollbackReconciliation: (auditLogId: string) => void;
  clearReconciliationReport: () => void;

  // Step 7: Official 3-Way Salary Reconciliation Engine
  salaryReconciliationRecords: SalaryReconciliationRecord[];
  currentSalaryReconciliation: SalaryReconciliationRecord;
  updateOfficialSlip: (month: string, updates: Partial<OfficialPayrollSlip>) => void;
  updateBankReceipt: (month: string, updates: Partial<ActualBankReceipt>) => void;
  updateDiscrepancyResolution: (month: string, discrepancyId: string, resolution: ResolutionStatus, userNote?: string) => void;
  lockSalaryReconciliation: (month: string, auditNote?: string) => void;
  unlockSalaryReconciliation: (month: string, reason: string) => void;
  prefillOfficialSlipFromPulse: (month: string) => void;
  updateDisputeDetails: (month: string, disputeNotes: string, disputeStatus?: 'NONE' | 'DRAFTED' | 'SUBMITTED' | 'RESOLVED_ACCEPTED' | 'ADJUSTED_NEXT_MONTH', ticketRef?: string) => void;
  yearlySalarySummaries: YearlySalarySummaryItem[];

  // Step 9: Production Hardening, Backup, Export & Data Integrity Engine
  createBackup: (isEncrypted?: boolean, password?: string) => Promise<{ success: boolean; filename: string; error?: string }>;
  inspectBackupFile: (fileContent: string) => Promise<RestoreInspectionResult>;
  decryptBackupFile: (encryptedPayload: EncryptedBackupPayload, password: string) => Promise<FullBackupPayload>;
  inspectMerge: (backupPayload: FullBackupPayload) => MergeInspectionResult;
  executeRestoreBackup: (backupPayload: FullBackupPayload, mode: 'REPLACE' | 'MERGE', conflictResolutions?: Map<string, MergeConflictResolution>) => Promise<{ success: boolean; message: string; error?: string }>;
  rebuildCalculations: () => { success: boolean; refreshedDaysCount: number; timestamp: string };
  runIntegrityCheck: () => DataIntegrityReport;
  exportAttendanceCSV: () => void;
  exportPayrollCSV: () => void;
  exportAnalyticsCSV: () => void;
  resetApplicationDataWithSafetyBackup: () => Promise<void>;
  systemHealth: SystemHealthStatus;
  historicalConfigDiffs: HistoricalConfigDiff[];
  integrityReport: DataIntegrityReport;
  step9TestResults: Step9TestCaseResult[];
  rerunStep9Tests: () => Promise<Step9TestCaseResult[]>;
  step11TestResults: Step11TestCaseResult[];
  rerunStep11Tests: () => Promise<Step11TestCaseResult[]>;
  
  // Compatibility Aliases for Views
  currentLiveSeconds: number;
  currentDayAttendance: AttendanceDay | undefined;
  punchIn: (note?: string) => void;
  punchOut: (note?: string) => void;

  // Reset & Verification
  resetAllData: () => void;
  deleteAllData: (options?: { resetSalaryConfig?: boolean; preserveUser?: boolean }) => Promise<{ success: boolean; message: string }>;
  importAttendanceDataWithConfig: (params: {
    salaryConfig?: Partial<SalaryConfig>;
    schedule?: Partial<WorkSchedule>;
    attendanceDays: AttendanceDay[];
    mode: 'REPLACE' | 'APPEND';
  }) => Promise<{ success: boolean; message: string; count: number }>;
  clockInAnalysisReport: ClockInAnalysisReport;
  testResults: TestCaseResult[];
  rerunTests: () => TestCaseResult[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Ensure storage is initialized and seeded before React state hooks read from persistence
StorageService.initStorage();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State initialization from persistence
  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    return (StorageService.getActiveTab() as NavigationTab) || 'live-work';
  });

  const [selectedMonth, setSelectedMonthState] = useState<string>(() => {
    return StorageService.getSelectedMonth() || '2026-09';
  });

  const [user, setUserState] = useState<User>(() => StorageService.getUser());
  const [salaryConfig, setSalaryConfigState] = useState<SalaryConfig>(() => StorageService.getSalaryConfig());
  const [schedule, setScheduleState] = useState<WorkSchedule>(() => StorageService.getSchedule());
  const [holidays, setHolidaysState] = useState<Holiday[]>(() => StorageService.getHolidays());
  const [attendanceDays, setAttendanceDaysState] = useState<AttendanceDay[]>(() => StorageService.getAttendanceDays());
  const [appSettings, setAppSettingsState] = useState<AppSettings>(() => StorageService.getAppSettings());
  const [auditLogs, setAuditLogsState] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [bonusApprovalState, setBonusApprovalState] = useState<boolean | undefined>(true);
  const [testResults, setTestResults] = useState<TestCaseResult[]>(() => runEngineTests());

  // Active reference date for live tracking, with persistent local sync
  const [todayDate, setTodayDateState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('salarypulse_active_today_date');
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return saved;
    } catch {
      // ignore
    }
    return '2026-09-05';
  });

  const setTodayDate = (date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    setTodayDateState(date);
    try {
      localStorage.setItem('salarypulse_active_today_date', date);
    } catch {
      // ignore
    }
    // Also auto-sync selectedMonth if date belongs to a different month
    const ym = date.slice(0, 7);
    if (ym !== selectedMonth) {
      setSelectedMonthState(ym);
      StorageService.saveSelectedMonth(ym);
    }
  };

  const startNewDay = (dateStr?: string): { success: boolean; date: string } => {
    let targetDate = dateStr;
    if (!targetDate) {
      // Calculate next calendar day from current todayDate
      const current = new Date(`${todayDate}T12:00:00`);
      current.setDate(current.getDate() + 1);
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      targetDate = `${y}-${m}-${d}`;
    }

    setTodayDate(targetDate);

    // If attendance record doesn't exist for targetDate, initialize it
    const existing = attendanceDays.find(d => d.date === targetDate);
    if (!existing) {
      const newDay: AttendanceDay = {
        id: `att-${targetDate}`,
        date: targetDate,
        status: 'PRESENT',
        workdayStatus: 'NOT_STARTED',
        totalActiveSeconds: 0,
        creditedNormalSeconds: 0,
        totalBreakSeconds: 0,
        overtimeSeconds: 0,
        workSessions: [],
        breakSessions: [],
        source: 'DEVICE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updateAttendanceDay(newDay);
    }

    const newLog = StorageService.addAuditLog({
      entityType: 'attendance',
      entityId: `att-${targetDate}`,
      action: 'CREATE',
      fieldChanged: 'todayDate',
      oldValue: todayDate,
      newValue: targetDate,
      reason: `Started new workday session for ${targetDate}`,
      userId: user.id,
    });
    setAuditLogsState(prev => [newLog, ...prev]);

    return { success: true, date: targetDate };
  };

  const deleteAttendanceDay = (dateStr: string, reason?: string): { success: boolean; message?: string } => {
    const existing = attendanceDays.find(d => d.date === dateStr);
    
    setAttendanceDaysState(prev => {
      const filtered = prev.filter(d => d.date !== dateStr);
      StorageService.saveAttendanceDays(filtered);
      return filtered;
    });

    const auditLog = StorageService.addAuditLog({
      entityType: 'attendance',
      entityId: existing?.id || `att-${dateStr}`,
      action: 'DELETE',
      fieldChanged: 'dayRecord',
      oldValue: existing ? JSON.stringify(existing) : 'none',
      newValue: 'DELETED',
      reason: reason || `Manual Attendance Day Deletion for ${dateStr}`,
      userId: user.id,
    });
    setAuditLogsState(prev => [auditLog, ...prev]);

    return { success: true, message: `Record for ${dateStr} successfully deleted.` };
  };

  const reopenDay = (dateStr?: string, reason?: string): { success: boolean } => {
    const targetDate = dateStr || todayDate;
    const existing = attendanceDays.find(d => d.date === targetDate) || todayAttendance;
    
    const updatedDay: AttendanceDay = {
      ...existing,
      workdayStatus: 'WORKING',
      status: 'PRESENT',
      finishedAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    updateAttendanceDay(updatedDay);
    
    const newLog = StorageService.addAuditLog({
      entityType: 'attendance',
      entityId: updatedDay.id || `att-${targetDate}`,
      action: 'CORRECTION',
      fieldChanged: 'workdayStatus',
      oldValue: existing.workdayStatus,
      newValue: 'WORKING (Re-opened)',
      reason: reason || 'User re-opened day shift for active work',
      userId: user.id,
    });
    setAuditLogsState(prev => [newLog, ...prev]);
    return { success: true };
  };

  // Step 5: Scenario & Prediction State initialization
  const [scenarios, setScenariosState] = useState<ProjectionScenario[]>(() => {
    const saved = StorageService.getScenarios();
    if (saved && saved.length > 0) return saved;
    
    // Create initial rich presets for 2026-08
    const initSchedule = StorageService.getSchedule();
    const initHolidays = StorageService.getHolidays();
    
    const expected = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'EXPECTED');
    const bestCase = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'BEST_CASE');
    const worstCase = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'WORST_CASE');
    
    // Custom scenario preset: 2 Days Planned Leave
    const customLeave = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'EXPECTED');
    customLeave.id = 'scenario-2026-08-custom-leave';
    customLeave.name = '2 Days Leave Plan';
    customLeave.assumptionType = 'CUSTOM';
    customLeave.futureDays = customLeave.futureDays.map(d => {
      if (d.date === '2026-08-25' || d.date === '2026-08-26') {
        return {
          ...d,
          status: 'UNPAID_LEAVE',
          plannedWorkSeconds: 0,
          plannedBreakSeconds: 0,
          notes: 'Planned personal leave',
        };
      }
      return d;
    });

    const initialScenarios = [expected, customLeave, bestCase, worstCase];
    StorageService.saveScenarios(initialScenarios);
    return initialScenarios;
  });

  const [activeScenarioId, setActiveScenarioIdState] = useState<string>(() => {
    return scenarios[0]?.id || 'scenario-2026-08-default';
  });

  // Step 6: Reconciliation State
  const [reconciliationReport, setReconciliationReport] = useState<ReconciliationReport | null>(() => {
    return StorageService.getReconciliationReport();
  });

  const [reconciliationAuditLogs, setReconciliationAuditLogs] = useState<ReconciliationAuditLog[]>(() => {
    return StorageService.getReconciliationAuditLogs();
  });

  // Step 7: Salary Reconciliation State
  const [salaryReconciliationRecords, setSalaryReconciliationRecords] = useState<SalaryReconciliationRecord[]>(() => {
    return StorageService.getSalaryReconciliationRecords();
  });

  // Real-time ticking state: increments a tick every 1000ms so that Date.now() timestamp comparisons update smoothly
  const [clockTick, setClockTick] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Setters with persistent storage sync
  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    StorageService.saveActiveTab(tab);
  };

  const setSelectedMonth = (month: string) => {
    setSelectedMonthState(month);
    StorageService.saveSelectedMonth(month);
  };

  const updateUser = (updatedUser: User) => {
    setUserState(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  const updateSalaryConfig = (partial: Partial<SalaryConfig>) => {
    setSalaryConfigState(prev => {
      const next = { ...prev, ...partial };
      StorageService.saveSalaryConfig(next);
      return next;
    });
  };

  const updateSchedule = (partial: Partial<WorkSchedule>) => {
    setScheduleState(prev => {
      const next = { ...prev, ...partial };
      StorageService.saveSchedule(next);
      return next;
    });
  };

  const updateHolidays = (updatedHolidays: Holiday[]) => {
    setHolidaysState(updatedHolidays);
    StorageService.saveHolidays(updatedHolidays);
  };

  const updateAttendanceDay = (updatedDay: AttendanceDay) => {
    setAttendanceDaysState(prev => {
      const index = prev.findIndex(d => d.id === updatedDay.id || d.date === updatedDay.date);
      let next: AttendanceDay[];
      if (index >= 0) {
        next = [...prev];
        next[index] = updatedDay;
      } else {
        next = [...prev, updatedDay];
      }
      StorageService.saveAttendanceDays(next);
      return next;
    });
  };

  const updateAppSettings = (partial: Partial<AppSettings>) => {
    setAppSettingsState(prev => {
      const next = { ...prev, ...partial };
      StorageService.saveAppSettings(next);
      return next;
    });
  };

  const setBonusApproval = (approved: boolean) => {
    setBonusApprovalState(approved);
  };

  // Authoritative Rate Derivation helper for any arbitrary month
  const getRatesForMonth = (yearMonth: string): RateDerivation => {
    return SalaryEngine.deriveRates(yearMonth, salaryConfig, schedule, holidays);
  };

  // Authoritative Rate Derivation for active selected month
  const rateDerivation = useMemo(() => {
    return SalaryEngine.deriveRates(selectedMonth, salaryConfig, schedule, holidays);
  }, [selectedMonth, salaryConfig, schedule, holidays]);

  // --------------------------------------------------------------------------
  // LIVE WORK & ATTENDANCE ENGINE (DRIFT-FREE TIMESTAMP CALCULATIONS)
  // --------------------------------------------------------------------------

  // Retrieve or create authoritative AttendanceDay record for today
  const todayAttendance: AttendanceDay = useMemo(() => {
    const existing = attendanceDays.find(d => d.date === todayDate);
    if (existing) return existing;

    const newDay: AttendanceDay = {
      id: `att-${todayDate}`,
      date: todayDate,
      status: 'PRESENT',
      workdayStatus: 'NOT_STARTED',
      totalActiveSeconds: 0,
      creditedNormalSeconds: 0,
      totalBreakSeconds: 0,
      overtimeSeconds: 0,
      workSessions: [],
      breakSessions: [],
      source: 'DEVICE',
    };
    return newDay;
  }, [attendanceDays, todayDate]);

  // Derive live active work & break stats from timestamps (zero timer drift)
  const nowIso = useMemo(() => new Date(clockTick).toISOString(), [clockTick]);

  const configuredLunchSeconds = useMemo(() => {
    const lunchRule = schedule?.breakRules?.find(r => r.type === 'lunch' || r.id === 'brk-lunch');
    return ((schedule?.defaultLunchDurationMinutes || lunchRule?.durationMinutes || 60) * 60);
  }, [schedule]);

  const activeWorkResult = useMemo(() => {
    return WorkSessionEngine.calculateDayActiveSeconds(
      todayAttendance.workSessions, 
      nowIso, 
      todayAttendance.date,
      12,
      configuredLunchSeconds,
      todayAttendance.breakSessions,
      todayAttendance.firstPunchIn,
      todayAttendance.lastPunchOut
    );
  }, [todayAttendance.workSessions, todayAttendance.breakSessions, todayAttendance.firstPunchIn, todayAttendance.lastPunchOut, todayAttendance.date, nowIso, configuredLunchSeconds]);

  const breakResult = useMemo(() => {
    return WorkSessionEngine.calculateDayBreakSeconds(todayAttendance.breakSessions, schedule, nowIso);
  }, [todayAttendance.breakSessions, schedule, nowIso]);

  const isCurrentlyWorking = activeWorkResult.isOpen && !breakResult.activeBreak;
  const isOnBreak = !!breakResult.activeBreak;
  const openWorkSession = activeWorkResult.openSession;
  const openBreakSession = breakResult.activeBreak;

  const currentWorkdayStatus: WorkdayStatus = useMemo(() => {
    if (todayAttendance.workdayStatus === 'COMPLETED') return 'COMPLETED';
    if (isOnBreak) return 'ON_BREAK';
    if (isCurrentlyWorking) return 'WORKING';
    if (activeWorkResult.totalActiveSeconds > 0) return 'PARTIAL';
    return 'NOT_STARTED';
  }, [todayAttendance.workdayStatus, isOnBreak, isCurrentlyWorking, activeWorkResult.totalActiveSeconds]);

  const todayCompletedActiveSeconds = activeWorkResult.completedSeconds;
  const todayLiveActiveSeconds = activeWorkResult.totalActiveSeconds;
  const todayLiveBreakSeconds = breakResult.totalBreakSeconds;

  const todayRemainingActiveSeconds = useMemo(() => {
    return WorkSessionEngine.calculateRemainingActiveSeconds(
      schedule.requiredActiveHoursPerDay || 8.0,
      todayLiveActiveSeconds
    );
  }, [schedule.requiredActiveHoursPerDay, todayLiveActiveSeconds]);

  // Lunch Break stats
  const lunchStats = breakResult.lunchStats;

  // Overtime live transition evaluation
  const liveOtInfo = useMemo(() => {
    // Calculate prior eligible seconds in this month (excluding today)
    const priorDays = attendanceDays.filter(d => d.date.startsWith(selectedMonth) && d.date !== todayDate);
    const priorEligibleSeconds = priorDays.reduce((acc, d) => acc + (d.totalActiveSeconds || 0), 0);
    const monthTargetSeconds = SalaryEngine.getMonthlyTargetSeconds(selectedMonth, schedule, holidays);

    return WorkSessionEngine.evaluateLiveOvertime(
      todayLiveActiveSeconds,
      schedule.requiredActiveHoursPerDay || 8.0,
      priorEligibleSeconds,
      monthTargetSeconds,
      salaryConfig.overtimeMethod === 'daily_threshold' ? 'daily_threshold' : 'monthly_threshold',
      false,
      salaryConfig.weeklyOffWorkRule
    );
  }, [attendanceDays, selectedMonth, todayDate, todayLiveActiveSeconds, schedule, holidays, salaryConfig]);

  // Live Realtime Accrual Ticker (Yield) derived from authoritative SalaryEngine rates
  const todayLiveEarned = useMemo(() => {
    const normalSec = liveOtInfo.normalSecondsToday;
    const otSec = liveOtInfo.overtimeSecondsToday;
    const earned = (normalSec * rateDerivation.perSecondRate) + (otSec * rateDerivation.overtimeSecondRate);
    return Number(earned.toFixed(2));
  }, [liveOtInfo, rateDerivation]);

  // Dynamic Completion Time Estimation (Exact time to finish shift target based on remaining active work)
  const todayEstimatedCompletion = useMemo((): TodayEstimatedTime => {
    const isWorkConcluded =
      todayAttendance.workdayStatus === 'COMPLETED' ||
      (!isCurrentlyWorking && !isOnBreak && (!!todayAttendance.lastPunchOut || !!todayAttendance.finishedAt));

    // When End Work is triggered and isWorking becomes false, or when workday is concluded,
    // reset/hide projected finish by returning null values to prevent stale projection data.
    if (isWorkConcluded || (!isCurrentlyWorking && !isOnBreak)) {
      return {
        completionDate: null,
        formattedTime: null,
        formattedClockTime: null,
        totalRemainingClockSeconds: isWorkConcluded ? 0 : todayRemainingActiveSeconds,
        isCompleted: isWorkConcluded || todayRemainingActiveSeconds <= 0,
      };
    }

    if (todayRemainingActiveSeconds <= 0) {
      return {
        completionDate: new Date(),
        formattedTime: 'Target Completed',
        formattedClockTime: '--:--:--',
        totalRemainingClockSeconds: 0,
        isCompleted: true,
      };
    }

    return WorkSessionEngine.estimateCompletionTime(
      new Date(),
      todayRemainingActiveSeconds,
      0
    );
  }, [
    todayRemainingActiveSeconds,
    todayAttendance.workdayStatus,
    todayAttendance.lastPunchOut,
    todayAttendance.finishedAt,
    isCurrentlyWorking,
    isOnBreak
  ]);

  // Explicit Projected Finish: Conditionally hidden or set to null when 'End Work' is triggered and isWorking becomes false
  const projectedFinishTime = useMemo((): string | null => {
    const isWorkConcluded =
      todayAttendance.workdayStatus === 'COMPLETED' ||
      (!isCurrentlyWorking && !isOnBreak && (!!todayAttendance.lastPunchOut || !!todayAttendance.finishedAt));

    if (isWorkConcluded || !isCurrentlyWorking || todayRemainingActiveSeconds <= 0) {
      return null;
    }

    if (!todayEstimatedCompletion.formattedTime || 
        todayEstimatedCompletion.formattedTime === '--:--' || 
        todayEstimatedCompletion.formattedTime === 'Target Completed' || 
        todayEstimatedCompletion.formattedTime === 'Workday Concluded') {
      return null;
    }

    return todayEstimatedCompletion.formattedTime;
  }, [
    todayAttendance.workdayStatus,
    todayAttendance.lastPunchOut,
    todayAttendance.finishedAt,
    isCurrentlyWorking,
    isOnBreak,
    todayRemainingActiveSeconds,
    todayEstimatedCompletion.formattedTime
  ]);

  // Authoritative Comprehensive Salary Calculation for active selected month (Real-time live accruing)
  const salaryCalculation = useMemo(() => {
    return SalaryEngine.calculateMonthlySalary(
      selectedMonth,
      salaryConfig,
      schedule,
      attendanceDays,
      holidays,
      salaryConfig.deductions,
      bonusApprovalState,
      {
        todayDate,
        liveActiveSeconds: todayLiveActiveSeconds,
        liveBreakSeconds: todayLiveBreakSeconds,
        liveOtSeconds: liveOtInfo.overtimeSecondsToday,
        liveEarned: todayLiveEarned,
      }
    );
  }, [
    selectedMonth, 
    salaryConfig, 
    schedule, 
    attendanceDays, 
    holidays, 
    bonusApprovalState,
    todayDate,
    todayLiveActiveSeconds,
    todayLiveBreakSeconds,
    liveOtInfo.overtimeSecondsToday,
    todayLiveEarned
  ]);

  // --------------------------------------------------------------------------
  // HIGH-PRECISION PUNCH & ACTION HANDLERS
  // --------------------------------------------------------------------------

  const logAudit = (action: AuditLog['action'], fieldChanged?: string, oldValue?: string, newValue?: string, reason?: string) => {
    const newLog = StorageService.addAuditLog({
      entityType: 'attendance',
      entityId: todayAttendance.id,
      action,
      fieldChanged,
      oldValue,
      newValue,
      reason: reason || 'Live Attendance Engine Event',
      userId: user.id,
    });
    setAuditLogsState(prev => [newLog, ...prev]);
  };

  /**
   * 1. Start Work / Punch In
   */
  const startWork = (note?: string, customStartTime?: string): { success: boolean; message?: string } => {
    if (isCurrentlyWorking) {
      return { success: false, message: "You're already clocked in to an active session." };
    }

    const timestamp = customStartTime || new Date().toISOString();
    const newWorkSession: WorkSession = {
      id: `ws-${Date.now()}`,
      attendanceDayId: todayAttendance.id,
      startTime: timestamp,
      durationSeconds: 0,
      status: 'OPEN',
      source: customStartTime ? 'MANUAL' : 'DEVICE',
      note: note || (todayAttendance.workSessions.length === 0 ? 'Session 1' : `Session ${todayAttendance.workSessions.length + 1}`),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    let updatedBreakSessions = [...todayAttendance.breakSessions];
    // If currently on break, end break first
    if (isOnBreak && openBreakSession) {
      updatedBreakSessions = updatedBreakSessions.map(b => {
        if (b.id === openBreakSession.id) {
          const dur = WorkSessionEngine.getDurationSeconds(b.startTime, timestamp);
          return { ...b, endTime: timestamp, durationSeconds: dur, updatedAt: timestamp };
        }
        return b;
      });
    }

    const updatedWorkSessions = [...todayAttendance.workSessions, newWorkSession];
    const firstPunch = todayAttendance.firstPunchIn || timestamp;

    // Evaluate punctuality against 09:00 AM standard shift
    let punctualityTag = '';
    const schedStart = schedule.officeStartTime || '09:00';
    const [startH, startM] = schedStart.split(':').map(Number);
    const timePart = timestamp.includes('T') ? timestamp.split('T')[1].substring(0, 5) : timestamp.substring(0, 5);
    const [pH, pM] = timePart.split(':').map(Number);
    if (!isNaN(pH) && !isNaN(pM)) {
      const diffMin = (pH * 60 + pM) - (startH * 60 + startM);
      if (diffMin > 0) punctualityTag = ` [Late Entry by ${diffMin}m]`;
      else if (diffMin < 0) punctualityTag = ` [Early Entry by ${Math.abs(diffMin)}m]`;
      else punctualityTag = ` [On Time (09:00)]`;
    }

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      status: 'PRESENT',
      workdayStatus: 'WORKING',
      firstPunchIn: firstPunch,
      workSessions: updatedWorkSessions,
      breakSessions: updatedBreakSessions,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('PUNCH_IN', 'workSessions', 'CLOSED', `OPEN (${timestamp})${punctualityTag}`, note);

    // Trigger visual 'Success' toast notification for check-in
    NotificationService.pushInAppNotification({
      id: `toast-checkin-${Date.now()}`,
      title: 'Checked In Successfully',
      message: `Work session started at ${formatTimeDisplay(timestamp)}${punctualityTag ? ` · ${punctualityTag.trim()}` : ''}. Accruing live salary!`,
      severity: 'success',
      timestamp,
      milestoneKey: 'check-in',
      autoDismissMs: 4000,
    });

    return { success: true };
  };

  /**
   * 2. Pause Work / Punch Out
   */
  const pauseWork = (note?: string, customEndTime?: string): { success: boolean; message?: string } => {
    if (!openWorkSession && !openBreakSession) {
      return { success: false, message: 'No active session is currently open.' };
    }

    const timestamp = customEndTime || new Date().toISOString();

    const updatedWorkSessions = todayAttendance.workSessions.map(ws => {
      if (!ws.endTime) {
        const dur = WorkSessionEngine.getDurationSeconds(ws.startTime, timestamp);
        return {
          ...ws,
          endTime: timestamp,
          durationSeconds: dur,
          status: 'COMPLETED' as const,
          note: note || ws.note,
          updatedAt: timestamp,
        };
      }
      return ws;
    });

    const updatedBreakSessions = todayAttendance.breakSessions.map(bs => {
      if (!bs.endTime) {
        const dur = WorkSessionEngine.getDurationSeconds(bs.startTime, timestamp);
        return {
          ...bs,
          endTime: timestamp,
          durationSeconds: dur,
          updatedAt: timestamp,
        };
      }
      return bs;
    });

    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);
    const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      workdayStatus: 'PARTIAL',
      totalActiveSeconds: activeSec,
      totalBreakSeconds: breakSec,
      lastPunchOut: timestamp,
      workSessions: updatedWorkSessions,
      breakSessions: updatedBreakSessions,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('PUNCH_OUT', 'workSessions', 'OPEN', `CLOSED (${timestamp})`, note);

    // Trigger visual 'Success' toast notification for check-out
    NotificationService.pushInAppNotification({
      id: `toast-checkout-${Date.now()}`,
      title: 'Checked Out Successfully',
      message: `Work session clocked out at ${formatTimeDisplay(timestamp)}. Total active today: ${formatDurationHM(activeSec)}.`,
      severity: 'success',
      timestamp,
      milestoneKey: 'check-out',
      autoDismissMs: 4000,
    });

    return { success: true };
  };

  /**
   * 3. Start Break
   */
  const startBreak = (
    type: 'lunch' | 'tea' | 'personal' | 'custom' | string = 'lunch',
    note?: string,
    customStartTime?: string
  ): { success: boolean; message?: string } => {
    const timestamp = customStartTime || new Date().toISOString();

    // Check if break type is paid according to schedule
    const breakRule = schedule.breakRules?.find(r => r.type === type || r.id === `brk-${type}`);
    const isPaid = breakRule ? breakRule.isPaid : (type === 'tea');

    // If active work session is open, close it cleanly
    const updatedWorkSessions = todayAttendance.workSessions.map(ws => {
      if (!ws.endTime) {
        const dur = WorkSessionEngine.getDurationSeconds(ws.startTime, timestamp);
        return {
          ...ws,
          endTime: timestamp,
          durationSeconds: dur,
          status: 'COMPLETED' as const,
          updatedAt: timestamp,
        };
      }
      return ws;
    });

    const newBreak: BreakSession = {
      id: `bs-${Date.now()}`,
      type,
      startTime: timestamp,
      durationSeconds: 0,
      isPaid,
      source: customStartTime ? 'MANUAL' : 'DEVICE',
      note: note || (type === 'lunch' ? 'Lunch Break' : type === 'tea' ? 'Tea Break' : 'Break'),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedBreakSessions = [...todayAttendance.breakSessions, newBreak];
    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      workdayStatus: 'ON_BREAK',
      totalActiveSeconds: activeSec,
      workSessions: updatedWorkSessions,
      breakSessions: updatedBreakSessions,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('START_BREAK', 'breakSessions', 'WORKING', `BREAK (${type})`, note);
    return { success: true };
  };

  /**
   * 4. End Break
   */
  const endBreak = (note?: string, customEndTime?: string): { success: boolean; message?: string } => {
    if (!openBreakSession) {
      return { success: false, message: 'No break session is currently active.' };
    }

    const timestamp = customEndTime || new Date().toISOString();

    const updatedBreakSessions = todayAttendance.breakSessions.map(b => {
      if (b.id === openBreakSession.id || !b.endTime) {
        const dur = WorkSessionEngine.getDurationSeconds(b.startTime, timestamp);
        return {
          ...b,
          endTime: timestamp,
          durationSeconds: dur,
          note: note || b.note,
          updatedAt: timestamp,
        };
      }
      return b;
    });

    const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      workdayStatus: 'PARTIAL',
      totalBreakSeconds: breakSec,
      breakSessions: updatedBreakSessions,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('END_BREAK', 'breakSessions', 'BREAK', 'RESUMED', note);
    return { success: true };
  };

  /**
   * 5. Resume Work
   */
  const resumeWork = (note?: string, customTimestamp?: string): { success: boolean; message?: string } => {
    const timestamp = customTimestamp || new Date().toISOString();
    let updatedBreakSessions = [...todayAttendance.breakSessions];
    let breakLogInfo = 'RESUMED';

    if (openBreakSession) {
      const configuredLunchSec = (schedule.defaultLunchDurationMinutes || 60) * 60;
      updatedBreakSessions = updatedBreakSessions.map(b => {
        if (b.id === openBreakSession.id || !b.endTime) {
          const dur = WorkSessionEngine.getDurationSeconds(b.startTime, timestamp);
          let bNote = b.note;
          if (b.type === 'lunch') {
            if (dur > configuredLunchSec) {
              const delaySec = dur - configuredLunchSec;
              const delayMin = Math.round(delaySec / 60);
              bNote = `${b.note || 'Lunch Break'} (1 Hour Lunch Over · Delayed by ${delayMin}m)`;
              breakLogInfo = `1h lunch over, delayed by ${delayMin}m (${delaySec}s)`;
            } else {
              breakLogInfo = `Lunch completed in ${Math.round(dur / 60)}m`;
            }
          }
          return {
            ...b,
            endTime: timestamp,
            durationSeconds: dur,
            note: bNote,
            source: customTimestamp ? ('MANUAL' as const) : b.source,
            updatedAt: timestamp,
          };
        }
        return b;
      });
    }

    const newSession: WorkSession = {
      id: `ws-${Date.now()}`,
      attendanceDayId: todayAttendance.id,
      startTime: timestamp,
      durationSeconds: 0,
      status: 'OPEN',
      source: customTimestamp ? 'MANUAL' : 'DEVICE',
      note: note || (todayAttendance.workSessions.length === 0 ? 'Session 1' : `Session ${todayAttendance.workSessions.length + 1}`),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedWorkSessions = [...todayAttendance.workSessions, newSession];
    const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      status: 'PRESENT',
      workdayStatus: 'WORKING',
      totalBreakSeconds: breakSec,
      workSessions: updatedWorkSessions,
      breakSessions: updatedBreakSessions,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('PUNCH_IN', 'workSessions', 'ON_BREAK', `RESUMED (${timestamp}) [${breakLogInfo}]`, note);

    // Trigger visual 'Success' toast notification for resuming check-in
    NotificationService.pushInAppNotification({
      id: `toast-checkin-resumed-${Date.now()}`,
      title: 'Checked In Successfully',
      message: `Work session resumed at ${formatTimeDisplay(timestamp)} (${breakLogInfo}). Accruing live salary!`,
      severity: 'success',
      timestamp,
      milestoneKey: 'check-in',
      autoDismissMs: 4000,
    });

    return { success: true };
  };

  /**
   * 6. End Day (Daily Completion Summary)
   * Supports manual biometric punch-out timestamp with full chronological validation
   */
  const endDay = (
    note?: string,
    customEndTime?: string
  ): { success: boolean; summary?: Record<string, number | string>; message?: string } => {
    const timestamp = customEndTime || new Date().toISOString();

    // Validation: End time cannot be earlier than open/latest session start time
    if (openWorkSession) {
      const startMs = new Date(openWorkSession.startTime).getTime();
      const endMs = new Date(timestamp).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
        return {
          success: false,
          message: `Clock-out time cannot be earlier than active session start (${openWorkSession.startTime.split('T')[1]?.slice(0, 8)}).`,
        };
      }
    }

    if (openBreakSession) {
      const startMs = new Date(openBreakSession.startTime).getTime();
      const endMs = new Date(timestamp).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
        return {
          success: false,
          message: `Clock-out time cannot be earlier than active break start (${openBreakSession.startTime.split('T')[1]?.slice(0, 8)}).`,
        };
      }
    }

    const updatedWorkSessions = todayAttendance.workSessions.map(ws => {
      if (!ws.endTime || ws.status === 'OPEN') {
        const dur = WorkSessionEngine.getDurationSeconds(ws.startTime, timestamp);
        return { 
          ...ws, 
          endTime: timestamp, 
          durationSeconds: Math.max(0, dur), 
          status: 'COMPLETED' as const, 
          source: customEndTime ? ('MANUAL' as const) : ws.source,
          updatedAt: timestamp 
        };
      }
      return ws;
    });

    const updatedBreakSessions = todayAttendance.breakSessions.map(bs => {
      if (!bs.endTime) {
        const dur = WorkSessionEngine.getDurationSeconds(bs.startTime, timestamp);
        return { 
          ...bs, 
          endTime: timestamp, 
          durationSeconds: Math.max(0, dur), 
          source: customEndTime ? ('MANUAL' as const) : bs.source,
          updatedAt: timestamp 
        };
      }
      return bs;
    });

    const finalActiveSec = WorkSessionEngine.calculateTotalActiveSeconds(
      updatedWorkSessions,
      updatedBreakSessions,
      todayAttendance.date,
      configuredLunchSeconds,
      todayAttendance.firstPunchIn,
      timestamp
    );
    const finalBreakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;
    const requiredSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    const normalSec = Math.min(finalActiveSec, requiredSec);
    const otSec = Math.max(0, finalActiveSec - requiredSec);

    const baseEarned = Number((normalSec * rateDerivation.perSecondRate).toFixed(2));
    const otEarned = Number((otSec * rateDerivation.overtimeSecondRate).toFixed(2));
    const totalDayPay = Number((baseEarned + otEarned).toFixed(2));

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      status: finalActiveSec >= (requiredSec * 0.5) ? 'PRESENT' : (finalActiveSec > 0 ? 'PARTIAL' : todayAttendance.status),
      workdayStatus: 'COMPLETED',
      finishedAt: timestamp,
      totalActiveSeconds: finalActiveSec,
      totalBreakSeconds: finalBreakSec,
      overtimeSeconds: otSec,
      lastPunchOut: timestamp,
      workSessions: updatedWorkSessions,
      breakSessions: updatedBreakSessions,
      notes: note || todayAttendance.notes,
      source: customEndTime ? 'MANUAL' : todayAttendance.source,
      updatedAt: timestamp,
    };

    updateAttendanceDay(updatedDay);
    logAudit('END_DAY', 'workdayStatus', todayAttendance.workdayStatus, `COMPLETED (${timestamp})`, note);
    logAudit('END_DAY', 'finishedAt', todayAttendance.finishedAt, timestamp, note || 'End Work workday concluded');

    // Trigger visual 'Success' toast notification for end-of-day check-out
    NotificationService.pushInAppNotification({
      id: `toast-checkout-end-${Date.now()}`,
      title: 'Checked Out Successfully',
      message: `Shift completed at ${formatTimeDisplay(timestamp)}. Total active: ${formatDurationHM(finalActiveSec)} · Estimated pay: ₹${totalDayPay.toFixed(0)}.`,
      severity: 'success',
      timestamp,
      milestoneKey: 'check-out',
      autoDismissMs: 4500,
    });

    return {
      success: true,
      summary: {
        totalActiveSeconds: finalActiveSec,
        totalActiveHours: (finalActiveSec / 3600).toFixed(2),
        totalBreakSeconds: finalBreakSec,
        normalSeconds: normalSec,
        overtimeSeconds: otSec,
        baseEarned,
        overtimeEarned: otEarned,
        totalDayPay,
      },
    };
  };

  /**
   * 7. Direct Punch-Out Correction with Recalculation & Immutable Audit Logging
   */
  const editPunchOut = (
    dateStr: string,
    newPunchOutIso: string,
    reason: string
  ): { success: boolean; message?: string } => {
    const targetDay = attendanceDays.find(d => d.date === dateStr) || (todayAttendance.date === dateStr ? todayAttendance : null);
    if (!targetDay) {
      return { success: false, message: `Attendance record not found for date ${dateStr}.` };
    }

    const sessions = targetDay.workSessions || [];
    if (sessions.length === 0) {
      return { success: false, message: 'No work session exists to edit punch-out on this day.' };
    }

    const lastSessionIndex = sessions.length - 1;
    const lastSession = sessions[lastSessionIndex];

    const newOutTimestamp = new Date(newPunchOutIso).getTime();
    const startTimestamp = new Date(lastSession.startTime).getTime();

    if (isNaN(newOutTimestamp) || isNaN(startTimestamp)) {
      return { success: false, message: 'Invalid timestamp format.' };
    }

    if (newOutTimestamp < startTimestamp) {
      return { 
        success: false, 
        message: `Punch-out (${newPunchOutIso.split('T')[1]?.slice(0, 8)}) cannot be earlier than punch-in / session start (${lastSession.startTime.split('T')[1]?.slice(0, 8)}).` 
      };
    }

    const oldPunchOut = targetDay.lastPunchOut || lastSession.endTime || 'none';
    const dur = WorkSessionEngine.getDurationSeconds(lastSession.startTime, newPunchOutIso);

    const updatedWorkSessions = sessions.map((ws, i) => {
      if (i === lastSessionIndex) {
        return {
          ...ws,
          endTime: newPunchOutIso,
          durationSeconds: Math.max(0, dur),
          status: 'COMPLETED' as const,
          source: 'CORRECTED' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return ws;
    });

    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);
    const breakSec = WorkSessionEngine.calculateBreakSeconds(targetDay.breakSessions || []).totalBreakSeconds;
    const requiredSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    const otSec = Math.max(0, activeSec - requiredSec);

    const updatedDay: AttendanceDay = {
      ...targetDay,
      status: activeSec >= (requiredSec * 0.5) ? 'PRESENT' : (activeSec > 0 ? 'PARTIAL' : targetDay.status),
      workdayStatus: 'COMPLETED',
      totalActiveSeconds: activeSec,
      totalBreakSeconds: breakSec,
      overtimeSeconds: otSec,
      lastPunchOut: newPunchOutIso,
      workSessions: updatedWorkSessions,
      source: 'CORRECTED',
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CLOCK_OUT_CORRECTION' as any, 'lastPunchOut', oldPunchOut, newPunchOutIso, reason || 'Manual Punch-Out Correction');
    return { success: true };
  };

  /**
   * 8. Direct Punch-In Correction with Recalculation & Immutable Audit Logging
   */
  const editPunchIn = (
    dateStr: string,
    newPunchInIso: string,
    reason: string
  ): { success: boolean; message?: string } => {
    const targetDay = attendanceDays.find(d => d.date === dateStr) || (todayAttendance.date === dateStr ? todayAttendance : null);
    if (!targetDay) {
      return { success: false, message: `Attendance record not found for date ${dateStr}.` };
    }

    const sessions = targetDay.workSessions || [];
    if (sessions.length === 0) {
      return { success: false, message: 'No work session exists to edit punch-in on this day.' };
    }

    const firstSession = sessions[0];
    const newInTimestamp = new Date(newPunchInIso).getTime();
    const endTimestamp = firstSession.endTime ? new Date(firstSession.endTime).getTime() : Date.now();

    if (isNaN(newInTimestamp)) {
      return { success: false, message: 'Invalid timestamp format.' };
    }

    if (firstSession.endTime && newInTimestamp > endTimestamp) {
      return { 
        success: false, 
        message: `Punch-in (${newPunchInIso.split('T')[1]?.slice(0, 8)}) cannot be later than session end (${firstSession.endTime.split('T')[1]?.slice(0, 8)}).` 
      };
    }

    const oldPunchIn = targetDay.firstPunchIn || firstSession.startTime || 'none';
    const dur = firstSession.endTime 
      ? WorkSessionEngine.getDurationSeconds(newPunchInIso, firstSession.endTime) 
      : firstSession.durationSeconds;

    const updatedWorkSessions = sessions.map((ws, i) => {
      if (i === 0) {
        return {
          ...ws,
          startTime: newPunchInIso,
          durationSeconds: Math.max(0, dur),
          source: 'CORRECTED' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return ws;
    });

    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);
    const breakSec = WorkSessionEngine.calculateBreakSeconds(targetDay.breakSessions || []).totalBreakSeconds;
    const requiredSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    const otSec = Math.max(0, activeSec - requiredSec);

    const updatedDay: AttendanceDay = {
      ...targetDay,
      status: activeSec >= (requiredSec * 0.5) ? 'PRESENT' : (activeSec > 0 ? 'PARTIAL' : targetDay.status),
      firstPunchIn: newPunchInIso,
      totalActiveSeconds: activeSec,
      totalBreakSeconds: breakSec,
      overtimeSeconds: otSec,
      workSessions: updatedWorkSessions,
      source: 'CORRECTED',
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CLOCK_IN_CORRECTION' as any, 'firstPunchIn', oldPunchIn, newPunchInIso, reason || 'Manual Punch-In Correction');
    return { success: true };
  };

  // --------------------------------------------------------------------------
  // MANUAL EDITING, CORRECTIONS & AUDIT LOGS
  // --------------------------------------------------------------------------

  const correctWorkSession = (sessionId: string, updates: Partial<WorkSession>, reason: string) => {
    const existing = todayAttendance.workSessions.find(ws => ws.id === sessionId);
    if (!existing) return;

    const updatedWorkSessions = todayAttendance.workSessions.map(ws => {
      if (ws.id === sessionId) {
        const nextStart = updates.startTime || ws.startTime;
        const nextEnd = updates.endTime !== undefined ? updates.endTime : ws.endTime;
        const dur = nextEnd ? WorkSessionEngine.getDurationSeconds(nextStart, nextEnd) : ws.durationSeconds;
        return {
          ...ws,
          ...updates,
          durationSeconds: dur,
          source: 'MANUAL' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return ws;
    });

    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);
    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      totalActiveSeconds: activeSec,
      workSessions: updatedWorkSessions,
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CORRECTION', `work_session:${sessionId}`, JSON.stringify(existing), JSON.stringify(updates), reason);
  };

  const correctBreakSession = (sessionId: string, updates: Partial<BreakSession>, reason: string) => {
    const existing = todayAttendance.breakSessions.find(bs => bs.id === sessionId);
    if (!existing) return;

    const updatedBreakSessions = todayAttendance.breakSessions.map(bs => {
      if (bs.id === sessionId) {
        const nextStart = updates.startTime || bs.startTime;
        const nextEnd = updates.endTime !== undefined ? updates.endTime : bs.endTime;
        const dur = nextEnd ? WorkSessionEngine.getDurationSeconds(nextStart, nextEnd) : bs.durationSeconds;
        return {
          ...bs,
          ...updates,
          durationSeconds: dur,
          source: 'MANUAL' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return bs;
    });

    const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;
    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      totalBreakSeconds: breakSec,
      breakSessions: updatedBreakSessions,
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CORRECTION', `break_session:${sessionId}`, JSON.stringify(existing), JSON.stringify(updates), reason);
  };

  const addManualWorkSession = (session: Omit<WorkSession, 'id'>, reason: string) => {
    const dur = session.endTime 
      ? WorkSessionEngine.getDurationSeconds(session.startTime, session.endTime) 
      : session.durationSeconds || 0;

    const newSession: WorkSession = {
      ...session,
      id: `ws-manual-${Date.now()}`,
      attendanceDayId: todayAttendance.id,
      durationSeconds: dur,
      source: 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedWorkSessions = [...todayAttendance.workSessions, newSession];
    const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      totalActiveSeconds: activeSec,
      workSessions: updatedWorkSessions,
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CREATE', 'workSessions', 'none', JSON.stringify(newSession), reason);
  };

  const addManualBreakSession = (breakSession: Omit<BreakSession, 'id'>, reason: string) => {
    const dur = breakSession.endTime 
      ? WorkSessionEngine.getDurationSeconds(breakSession.startTime, breakSession.endTime) 
      : breakSession.durationSeconds || 0;

    const newBreak: BreakSession = {
      ...breakSession,
      id: `bs-manual-${Date.now()}`,
      durationSeconds: dur,
      source: 'MANUAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBreakSessions = [...todayAttendance.breakSessions, newBreak];
    const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;

    const updatedDay: AttendanceDay = {
      ...todayAttendance,
      totalBreakSeconds: breakSec,
      breakSessions: updatedBreakSessions,
      updatedAt: new Date().toISOString(),
    };

    updateAttendanceDay(updatedDay);
    logAudit('CREATE', 'breakSessions', 'none', JSON.stringify(newBreak), reason);
  };

  const deleteSession = (sessionId: string, isBreak: boolean, reason: string) => {
    if (isBreak) {
      const updatedBreakSessions = todayAttendance.breakSessions.filter(bs => bs.id !== sessionId);
      const breakSec = WorkSessionEngine.calculateBreakSeconds(updatedBreakSessions).totalBreakSeconds;
      const updatedDay: AttendanceDay = {
        ...todayAttendance,
        totalBreakSeconds: breakSec,
        breakSessions: updatedBreakSessions,
        updatedAt: new Date().toISOString(),
      };
      updateAttendanceDay(updatedDay);
      logAudit('DELETE', `break_session:${sessionId}`, sessionId, 'DELETED', reason);
    } else {
      const updatedWorkSessions = todayAttendance.workSessions.filter(ws => ws.id !== sessionId);
      const activeSec = WorkSessionEngine.calculateTotalActiveSeconds(updatedWorkSessions);
      const updatedDay: AttendanceDay = {
        ...todayAttendance,
        totalActiveSeconds: activeSec,
        workSessions: updatedWorkSessions,
        updatedAt: new Date().toISOString(),
      };
      updateAttendanceDay(updatedDay);
      logAudit('DELETE', `work_session:${sessionId}`, sessionId, 'DELETED', reason);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 4: AUTHORITATIVE RUNNING-MONTH & DAY BREAKDOWNS
  // --------------------------------------------------------------------------
  const { days: monthlyDaysDetails, summary: monthlyRunningSummary } = useMemo(() => {
    return DayEngine.calculateMonthlyRunningBreakdown(
      selectedMonth,
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      rateDerivation,
      todayDate,
      {
        liveActiveSeconds: todayLiveActiveSeconds,
        liveBreakSeconds: todayLiveBreakSeconds,
        liveOtSeconds: liveOtInfo.overtimeSecondsToday,
        liveEarned: todayLiveEarned,
      }
    );
  }, [selectedMonth, attendanceDays, salaryConfig, schedule, holidays, rateDerivation, todayDate, todayLiveActiveSeconds, todayLiveBreakSeconds, liveOtInfo.overtimeSecondsToday, todayLiveEarned]);

  // Step 10: Automatic Evaluation of Milestones and Notification Dispatch
  useEffect(() => {
    if (!appSettings.notificationSettings) return;
    const milestones = NotificationEngine.evaluateMilestones(
      todayDate,
      todayAttendance,
      currentWorkdayStatus,
      todayLiveActiveSeconds,
      lunchStats,
      liveOtInfo,
      monthlyRunningSummary,
      appSettings.notificationSettings,
      appSettings.lastBackupDate
    );
    if (milestones.length > 0) {
      NotificationService.processMilestones(milestones, appSettings.notificationSettings);
    }
  }, [
    todayDate,
    todayAttendance,
    currentWorkdayStatus,
    todayLiveActiveSeconds,
    lunchStats,
    liveOtInfo,
    monthlyRunningSummary,
    appSettings.notificationSettings,
    appSettings.lastBackupDate
  ]);

  const getDayDetails = (dateStr: string): DayCalculationDetails => {
    const existingFromMonth = monthlyDaysDetails.find(d => d.date === dateStr);
    if (existingFromMonth) return existingFromMonth;

    const record = attendanceDays.find(d => d.date === dateStr);
    return DayEngine.calculateDayDetails(
      dateStr,
      record,
      salaryConfig,
      schedule,
      holidays,
      rateDerivation,
      todayDate
    );
  };

  const editAttendanceDayWithAudit = (updatedDay: AttendanceDay, reason: string) => {
    const existing = attendanceDays.find(d => d.date === updatedDay.date);
    updateAttendanceDay(updatedDay);
    
    const newLog = StorageService.addAuditLog({
      entityType: 'attendance',
      entityId: updatedDay.id || `att-${updatedDay.date}`,
      action: 'CORRECTION',
      fieldChanged: 'dayRecord',
      oldValue: existing ? JSON.stringify(existing) : 'none',
      newValue: JSON.stringify(updatedDay),
      reason: reason || 'Manual Day Correction / Audit Edit',
      userId: user.id,
    });
    setAuditLogsState(prev => [newLog, ...prev]);
  };

  // --------------------------------------------------------------------------
  // STEP 5: AUTHORITATIVE SCENARIOS & RUNNING-MONTH PREDICTIONS
  // --------------------------------------------------------------------------

  // Fallback default scenario if needed
  const fallbackScenario = useMemo(() => {
    return PredictionEngine.createDefaultScenario(selectedMonth, schedule, holidays, 'EXPECTED');
  }, [selectedMonth, schedule, holidays]);

  // Current active scenario for selected month
  const activeScenario: ProjectionScenario = useMemo(() => {
    const found = scenarios.find(s => s.id === activeScenarioId && s.targetMonth === selectedMonth);
    if (found) return found;
    const sameMonth = scenarios.find(s => s.targetMonth === selectedMonth);
    if (sameMonth) return sameMonth;
    return fallbackScenario;
  }, [scenarios, activeScenarioId, selectedMonth, fallbackScenario]);

  const setActiveScenarioId = (id: string) => {
    setActiveScenarioIdState(id);
  };

  const createScenario = (name: string, assumptionType: AssumptionType = 'EXPECTED'): ProjectionScenario => {
    const newScen = PredictionEngine.createDefaultScenario(selectedMonth, schedule, holidays, assumptionType);
    newScen.name = name.trim() || `Scenario ${scenarios.length + 1}`;
    const next = [...scenarios, newScen];
    setScenariosState(next);
    StorageService.saveScenarios(next);
    setActiveScenarioIdState(newScen.id);
    return newScen;
  };

  const updateScenario = (updated: ProjectionScenario) => {
    setScenariosState(prev => {
      const idx = prev.findIndex(s => s.id === updated.id);
      let next: ProjectionScenario[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...updated, updatedAt: new Date().toISOString() };
      } else {
        next = [...prev, updated];
      }
      StorageService.saveScenarios(next);
      return next;
    });
  };

  const updateScenarioFutureDay = (dateStr: string, updates: Partial<ProjectionDay>) => {
    if (!activeScenario) return;
    const updatedDays = activeScenario.futureDays.map(d => {
      if (d.date === dateStr) {
        return {
          ...d,
          ...updates,
          isUserModified: true,
        };
      }
      return d;
    });

    const updatedScenario: ProjectionScenario = {
      ...activeScenario,
      futureDays: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    updateScenario(updatedScenario);
  };

  const deleteScenario = (id: string) => {
    setScenariosState(prev => {
      const next = prev.filter(s => s.id !== id);
      StorageService.saveScenarios(next);
      return next;
    });
    if (activeScenarioId === id) {
      const remaining = scenarios.filter(s => s.id !== id && s.targetMonth === selectedMonth);
      if (remaining.length > 0) {
        setActiveScenarioIdState(remaining[0].id);
      }
    }
  };

  const duplicateScenario = (id: string): ProjectionScenario => {
    const target = scenarios.find(s => s.id === id) || activeScenario;
    const copy: ProjectionScenario = {
      ...target,
      id: `scenario-${selectedMonth}-${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      futureDays: target.futureDays.map(d => ({ ...d })),
    };

    const next = [...scenarios, copy];
    setScenariosState(next);
    StorageService.saveScenarios(next);
    setActiveScenarioIdState(copy.id);
    return copy;
  };

  const resetScenarioToDefault = (id: string) => {
    const target = scenarios.find(s => s.id === id);
    const assumptionType = target?.assumptionType || 'EXPECTED';
    const fresh = PredictionEngine.createDefaultScenario(selectedMonth, schedule, holidays, assumptionType);
    if (target) {
      fresh.id = target.id;
      fresh.name = target.name;
    }
    updateScenario(fresh);
  };

  // Authoritative dynamic projection calculation
  const selectedMonthProjection: MonthlyProjectionResult = useMemo(() => {
    const isCurrentMonth = selectedMonth === todayDate.substring(0, 7);
    return PredictionEngine.projectMonth(
      selectedMonth,
      attendanceDays,
      activeScenario,
      salaryConfig,
      schedule,
      holidays,
      salaryConfig.deductions,
      todayDate,
      isCurrentMonth ? {
        liveActiveSeconds: todayLiveActiveSeconds,
        liveBreakSeconds: todayLiveBreakSeconds,
        liveOtSeconds: liveOtInfo.overtimeSecondsToday,
        liveEarned: todayLiveEarned,
      } : undefined
    );
  }, [
    selectedMonth,
    attendanceDays,
    activeScenario,
    salaryConfig,
    schedule,
    holidays,
    todayDate,
    todayLiveActiveSeconds,
    todayLiveBreakSeconds,
    liveOtInfo.overtimeSecondsToday,
    todayLiveEarned
  ]);

  // Authoritative comparison of scenarios for the active month
  const scenarioComparison: ScenarioComparisonItem[] = useMemo(() => {
    const monthScenarios = scenarios.filter(s => s.targetMonth === selectedMonth);
    const scenList = monthScenarios.length > 0 ? monthScenarios : [activeScenario];
    const isCurrentMonth = selectedMonth === todayDate.substring(0, 7);

    return PredictionEngine.compareScenarios(
      scenList,
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      salaryConfig.deductions,
      todayDate,
      isCurrentMonth ? {
        liveActiveSeconds: todayLiveActiveSeconds,
        liveBreakSeconds: todayLiveBreakSeconds,
        liveOtSeconds: liveOtInfo.overtimeSecondsToday,
        liveEarned: todayLiveEarned,
      } : undefined
    );
  }, [
    scenarios,
    selectedMonth,
    activeScenario,
    attendanceDays,
    salaryConfig,
    schedule,
    holidays,
    todayDate,
    todayLiveActiveSeconds,
    todayLiveBreakSeconds,
    liveOtInfo.overtimeSecondsToday,
    todayLiveEarned
  ]);

  const resetAllData = () => {
    StorageService.resetAll();
    setUserState(StorageService.getUser());
    setSalaryConfigState(StorageService.getSalaryConfig());
    setScheduleState(StorageService.getSchedule());
    setHolidaysState(StorageService.getHolidays());
    setAttendanceDaysState(StorageService.getAttendanceDays());
    setAppSettingsState(StorageService.getAppSettings());
    setAuditLogsState([]);
    setSelectedMonthState('2026-08');
    setBonusApprovalState(true);
    
    // Reinitialize default scenarios
    const initSchedule = StorageService.getSchedule();
    const initHolidays = StorageService.getHolidays();
    const exp = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'EXPECTED');
    const best = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'BEST_CASE');
    const worst = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'WORST_CASE');
    const customLeave = PredictionEngine.createDefaultScenario('2026-08', initSchedule, initHolidays, 'EXPECTED');
    customLeave.id = 'scenario-2026-08-custom-leave';
    customLeave.name = '2 Days Leave Plan';
    customLeave.assumptionType = 'CUSTOM';
    customLeave.futureDays = customLeave.futureDays.map(d => {
      if (d.date === '2026-08-25' || d.date === '2026-08-26') {
        return {
          ...d,
          status: 'UNPAID_LEAVE',
          plannedWorkSeconds: 0,
          plannedBreakSeconds: 0,
          notes: 'Planned personal leave',
        };
      }
      return d;
    });
    const defScens = [exp, customLeave, best, worst];
    setScenariosState(defScens);
    StorageService.saveScenarios(defScens);
    setActiveScenarioIdState(exp.id);

    setTestResults(runEngineTests());
  };

  const rerunTests = () => {
    const res = runEngineTests();
    setTestResults(res);
    return res;
  };

  // Step 6: Reconciliation Handlers
  const runReconciliation = (
    fileName: string, 
    targetEmployeeName: string, 
    records: ExtractedDayRecord[], 
    employees: ExtractedEmployee[]
  ): ReconciliationReport => {
    const targetEmp = employees.find(e => e.name.toLowerCase().includes(targetEmployeeName.toLowerCase())) || 
      employees[0] || {
        employeeId: 'EMP-1042',
        name: targetEmployeeName,
        department: 'Engineering',
        totalRecordsCount: records.length,
        isTargetMatch: true
      };

    const report = ReconciliationEngine.compareRecords(
      selectedMonth,
      fileName,
      targetEmp,
      employees,
      records,
      attendanceDays,
      salaryConfig,
      rateDerivation
    );

    setReconciliationReport(report);
    StorageService.saveReconciliationReport(report);
    return report;
  };

  const toggleReconciliationItemSelection = (itemId: string, selected?: boolean) => {
    if (!reconciliationReport) return;
    const updatedItems = (reconciliationReport.items || []).map(item => {
      if (item.id === itemId) {
        return { ...item, isSelected: selected !== undefined ? selected : !item.isSelected };
      }
      return item;
    });
    const updatedReport = { ...reconciliationReport, items: updatedItems };
    setReconciliationReport(updatedReport);
    StorageService.saveReconciliationReport(updatedReport);
  };

  const selectAllReconciliationItems = (selected: boolean, onlyDiscrepancies = false) => {
    if (!reconciliationReport) return;
    const updatedItems = (reconciliationReport.items || []).map(item => {
      if (onlyDiscrepancies) {
        return {
          ...item,
          isSelected: item.discrepancyType !== 'MATCH' ? selected : false
        };
      }
      return { ...item, isSelected: selected };
    });
    const updatedReport = { ...reconciliationReport, items: updatedItems };
    setReconciliationReport(updatedReport);
    StorageService.saveReconciliationReport(updatedReport);
  };

  const setReconciliationItemResolution = (itemId: string, resolution: ResolutionChoice) => {
    if (!reconciliationReport) return;
    const updatedItems = (reconciliationReport.items || []).map(item => {
      if (item.id === itemId) {
        return { ...item, resolution };
      }
      return item;
    });
    const updatedReport = { ...reconciliationReport, items: updatedItems };
    setReconciliationReport(updatedReport);
    StorageService.saveReconciliationReport(updatedReport);
  };

  const applyReconciliationCorrections = (selectedItemIds?: string[]) => {
    if (!reconciliationReport) {
      throw new Error('No active reconciliation report to apply');
    }

    const idsToApply = selectedItemIds || 
      (reconciliationReport.items || []).filter(i => i.isSelected && i.resolution !== 'KEEP_APP').map(i => i.id);

    const grossBefore = salaryCalculation.grossPay;
    const netBefore = salaryCalculation.realtimeEarnedSoFar;
    const otHoursBefore = salaryCalculation.overtimeSeconds / 3600;
    const bonusBefore = salaryCalculation.attendanceBonusAmount;

    const { updatedAttendanceDays, auditLog } = ReconciliationEngine.applyCorrections(
      reconciliationReport,
      idsToApply,
      attendanceDays,
      grossBefore,
      netBefore,
      otHoursBefore,
      bonusBefore,
      salaryConfig,
      rateDerivation
    );

    setAttendanceDaysState(updatedAttendanceDays);
    StorageService.saveAttendanceDays(updatedAttendanceDays);

    const updatedAuditLogs = [auditLog, ...reconciliationAuditLogs];
    setReconciliationAuditLogs(updatedAuditLogs);
    StorageService.saveReconciliationAuditLogs(updatedAuditLogs);

    // Re-run reconciliation with new data so report shows fully matched
    const refreshedReport = ReconciliationEngine.compareRecords(
      selectedMonth,
      reconciliationReport.fileName,
      reconciliationReport.selectedEmployee,
      reconciliationReport.allEmployeesFound,
      reconciliationReport.items.map(i => ({
        date: i.date,
        dayName: i.dayName,
        shift: i.pdfData.shift,
        inTime: i.pdfData.inTime,
        outTime: i.pdfData.outTime,
        totalDurationHours: i.pdfData.workDurationSeconds / 3600,
        workDurationSeconds: i.pdfData.workDurationSeconds,
        overtimeSeconds: i.pdfData.overtimeSeconds,
        overtimeHours: i.pdfData.overtimeSeconds / 3600,
        status: i.pdfData.status,
        remarks: i.pdfData.remarks,
        rawPunches: i.pdfData.rawPunches,
      })),
      updatedAttendanceDays,
      salaryConfig,
      rateDerivation
    );

    setReconciliationReport(refreshedReport);
    StorageService.saveReconciliationReport(refreshedReport);

    return {
      updatedCount: auditLog.totalCorrectedDates,
      netGain: auditLog.netAfter - auditLog.netBefore,
      auditLog,
    };
  };

  const rollbackReconciliation = (auditLogId: string) => {
    const log = reconciliationAuditLogs.find(l => l.id === auditLogId);
    if (!log) return;
    const remainingLogs = reconciliationAuditLogs.filter(l => l.id !== auditLogId);
    setReconciliationAuditLogs(remainingLogs);
    StorageService.saveReconciliationAuditLogs(remainingLogs);
  };

  const clearReconciliationReport = () => {
    setReconciliationReport(null);
    StorageService.saveReconciliationReport(null);
  };

  // Step 7: Authoritative 3-Way Salary Reconciliation Computations
  const currentSalaryReconciliation = useMemo(() => {
    const existing = salaryReconciliationRecords.find(r => r.month === selectedMonth);
    
    // Build fresh pulseData from current calculation for selectedMonth
    const pulseData: PulseCalculatedSummary = {
      grossSalary: salaryCalculation.grossPay,
      basePay: salaryCalculation.grossEarnedBasePay,
      overtimePay: salaryCalculation.overtimePay,
      attendanceBonus: salaryCalculation.attendanceBonusAmount,
      performanceBonus: 0,
      specialAllowance: 0,
      totalDeductions: salaryCalculation.totalDeductions,
      itemizedDeductions: (salaryCalculation?.itemizedDeductions || []).map(d => ({
        name: d.name,
        amount: d.amount,
        type: 'standard',
      })),
      netPay: salaryCalculation.netSalary,
      scheduledWorkingDays: salaryCalculation.scheduledWorkingDays,
      presentDays: salaryCalculation.actualPresentDays,
      otHours: salaryCalculation.overtimeSeconds / 3600,
      perDayRate: salaryCalculation.perDayRate,
      perHourRate: salaryCalculation.perHourRate,
      calculationBasis: salaryConfig.calculationBasis,
    };

    if (existing) {
      if (existing.isLocked) {
        // Locked records remain strictly immutable snapshots
        return existing;
      }

      // If unlocked, synchronize pulseData while keeping user's entered slip and bank receipts
      return SalaryReconciliationEngine.buildRecord(
        selectedMonth,
        pulseData,
        existing.officialSlip,
        existing.bankReceipt,
        user,
        existing
      );
    }

    // Default pristine record for new months
    const defaultSlip: OfficialPayrollSlip = {
      isProvided: false,
      basePay: pulseData.basePay,
      overtimePay: 0,
      attendanceBonus: 0,
      performanceBonus: 0,
      specialAllowance: 0,
      otherEarnings: 0,
      grossPay: pulseData.basePay,
      deductions: {
        pf: 0,
        pt: 0,
        tds: 0,
        esi: 0,
        lop: 0,
        other: 0,
      },
      totalDeductions: 0,
      netSalary: pulseData.basePay,
    };

    const defaultBank: ActualBankReceipt = {
      isProvided: false,
      amountReceived: 0,
      depositDate: '',
      bankName: 'HDFC Bank',
      accountLast4: '4829',
      transactionRef: '',
      depositStatus: 'PENDING',
    };

    return SalaryReconciliationEngine.buildRecord(
      selectedMonth,
      pulseData,
      defaultSlip,
      defaultBank,
      user
    );
  }, [salaryReconciliationRecords, selectedMonth, salaryCalculation, salaryConfig, user]);

  const updateOfficialSlip = (month: string, updates: Partial<OfficialPayrollSlip>) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month) || currentSalaryReconciliation;
      if (existing.isLocked) return prev; // Do not edit locked record

      const currentSlip = existing.officialSlip;
      const updatedDeductions = updates.deductions 
        ? { ...currentSlip.deductions, ...updates.deductions }
        : currentSlip.deductions;

      const totalDeductions = updates.totalDeductions !== undefined 
        ? updates.totalDeductions 
        : (updatedDeductions.pf + updatedDeductions.pt + updatedDeductions.tds + updatedDeductions.esi + updatedDeductions.lop + updatedDeductions.other);

      const basePay = updates.basePay !== undefined ? updates.basePay : currentSlip.basePay;
      const overtimePay = updates.overtimePay !== undefined ? updates.overtimePay : currentSlip.overtimePay;
      const attendanceBonus = updates.attendanceBonus !== undefined ? updates.attendanceBonus : currentSlip.attendanceBonus;
      const performanceBonus = updates.performanceBonus !== undefined ? updates.performanceBonus : currentSlip.performanceBonus;
      const specialAllowance = updates.specialAllowance !== undefined ? updates.specialAllowance : currentSlip.specialAllowance;
      const otherEarnings = updates.otherEarnings !== undefined ? updates.otherEarnings : currentSlip.otherEarnings;

      const grossPay = updates.grossPay !== undefined 
        ? updates.grossPay 
        : (basePay + overtimePay + attendanceBonus + performanceBonus + specialAllowance + otherEarnings);

      const netSalary = updates.netSalary !== undefined 
        ? updates.netSalary 
        : Math.max(0, grossPay - totalDeductions);

      const updatedSlip: OfficialPayrollSlip = {
        ...currentSlip,
        ...updates,
        isProvided: true,
        basePay,
        overtimePay,
        attendanceBonus,
        performanceBonus,
        specialAllowance,
        otherEarnings,
        grossPay,
        deductions: updatedDeductions,
        totalDeductions,
        netSalary,
      };

      const updatedRecord = SalaryReconciliationEngine.buildRecord(
        month,
        existing.pulseData,
        updatedSlip,
        existing.bankReceipt,
        user,
        existing
      );

      const next = prev.filter(r => r.month !== month);
      const combined = [updatedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const updateBankReceipt = (month: string, updates: Partial<ActualBankReceipt>) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month) || currentSalaryReconciliation;
      if (existing.isLocked) return prev;

      const updatedBank: ActualBankReceipt = {
        ...existing.bankReceipt,
        ...updates,
        isProvided: updates.amountReceived !== undefined ? updates.amountReceived > 0 : existing.bankReceipt.isProvided,
      };

      const updatedRecord = SalaryReconciliationEngine.buildRecord(
        month,
        existing.pulseData,
        existing.officialSlip,
        updatedBank,
        user,
        existing
      );

      const next = prev.filter(r => r.month !== month);
      const combined = [updatedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const updateDiscrepancyResolution = (month: string, discrepancyId: string, resolution: ResolutionStatus, userNote?: string) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month) || currentSalaryReconciliation;
      if (existing.isLocked) return prev;

      const updatedDiscrepancies = (existing?.itemizedDiscrepancies || []).map(d => {
        if (d.id === discrepancyId) {
          return {
            ...d,
            userResolution: resolution,
            userNote: userNote !== undefined ? userNote : d.userNote,
          };
        }
        return d;
      });

      const updatedRecord: SalaryReconciliationRecord = {
        ...existing,
        itemizedDiscrepancies: updatedDiscrepancies,
        lastUpdated: new Date().toISOString(),
      };

      const next = prev.filter(r => r.month !== month);
      const combined = [updatedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const lockSalaryReconciliation = (month: string, auditNote?: string) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month) || currentSalaryReconciliation;
      const lockedRecord: SalaryReconciliationRecord = {
        ...existing,
        isLocked: true,
        lockedAt: new Date().toISOString(),
        lockedBy: user.name,
        status: 'LOCKED_FINAL',
        auditNotes: auditNote || `Reconciliation snapshot locked by ${user.name} on ${new Date().toLocaleDateString()}`,
        lastUpdated: new Date().toISOString(),
      };

      StorageService.addAuditLog({
        entityType: 'salary_reconciliation',
        entityId: lockedRecord.id,
        action: 'LOCK',
        fieldChanged: 'isLocked',
        oldValue: 'false',
        newValue: 'true',
        reason: auditNote || 'User permanently locked monthly salary reconciliation snapshot.',
        userId: user.id,
      });

      const next = prev.filter(r => r.month !== month);
      const combined = [lockedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const unlockSalaryReconciliation = (month: string, reason: string) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month);
      if (!existing) return prev;

      const unlockedRecord: SalaryReconciliationRecord = {
        ...existing,
        isLocked: false,
        status: 'IN_PROGRESS',
        auditNotes: `Unlocked on ${new Date().toLocaleDateString()}: ${reason}`,
        lastUpdated: new Date().toISOString(),
      };

      StorageService.addAuditLog({
        entityType: 'salary_reconciliation',
        entityId: unlockedRecord.id,
        action: 'UNLOCK',
        fieldChanged: 'isLocked',
        oldValue: 'true',
        newValue: 'false',
        reason: reason || 'Unlocked for correction',
        userId: user.id,
      });

      const next = prev.filter(r => r.month !== month);
      const combined = [unlockedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const prefillOfficialSlipFromPulse = (month: string) => {
    const rec = currentSalaryReconciliation;
    updateOfficialSlip(month, {
      basePay: rec.pulseData.basePay,
      overtimePay: rec.pulseData.overtimePay,
      attendanceBonus: rec.pulseData.attendanceBonus,
      grossPay: rec.pulseData.grossSalary,
      netSalary: rec.pulseData.netPay,
      reportedWorkDays: rec.pulseData.scheduledWorkingDays,
      reportedPresentDays: rec.pulseData.presentDays,
      reportedOTHours: rec.pulseData.otHours,
      remarks: 'Pre-filled from SalaryPulse verified attendance and rate calculation engine.',
    });
  };

  const updateDisputeDetails = (
    month: string, 
    disputeNotes: string, 
    disputeStatus?: 'NONE' | 'DRAFTED' | 'SUBMITTED' | 'RESOLVED_ACCEPTED' | 'ADJUSTED_NEXT_MONTH', 
    ticketRef?: string
  ) => {
    setSalaryReconciliationRecords(prev => {
      const existing = prev.find(r => r.month === month) || currentSalaryReconciliation;
      const updatedRecord: SalaryReconciliationRecord = {
        ...existing,
        disputeNotes,
        disputeStatus: disputeStatus || existing.disputeStatus || 'DRAFTED',
        disputeTicketRef: ticketRef !== undefined ? ticketRef : existing.disputeTicketRef,
        status: (disputeStatus === 'SUBMITTED' || disputeStatus === 'DRAFTED') ? 'DISPUTE_RAISED' : existing.status,
        lastUpdated: new Date().toISOString(),
      };

      const next = prev.filter(r => r.month !== month);
      const combined = [updatedRecord, ...next];
      StorageService.saveSalaryReconciliationRecords(combined);
      return combined;
    });
  };

  const yearlySalarySummaries = useMemo(() => {
    return SalaryReconciliationEngine.buildYearlySummary(salaryReconciliationRecords);
  }, [salaryReconciliationRecords]);

  // --------------------------------------------------------------------------
  // STEP 9: PRODUCTION HARDENING, BACKUP, EXPORT & DATA INTEGRITY ENGINE
  // --------------------------------------------------------------------------
  const [step9TestResults, setStep9TestResults] = useState<Step9TestCaseResult[]>([]);
  const [step11TestResults, setStep11TestResults] = useState<Step11TestCaseResult[]>([]);

  useEffect(() => {
    runStep9Tests().then(res => setStep9TestResults(res));
    runStep11ComprehensiveQA().then(res => setStep11TestResults(res));
  }, []);

  const rerunStep9Tests = async (): Promise<Step9TestCaseResult[]> => {
    const res = await runStep9Tests();
    setStep9TestResults(res);
    return res;
  };

  const rerunStep11Tests = async (): Promise<Step11TestCaseResult[]> => {
    const res = await runStep11ComprehensiveQA();
    setStep11TestResults(res);
    return res;
  };

  const integrityReport = useMemo<DataIntegrityReport>(() => {
    return DataIntegrityEngine.runFullIntegrityCheck(
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      salaryReconciliationRecords
    );
  }, [attendanceDays, salaryConfig, schedule, holidays, salaryReconciliationRecords]);

  const historicalConfigDiffs = useMemo<HistoricalConfigDiff[]>(() => {
    return DataIntegrityEngine.detectConfigurationDrifts(
      salaryConfig,
      salaryReconciliationRecords
    );
  }, [salaryConfig, salaryReconciliationRecords]);

  const systemHealth = useMemo<SystemHealthStatus>(() => {
    return DataIntegrityEngine.getSystemHealthStatus(
      attendanceDays,
      salaryReconciliationRecords,
      appSettings,
      integrityReport,
      historicalConfigDiffs
    );
  }, [attendanceDays, salaryReconciliationRecords, appSettings, integrityReport, historicalConfigDiffs]);

  const createBackup = async (isEncrypted?: boolean, password?: string): Promise<{ success: boolean; filename: string; error?: string }> => {
    try {
      const fullState = StorageService.getFullState();
      
      let payloadContent: string;
      let filename: string;
      const dateTag = new Date().toISOString().split('T')[0];

      if (isEncrypted && password) {
        const { jsonString, filename: encName } = await BackupRestoreEngine.createEncryptedBackup(fullState, password);
        payloadContent = jsonString;
        filename = encName;
      } else {
        const { jsonString, filename: plainName } = await BackupRestoreEngine.createFullBackup(fullState);
        payloadContent = jsonString;
        filename = plainName;
      }

      // Trigger automatic browser download
      BackupRestoreEngine.triggerDownload(payloadContent, filename, 'application/json');

      // Update last backup date in settings & storage
      const nowIso = new Date().toISOString();
      updateAppSettings({ lastBackupDate: nowIso });

      // Add audit log entry
      StorageService.addAuditLog({
        entityType: 'backup',
        entityId: filename,
        action: 'BACKUP_CREATED',
        fieldChanged: 'fullBackup',
        oldValue: 'none',
        newValue: filename,
        reason: `Full data backup created (${isEncrypted ? 'Encrypted' : 'Plaintext JSON'}). Total records: ${fullState.metadata.recordCounts.attendanceDays} attendance days.`,
        userId: user.id,
      });

      return { success: true, filename };
    } catch (err: any) {
      console.error('Backup creation failed:', err);
      return { success: false, filename: '', error: err.message || 'Failed to create backup' };
    }
  };

  const inspectBackupFile = async (fileContent: string): Promise<RestoreInspectionResult> => {
    const currentState = StorageService.getFullState();
    return BackupRestoreEngine.inspectBackupFile(fileContent, currentState);
  };

  const decryptBackupFile = async (encryptedPayload: EncryptedBackupPayload, password: string): Promise<FullBackupPayload> => {
    return BackupRestoreEngine.decryptBackup(encryptedPayload, password);
  };

  const inspectMerge = (backupPayload: FullBackupPayload): MergeInspectionResult => {
    const currentState = StorageService.getFullState();
    return BackupRestoreEngine.inspectMerge(backupPayload, currentState);
  };

  const executeRestoreBackup = async (
    backupPayload: FullBackupPayload,
    mode: 'REPLACE' | 'MERGE',
    conflictResolutions?: Map<string, MergeConflictResolution>
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      // 1. Create emergency safety rollback snapshot in case of restore failure
      StorageService.createRollbackSnapshot();

      const currentState = StorageService.getFullState();
      const restored = BackupRestoreEngine.executeRestore(backupPayload, currentState, mode, conflictResolutions);

      // 2. Persist to storage
      StorageService.saveFullState(restored);

      // 3. Synchronize React state
      setUserState(restored.user);
      setSalaryConfigState(restored.salaryConfig);
      setScheduleState(restored.schedule);
      setHolidaysState(restored.holidays);
      setAttendanceDaysState(restored.attendanceDays);
      setAppSettingsState(restored.appSettings);
      setScenariosState(restored.projectionScenarios || []);
      setSalaryReconciliationRecords(restored.salaryReconciliationRecords || []);
      setReconciliationReport(restored.reconciliationReport || null);
      setReconciliationAuditLogs(restored.reconciliationAuditLogs || []);
      setAuditLogsState(restored.auditLogs || []);
      if (restored.selectedMonth) setSelectedMonthState(restored.selectedMonth);

      // 4. Log audit entry
      StorageService.addAuditLog({
        entityType: 'backup',
        entityId: `restore-${Date.now()}`,
        action: mode === 'REPLACE' ? 'BACKUP_RESTORED' : 'BACKUP_MERGED',
        fieldChanged: 'allEntities',
        oldValue: `v${currentState.metadata.schemaVersion}`,
        newValue: `v${restored.metadata.schemaVersion}`,
        reason: `Restored backup using ${mode} strategy. Record count: ${restored.attendanceDays.length} days.`,
        userId: user.id,
      });

      return {
        success: true,
        message: mode === 'REPLACE' 
          ? `Successfully restored ${restored.attendanceDays.length} attendance days and salary configurations.` 
          : `Successfully merged backup records with local state.`,
      };
    } catch (err: any) {
      console.error('Restore execution failed:', err);
      // Attempt rollback from snapshot
      StorageService.restoreRollbackSnapshot();
      return { success: false, message: 'Restore failed', error: err.message || 'Unknown error during restore' };
    }
  };

  const rebuildCalculations = (): { success: boolean; refreshedDaysCount: number; timestamp: string } => {
    const timestamp = new Date().toISOString();
    // Trigger state re-evaluation by gently cloning state
    setAttendanceDaysState(prev => [...prev]);
    setSalaryConfigState(prev => ({ ...prev }));
    
    StorageService.addAuditLog({
      entityType: 'calculation_engine',
      entityId: 'REBUILD_ALL',
      action: 'DATA_REBUILD',
      fieldChanged: 'allRatesAndDays',
      oldValue: 'prior_eval',
      newValue: 'recomputed_eval',
      reason: `User requested complete calculation and rate re-evaluation across all historical and current records.`,
      userId: user.id,
    });

    return {
      success: true,
      refreshedDaysCount: attendanceDays.length,
      timestamp,
    };
  };

  const runIntegrityCheck = (): DataIntegrityReport => {
    const rep = DataIntegrityEngine.runFullIntegrityCheck(
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      salaryReconciliationRecords
    );

    StorageService.addAuditLog({
      entityType: 'integrity_engine',
      entityId: 'SYSTEM_AUDIT',
      action: 'INTEGRITY_CHECK',
      fieldChanged: 'reportStatus',
      oldValue: 'unknown',
      newValue: rep.status,
      reason: `Integrity check completed with ${rep.issues.length} issue(s) detected.`,
      userId: user.id,
    });

    return rep;
  };

  const exportAttendanceCSV = () => {
    const csv = BackupRestoreEngine.exportAttendanceCSV(attendanceDays, salaryConfig);
    const filename = `SalaryPulse_Attendance_${selectedMonth}_${new Date().toISOString().split('T')[0]}.csv`;
    BackupRestoreEngine.triggerDownload(csv, filename, 'text/csv');
    
    StorageService.addAuditLog({
      entityType: 'export',
      entityId: filename,
      action: 'EXPORT_CREATED',
      fieldChanged: 'attendanceCSV',
      oldValue: 'none',
      newValue: filename,
      reason: `Exported attendance dataset (${attendanceDays.length} records) to CSV.`,
      userId: user.id,
    });
  };

  const exportPayrollCSV = () => {
    const csv = BackupRestoreEngine.exportPayrollCSV(salaryReconciliationRecords);
    const filename = `SalaryPulse_Payroll_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    BackupRestoreEngine.triggerDownload(csv, filename, 'text/csv');

    StorageService.addAuditLog({
      entityType: 'export',
      entityId: filename,
      action: 'EXPORT_CREATED',
      fieldChanged: 'payrollCSV',
      oldValue: 'none',
      newValue: filename,
      reason: `Exported 3-way official payroll reconciliation ledger to CSV.`,
      userId: user.id,
    });
  };

  const exportAnalyticsCSV = () => {
    const growth = AnalyticsEngine.generateMonthlySalaryGrowthData(salaryReconciliationRecords, attendanceDays, salaryConfig, schedule, holidays);
    const yearly = AnalyticsEngine.getYearlyDashboardData(2026, salaryReconciliationRecords, salaryConfig);
    const fy = AnalyticsEngine.getFinancialYearData(2026, salaryReconciliationRecords, salaryConfig);
    const csv = BackupRestoreEngine.exportAnalyticsCSV(growth, yearly, fy);
    const filename = `SalaryPulse_Analytics_Intelligence_${new Date().toISOString().split('T')[0]}.csv`;
    BackupRestoreEngine.triggerDownload(csv, filename, 'text/csv');

    StorageService.addAuditLog({
      entityType: 'export',
      entityId: filename,
      action: 'EXPORT_CREATED',
      fieldChanged: 'analyticsCSV',
      oldValue: 'none',
      newValue: filename,
      reason: `Exported analytics and payroll intelligence dataset to CSV.`,
      userId: user.id,
    });
  };

  // Clock-in Analysis Report derivation for active month
  const clockInAnalysisReport = useMemo(() => {
    return AttendanceEngine.analyzeClockInPunctuality(monthlyDaysDetails, schedule);
  }, [monthlyDaysDetails, schedule]);

  // Complete Data Deletion & Purge Action
  const deleteAllData = async (options?: { resetSalaryConfig?: boolean; preserveUser?: boolean }): Promise<{ success: boolean; message: string }> => {
    StorageService.createRollbackSnapshot();

    if (options?.resetSalaryConfig) {
      StorageService.resetAll();
      setAttendanceDaysState([]);
      setSalaryConfigState(INITIAL_SALARY_CONFIG);
      setScheduleState(INITIAL_SCHEDULE);
      setHolidaysState(INITIAL_HOLIDAYS);
      if (!options.preserveUser) setUserState(INITIAL_USER);
      setAuditLogsState([]);
      setScenariosState([]);
      setReconciliationReport(null);
      setReconciliationAuditLogs([]);
      setSalaryReconciliationRecords([]);
    } else {
      setAttendanceDaysState([]);
      StorageService.saveAttendanceDays([]);
      setSalaryReconciliationRecords([]);
      StorageService.saveSalaryReconciliationRecords([]);
      setReconciliationReport(null);
      StorageService.saveReconciliationReport(null);
      setAuditLogsState([]);
      StorageService.saveAuditLogs([]);
      setScenariosState([]);
      StorageService.saveScenarios([]);
      setReconciliationAuditLogs([]);
      StorageService.saveReconciliationAuditLogs([]);
    }

    StorageService.addAuditLog({
      entityType: 'system',
      entityId: 'DATA_PURGE',
      action: 'DATA_RESET',
      fieldChanged: 'attendanceDays',
      oldValue: `${attendanceDays.length} records`,
      newValue: '0 records',
      reason: options?.resetSalaryConfig ? 'Full factory reset and database purge executed.' : 'All attendance records and punch history deleted by user.',
      userId: user.id,
    });

    return {
      success: true,
      message: options?.resetSalaryConfig 
        ? 'All data, attendance records, and custom configurations have been completely reset.' 
        : 'All attendance records and punch history have been cleared successfully.'
    };
  };

  // Import Custom Attendance Data with Salary & Schedule selection
  const importAttendanceDataWithConfig = async (params: {
    salaryConfig?: Partial<SalaryConfig>;
    schedule?: Partial<WorkSchedule>;
    attendanceDays: AttendanceDay[];
    mode: 'REPLACE' | 'APPEND';
  }): Promise<{ success: boolean; message: string; count: number }> => {
    try {
      StorageService.createRollbackSnapshot();

      if (params.salaryConfig) {
        const nextSalary = { ...salaryConfig, ...params.salaryConfig };
        setSalaryConfigState(nextSalary);
        StorageService.saveSalaryConfig(nextSalary);
      }

      if (params.schedule) {
        const nextSchedule = { ...schedule, ...params.schedule };
        setScheduleState(nextSchedule);
        StorageService.saveSchedule(nextSchedule);
      }

      let mergedDays: AttendanceDay[];
      if (params.mode === 'REPLACE') {
        mergedDays = params.attendanceDays;
      } else {
        const dayMap = new Map<string, AttendanceDay>();
        attendanceDays.forEach(d => dayMap.set(d.date, d));
        params.attendanceDays.forEach(d => dayMap.set(d.date, d));
        mergedDays = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      }

      setAttendanceDaysState(mergedDays);
      StorageService.saveAttendanceDays(mergedDays);

      StorageService.addAuditLog({
        entityType: 'attendance',
        entityId: `import-${Date.now()}`,
        action: 'UPDATE',
        fieldChanged: 'attendanceDays',
        oldValue: `${attendanceDays.length} records`,
        newValue: `${mergedDays.length} records`,
        reason: `Imported ${params.attendanceDays.length} attendance records (${params.mode} mode) with updated salary configuration.`,
        userId: user.id,
      });

      return {
        success: true,
        message: `Successfully imported ${params.attendanceDays.length} attendance records into localStorage with updated salary & shift settings.`,
        count: params.attendanceDays.length,
      };
    } catch (e: any) {
      console.error('Import failed:', e);
      return {
        success: false,
        message: e?.message || 'Failed to import attendance data.',
        count: 0,
      };
    }
  };

  const resetApplicationDataWithSafetyBackup = async (): Promise<void> => {
    // 1. Create immediate automatic backup download
    await createBackup(false);

    // 2. Wipe storage & reset to factory defaults
    StorageService.resetAll();
    setUserState(INITIAL_USER);
    setSalaryConfigState(INITIAL_SALARY_CONFIG);
    setScheduleState(INITIAL_SCHEDULE);
    setHolidaysState(INITIAL_HOLIDAYS);
    setAttendanceDaysState(INITIAL_ATTENDANCE_DAYS);
    setAppSettingsState(DEFAULT_APP_SETTINGS);
    setAuditLogsState([]);
    setScenariosState([]);
    setReconciliationReport(null);
    setReconciliationAuditLogs([]);
    setSalaryReconciliationRecords(INITIAL_SALARY_RECONCILIATION_RECORDS);

    StorageService.addAuditLog({
      entityType: 'system',
      entityId: 'DATA_RESET',
      action: 'DATA_RESET',
      fieldChanged: 'allStorage',
      oldValue: 'custom_state',
      newValue: 'factory_defaults',
      reason: 'Application reset to pristine state with automated emergency safety backup.',
      userId: INITIAL_USER.id,
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        user,
        updateUser,
        salaryConfig,
        updateSalaryConfig,
        schedule,
        updateSchedule,
        holidays,
        updateHolidays,
        attendanceDays,
        updateAttendanceDay,
        appSettings,
        updateAppSettings,
        deductions: salaryConfig.deductions || [],
        bonusApprovalState,
        setBonusApproval,
        rateDerivation,
        salaryCalculation,
        getRatesForMonth,
        
        // Step 4 Calendar & Attendance History
        monthlyDaysDetails,
        monthlyRunningSummary,
        getDayDetails,
        editAttendanceDayWithAudit,

        // Step 5 Scenario & Prediction Engine
        scenarios,
        activeScenarioId,
        activeScenario,
        selectedMonthProjection,
        createScenario,
        updateScenario,
        updateScenarioFutureDay,
        deleteScenario,
        duplicateScenario,
        resetScenarioToDefault,
        setActiveScenarioId,
        scenarioComparison,

        // Step 6 PDF Reconciliation Suite
        reconciliationReport,
        reconciliationAuditLogs,
        runReconciliation,
        toggleReconciliationItemSelection,
        selectAllReconciliationItems,
        setReconciliationItemResolution,
        applyReconciliationCorrections,
        rollbackReconciliation,
        clearReconciliationReport,

        // Step 7 Official 3-Way Salary Reconciliation Engine
        salaryReconciliationRecords,
        currentSalaryReconciliation,
        updateOfficialSlip,
        updateBankReceipt,
        updateDiscrepancyResolution,
        lockSalaryReconciliation,
        unlockSalaryReconciliation,
        prefillOfficialSlipFromPulse,
        updateDisputeDetails,
        yearlySalarySummaries,

        // Step 9 Production Hardening, Backup, Export & Data Integrity Engine
        createBackup,
        inspectBackupFile,
        decryptBackupFile,
        inspectMerge,
        executeRestoreBackup,
        rebuildCalculations,
        runIntegrityCheck,
        exportAttendanceCSV,
        exportPayrollCSV,
        exportAnalyticsCSV,
        resetApplicationDataWithSafetyBackup,
        systemHealth,
        historicalConfigDiffs,
        integrityReport,
        step9TestResults,
        rerunStep9Tests,
        step11TestResults,
        rerunStep11Tests,

        // Step 3 Live Engine state
        todayDate,
        setTodayDate,
        startNewDay,
        deleteAttendanceDay,
        reopenDay,
        todayAttendance,
        isCurrentlyWorking,
        isOnBreak,
        currentWorkdayStatus,
        openWorkSession,
        openBreakSession,
        activeWorkResult,
        todayCompletedActiveSeconds,
        todayLiveActiveSeconds,
        todayLiveBreakSeconds,
        todayLiveEarned,
        todayRemainingActiveSeconds,
        todayEstimatedCompletion,
        projectedFinishTime,
        lunchStats,
        liveOtInfo,
        
        // Punch actions
        startWork,
        pauseWork,
        startBreak,
        endBreak,
        resumeWork,
        endDay,
        editPunchOut,
        editPunchIn,
        
        // Manual & audit
        correctWorkSession,
        correctBreakSession,
        addManualWorkSession,
        addManualBreakSession,
        deleteSession,
        auditLogs,

        // Compatibility Aliases
        isWorking: isCurrentlyWorking,
        endWork: (note?: string, customEndTime?: string) => endDay(note, customEndTime),
        currentLiveSeconds: todayLiveActiveSeconds,
        currentDayAttendance: todayAttendance,
        punchIn: (note?: string) => startWork(note),
        punchOut: (note?: string) => pauseWork(note),

        resetAllData,
        deleteAllData,
        importAttendanceDataWithConfig,
        clockInAnalysisReport,
        testResults,
        rerunTests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
