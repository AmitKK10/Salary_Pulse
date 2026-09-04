// ============================================================================
// SALARYPULSE — THREE PILLARS SALARY COMPARISON COMPONENT (STEP 7)
// SalaryPulse Calculated vs Official HR Slip vs Actual Bank Receipt
// ============================================================================

import React from 'react';
import { 
  Building2, 
  Landmark, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight,
  Edit3,
  Calendar,
  Lock
} from 'lucide-react';
import { SalaryReconciliationRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ThreePillarsSummaryProps {
  record: SalaryReconciliationRecord;
  onEditOfficialSlip: () => void;
  onEditBankReceipt: () => void;
}

export const ThreePillarsSummary: React.FC<ThreePillarsSummaryProps> = ({
  record,
  onEditOfficialSlip,
  onEditBankReceipt,
}) => {
  const { pulseData, officialSlip, bankReceipt, forensicSummary, isLocked } = record;
  const netVariance = forensicSummary.netVariance;
  const bankVariance = forensicSummary.bankVariance;

  return (
    <div id="three-pillars-container" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* PILLAR 1: SALARYPULSE ACCRUED */}
      <div 
        id="pillar-pulse-accrual"
        className="rounded-2xl bg-[#0E0E0E] border border-[#262626] p-5 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl"
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. SalaryPulse Accrual</h3>
                <span className="text-[10px] text-[#737373] tracking-wide">Live Biometric & Schedule Engine</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[10px] font-semibold text-[#10B981] uppercase tracking-wider">
              Calculated
            </span>
          </div>

          {/* Earnings & Deductions Quick List */}
          <div className="space-y-1.5 pt-2 border-t border-[#1C1C1C] text-xs">
            <div className="flex justify-between text-[#A3A3A3]">
              <span>Base Pay ({pulseData.scheduledWorkingDays}d sched):</span>
              <span className="font-mono text-white font-medium">{formatCurrency(pulseData.basePay)}</span>
            </div>
            <div className="flex justify-between text-[#A3A3A3]">
              <span>Overtime ({pulseData.otHours.toFixed(1)}h):</span>
              <span className="font-mono text-[#D4AF37] font-medium">+{formatCurrency(pulseData.overtimePay)}</span>
            </div>
            <div className="flex justify-between text-[#A3A3A3]">
              <span>Attendance Bonus:</span>
              <span className="font-mono text-[#10B981] font-medium">+{formatCurrency(pulseData.attendanceBonus)}</span>
            </div>
            <div className="flex justify-between text-[#A3A3A3]">
              <span>Deductions Configured:</span>
              <span className="font-mono text-[#737373] font-medium">-{formatCurrency(pulseData.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Big Net Result */}
        <div className="pt-3 border-t border-[#1C1C1C]">
          <div className="text-[10px] uppercase tracking-widest text-[#737373] font-semibold">Projected Take-Home</div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-extrabold text-[#D4AF37] font-mono tracking-tight">
              {formatCurrency(pulseData.netPay)}
            </span>
            <span className="text-[11px] text-[#737373] font-mono">
              ₹{(pulseData.perHourRate).toFixed(0)}/hr base
            </span>
          </div>
        </div>
      </div>

      {/* PILLAR 2: OFFICIAL PAYROLL SLIP */}
      <div 
        id="pillar-official-slip"
        className={`rounded-2xl p-5 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl border transition-all ${
          !officialSlip.isProvided 
            ? 'bg-[#121212]/80 border-dashed border-[#333333]' 
            : Math.abs(netVariance) < 1 
              ? 'bg-[#0E0E0E] border-[#10B981]/30' 
              : 'bg-[#0E0E0E] border-[#EF4444]/30'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Official HR Slip</h3>
                <span className="text-[10px] text-[#737373] tracking-wide">
                  {officialSlip.isProvided ? (officialSlip.slipNumber || 'Company Payroll Record') : 'Not Entered Yet'}
                </span>
              </div>
            </div>

            {!isLocked && (
              <button
                id="btn-edit-official-slip"
                onClick={onEditOfficialSlip}
                className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-[10px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3 h-3 text-[#3B82F6]" />
                <span>{officialSlip.isProvided ? 'Edit Slip' : 'Enter Slip'}</span>
              </button>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] text-[#737373] font-semibold uppercase">
                <Lock className="w-3 h-3 text-[#D4AF37]" /> Locked
              </span>
            )}
          </div>

          {officialSlip.isProvided ? (
            <div className="space-y-1.5 pt-2 border-t border-[#1C1C1C] text-xs">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Base ({officialSlip.reportedPresentDays || pulseData.presentDays}d):</span>
                <span className="font-mono text-white font-medium">{formatCurrency(officialSlip.basePay)}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Overtime ({officialSlip.reportedOTHours ? `${officialSlip.reportedOTHours}h` : 'HR calc'}):</span>
                <span className="font-mono text-white font-medium">+{formatCurrency(officialSlip.overtimePay)}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Allowances & Bonus:</span>
                <span className="font-mono text-white font-medium">+{formatCurrency(officialSlip.attendanceBonus + officialSlip.specialAllowance + officialSlip.performanceBonus)}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Total Deductions (PF/PT/TDS):</span>
                <span className="font-mono text-[#EF4444] font-medium">-{formatCurrency(officialSlip.totalDeductions)}</span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-[#737373]">No official payroll slip entered for this month.</p>
              <button
                onClick={onEditOfficialSlip}
                className="text-xs text-[#3B82F6] hover:underline font-medium"
              >
                Click here to enter line items or pre-fill
              </button>
            </div>
          )}
        </div>

        {/* Big Official Result */}
        <div className="pt-3 border-t border-[#1C1C1C]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#737373] font-semibold">Official Net Salary</span>
            {officialSlip.isProvided && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                Math.abs(netVariance) < 1 
                  ? 'bg-[#10B981]/10 text-[#10B981]' 
                  : 'bg-[#EF4444]/10 text-[#EF4444]'
              }`}>
                {netVariance >= 0 ? '+' : ''}{formatCurrency(netVariance)} vs Pulse
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {officialSlip.isProvided ? formatCurrency(officialSlip.netSalary) : '—'}
            </span>
            {officialSlip.disbursalDate && (
              <span className="text-[10px] text-[#737373] font-mono">
                Disbursed: {officialSlip.disbursalDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PILLAR 3: ACTUAL BANK RECEIPT */}
      <div 
        id="pillar-bank-receipt"
        className={`rounded-2xl p-5 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl border transition-all ${
          !bankReceipt.isProvided 
            ? 'bg-[#121212]/80 border-dashed border-[#333333]' 
            : Math.abs(bankVariance) < 1 
              ? 'bg-[#0E0E0E] border-[#10B981]/30' 
              : 'bg-[#0E0E0E] border-[#F59E0B]/30'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Actual Bank Credit</h3>
                <span className="text-[10px] text-[#737373] tracking-wide">
                  {bankReceipt.bankName || 'Bank Deposit'} {bankReceipt.accountLast4 ? `(..${bankReceipt.accountLast4})` : ''}
                </span>
              </div>
            </div>

            {!isLocked && (
              <button
                id="btn-edit-bank-receipt"
                onClick={onEditBankReceipt}
                className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-[10px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3 h-3 text-[#10B981]" />
                <span>{bankReceipt.isProvided ? 'Edit Bank' : 'Enter Bank'}</span>
              </button>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 text-[10px] text-[#737373] font-semibold uppercase">
                <Lock className="w-3 h-3 text-[#D4AF37]" /> Locked
              </span>
            )}
          </div>

          {bankReceipt.isProvided ? (
            <div className="space-y-1.5 pt-2 border-t border-[#1C1C1C] text-xs">
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Credit Date:</span>
                <span className="font-mono text-white font-medium">{bankReceipt.depositDate || 'Confirmed'}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>UTR / Ref No:</span>
                <span className="font-mono text-white font-medium truncate max-w-[140px]">{bankReceipt.transactionRef || 'NEFT/RTGS'}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Status:</span>
                <span className="font-semibold text-[#10B981] uppercase text-[10px]">{bankReceipt.depositStatus}</span>
              </div>
              <div className="flex justify-between text-[#A3A3A3]">
                <span>Bank Variance vs Slip:</span>
                <span className={`font-mono font-medium ${Math.abs(bankVariance) < 1 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                  {bankVariance >= 0 ? '+' : ''}{formatCurrency(bankVariance)}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-xs text-[#737373]">Awaiting bank deposit entry or statement confirmation.</p>
              <button
                onClick={onEditBankReceipt}
                className="text-xs text-[#10B981] hover:underline font-medium"
              >
                Enter deposit amount & reference
              </button>
            </div>
          )}
        </div>

        {/* Big Bank Result */}
        <div className="pt-3 border-t border-[#1C1C1C]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#737373] font-semibold">Credited in Bank</span>
            {bankReceipt.isProvided && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                Math.abs(bankVariance) < 1 
                  ? 'bg-[#10B981]/10 text-[#10B981]' 
                  : 'bg-[#F59E0B]/10 text-[#F59E0B]'
              }`}>
                {Math.abs(bankVariance) < 1 ? '100% Match' : `${formatCurrency(bankVariance)} diff`}
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-extrabold text-[#10B981] font-mono tracking-tight">
              {bankReceipt.isProvided ? formatCurrency(bankReceipt.amountReceived) : 'Pending'}
            </span>
            <span className="text-[10px] text-[#737373]">
              {bankReceipt.isProvided ? 'Direct Deposit' : 'End of Month'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
