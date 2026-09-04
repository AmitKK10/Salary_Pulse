// ============================================================================
// SALARYPULSE — OFFICIAL SALARY RECONCILIATION VIEW (STEP 7)
// Executive 3-Way Reconciliation Suite: Pulse Accrual vs Official Slip vs Bank Credit
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Mail, 
  FileText, 
  RotateCcw, 
  Printer, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThreePillarsSummary } from '../salaryReconciliation/ThreePillarsSummary';
import { ForensicNarrativeCard } from '../salaryReconciliation/ForensicNarrativeCard';
import { DifferenceEngineTable } from '../salaryReconciliation/DifferenceEngineTable';
import { OfficialSlipEditorModal } from '../salaryReconciliation/OfficialSlipEditorModal';
import { BankReceiptModal } from '../salaryReconciliation/BankReceiptModal';
import { HRDisputeModal } from '../salaryReconciliation/HRDisputeModal';
import { YearlyReconciliationChart } from '../salaryReconciliation/YearlyReconciliationChart';
import { formatCurrency } from '../../utils/formatters';

export const SalaryReconciliationView: React.FC = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    user,
    currentSalaryReconciliation,
    salaryReconciliationRecords,
    updateOfficialSlip,
    updateBankReceipt,
    updateDiscrepancyResolution,
    lockSalaryReconciliation,
    unlockSalaryReconciliation,
    prefillOfficialSlipFromPulse,
    updateDisputeDetails,
    yearlySalarySummaries,
  } = useApp();

  // Modals state
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState<boolean>(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState<boolean>(false);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState<boolean>(false);
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState<boolean>(false);
  const [unlockReason, setUnlockReason] = useState<string>('');
  const [lockNote, setLockNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'RECONCILIATION' | 'TRENDS' | 'PRINT_VIEW'>('RECONCILIATION');

  const {
    pulseData,
    officialSlip,
    bankReceipt,
    forensicSummary,
    itemizedDiscrepancies = [],
    isLocked,
    status,
    disputeStatus,
  } = currentSalaryReconciliation || ({} as any);

  const handleLockConfirm = () => {
    lockSalaryReconciliation(selectedMonth, lockNote);
    setIsLockConfirmOpen(false);
    setLockNote('');
  };

  const handleUnlockConfirm = () => {
    unlockSalaryReconciliation(selectedMonth, unlockReason);
    setIsUnlockConfirmOpen(false);
    setUnlockReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOCKED_FINAL':
        return (
          <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Locked Snapshot
          </span>
        );
      case 'DISPUTE_RAISED':
        return (
          <span className="px-3 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Dispute Raised
          </span>
        );
      case 'RECONCILED_MATCH':
        return (
          <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Reconciled
          </span>
        );
      case 'IN_PROGRESS':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> In Progress
          </span>
        );
    }
  };

  return (
    <div id="salary-reconciliation-view" className="space-y-6 pb-12">
      {/* Top Header & Context Bar */}
      <div className="rounded-2xl bg-[#0E0E0E] border border-[#262626] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-serif-display tracking-tight">
                Official Salary Reconciliation
              </h1>
              {getStatusBadge(status)}
              {disputeStatus && disputeStatus !== 'NONE' && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-[10px] font-bold uppercase">
                  HR Ticket: {disputeStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] max-w-2xl">
              Deterministic 3-Way Comparison: SalaryPulse Verified Biometrics vs Official HR Payroll Slip vs Actual Bank Deposit.
            </p>
          </div>

          {/* Month Selector & Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Month Quick Select */}
            <div className="flex items-center gap-1 bg-[#141414] border border-[#262626] rounded-xl p-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#737373] ml-2 mr-1" />
              {['2026-08', '2026-07', '2026-06'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-lg font-mono transition text-xs ${
                    selectedMonth === m 
                      ? 'bg-[#D4AF37] text-black font-bold shadow' 
                      : 'text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  {m === '2026-08' ? 'Aug 26 (Live)' : m === '2026-07' ? 'Jul 26' : 'Jun 26'}
                </button>
              ))}
            </div>

            {/* Lock / Unlock Toggle */}
            {isLocked ? (
              <button
                id="btn-unlock-reconciliation"
                onClick={() => setIsUnlockConfirmOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#1F1F1F] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-[#D4AF37] flex items-center gap-2 transition"
                title="Unlock immutable record for edits"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock for Edit</span>
              </button>
            ) : (
              <button
                id="btn-lock-reconciliation"
                onClick={() => setIsLockConfirmOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] flex items-center gap-2 transition"
                title="Permanently seal this month's audited reconciliation"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Snapshot</span>
              </button>
            )}

            {/* Quick Actions */}
            {!isLocked && (
              <button
                id="btn-prefill-pulse"
                onClick={() => prefillOfficialSlipFromPulse(selectedMonth)}
                className="px-3.5 py-2 rounded-xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#262626] text-xs font-semibold text-white flex items-center gap-2 transition"
                title="Pre-populate slip fields from calculation engine"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Pre-fill from Calculation</span>
              </button>
            )}

            <button
              id="btn-open-dispute-modal"
              onClick={() => setIsDisputeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-xs font-bold text-[#EF4444] flex items-center gap-2 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>HR Query Draft</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#1C1C1C] text-xs">
          <button
            onClick={() => setActiveTab('RECONCILIATION')}
            className={`px-4 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'RECONCILIATION'
                ? 'bg-[#262626] text-white font-bold'
                : 'text-[#737373] hover:text-white'
            }`}
          >
            3-Way Reconciliation Audit
          </button>
          <button
            onClick={() => setActiveTab('TRENDS')}
            className={`px-4 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'TRENDS'
                ? 'bg-[#262626] text-white font-bold'
                : 'text-[#737373] hover:text-white'
            }`}
          >
            Multi-Month History & Trends
          </button>
          <button
            onClick={() => setActiveTab('PRINT_VIEW')}
            className={`px-4 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'PRINT_VIEW'
                ? 'bg-[#262626] text-white font-bold'
                : 'text-[#737373] hover:text-white'
            }`}
          >
            Printable Audit Sheet
          </button>
        </div>
      </div>

      {/* TAB 1: 3-WAY RECONCILIATION AUDIT */}
      {activeTab === 'RECONCILIATION' && (
        <div className="space-y-6 animate-fade-in">
          {/* Three Pillars Summary Cards */}
          <ThreePillarsSummary
            record={currentSalaryReconciliation}
            onEditOfficialSlip={() => setIsOfficialModalOpen(true)}
            onEditBankReceipt={() => setIsBankModalOpen(true)}
          />

          {/* Forensic "Why is my salary different?" Narrative */}
          <ForensicNarrativeCard
            narrative={forensicSummary}
            onOpenHRDisputeModal={() => setIsDisputeModalOpen(true)}
          />

          {/* Line-by-Line Difference Engine Table */}
          <DifferenceEngineTable
            discrepancies={itemizedDiscrepancies}
            isLocked={isLocked}
            onUpdateResolution={(id, res, note) => updateDiscrepancyResolution(selectedMonth, id, res, note)}
          />
        </div>
      )}

      {/* TAB 2: MULTI-MONTH TRENDS */}
      {activeTab === 'TRENDS' && (
        <div className="space-y-6 animate-fade-in">
          <YearlyReconciliationChart
            summaries={yearlySalarySummaries}
            selectedMonth={selectedMonth}
            onSelectMonth={(m) => {
              setSelectedMonth(m);
              setActiveTab('RECONCILIATION');
            }}
          />
        </div>
      )}

      {/* TAB 3: PRINTABLE AUDIT SHEET */}
      {activeTab === 'PRINT_VIEW' && (
        <div className="rounded-2xl bg-white text-black p-8 shadow-2xl space-y-6 font-sans">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">SalaryPulse Reconciliation Statement</h2>
              <p className="text-xs text-neutral-600">Month: {selectedMonth} • Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{user.name} ({user.employeeId || 'EMP-1082'})</div>
              <div className="text-xs text-neutral-600">{user.designation || user.role} • {user.department}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-neutral-50 text-xs">
            <div>
              <div className="font-bold text-neutral-500 uppercase">1. Calculated Accrual</div>
              <div className="text-lg font-black">{formatCurrency(pulseData.netPay)}</div>
              <div className="text-[10px] text-neutral-500">{pulseData.presentDays} days • {pulseData.otHours.toFixed(1)} OT hrs</div>
            </div>
            <div>
              <div className="font-bold text-neutral-500 uppercase">2. Official Slip Net</div>
              <div className="text-lg font-black">{officialSlip.isProvided ? formatCurrency(officialSlip.netSalary) : 'N/A'}</div>
              <div className="text-[10px] text-neutral-500">Ref: {officialSlip.slipNumber || 'Pending'}</div>
            </div>
            <div>
              <div className="font-bold text-neutral-500 uppercase">3. Bank Credited</div>
              <div className="text-lg font-black text-emerald-700">{bankReceipt.isProvided ? formatCurrency(bankReceipt.amountReceived) : 'Pending'}</div>
              <div className="text-[10px] text-neutral-500">{bankReceipt.bankName} (..{bankReceipt.accountLast4})</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">Itemized Breakdown</h3>
            <table className="w-full text-left text-xs border-collapse border border-neutral-300">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-300 font-bold">
                  <th className="p-2 border-r border-neutral-300">Component</th>
                  <th className="p-2 border-r border-neutral-300 text-right">Pulse Accrued</th>
                  <th className="p-2 border-r border-neutral-300 text-right">Official Slip</th>
                  <th className="p-2 border-r border-neutral-300 text-right">Variance</th>
                  <th className="p-2">Forensic Assessment</th>
                </tr>
              </thead>
              <tbody>
                {itemizedDiscrepancies.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-200">
                    <td className="p-2 border-r border-neutral-300 font-medium">{item.title}</td>
                    <td className="p-2 border-r border-neutral-300 text-right font-mono">{formatCurrency(item.pulseAmount)}</td>
                    <td className="p-2 border-r border-neutral-300 text-right font-mono">{formatCurrency(item.officialAmount)}</td>
                    <td className="p-2 border-r border-neutral-300 text-right font-mono font-bold">
                      {item.variance !== 0 ? (item.variance > 0 ? `+${formatCurrency(item.variance)}` : formatCurrency(item.variance)) : '₹0.00'}
                    </td>
                    <td className="p-2 text-neutral-600 text-[11px]">{item.impactNote || item.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 text-[10px] text-neutral-500 flex justify-between items-center">
            <span>Audit Status: {status} • Sealed & Reconciled via SalaryPulse Deterministic Engine</span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-black text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Statement
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: OFFICIAL PAYSLIP EDITOR */}
      <OfficialSlipEditorModal
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        month={selectedMonth}
        initialSlip={officialSlip}
        pulseData={pulseData}
        onSave={(updated) => updateOfficialSlip(selectedMonth, updated)}
      />

      {/* MODAL 2: BANK RECEIPT MODAL */}
      <BankReceiptModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        month={selectedMonth}
        initialReceipt={bankReceipt}
        officialSlip={officialSlip}
        onSave={(updated) => updateBankReceipt(selectedMonth, updated)}
      />

      {/* MODAL 3: HR DISPUTE MODAL */}
      <HRDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        record={currentSalaryReconciliation}
        user={user}
        onSaveDispute={(notes, status, tkt) => updateDisputeDetails(selectedMonth, notes, status, tkt)}
      />

      {/* MODAL 4: LOCK CONFIRMATION */}
      {isLockConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E0E0E] border border-[#262626] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <Lock className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-serif-display">Lock Reconciliation Snapshot?</h3>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Locking seals this month's calculation, official slip, and bank figures as an immutable historical record. Future configuration changes will not modify this snapshot.
            </p>
            <div>
              <label className="block text-[11px] text-[#737373] uppercase tracking-wider mb-1 font-mono">
                Audit Note (Optional)
              </label>
              <input
                type="text"
                value={lockNote}
                onChange={(e) => setLockNote(e.target.value)}
                placeholder="e.g. Month finalized and signed off with HR"
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsLockConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleLockConfirm}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider shadow"
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: UNLOCK CONFIRMATION */}
      {isUnlockConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E0E0E] border border-[#262626] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <Unlock className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-serif-display">Unlock Reconciled Snapshot?</h3>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Unlocking allows modifying line items and re-calculating variances. An audit log entry will record this action.
            </p>
            <div>
              <label className="block text-[11px] text-[#737373] uppercase tracking-wider mb-1 font-mono">
                Reason for Unlocking
              </label>
              <input
                type="text"
                required
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="e.g. Received revised pay slip from HR"
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EF4444]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsUnlockConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockConfirm}
                className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-xs font-bold uppercase tracking-wider shadow"
              >
                Unlock Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
