import React from 'react';
import { TimeMoneyConversionData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Clock, Zap, Coffee } from 'lucide-react';

interface TimeToMoneyCardProps {
  conversionData: TimeMoneyConversionData;
}

export const TimeToMoneyCard: React.FC<TimeToMoneyCardProps> = ({ conversionData }) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Time-to-Money Exact Conversion Matrix
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
          RATE CONVERSION
        </span>
      </div>

      {/* Grid of rates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>1 Second Normal</span>
          </div>
          <div className="text-base font-bold font-mono text-sky-300 mt-1">
            ₹{conversionData.normalSecondRate.toFixed(4)}
          </div>
          <div className="text-[10px] text-slate-500">Live per-second accrual</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>1 Hour Normal Work</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(conversionData.normalHourlyRate)}
          </div>
          <div className="text-[10px] text-slate-500">Scheduled baseline</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>1 Hour Overtime</span>
          </div>
          <div className="text-base font-bold font-mono text-purple-300 mt-1">
            {formatCurrency(conversionData.otHourlyRate)}
          </div>
          <div className="text-[10px] text-slate-500">2.0x overtime multiplier</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Coffee className="w-3 h-3 text-amber-400" />
            <span>30-Min Lunch Value</span>
          </div>
          <div className="text-base font-bold font-mono text-amber-300 mt-1">
            {formatCurrency(conversionData.thirtyMinLunchValue)}
          </div>
          <div className="text-[10px] text-slate-500">0.5h time equivalent</div>
        </div>
      </div>
    </div>
  );
};
