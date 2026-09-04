import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  Clock, 
  Coins, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { MonthlyProjectionResult, ProjectionConfidenceLabel } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RunningMonthBannerProps {
  projection: MonthlyProjectionResult;
  selectedMonth: string;
  onOpenHowCalculated?: () => void;
}

export const RunningMonthBanner: React.FC<RunningMonthBannerProps> = ({
  projection,
  selectedMonth,
  onOpenHowCalculated,
}) => {
  const {
    projectedMonthEndTotal,
    projectedMonthEndWithBonus,
    actualEarnings,
    liveTodayEarnings,
    projectedFutureEarnings,
    actualOTEarnings,
    projectedFutureOTEarnings,
    potentialBonus,
    projectedBonus,
    bonusStatus,
    confidenceLabel,
    confidenceReason,
    actualWorkingDays,
    futureWorkingDays,
    scheduledWorkingDays,
    qualifyingAttendanceDays,
    bonusTargetDays,
    expectedMonthEndTarget,
    projectedSalaryGap,
  } = projection;

  const getConfidenceBadgeColor = (label: ProjectionConfidenceLabel) => {
    switch (label) {
      case 'HIGH CONFIDENCE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM CONFIDENCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW CONFIDENCE':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const totalOTProjected = actualOTEarnings + projectedFutureOTEarnings;
  const varianceVsTarget = (projectedMonthEndWithBonus) - expectedMonthEndTarget;
  const totalDaysCount = Math.max(1, scheduledWorkingDays);
  const pastPercent = Math.min(100, Math.round((actualWorkingDays / totalDaysCount) * 100));
  const futurePercent = Math.max(0, 100 - pastPercent);

  return (
    <div id="running-month-banner" className="bg-[#121212] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white font-serif-display tracking-tight">
                Running Month Salary Projection
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2B2B2B] text-[#A3A3A3]">
                {selectedMonth}
              </span>
            </div>
            <p className="text-xs text-[#888888]">
              Authoritative synthesis of confirmed attendance, today's live session, and future assumptions
            </p>
          </div>
        </div>

        {/* Confidence & How it was calculated button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div 
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${getConfidenceBadgeColor(confidenceLabel)}`}
            title={confidenceReason}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{confidenceLabel}</span>
          </div>

          {onOpenHowCalculated && (
            <button
              onClick={onOpenHowCalculated}
              className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1 transition"
              title="View step-by-step calculation audit"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Calculation Steps</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Card 1: Forecasted Take-Home (Net Salary) */}
        <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4.5 space-y-1.5">
          <div className="flex justify-between items-center text-xs text-[#888888]">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Forecasted Net Take-Home</span>
            <span className="text-[10px] font-mono text-[#D4AF37]">TAKE-HOME</span>
          </div>
          <div className="text-3xl sm:text-4xl font-light text-[#D4AF37] font-serif-display tracking-tight">
            {formatCurrency(projectedMonthEndWithBonus)}
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className={`font-mono font-semibold flex items-center ${varianceVsTarget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <ArrowUpRight className={`w-3.5 h-3.5 ${varianceVsTarget < 0 ? 'rotate-90' : ''}`} />
              {varianceVsTarget >= 0 ? `+${formatCurrency(varianceVsTarget)}` : formatCurrency(varianceVsTarget)}
            </span>
            <span className="text-[#666666] text-[11px]">vs base + bonus target</span>
          </div>
        </div>

        {/* Card 2: Projected Gross & Components */}
        <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4.5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#888888]">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Projected Breakdown</span>
            <span className="font-mono text-white text-xs font-semibold">{formatCurrency(projectedMonthEndTotal)} base net</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1A1A1A]">
            <div>
              <span className="text-[#666666] text-[10px] block">Projected OT Pay</span>
              <span className="font-mono text-emerald-400 font-medium">+{formatCurrency(totalOTProjected)}</span>
            </div>
            <div>
              <span className="text-[#666666] text-[10px] block">Attendance Bonus ({qualifyingAttendanceDays}/{bonusTargetDays}d)</span>
              <span className={`font-mono font-medium ${projectedBonus > 0 ? 'text-[#D4AF37]' : 'text-[#666666]'}`}>
                {projectedBonus > 0 ? `+${formatCurrency(projectedBonus)}` : `₹0 (${bonusStatus})`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Progression Segregation (Actual / Live / Future) */}
        <div className="bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl p-4.5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#888888]">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Earnings Segregation</span>
            <span className="text-[10px] text-[#A3A3A3] font-mono">{actualWorkingDays + futureWorkingDays} Workdays</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-400/90 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Confirmed Past:
              </span>
              <span className="font-mono text-white font-medium">{formatCurrency(actualEarnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400/90 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Today Live Session:
              </span>
              <span className="font-mono text-amber-300 font-medium">{formatCurrency(liveTodayEarnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400/90 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Future Projected:
              </span>
              <span className="font-mono text-blue-300 font-medium">{formatCurrency(projectedFutureEarnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Timeline Progress Bar */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-xs text-[#888888]">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Actual Confirmed ({actualWorkingDays}d)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Today Live</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/60" />
              <span>Future Planned ({futureWorkingDays}d)</span>
            </span>
          </div>
          <span className="font-mono text-[#A3A3A3] text-[11px]">{pastPercent}% Elapsed</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden flex border border-[#2B2B2B]">
          <div 
            style={{ width: `${pastPercent}%` }} 
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Confirmed Days: ${actualWorkingDays}`}
          />
          <div 
            style={{ width: `${futurePercent}%` }} 
            className="h-full bg-blue-500/40 transition-all duration-500"
            title={`Future Planned: ${futureWorkingDays}`}
          />
        </div>
      </div>
    </div>
  );
};
