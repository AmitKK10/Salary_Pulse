// ============================================================================
// SALARYPULSE — BANK RECEIPT ENTRY MODAL (STEP 7)
// Enter actual bank credit amount, UTR reference, and deposit date
// ============================================================================

import React, { useState } from 'react';
import { 
  X, 
  Landmark, 
  Save, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ActualBankReceipt, OfficialPayrollSlip } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BankReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  initialReceipt: ActualBankReceipt;
  officialSlip: OfficialPayrollSlip;
  onSave: (updatedBank: Partial<ActualBankReceipt>) => void;
}

export const BankReceiptModal: React.FC<BankReceiptModalProps> = ({
  isOpen,
  onClose,
  month,
  initialReceipt,
  officialSlip,
  onSave,
}) => {
  if (!isOpen) return null;

  const [amountReceived, setAmountReceived] = useState<number>(
    initialReceipt.amountReceived || officialSlip.netSalary || 0
  );
  const [depositDate, setDepositDate] = useState<string>(
    initialReceipt.depositDate || `${month}-31`
  );
  const [bankName, setBankName] = useState<string>(initialReceipt.bankName || 'HDFC Bank');
  const [accountLast4, setAccountLast4] = useState<string>(initialReceipt.accountLast4 || '4829');
  const [transactionRef, setTransactionRef] = useState<string>(
    initialReceipt.transactionRef || `CMS${month.replace('-', '')}8491`
  );
  const [depositStatus, setDepositStatus] = useState<ActualBankReceipt['depositStatus']>(
    initialReceipt.depositStatus || 'RECEIVED'
  );
  const [notes, setNotes] = useState<string>(initialReceipt.notes || '');

  const handleMatchOfficialNet = () => {
    setAmountReceived(officialSlip.netSalary);
    setDepositStatus('RECEIVED');
    setNotes('Exact match with official HR payslip net disbursement.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      amountReceived,
      depositDate,
      bankName,
      accountLast4,
      transactionRef,
      depositStatus,
      notes,
      isProvided: amountReceived > 0,
    });
    onClose();
  };

  const varianceVsOfficial = amountReceived - officialSlip.netSalary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E0E] border border-[#262626] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#1C1C1C] flex items-center justify-between bg-[#0E0E0E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif-display">Actual Bank Credit</h2>
              <p className="text-xs text-[#737373]">Month: {month} • Confirm funds deposited into your bank account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Match Preset */}
          {officialSlip.isProvided && (
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between">
              <div className="text-xs text-[#A3A3A3]">
                Official Payslip Net: <strong className="text-white font-mono">{formatCurrency(officialSlip.netSalary)}</strong>
              </div>
              <button
                type="button"
                onClick={handleMatchOfficialNet}
                className="px-2.5 py-1 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-xs font-bold text-[#10B981] flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3" />
                <span>Match Payslip</span>
              </button>
            </div>
          )}

          {/* Amount Received */}
          <div>
            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5 font-mono">
              Amount Credited in Bank (₹)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-lg font-bold text-white font-mono focus:border-[#10B981] focus:outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3 text-sm text-[#737373] font-mono">INR</span>
            </div>
            {officialSlip.isProvided && (
              <div className="flex items-center justify-between text-xs mt-1.5 font-mono">
                <span className="text-[#737373]">Variance vs Payslip:</span>
                <span className={Math.abs(varianceVsOfficial) < 1 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                  {varianceVsOfficial >= 0 ? '+' : ''}{formatCurrency(varianceVsOfficial)}
                </span>
              </div>
            )}
          </div>

          {/* Date & Bank Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Deposit Date
              </label>
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
                placeholder="e.g. HDFC Bank"
              />
            </div>
          </div>

          {/* Account Last 4 & UTR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Account Last 4
              </label>
              <input
                type="text"
                maxLength={4}
                value={accountLast4}
                onChange={(e) => setAccountLast4(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#10B981]"
                placeholder="4829"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Deposit Status
              </label>
              <select
                value={depositStatus}
                onChange={(e) => setDepositStatus(e.target.value as ActualBankReceipt['depositStatus'])}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
              >
                <option value="CREDITED">Credited / Settled</option>
                <option value="PENDING">Pending Transfer</option>
                <option value="HOLD">Bank Hold</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
          </div>

          {/* Transaction Ref / UTR */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
              UTR / Transaction Reference Number
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#10B981]"
              placeholder="e.g. CMS20260831001"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
              Bank Notes / Observations
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Salary credited via NEFT at 08:30 PM"
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Bank Deposit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
