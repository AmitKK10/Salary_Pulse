import React from 'react';
import { 
  Flame, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  Zap,
  Info,
  Calendar
} from 'lucide-react';
import { MonthlyProjectionResult, SalaryConfig, RateDerivation } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface OvertimeForecastCardProps {
  projection: MonthlyProjectionResult;
  rateDerivation: RateDerivation;
  salaryConfig: SalaryConfig;
  selectedMonth: string;
}

export const OvertimeForecastCard: React.FC<OvertimeForecastCardProps> = ({
  projection,
  rateDerivation,
  salaryConfig,
  selectedMonth,
}) => {
  const {
    otMode,
    monthlyNormalTargetSeconds,
    actualNormalSeconds,
    actualOTSeconds,
    projectedNormalSeconds,
    projectedOTSeconds,
    totalMonthNormalSeconds,
    totalMonthOTSeconds,
    actualOTEarnings,
    projectedFutureOTEarnings,
    otThresholdCrossed,
    remainingNormalTargetSeconds,
  } = projection;

  const targetHours = (monthlyNormalTargetSeconds / 3600);
  const actualNormalHours = (actualNormalSeconds / 3600);
  const actualOTHours = (actualOTSeconds / 3600);
  const projectedNormalHours = (projectedNormalSeconds / 3600);
  const projectedOTHours = (projectedOTSeconds / 3600);
  const totalHours = ((totalMonthNormalSeconds + totalMonthOTSeconds) / 3600);
  const totalOTHours = (totalMonthOTSeconds / 3600);
  const totalOTEarnings = actualOTEarnings + projectedFutureOTEarnings;

  const normalHoursProgressPercent = targetHours > 0 
    ? Math.min(100, Math.round(((actualNormalHours + projectedNormalHours) / targetHours) * 100))
    : 100;

  return (
    <div id="overtime-forecast-card" className="bg-[#121212] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-serif-display">
              Running Month Overtime Forecast ({otMode === 'monthly_threshold' ? 'Monthly Threshold' : 'Daily Shift Threshold'})
            </h3>
            <p className="text-xs text-[#888888]">
              {otMode === 'monthly_threshold' 
                ? `Tracking progress towards the ${targetHours.toFixed(1)}h regular threshold before OT premium triggers`
                : `Accumulating daily overtime hours based on daily standard shifts`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {otThresholdCrossed ? (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>OT Threshold Crossed</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{(remainingNormalTargetSeconds / 3600).toFixed(1)}h to OT Threshold</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#0E0E0E] border border-[#1F1F1F] rounded-xl p-4">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold block">Total Forecasted OT</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalOTHours.toFixed(1)} <span className="text-sm font-normal text-[#888888]">hrs</span>
          </div>
          <div className="text-xs text-[#666666] mt-1">
            {actualOTHours.toFixed(1)}h confirmed + {projectedOTHours.toFixed(1)}h planned
          </div>
        </div>

        <div className="bg-[#0E0E0E] border border-[#1F1F1F] rounded-xl p-4">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold block">Projected OT Pay</span>
          <div className="text-2xl font-bold font-mono text-[#D4AF37] mt-1">
            +{formatCurrency(totalOTEarnings)}
          </div>
          <div className="text-xs text-[#666666] mt-1">
            @ {formatCurrency(rateDerivation.overtimeHourlyRate)}/hr effective
          </div>
        </div>

        <div className="bg-[#0E0E0E] border border-[#1F1F1F] rounded-xl p-4">
          <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold block">OT Multiplier</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {salaryConfig.overtimeMultiplier || 1.5}x
          </div>
          <div className="text-xs text-[#666666] mt-1">
            Base hourly: {formatCurrency(rateDerivation.perHourRate)}
          </div>
        </div>
      </div>

      {/* Visual Target Bar for Monthly Mode */}
      {otMode === 'monthly_threshold' && (
        <div className="space-y-2 bg-[#0E0E0E] border border-[#1A1A1A] p-4 rounded-xl">
          <div className="flex justify-between text-xs text-[#888888]">
            <span>Regular Hours Target ({targetHours.toFixed(1)}h)</span>
            <span className="font-mono text-white font-medium">
              {(actualNormalHours + projectedNormalHours).toFixed(1)} / {targetHours.toFixed(1)} hrs ({normalHoursProgressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden flex border border-[#2B2B2B]">
            <div 
              style={{ width: `${Math.min(100, Math.round((actualNormalHours / Math.max(1, targetHours)) * 100))}%` }} 
              className="h-full bg-emerald-500"
              title="Confirmed Regular Hours"
            />
            <div 
              style={{ width: `${Math.min(100 - Math.min(100, Math.round((actualNormalHours / Math.max(1, targetHours)) * 100)), Math.round((projectedNormalHours / Math.max(1, targetHours)) * 100))}%` }} 
              className="h-full bg-blue-500/60"
              title="Projected Regular Hours"
            />
          </div>

          <div className="flex justify-between text-[11px] text-[#666666] pt-1">
            <span>0 hrs</span>
            <span>Regular Shift Cap: {targetHours.toFixed(1)} hrs</span>
            <span className="text-emerald-400 font-semibold">+Overtime Zone</span>
          </div>
        </div>
      )}
    </div>
  );
};
