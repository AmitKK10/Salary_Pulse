// ============================================================================
// SALARYPULSE — DELETE ALL DATA & STORAGE PURGE DOUBLE-CONFIRMATION MODAL
// Allows users to clear all attendance records, work sessions, and application history,
// or perform a complete factory reset stored in localStorage with double confirmation.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Download, 
  ShieldAlert, 
  Check, 
  Info,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Database,
  Clock,
  Calendar,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DeleteAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAllDataModal: React.FC<DeleteAllDataModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    deleteAllData, 
    createBackup, 
    attendanceDays, 
    salaryConfig,
    salaryReconciliationRecords,
    auditLogs,
    scenarios
  } = useApp();

  // Double-Confirmation Steps: Step 1 (Scope & Safety Review) -> Step 2 (Double Verification & Execution)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [deleteMode, setDeleteMode] = useState<'ATTENDANCE_ONLY' | 'FACTORY_RESET'>('ATTENDANCE_ONLY');
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [backupDownloaded, setBackupDownloaded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute total session count
  const totalSessions = useMemo(() => {
    let total = 0;
    for (const d of attendanceDays) {
      total += (d.workSessions || []).length + (d.breakSessions || []).length;
    }
    return total;
  }, [attendanceDays]);

  if (!isOpen) return null;

  const targetPhrase = deleteMode === 'ATTENDANCE_ONLY' ? 'CLEAR ALL DATA' : 'RESET EVERYTHING';
  const isTextConfirmed = 
    confirmText.trim().toUpperCase() === targetPhrase || 
    confirmText.trim().toUpperCase() === 'CLEAR' ||
    confirmText.trim().toUpperCase() === 'DELETE';

  const canExecute = currentStep === 2 && hasAcknowledgedRisk && isTextConfirmed && !isProcessing;

  const handleDownloadBackup = async () => {
    try {
      await createBackup(false);
      setBackupDownloaded(true);
      setStatusMessage({
        type: 'success',
        text: 'Emergency JSON backup file downloaded successfully to your device.',
      });
    } catch (e: any) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to download emergency backup.',
      });
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setCurrentStep(1);
    setConfirmText('');
    setHasAcknowledgedRisk(false);
    setStatusMessage(null);
    onClose();
  };

  const handleExecuteDelete = async () => {
    if (!canExecute) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await deleteAllData({
        resetSalaryConfig: deleteMode === 'FACTORY_RESET',
        preserveUser: false,
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'All stored attendance sessions and history cleared.',
      });

      setTimeout(() => {
        setIsProcessing(false);
        handleClose();
      }, 1500);
    } catch (e: any) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        text: e?.message || 'Failed to clear application data.',
      });
    }
  };

  return (
    <div 
      id="delete-all-data-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-lg my-6 bg-[#111111] border border-rose-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
        
        {/* Header with Step Indicator */}
        <div className="p-4 sm:p-5 border-b border-[#222222] bg-[#161212]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 font-serif-display">
                  Clear All Data & History
                </h2>
                <p className="text-xs text-[#888888]">
                  {currentStep === 1 ? 'Step 1 of 2: Select Scope & Safety Review' : 'Step 2 of 2: Double-Verification & Purge Confirmation'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 text-[#737373] hover:text-white rounded-lg hover:bg-[#222222] transition cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2-Step Progress Indicator */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep === 1 ? 'bg-amber-400' : 'bg-emerald-500'
            }`} />
            <div className={`h-1.5 rounded-full transition-all ${
              currentStep === 2 ? 'bg-rose-500' : 'bg-[#262626]'
            }`} />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs font-mono">
          
          {/* Status Alert Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: SCOPE SELECTION & IMPACT REVIEW */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-4">
              
              {/* Storage Footprint & Impact Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-center">
                  <div className="text-[10px] text-[#737373] uppercase font-semibold">Attendance</div>
                  <div className="text-sm font-bold text-white mt-0.5">{attendanceDays.length} Days</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-center">
                  <div className="text-[10px] text-[#737373] uppercase font-semibold">Sessions</div>
                  <div className="text-sm font-bold text-amber-300 mt-0.5">{totalSessions} Punches</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-center">
                  <div className="text-[10px] text-[#737373] uppercase font-semibold">Reconciliations</div>
                  <div className="text-sm font-bold text-[#D4AF37] mt-0.5">{salaryReconciliationRecords.length} Ledgers</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#161616] border border-[#262626] text-center">
                  <div className="text-[10px] text-[#737373] uppercase font-semibold">Audit Logs</div>
                  <div className="text-sm font-bold text-[#A3A3A3] mt-0.5">{auditLogs.length} Entries</div>
                </div>
              </div>

              {/* Emergency Safety Backup Banner */}
              <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#A3A3A3]">
                  <Download className={`w-4 h-4 ${backupDownloaded ? 'text-emerald-400' : 'text-[#D4AF37]'} shrink-0`} />
                  <span className="text-[11px]">
                    {backupDownloaded ? 'Safety backup downloaded' : 'Recommended: Save an emergency safety JSON backup'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    backupDownloaded
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#222222] hover:bg-[#2A2A2A] text-[#D4AF37] border-[#333333]'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{backupDownloaded ? 'Downloaded' : 'Download Backup'}</span>
                </button>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">
                  Select Purge Scope
                </div>

                {/* Option 1: Clear Attendance & Application History */}
                <label 
                  onClick={() => setDeleteMode('ATTENDANCE_ONLY')}
                  className={`p-3.5 rounded-xl border cursor-pointer block transition ${
                    deleteMode === 'ATTENDANCE_ONLY'
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm'
                      : 'bg-[#151515] border-[#242424] text-[#888888] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="radio" 
                      name="delMode" 
                      checked={deleteMode === 'ATTENDANCE_ONLY'}
                      onChange={() => setDeleteMode('ATTENDANCE_ONLY')}
                      className="mt-0.5 accent-amber-400"
                    />
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>Clear All Attendance Sessions & Application History</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                          Recommended
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed">
                        Erases all {attendanceDays.length} attendance records, live punch timers, break logs, reconciliation records, and application audit history. <strong>Preserves your configured Base Salary (₹{(salaryConfig.monthlyBaseSalary || 15000).toLocaleString()})</strong>, shift rules, and calculation basis.
                      </div>
                    </div>
                  </div>
                </label>

                {/* Option 2: Factory Reset */}
                <label 
                  onClick={() => setDeleteMode('FACTORY_RESET')}
                  className={`p-3.5 rounded-xl border cursor-pointer block transition ${
                    deleteMode === 'FACTORY_RESET'
                      ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-sm'
                      : 'bg-[#151515] border-[#242424] text-[#888888] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="radio" 
                      name="delMode" 
                      checked={deleteMode === 'FACTORY_RESET'}
                      onChange={() => setDeleteMode('FACTORY_RESET')}
                      className="mt-0.5 accent-rose-400"
                    />
                    <div>
                      <div className="font-bold text-rose-300 text-xs">
                        Complete Factory Reset (Wipe Everything)
                      </div>
                      <div className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed">
                        Completely resets all LocalStorage keys, restores salary configs, working schedules, and custom deductions back to factory blank defaults.
                      </div>
                    </div>
                  </div>
                </label>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: DOUBLE-CONFIRMATION & VERIFICATION */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Severe Warning Alert */}
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Double-Confirmation Required (Irreversible Action)</span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  You are about to permanently purge <strong>{attendanceDays.length} attendance records</strong>, all work sessions, break intervals, reconciliation histories, and audit logs from your browser storage.
                </p>
              </div>

              {/* Confirmation Step 1: Risk Acknowledgment Checkbox */}
              <label className="p-3.5 rounded-xl bg-[#171717] border border-[#2B2B2B] flex items-start gap-3 cursor-pointer select-none hover:bg-[#1C1C1C] transition">
                <input 
                  type="checkbox"
                  checked={hasAcknowledgedRisk}
                  onChange={(e) => setHasAcknowledgedRisk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-rose-500 cursor-pointer"
                />
                <div className="text-[11px] text-[#D4D4D4] leading-relaxed">
                  I understand that this action is <strong className="text-rose-400 font-bold">permanent and irreversible</strong>. All locally stored sessions and history will be deleted immediately.
                </div>
              </label>

              {/* Confirmation Step 2: Verification Keyword Typing */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-[#A3A3A3]">
                  To confirm deletion, please type <strong className="text-rose-400 font-bold tracking-wider font-mono">"{targetPhrase}"</strong> below:
                </div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "${targetPhrase}"`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#2D2D2D] text-white focus:outline-none focus:border-rose-500 text-xs font-mono uppercase tracking-wider"
                  autoFocus
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-[#222222] bg-[#141414] flex items-center justify-between gap-3">
          
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-[#202020] hover:bg-[#2A2A2A] text-[#888888] hover:text-white font-mono text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/30"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl bg-[#202020] hover:bg-[#2A2A2A] text-[#888888] hover:text-white font-mono text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={!canExecute}
                className={`px-5 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                  canExecute
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40 cursor-pointer animate-pulse'
                    : 'bg-[#222222] text-[#555555] cursor-not-allowed border border-[#303030]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isProcessing 
                    ? 'Clearing All Data...' 
                    : deleteMode === 'ATTENDANCE_ONLY' 
                      ? 'Permanently Clear All Sessions' 
                      : 'Permanently Reset Everything'}
                </span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

