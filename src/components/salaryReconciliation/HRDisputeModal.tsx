// ============================================================================
// SALARYPULSE — HR DISPUTE RESOLUTION MODAL (STEP 7)
// Formal dispute letter generator with copyable template, status tracking & ticket log
// ============================================================================

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { SalaryReconciliationRecord, User } from '../../types';

interface HRDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SalaryReconciliationRecord;
  user: User;
  onSaveDispute: (disputeNotes: string, disputeStatus: 'NONE' | 'DRAFTED' | 'SUBMITTED' | 'RESOLVED_ACCEPTED' | 'ADJUSTED_NEXT_MONTH', ticketRef?: string) => void;
}

export const HRDisputeModal: React.FC<HRDisputeModalProps> = ({
  isOpen,
  onClose,
  record,
  user,
  onSaveDispute,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<boolean>(false);
  const [disputeNotes, setDisputeNotes] = useState<string>(
    record.disputeNotes || record.forensicSummary.suggestedHRDisputeTemplate || ''
  );
  const [disputeStatus, setDisputeStatus] = useState<SalaryReconciliationRecord['disputeStatus']>(
    record.disputeStatus || 'DRAFTED'
  );
  const [ticketRef, setTicketRef] = useState<string>(record.disputeTicketRef || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(disputeNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDispute(disputeNotes, disputeStatus || 'DRAFTED', ticketRef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E0E] border border-[#262626] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#1C1C1C] flex items-center justify-between bg-[#0E0E0E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif-display">HR Payroll Dispute & Query Draft</h2>
              <p className="text-xs text-[#737373]">Month: {record.month} • Formal query communication for payroll discrepancies</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#737373] hover:text-white hover:bg-[#1A1A1A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Dispute Status & Ticket Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#141414] border border-[#262626]">
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Dispute Lifecycle Status
              </label>
              <select
                value={disputeStatus}
                onChange={(e) => setDisputeStatus(e.target.value as SalaryReconciliationRecord['disputeStatus'])}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="DRAFTED">Drafted / Ready to Send</option>
                <option value="SUBMITTED">Submitted to HR / Ticket Open</option>
                <option value="RESOLVED_ACCEPTED">Resolved & Paid in Slip</option>
                <option value="ADJUSTED_NEXT_MONTH">Adjustment Promised Next Month</option>
                <option value="NONE">No Dispute Required</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                HR Ticket / Case Reference #
              </label>
              <input
                type="text"
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                placeholder="e.g. HR-TKT-2026-892"
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Letter Body Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider font-mono">
                Formal Letter Content
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-[#262626] hover:bg-[#333333] text-xs text-white font-medium flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <textarea
              rows={12}
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl p-4 text-xs font-mono text-[#D4D4D4] leading-relaxed focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1C]">
            <div className="text-[11px] text-[#737373]">
              Tip: Copy and email this text directly to your HR/Payroll department.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A] transition"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5BE3B] text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Dispute Record</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
