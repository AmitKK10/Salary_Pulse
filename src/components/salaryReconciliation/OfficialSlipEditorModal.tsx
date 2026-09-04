// ============================================================================
// SALARYPULSE — OFFICIAL PAYROLL SLIP EDITOR MODAL (STEP 7)
// Full line-item entry & preset generator for company-issued salary slips
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Sparkles, 
  Save, 
  RotateCcw, 
  HelpCircle,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { OfficialPayrollSlip, PulseCalculatedSummary } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OfficialSlipEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  initialSlip: OfficialPayrollSlip;
  pulseData: PulseCalculatedSummary;
  onSave: (updatedSlip: Partial<OfficialPayrollSlip>) => void;
}

export const OfficialSlipEditorModal: React.FC<OfficialSlipEditorModalProps> = ({
  isOpen,
  onClose,
  month,
  initialSlip,
  pulseData,
  onSave,
}) => {
  if (!isOpen) return null;

  const [slipNumber, setSlipNumber] = useState(initialSlip.slipNumber || `PAY-${month.replace('-', '')}-084`);
  const [disbursalDate, setDisbursalDate] = useState(initialSlip.disbursalDate || `${month}-31`);
  const [reportedPresentDays, setReportedPresentDays] = useState(initialSlip.reportedPresentDays || pulseData.presentDays);
  const [reportedWorkDays, setReportedWorkDays] = useState(initialSlip.reportedWorkDays || pulseData.scheduledWorkingDays);
  const [reportedOTHours, setReportedOTHours] = useState(initialSlip.reportedOTHours !== undefined ? initialSlip.reportedOTHours : pulseData.otHours);

  // Earnings
  const [basePay, setBasePay] = useState(initialSlip.basePay || pulseData.basePay);
  const [overtimePay, setOvertimePay] = useState(initialSlip.overtimePay || 0);
  const [attendanceBonus, setAttendanceBonus] = useState(initialSlip.attendanceBonus || 0);
  const [performanceBonus, setPerformanceBonus] = useState(initialSlip.performanceBonus || 0);
  const [specialAllowance, setSpecialAllowance] = useState(initialSlip.specialAllowance || 0);
  const [otherEarnings, setOtherEarnings] = useState(initialSlip.otherEarnings || 0);

  // Deductions
  const [pf, setPf] = useState(initialSlip.deductions?.pf || 0);
  const [pt, setPt] = useState(initialSlip.deductions?.pt || 0);
  const [tds, setTds] = useState(initialSlip.deductions?.tds || 0);
  const [esi, setEsi] = useState(initialSlip.deductions?.esi || 0);
  const [lop, setLop] = useState(initialSlip.deductions?.lop || 0);
  const [otherDeduction, setOtherDeduction] = useState(initialSlip.deductions?.other || 0);
  const [remarks, setRemarks] = useState(initialSlip.remarks || '');

  // Computed Totals
  const calculatedGross = basePay + overtimePay + attendanceBonus + performanceBonus + specialAllowance + otherEarnings;
  const calculatedTotalDeductions = pf + pt + tds + esi + lop + otherDeduction;
  const calculatedNet = Math.max(0, calculatedGross - calculatedTotalDeductions);

  const handleApplyPulseMatchPreset = () => {
    setBasePay(pulseData.basePay);
    setOvertimePay(pulseData.overtimePay);
    setAttendanceBonus(pulseData.attendanceBonus);
    setPerformanceBonus(pulseData.performanceBonus);
    setSpecialAllowance(pulseData.specialAllowance);
    setOtherEarnings(0);
    setReportedPresentDays(pulseData.presentDays);
    setReportedWorkDays(pulseData.scheduledWorkingDays);
    setReportedOTHours(pulseData.otHours);
    setPf(1800);
    setPt(200);
    setTds(0);
    setLop(0);
    setRemarks('Matches SalaryPulse calculated values with standard statutory deductions.');
  };

  const handleApplyUnderpaidOTPreset = () => {
    // 1x OT instead of 2x OT rate
    setBasePay(pulseData.basePay);
    setOvertimePay(pulseData.overtimePay / 2);
    setAttendanceBonus(0); // Omitted bonus
    setPf(1800);
    setPt(200);
    setTds(0);
    setRemarks('Company paid OT at standard 1.0x rate and omitted monthly attendance bonus.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slipNumber,
      disbursalDate,
      reportedPresentDays,
      reportedWorkDays,
      reportedOTHours,
      basePay,
      overtimePay,
      attendanceBonus,
      performanceBonus,
      specialAllowance,
      otherEarnings,
      grossPay: calculatedGross,
      deductions: {
        pf,
        pt,
        tds,
        esi,
        lop,
        other: otherDeduction,
      },
      totalDeductions: calculatedTotalDeductions,
      netSalary: calculatedNet,
      remarks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E0E] border border-[#262626] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#1C1C1C] flex items-center justify-between sticky top-0 bg-[#0E0E0E] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif-display">Official Company Payroll Slip</h2>
              <p className="text-xs text-[#737373]">Month: {month} • Enter line items as printed on your official salary payslip</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Quick Presets Banner */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Slip Presets
              </span>
              <span className="text-[10px] text-[#737373]">Fill accurate data or test common HR scenarios</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleApplyPulseMatchPreset}
                className="px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-xs font-medium text-white transition"
              >
                100% Match with Pulse Accrual
              </button>
              <button
                type="button"
                onClick={handleApplyUnderpaidOTPreset}
                className="px-3 py-1.5 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-xs font-medium text-[#EF4444] transition"
              >
                Simulate 1.0x OT & Bonus Omission
              </button>
            </div>
          </div>

          {/* Slip Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Payslip # / Reference
              </label>
              <input
                type="text"
                value={slipNumber}
                onChange={(e) => setSlipNumber(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                placeholder="e.g. SLIP-AUG-042"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Disbursal Date
              </label>
              <input
                type="date"
                value={disbursalDate}
                onChange={(e) => setDisbursalDate(e.target.value)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
                Reported Present Days
              </label>
              <input
                type="number"
                step="0.5"
                value={reportedPresentDays}
                onChange={(e) => setReportedPresentDays(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* SECTION 1: EARNINGS BREAKDOWN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center justify-between border-b border-[#1C1C1C] pb-2">
              <span className="text-[#10B981]">1. Earnings Breakdown (Gross: {formatCurrency(calculatedGross)})</span>
              <span className="text-[10px] text-[#737373] font-normal">All positive wage components</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Base Basic / Earned Pay (₹)</label>
                <input
                  type="number"
                  value={basePay}
                  onChange={(e) => setBasePay(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Overtime Pay (₹)</label>
                <input
                  type="number"
                  value={overtimePay}
                  onChange={(e) => setOvertimePay(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Attendance Bonus (₹)</label>
                <input
                  type="number"
                  value={attendanceBonus}
                  onChange={(e) => setAttendanceBonus(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Performance Bonus (₹)</label>
                <input
                  type="number"
                  value={performanceBonus}
                  onChange={(e) => setPerformanceBonus(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Special Allowance (₹)</label>
                <input
                  type="number"
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A3A3A3] mb-1">Other Allowances (₹)</label>
                <input
                  type="number"
                  value={otherEarnings}
                  onChange={(e) => setOtherEarnings(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#10B981] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DEDUCTIONS BREAKDOWN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center justify-between border-b border-[#1C1C1C] pb-2">
              <span className="text-[#EF4444]">2. Itemized Deductions (Total: {formatCurrency(calculatedTotalDeductions)})</span>
              <span className="text-[10px] text-[#737373] font-normal">Statutory, tax & penalty deductions</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">Provident Fund (PF)</label>
                <input
                  type="number"
                  value={pf}
                  onChange={(e) => setPf(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">Prof. Tax (PT)</label>
                <input
                  type="number"
                  value={pt}
                  onChange={(e) => setPt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">Income Tax (TDS)</label>
                <input
                  type="number"
                  value={tds}
                  onChange={(e) => setTds(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">ESI Insurance</label>
                <input
                  type="number"
                  value={esi}
                  onChange={(e) => setEsi(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">Loss of Pay (LOP)</label>
                <input
                  type="number"
                  value={lop}
                  onChange={(e) => setLop(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#A3A3A3] mb-1 uppercase font-semibold">Other / Penalty</label>
                <input
                  type="number"
                  value={otherDeduction}
                  onChange={(e) => setOtherDeduction(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#EF4444] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-1">
              HR Remarks / Notes on Payslip
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Standard monthly salary processed"
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Live Summary Bar */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#333333] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#737373]">Calculated Official Take-Home</span>
              <div className="text-xl font-extrabold text-white font-mono">
                {formatCurrency(calculatedNet)}
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#737373]">Pulse Accrued Take-Home</span>
              <div className="text-xl font-extrabold text-[#D4AF37] font-mono">
                {formatCurrency(pulseData.netPay)}
              </div>
            </div>
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
              className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Official Slip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
