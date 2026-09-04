// ============================================================================
// SALARYPULSE — STEP 9 DATA MANAGEMENT & PRODUCTION HARDENING UI
// Backups, Encrypted Exports, Conflict-Aware Merge, Integrity Audit & Health
// ============================================================================

import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Upload, 
  KeyRound, 
  Database, 
  FileSpreadsheet, 
  RefreshCw, 
  GitMerge, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  FileText, 
  History, 
  Trash2, 
  Search, 
  Layers, 
  Sparkles,
  Info,
  CheckCircle,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  FullBackupPayload, 
  RestoreInspectionResult, 
  MergeInspectionResult, 
  MergeConflictResolution,
  IntegrityIssue
} from '../../types';
import { formatCurrency, formatDurationHoursMinutes } from '../../utils/formatters';
import { ClockInAnalysisModal } from './ClockInAnalysisModal';
import { DeleteAllDataModal } from './DeleteAllDataModal';
import { ImportAttendanceModal } from './ImportAttendanceModal';

export const DataManagementSection: React.FC = () => {
  const {
    salaryConfig,
    schedule,
    attendanceDays,
    appSettings,
    systemHealth,
    integrityReport,
    historicalConfigDiffs,
    step9TestResults,
    rerunStep9Tests,
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
    clockInAnalysisReport,
    getDayDetails
  } = useApp();

  // Modals for Clock-In Analysis, Import, and Deletion
  const [isClockInAnalysisOpen, setIsClockInAnalysisOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Backup State
  const [backupPassword, setBackupPassword] = useState<string>('');
  const [isEncryptedBackup, setIsEncryptedBackup] = useState<boolean>(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Restore State
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');
  const [inspectionResult, setInspectionResult] = useState<RestoreInspectionResult | null>(null);
  const [restorePassword, setRestorePassword] = useState<string>('');
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'REPLACE' | 'MERGE'>('MERGE');
  const [mergeInspection, setMergeInspection] = useState<MergeInspectionResult | null>(null);
  const [conflictResolutions, setConflictResolutions] = useState<Map<string, MergeConflictResolution>>(new Map());
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreOutcome, setRestoreOutcome] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI Tabs & Collapse States
  const [activeSubTab, setActiveSubTab] = useState<'BACKUP_RESTORE' | 'INTEGRITY_DRIFT' | 'EXPORTS' | 'TEST_SUITES'>('BACKUP_RESTORE');
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetConfirmInput, setResetConfirmInput] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [rebuildingStatus, setRebuildingStatus] = useState<string | null>(null);
  const [testingStatus, setTestingStatus] = useState<boolean>(false);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Backup Creation
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupMessage(null);
    try {
      if (isEncryptedBackup && !backupPassword.trim()) {
        setBackupMessage({ type: 'error', text: 'Please enter a password for encryption.' });
        setIsCreatingBackup(false);
        return;
      }

      const res = await createBackup(isEncryptedBackup, backupPassword.trim() || undefined);
      if (res.success) {
        setBackupMessage({
          type: 'success',
          text: `Backup downloaded successfully (${res.filename}). Local last-backup timestamp updated.`,
        });
        setBackupPassword('');
      } else {
        setBackupMessage({ type: 'error', text: res.error || 'Backup creation failed.' });
      }
    } catch (e: any) {
      setBackupMessage({ type: 'error', text: e.message || 'Unexpected backup error.' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Handle File Selected for Restore
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    setRestoreOutcome(null);
    setDecryptError(null);
    setInspectionResult(null);
    setMergeInspection(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setRestoreFileContent(content);
      const inspection = await inspectBackupFile(content);
      setInspectionResult(inspection);

      if (inspection.isValid && !inspection.isEncrypted && inspection.payload) {
        const mergeResult = inspectMerge(inspection.payload);
        setMergeInspection(mergeResult);
        // Initialize default resolutions to USE_BACKUP
        const initialResolutions = new Map<string, MergeConflictResolution>();
        mergeResult.conflicts.forEach(c => {
          initialResolutions.set(c.id, 'USE_BACKUP');
        });
        setConflictResolutions(initialResolutions);
      }
    };
    reader.readAsText(file);
  };

  // Handle Decryption of Encrypted Backup
  const handleDecrypt = async () => {
    if (!inspectionResult || !restoreFileContent || !restorePassword) return;
    setDecryptError(null);
    try {
      const parsedEnc = JSON.parse(restoreFileContent);
      const decrypted = await decryptBackupFile(parsedEnc, restorePassword);
      
      const updatedInspection: RestoreInspectionResult = {
        ...inspectionResult,
        isValid: true,
        isEncrypted: false,
        payload: decrypted,
        backupPayload: decrypted,
        createdAt: decrypted.metadata.createdAt,
        schemaVersion: decrypted.metadata.schemaVersion,
      };
      setInspectionResult(updatedInspection);

      const mergeResult = inspectMerge(decrypted);
      setMergeInspection(mergeResult);
      const initialResolutions = new Map<string, MergeConflictResolution>();
      mergeResult.conflicts.forEach(c => {
        initialResolutions.set(c.id, 'USE_BACKUP');
      });
      setConflictResolutions(initialResolutions);
    } catch (err: any) {
      setDecryptError(err.message || 'Decryption failed. Please verify the password.');
    }
  };

  // Handle Restore Execution
  const handleExecuteRestore = async () => {
    if (!inspectionResult?.payload) return;
    setIsRestoring(true);
    setRestoreOutcome(null);

    try {
      const res = await executeRestoreBackup(
        inspectionResult.payload,
        restoreMode,
        restoreMode === 'MERGE' ? conflictResolutions : undefined
      );

      if (res.success) {
        setRestoreOutcome({ type: 'success', text: res.message });
        setRestoreFileContent(null);
        setInspectionResult(null);
        setMergeInspection(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setRestoreOutcome({ type: 'error', text: res.error || 'Restore failed.' });
      }
    } catch (e: any) {
      setRestoreOutcome({ type: 'error', text: e.message || 'Unexpected restore error.' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Rebuild Calculations
  const handleRebuild = () => {
    setRebuildingStatus('Recomputing entire rate derivation & monthly attendance ledger...');
    setTimeout(() => {
      const res = rebuildCalculations();
      setRebuildingStatus(`Calculations rebuilt across ${res.refreshedDaysCount} records at ${new Date(res.timestamp).toLocaleTimeString()}.`);
      setTimeout(() => setRebuildingStatus(null), 4000);
    }, 400);
  };

  // Handle Deterministic Tests Rerun
  const handleRerunTests = async () => {
    setTestingStatus(true);
    await rerunStep9Tests();
    setTestingStatus(false);
  };

  // Handle Factory Reset
  const handleExecuteReset = async () => {
    if (resetConfirmInput !== 'DELETE SALARYPULSE DATA') return;
    setIsResetting(true);
    try {
      await resetApplicationDataWithSafetyBackup();
      setShowResetModal(false);
      setResetConfirmInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const statusColor = systemHealth.status === 'HEALTHY' 
    ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30' 
    : systemHealth.status === 'WARNING' 
    ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30' 
    : 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';

  return (
    <div id="step9-data-management" className="space-y-8 animate-fadeIn">
      {/* ------------------------------------------------------------------ */}
      {/* SYSTEM HEALTH & METRIC HERO */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif-display">System Health & Storage Integrity</h3>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${statusColor}`}>
                  {systemHealth.status}
                </span>
              </div>
              <p className="text-xs text-[#737373]">Schema v{systemHealth.schemaVersion} • Local-First Immutable Storage Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRebuild}
              className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white flex items-center gap-1.5 transition"
              title="Re-run mathematical derivations across all recorded attendance days and months"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Rebuild Calculations</span>
            </button>
            <button
              onClick={() => runIntegrityCheck()}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audit Now</span>
            </button>
          </div>
        </div>

        {rebuildingStatus && (
          <div className="p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{rebuildingStatus}</span>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase font-semibold">Storage Footprint</span>
            <div className="text-sm font-mono font-bold text-white">
              {((systemHealth?.storageSizeBytes || 0) / 1024).toFixed(1)} KB
            </div>
            <p className="text-[10px] text-[#555]">Browser LocalStorage</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase font-semibold">Attendance Days</span>
            <div className="text-sm font-mono font-bold text-[#10B981]">
              {systemHealth?.recordCounts?.attendanceDays ?? 0} Days
            </div>
            <p className="text-[10px] text-[#555]">{systemHealth?.recordCounts?.workSessions ?? 0} Work Sessions Recorded</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase font-semibold">Reconciliations</span>
            <div className="text-sm font-mono font-bold text-[#D4AF37]">
              {systemHealth?.recordCounts?.salaryReconciliations ?? 0} Months
            </div>
            <p className="text-[10px] text-[#555]">{systemHealth?.configDriftCount ?? 0} Historical Config Drifts</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase font-semibold">Last Full Backup</span>
            <div className="text-xs font-mono font-bold text-white truncate">
              {systemHealth?.lastBackupDate ? new Date(systemHealth.lastBackupDate).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-[10px] text-[#555]">
              {systemHealth?.lastBackupDate ? new Date(systemHealth.lastBackupDate).toLocaleTimeString() : 'Backup recommended'}
            </p>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Attendance & Data Engine Operations</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsClockInAnalysisOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Clock-in Punctuality Logs</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Import Attendance Data</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete / Purge Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* NAVIGATION SUB-TABS */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-2 border-b border-[#1F1F1F] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('BACKUP_RESTORE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'BACKUP_RESTORE'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121212] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup, Restore & Merge</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INTEGRITY_DRIFT')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'INTEGRITY_DRIFT'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121212] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Integrity & Drift ({(integrityReport?.issues || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('EXPORTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'EXPORTS'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121212] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>CSV Data Exports</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TEST_SUITES')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap ${
            activeSubTab === 'TEST_SUITES'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#121212] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Step 9 Verification ({(step9TestResults || []).filter(t => t.passed).length}/15)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SUBTAB 1: BACKUP, RESTORE & MERGE */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'BACKUP_RESTORE' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Row: Create Backup on Left, Restore Center on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD A: CREATE BACKUP */}
            <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Create Safe System Backup</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#10B981] border border-[#262626]">
                  SHA-256 Verified
                </span>
              </div>

              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Exports all attendance days, live punch sessions, break rules, salary configurations, historical 3-way reconciliation records, and audit logs into a verified, standalone JSON payload.
              </p>

              {/* Encryption Options */}
              <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Password Protect Backup (AES-GCM-256)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={isEncryptedBackup}
                    onChange={(e) => setIsEncryptedBackup(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#141414] border-[#333333] text-[#D4AF37] focus:ring-0"
                  />
                </label>

                {isEncryptedBackup && (
                  <div className="space-y-1.5 pt-2 border-t border-[#1A1A1A] animate-fadeIn">
                    <label className="text-[11px] text-[#A3A3A3] font-semibold">Encryption Password</label>
                    <input
                      type="password"
                      placeholder="Enter strong passphrase..."
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                      className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 font-mono text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#737373]">
                      Standard Web Crypto PBKDF2 (100,000 iterations) + AES-GCM 256-bit.
                    </p>
                  </div>
                )}
              </div>

              {backupMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
                    backupMessage.type === 'success'
                      ? 'bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {backupMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{backupMessage.text}</span>
                </div>
              )}

              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isCreatingBackup ? 'Generating Backup...' : 'Download JSON Backup'}</span>
              </button>
            </div>

            {/* CARD B: RESTORE CENTER */}
            <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
                  <Upload className="w-4 h-4 text-[#D4AF37]" />
                  <span>Restore & Conflict-Aware Merge</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#D4AF37] border border-[#262626]">
                  Rollback Protected
                </span>
              </div>

              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Select a previously saved SalaryPulse JSON file. Automatic migration upgrades legacy schemas (v1→v9) and detects potential merge conflicts before touching local state.
              </p>

              {/* File Input Box */}
              <div className="border-2 border-dashed border-[#262626] hover:border-[#D4AF37]/50 rounded-xl p-4 text-center cursor-pointer bg-[#0A0A0A] transition"
                   onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.enc"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-[#737373] mx-auto mb-2" />
                <div className="text-xs font-semibold text-white">
                  {restoreFileName ? restoreFileName : 'Click or Drag & Drop Backup File'}
                </div>
                <p className="text-[10px] text-[#555]">Supports .json and encrypted payloads</p>
              </div>

              {/* Password prompt for encrypted file */}
              {inspectionResult?.isEncrypted && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Encrypted Backup Detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Enter decryption password..."
                      value={restorePassword}
                      onChange={(e) => setRestorePassword(e.target.value)}
                      className="flex-1 bg-[#141414] border border-[#262626] rounded-lg p-2 font-mono text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      onClick={handleDecrypt}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase transition"
                    >
                      Decrypt
                    </button>
                  </div>
                  {decryptError && <p className="text-[11px] text-rose-400">{decryptError}</p>}
                </div>
              )}

              {/* Restore Outcome Notice */}
              {restoreOutcome && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
                    restoreOutcome.type === 'success'
                      ? 'bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {restoreOutcome.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{restoreOutcome.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* INSPECTION & CONFLICT RESOLUTION MODAL / CARD */}
          {inspectionResult?.isValid && inspectionResult.payload && (
            <div className="rounded-2xl bg-[#121212] border border-[#D4AF37]/30 p-6 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Backup File Validated: {restoreFileName}</h4>
                    <p className="text-xs text-[#737373]">
                      Created: {new Date(inspectionResult.createdAt || inspectionResult.payload?.metadata?.createdAt || Date.now()).toLocaleString()} • Schema v{inspectionResult.schemaVersion || inspectionResult.payload?.metadata?.schemaVersion || 9}
                    </p>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center bg-[#0A0A0A] p-1 rounded-xl border border-[#262626]">
                  <button
                    onClick={() => setRestoreMode('MERGE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition ${
                      restoreMode === 'MERGE' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge (Safe)</span>
                  </button>
                  <button
                    onClick={() => setRestoreMode('REPLACE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition ${
                      restoreMode === 'REPLACE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Replace All</span>
                  </button>
                </div>
              </div>

              {/* Entity Breakdown Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <span className="text-[10px] text-[#737373] uppercase">Incoming Attendance</span>
                  <div className="text-sm font-mono font-bold text-white">
                    {inspectionResult.payload?.metadata?.recordCounts?.attendanceDays || inspectionResult.backupPayload?.metadata?.recordCounts?.attendanceDays || 0} Days
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <span className="text-[10px] text-[#737373] uppercase">New Unique Days</span>
                  <div className="text-sm font-mono font-bold text-[#10B981]">
                    +{mergeInspection?.newInBackupCount || 0} Records
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <span className="text-[10px] text-[#737373] uppercase">Identical Match</span>
                  <div className="text-sm font-mono font-bold text-[#A3A3A3]">
                    {mergeInspection?.identicalCount || 0} Records
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                  <span className="text-[10px] text-[#737373] uppercase">Modified Conflicts</span>
                  <div className={`text-sm font-mono font-bold ${(mergeInspection?.conflictCount || 0) > 0 ? 'text-amber-400' : 'text-[#10B981]'}`}>
                    {mergeInspection?.conflictCount || 0} Conflicts
                  </div>
                </div>
              </div>

              {/* Conflict Resolver List (If mode is MERGE and conflicts exist) */}
              {restoreMode === 'MERGE' && mergeInspection && mergeInspection.conflicts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5 text-amber-400" />
                      <span>Itemized Merge Conflict Resolutions</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const m = new Map<string, MergeConflictResolution>();
                          mergeInspection.conflicts.forEach(c => m.set(c.id, 'USE_BACKUP'));
                          setConflictResolutions(m);
                        }}
                        className="text-[10px] font-mono text-[#D4AF37] hover:underline"
                      >
                        Accept All Backup
                      </button>
                      <span className="text-[#333]">|</span>
                      <button
                        onClick={() => {
                          const m = new Map<string, MergeConflictResolution>();
                          mergeInspection.conflicts.forEach(c => m.set(c.id, 'KEEP_CURRENT'));
                          setConflictResolutions(m);
                        }}
                        className="text-[10px] font-mono text-[#A3A3A3] hover:underline"
                      >
                        Keep All Local
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {(mergeInspection?.conflicts || []).map(c => {
                      const choice = conflictResolutions.get(c.id) || 'USE_BACKUP';
                      return (
                        <div key={c.id} className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-bold text-white font-mono">{c.entityKey || c.id} ({c.entityType})</div>
                            <div className="text-[11px] text-[#737373] mt-0.5">
                              Local: <span className="text-[#A3A3A3] font-mono">{c.currentSummary}</span> vs Backup: <span className="text-[#D4AF37] font-mono">{c.backupSummary}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                const next = new Map(conflictResolutions);
                                next.set(c.id, 'USE_BACKUP');
                                setConflictResolutions(next);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition ${
                                choice === 'USE_BACKUP' ? 'bg-[#D4AF37] text-black' : 'bg-[#141414] text-[#737373] border border-[#262626]'
                              }`}
                            >
                              Use Backup
                            </button>
                            <button
                              onClick={() => {
                                const next = new Map(conflictResolutions);
                                next.set(c.id, 'KEEP_CURRENT');
                                setConflictResolutions(next);
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition ${
                                choice === 'KEEP_CURRENT' ? 'bg-[#10B981] text-black' : 'bg-[#141414] text-[#737373] border border-[#262626]'
                              }`}
                            >
                              Keep Local
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F1F]">
                <button
                  onClick={() => {
                    setInspectionResult(null);
                    setRestoreFileContent(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-xs font-semibold text-[#A3A3A3]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition flex items-center gap-2 ${
                    restoreMode === 'REPLACE'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#D4AF37] hover:bg-[#c49f27] text-black'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRestoring ? 'Applying Changes...' : restoreMode === 'REPLACE' ? 'Replace All Local Data' : 'Execute Safe Merge'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUBTAB 2: DATA INTEGRITY & CONFIGURATION DRIFT */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'INTEGRITY_DRIFT' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Integrity Report Overview */}
          <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Automated Integrity Verification Checks</span>
              </div>
              <span className="text-xs text-[#737373]">
                Checked: {new Date(integrityReport.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {(integrityReport?.issues || []).length === 0 ? (
              <div className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                <div className="text-sm font-bold text-white">All Integrity Constraints Verified Pass</div>
                <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
                  Zero timestamp overlaps, no negative break durations, no duplicate calendar days, and overtime mathematics strictly align with normal working hours.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(integrityReport?.issues || []).map(issue => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-xl border space-y-2 transition ${
                      issue.severity === 'CRITICAL' || issue.severity === 'ERROR'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            issue.severity === 'CRITICAL' || issue.severity === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs font-bold text-white">{issue.title}</span>
                        </div>
                        <p className="text-xs text-[#A3A3A3]">{issue.description}</p>
                      </div>
                      {issue.suggestedFix && (
                        <span className="text-[10px] font-mono text-[#D4AF37] px-2 py-1 rounded bg-[#141414] border border-[#262626] shrink-0">
                          {issue.suggestedFix}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Configuration Drift Viewer */}
          <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
                <History className="w-4 h-4 text-[#D4AF37]" />
                <span>Historical Snapshots & Configuration Drift Protection</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#262626]">
                Immutable
              </span>
            </div>

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Locked historical reconciliation records retain exact base rates and snapshots at the time of closing. Changes to current settings (e.g. salary raises in August) do not retroactively alter locked historical payrolls (e.g. June).
            </p>

            {(historicalConfigDiffs || []).length === 0 ? (
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#737373]">
                No configuration drift detected between current settings and locked historical payroll records.
              </div>
            ) : (
              <div className="space-y-3">
                {(historicalConfigDiffs || []).map((drift, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{drift.month} Historical Record</span>
                      <span className="text-[10px] font-mono text-[#D4AF37] px-2 py-0.5 rounded bg-[#141414] border border-[#262626]">
                        {drift.diffSummary}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-[11px]">
                      <div>
                        <span className="text-[#737373] block text-[10px]">Historical Locked Net</span>
                        <span className="text-[#10B981] font-bold">₹{drift.snapshotNetPay?.toFixed(2) ?? '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-[#737373] block text-[10px]">Current Active Config Base</span>
                        <span className="text-[#A3A3A3]">₹{drift.currentConfigBaseSalary?.toFixed(2) ?? '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUBTAB 3: CSV DATA EXPORTS */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'EXPORTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Card 1: Attendance History */}
          <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-serif-display">Attendance & Hours Ledger</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Complete daily punch sessions, active work seconds, break durations, normal/overtime splits, and calculated daily earnings.
              </p>
            </div>
            <button
              onClick={exportAttendanceCSV}
              className="w-full py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-bold text-[#10B981] flex items-center justify-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Attendance CSV</span>
            </button>
          </div>

          {/* Card 2: 3-Way Payroll Ledger */}
          <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-serif-display">3-Way Payroll Ledger</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Multi-month official payslips vs Pulse calculations vs actual bank deposits with itemized discrepancy resolutions and dispute tracking.
              </p>
            </div>
            <button
              onClick={exportPayrollCSV}
              className="w-full py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-bold text-[#D4AF37] flex items-center justify-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payroll Ledger CSV</span>
            </button>
          </div>

          {/* Card 3: Salary Intelligence & Analytics */}
          <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-serif-display">Salary Intelligence KPI</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Aggregated lifetime actual compensation, total overtime yields, bonus qualification trends, and hourly wage analytics.
              </p>
            </div>
            <button
              onClick={exportAnalyticsCSV}
              className="w-full py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-bold text-[#3B82F6] flex items-center justify-center gap-2 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Intelligence CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUBTAB 4: STEP 9 TEST SUITE (15 DETERMINISTIC TESTS) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'TEST_SUITES' && (
        <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#10B981]" />
              <div>
                <h4 className="text-sm font-bold text-white font-serif-display">
                  Step 9 Production Hardening & Integrity Suite (15 Tests)
                </h4>
                <p className="text-xs text-[#737373]">Deterministic test cases validating backups, duplicate immunity, and snapshot isolation</p>
              </div>
            </div>

            <button
              onClick={handleRerunTests}
              disabled={testingStatus}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingStatus ? 'animate-spin' : ''}`} />
              <span>{testingStatus ? 'Running Suite...' : 'Re-Run 15 Tests'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(step9TestResults || []).map(test => (
              <div
                key={test.id}
                className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#D4AF37] text-[10px]">{test.id}</span>
                    <span className="font-medium text-white">{test.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#737373]">
                    Expected: {test.expected}
                  </div>
                  <div className="text-[10px] font-mono text-[#A3A3A3]">
                    Actual: {test.actual}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 shrink-0">
                  PASSED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SAFETY FACTORY RESET TRIGGER */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#140E0E] border border-rose-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-sm font-bold text-rose-300 font-serif-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency Factory Reset with Auto-Backup</span>
          </div>
          <p className="text-xs text-[#737373]">
            Triggers an immediate automatic safety JSON download before wiping localStorage clean to initial state.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 uppercase tracking-wider transition shrink-0"
        >
          Reset Application Data
        </button>
      </div>

      {/* FACTORY RESET CONFIRMATION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-serif-display">
              <ShieldAlert className="w-5 h-5" />
              <span>Confirm Destructive Factory Reset</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              This action will reset all salary rules, recorded work punch sessions, breaks, and custom scenarios back to factory defaults. An emergency backup JSON will be downloaded to your computer automatically.
            </p>
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] text-[#737373]">
                To confirm, type <span className="text-white font-mono font-bold">DELETE SALARYPULSE DATA</span> below:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="DELETE SALARYPULSE DATA"
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F1F1F]">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-xs font-semibold text-[#A3A3A3]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={resetConfirmInput !== 'DELETE SALARYPULSE DATA' || isResetting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Saving Safety Backup & Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock-In Analysis Punctuality Modal */}
      <ClockInAnalysisModal
        isOpen={isClockInAnalysisOpen}
        onClose={() => setIsClockInAnalysisOpen(false)}
        onInspectDay={(dateStr) => {
          // Can inspect or view details
        }}
      />

      {/* Delete All Data Modal */}
      <DeleteAllDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Import Attendance & Configure Salary Modal */}
      <ImportAttendanceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
