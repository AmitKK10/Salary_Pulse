import React from 'react';
import { AttendanceBonusAnalyticsData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Award, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface AttendanceBonusAnalyticsCardProps {
  bonusData: AttendanceBonusAnalyticsData;
}

export const AttendanceBonusAnalyticsCard: React.FC<AttendanceBonusAnalyticsCardProps> = ({
  bonusData,
}) => {
  const getStatusBadge = () => {
    switch (bonusData.status) {
      case 'PAID':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          label: 'PAID IN OFFICIAL PAYROLL',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'APPROVED':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          label: 'APPROVED FOR DISBURSAL',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'ELIGIBLE':
        return {
          bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
          label: 'ELIGIBLE (QUALIFYING ATTAINED)',
          icon: <Award className="w-3.5 h-3.5" />,
        };
      case 'PENDING_APPROVAL':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          label: 'PENDING HR APPROVAL',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'AT RISK':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          label: 'AT RISK (IN PROGRESS)',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case 'NOT_ELIGIBLE':
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          label: 'NOT ELIGIBLE',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Attendance Bonus Eligibility & Lifecycle
          </h3>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold border ${badge.bg}`}>
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Progress towards target */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Qualifying Present Days Progress:</span>
          <span className="font-mono font-bold text-white">
            {bonusData.qualifyingAttendance} / {bonusData.requiredAttendance} Days ({bonusData.progressPercentage}%)
          </span>
        </div>

        <div className="w-full h-3 bg-[#0a0e17] rounded-full border border-[#1e293b] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              bonusData.progressPercentage >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${Math.min(100, bonusData.progressPercentage)}%` }}
          />
        </div>
      </div>

      {/* Metric details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Configured Bonus Value:</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(bonusData.potentialBonus)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fixed threshold bonus</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Qualifying Days Logged:</div>
          <div className="text-lg font-bold font-mono text-slate-200 mt-1">
            {bonusData.qualifyingAttendance} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full & half shifts credited</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400">Required Target:</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {bonusData.requiredAttendance} Days
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Threshold benchmark</div>
        </div>
      </div>

      {/* Note */}
      <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-xs text-slate-300 flex items-start gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Lifecycle Status: </span>
          <span>{bonusData.statusNote}</span>
        </div>
      </div>
    </div>
  );
};
