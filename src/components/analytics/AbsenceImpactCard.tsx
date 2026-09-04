import React from 'react';
import { AbsenceImpactData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, TrendingDown, DollarSign, Clock, ShieldAlert } from 'lucide-react';

interface AbsenceImpactCardProps {
  absenceData: AbsenceImpactData;
}

export const AbsenceImpactCard: React.FC<AbsenceImpactCardProps> = ({ absenceData }) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Absence & Leave Financial Impact Analyzer
          </h3>
        </div>
        <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded">
          OPPORTUNITY COST
        </span>
      </div>

      {/* Grid of impact metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Absent Days */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Unplanned Absent Days</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 my-1">
            {absenceData.absentDays} Days
          </div>
          <div className="text-[11px] text-slate-500">
            Unexcused / unpaid absences
          </div>
        </div>

        {/* 2. Scheduled Hours Missed */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Scheduled Hours Missed</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-200 my-1">
            {absenceData.scheduledHoursMissed}h 00m
          </div>
          <div className="text-[11px] text-slate-500">
            At 8.0h scheduled per day
          </div>
        </div>

        {/* 3. Estimated Direct Wage Impact */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Estimated Wage Deduction</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 my-1">
            -{formatCurrency(absenceData.estimatedSalaryImpact)}
          </div>
          <div className="text-[11px] text-slate-500">
            Direct unpaid salary reduction
          </div>
        </div>
      </div>

      {/* Narrative info box */}
      <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-200">Calculation Basis: </strong>
            {absenceData.explanation}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-amber-300">Attendance Bonus Impact: </strong>
            {absenceData.bonusEligibilityImpact}
          </span>
        </div>
      </div>
    </div>
  );
};
