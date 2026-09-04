import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Coffee, 
  Sparkles, 
  HelpCircle,
  PlayCircle,
  Briefcase
} from 'lucide-react';
import { AttendanceStatus, WorkdayStatus } from '../../types';

interface BadgeProps {
  id?: string;
  status?: AttendanceStatus | WorkdayStatus | string;
  label?: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' | 'purple' | 'gold' | 'cyan';
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  status,
  label,
  variant,
  size = 'sm',
  showIcon = true,
}) => {
  let resolvedVariant = variant || 'slate';
  let displayLabel = label;
  let IconComponent: React.ElementType | null = null;

  if (status) {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'COMPLETED':
        resolvedVariant = 'emerald';
        displayLabel = displayLabel || (s === 'COMPLETED' ? 'Completed' : 'Present');
        IconComponent = CheckCircle2;
        break;
      case 'WORKING':
        resolvedVariant = 'emerald';
        displayLabel = displayLabel || 'Working (Live)';
        IconComponent = PlayCircle;
        break;
      case 'ON_BREAK':
        resolvedVariant = 'amber';
        displayLabel = displayLabel || 'On Break';
        IconComponent = Coffee;
        break;
      case 'PARTIAL':
      case 'HALF_DAY':
        resolvedVariant = 'amber';
        displayLabel = displayLabel || 'Partial Day';
        IconComponent = Clock;
        break;
      case 'ABSENT':
        resolvedVariant = 'rose';
        displayLabel = displayLabel || 'Absent';
        IconComponent = XCircle;
        break;
      case 'PAID_LEAVE':
      case 'LEAVE':
        resolvedVariant = 'blue';
        displayLabel = displayLabel || 'Paid Leave';
        IconComponent = Calendar;
        break;
      case 'UNPAID_LEAVE':
        resolvedVariant = 'rose';
        displayLabel = displayLabel || 'Unpaid Leave';
        IconComponent = XCircle;
        break;
      case 'PAID_HOLIDAY':
      case 'HOLIDAY':
        resolvedVariant = 'purple';
        displayLabel = displayLabel || 'Paid Holiday';
        IconComponent = Sparkles;
        break;
      case 'UNPAID_HOLIDAY':
        resolvedVariant = 'slate';
        displayLabel = displayLabel || 'Unpaid Holiday';
        IconComponent = Calendar;
        break;
      case 'WEEKLY_OFF':
        resolvedVariant = 'slate';
        displayLabel = displayLabel || 'Weekly Off';
        IconComponent = Coffee;
        break;
      case 'WEEKLY_OFF_WORKED':
        resolvedVariant = 'gold';
        displayLabel = displayLabel || 'Weekly Off (Worked)';
        IconComponent = Briefcase;
        break;
      case 'FUTURE':
      case 'UPCOMING':
        resolvedVariant = 'slate';
        displayLabel = displayLabel || 'Upcoming';
        IconComponent = Calendar;
        break;
      case 'NEEDS_REVIEW':
        resolvedVariant = 'rose';
        displayLabel = displayLabel || 'Needs Review';
        IconComponent = AlertTriangle;
        break;
      case 'NOT_STARTED':
        resolvedVariant = 'slate';
        displayLabel = displayLabel || 'Not Started';
        IconComponent = Clock;
        break;
      default:
        displayLabel = displayLabel || String(status);
        IconComponent = HelpCircle;
    }
  }

  const variantStyles = {
    emerald: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    amber: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    gold: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    slate: 'bg-[#1A1A1A] text-[#A3A3A3] border-[#333333]',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider gap-1',
    sm: 'px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold uppercase tracking-wider gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center rounded-md border shrink-0 font-mono ${variantStyles[resolvedVariant]} ${sizeStyles[size]}`}
    >
      {showIcon && IconComponent && <IconComponent className={`${iconSizes[size]} shrink-0`} />}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};

