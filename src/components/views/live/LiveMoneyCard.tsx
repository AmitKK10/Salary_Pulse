// ============================================================================
// SALARYPULSE — LIVE MONEY CARD
// Section 8: TIME → MONEY Accrual & Real-Time Rate Matrix
// ============================================================================

import React from 'react';
import { DollarSign, Zap } from 'lucide-react';

interface LiveMoneyCardProps {
  hourlyRate: number;
  perMinuteRate: number;
  perSecondRate: number;
  isOvertimeActive: boolean;
  overtimeMultiplier: number;
}

export const LiveMoneyCard: React.FC<LiveMoneyCardProps> = ({
  hourlyRate,
  perMinuteRate,
  perSecondRate,
  isOvertimeActive,
  overtimeMultiplier,
}) => {
  const effectiveRate = isOvertimeActive ? hourlyRate * overtimeMultiplier : hourlyRate;

  return (
    <div 
      id="live-money-card" 
      className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4 font-mono"
    >
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
            TIME → MONEY
          </span>
        </div>
        {isOvertimeActive && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>OT ACTIVE ({overtimeMultiplier}x)</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] space-y-0.5">
          <span className="text-[10px] text-[#737373] uppercase block font-semibold">Hourly:</span>
          <span className="text-sm font-bold text-white tabular-nums">
            ₹{hourlyRate.toFixed(2)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] space-y-0.5">
          <span className="text-[10px] text-[#737373] uppercase block font-semibold">Per Minute:</span>
          <span className="text-sm font-bold text-[#10B981] tabular-nums">
            ₹{perMinuteRate.toFixed(2)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] space-y-0.5">
          <span className="text-[10px] text-[#737373] uppercase block font-semibold">Per Second:</span>
          <span className="text-sm font-bold text-[#D4AF37] tabular-nums">
            ₹{perSecondRate.toFixed(4)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] space-y-0.5">
          <span className="text-[10px] text-[#737373] uppercase block font-semibold">Current Effective:</span>
          <span className={`text-sm font-bold tabular-nums ${isOvertimeActive ? 'text-amber-400' : 'text-white'}`}>
            ₹{effectiveRate.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
