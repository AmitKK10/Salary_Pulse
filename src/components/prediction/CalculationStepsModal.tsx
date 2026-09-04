import React from 'react';
import { X, Calculator, ShieldCheck, Check, Info, ArrowRight } from 'lucide-react';
import { MonthlyProjectionResult, RateDerivation } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CalculationStepsModalProps {
  projection: MonthlyProjectionResult;
  rateDerivation: RateDerivation;
  onClose: () => void;
}

export const CalculationStepsModal: React.FC<CalculationStepsModalProps> = ({
  projection,
  rateDerivation,
  onClose,
}) => {
  const {
    yearMonth,
    projectedMonthEndTotal,
    projectedMonthEndWithBonus,
    actualEarnings,
    liveTodayEarnings,
    projectedFutureEarnings,
    actualOTEarnings,
    projectedFutureOTEarnings,
    projectedBonus,
    bonusStatus,
    confidenceLabel,
    confidenceReason,
    calculationSteps,
  } = projection;

  const getStepBadge = (type: string) => {
    switch (type) {
      case 'ACTUAL':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'LIVE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'PROJECTED':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'POTENTIAL':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'DEDUCTION':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-[#222] text-white border-[#333]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-display">
                Calculation Audit Trail & Formula
              </h3>
              <p className="text-xs text-[#888888]">Deterministic mathematical breakdown for {yearMonth}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-[#222222]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Calculation Steps from Engine */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            Deterministic Engine Steps
          </h4>
          <div className="space-y-2">
            {(calculationSteps || []).map((step, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-[#0E0E0E] border border-[#1F1F1F] text-xs font-mono text-[#D4D4D4] leading-relaxed flex items-start justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#2F2F2F] text-[#888888] text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white font-sans">{step.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase border font-mono ${getStepBadge(step.type)}`}>
                      {step.type}
                    </span>
                  </div>
                  <p className="text-[#888888] text-[11px] font-sans pl-7">{step.description}</p>
                </div>
                <div className="font-mono font-bold text-white text-right flex-shrink-0 pt-0.5">
                  {formatCurrency(step.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Summary Grid */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between text-[#888888]">
            <span>1. Confirmed Past Earnings:</span>
            <span className="font-mono text-white">{formatCurrency(actualEarnings)}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>2. Today's Live Accrual:</span>
            <span className="font-mono text-amber-300">+{formatCurrency(liveTodayEarnings)}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>3. Future Projected Base Shift:</span>
            <span className="font-mono text-blue-300">+{formatCurrency(projectedFutureEarnings)}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>4. Projected Overtime Pay:</span>
            <span className="font-mono text-emerald-400">+{formatCurrency(actualOTEarnings + projectedFutureOTEarnings)}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>5. Attendance Target Bonus ({bonusStatus}):</span>
            <span className={`font-mono ${projectedBonus > 0 ? 'text-[#D4AF37]' : 'text-[#666666]'}`}>
              +{formatCurrency(projectedBonus)}
            </span>
          </div>
          <div className="border-t border-[#222222] pt-2.5 flex justify-between font-bold text-sm">
            <span className="text-white">Total Forecasted Net Take-Home:</span>
            <span className="font-mono text-[#D4AF37]">{formatCurrency(projectedMonthEndWithBonus)}</span>
          </div>
        </div>

        {/* Confidence & Integrity */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-400">
              Deterministic Mathematical Audit ({confidenceLabel})
            </div>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">
              {confidenceReason} All calculations adhere strictly to company policy without arbitrary rounding.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
