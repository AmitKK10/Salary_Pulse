// ============================================================================
// SALARYPULSE — NEXT MILESTONE CARD
// Section 9: Dynamic Milestone Tracker (8h Target -> Monthly OT -> Bonus)
// ============================================================================

import React from 'react';
import { Award, Zap, CheckCircle2, Flag } from 'lucide-react';
import { formatSecondsToHMS } from '../../../utils/formatters';

interface NextMilestoneCardProps {
  todayRemainingActiveSeconds: number;
  isTodayTargetCompleted: boolean;
  monthlyRemainingNormalSeconds: number;
  isMonthlyThresholdReached: boolean;
  presentDaysCount: number;
  bonusTargetDays: number;
  bonusAmount: number;
}

export const NextMilestoneCard: React.FC<NextMilestoneCardProps> = ({
  todayRemainingActiveSeconds,
  isTodayTargetCompleted,
  monthlyRemainingNormalSeconds,
  isMonthlyThresholdReached,
  presentDaysCount,
  bonusTargetDays,
  bonusAmount,
}) => {
  // Determine active milestone state
  let milestoneTitle = '8 Hour Target';
  let milestoneValue = formatSecondsToHMS(todayRemainingActiveSeconds);
  let milestoneSubtitle = 'Remaining to complete standard daily shift';
  let badgeText = 'DAILY TARGET';
  let badgeColor = 'text-[#D4AF37] bg-[#D4AF37]/15 border-[#D4AF37]/30';
  let IconComponent = Flag;

  if (isTodayTargetCompleted && !isMonthlyThresholdReached) {
    milestoneTitle = 'Monthly OT Activation';
    milestoneValue = formatSecondsToHMS(monthlyRemainingNormalSeconds);
    milestoneSubtitle = 'Normal work remaining until all hours convert to 2.0x Overtime';
    badgeText = 'MONTHLY THRESHOLD';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    IconComponent = Zap;
  } else if (isTodayTargetCompleted && isMonthlyThresholdReached) {
    const daysNeeded = Math.max(0, bonusTargetDays - presentDaysCount);
    milestoneTitle = 'Attendance Bonus Qualification';
    milestoneValue = daysNeeded > 0 ? `${daysNeeded} days needed` : 'Qualified (₹' + bonusAmount + ')';
    milestoneSubtitle = `${presentDaysCount} / ${bonusTargetDays} present workdays recorded this month`;
    badgeText = daysNeeded > 0 ? 'BONUS TARGET' : 'QUALIFIED';
    badgeColor = 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30';
    IconComponent = Award;
  }

  return (
    <div 
      id="next-milestone-card" 
      className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-4 font-mono"
    >
      <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
            NEXT MILESTONE
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{milestoneTitle}</span>
            {isTodayTargetCompleted && (
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            )}
          </div>
          <p className="text-xs text-[#737373] leading-relaxed">
            {milestoneSubtitle}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] text-left sm:text-right shrink-0">
          <span className="text-[10px] text-[#737373] uppercase block font-semibold">Remaining:</span>
          <span className="text-base sm:text-lg font-bold text-[#D4AF37] tabular-nums">
            {milestoneValue}
          </span>
        </div>
      </div>
    </div>
  );
};
