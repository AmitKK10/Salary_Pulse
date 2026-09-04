import React from 'react';
import { BestWorstRecordsData, PersonalRecordsData } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Award, Zap, Clock, Calendar, Trophy, Flame } from 'lucide-react';

interface PersonalRecordsCardProps {
  records: PersonalRecordsData;
  bestWorst: BestWorstRecordsData;
}

export const PersonalRecordsCard: React.FC<PersonalRecordsCardProps> = ({
  records,
  bestWorst,
}) => {
  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
            Personal Career Milestones & Career Records
          </h3>
        </div>
        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
          ALL-TIME PEAKS
        </span>
      </div>

      {/* Grid of 6 personal record tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Highest Single Day Earnings */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Day Earnings</span>
            <Award className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400 my-1">
            {formatCurrency(records.highestSingleDayEarnings.amount)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {records.highestSingleDayEarnings.date}
          </div>
        </div>

        {/* 2. Highest Monthly Earnings */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Month Net</span>
            <Trophy className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-amber-300 my-1">
            {formatCurrency(records.highestMonthlyEarnings.amount)}
          </div>
          <div className="text-[10px] text-slate-500">
            {records.highestMonthlyEarnings.month}
          </div>
        </div>

        {/* 3. Highest OT in a Month */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak OT Month</span>
            <Zap className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-base font-bold font-mono text-purple-300 my-1">
            {records.highestOTHoursInMonth.hours}h OT
          </div>
          <div className="text-[10px] text-slate-500">
            {records.highestOTHoursInMonth.month}
          </div>
        </div>

        {/* 4. Longest Active Workday */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Longest Shift</span>
            <Clock className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-cyan-300 my-1">
            {records.longestActiveWorkDayHours?.hours || 0}h Active
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {records.longestActiveWorkDayHours?.date || 'N/A'}
          </div>
        </div>

        {/* 5. Longest Work Session */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Longest Session</span>
            <Clock className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-base font-bold font-mono text-indigo-300 my-1">
            {records.longestWorkSessionMinutes?.minutes || 0} min
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {records.longestWorkSessionMinutes?.date || 'N/A'}
          </div>
        </div>

        {/* 6. Longest Streak */}
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-3 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Attendance Streak</span>
            <Flame className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-white my-1">
            {records.longestAttendanceStreak} Days
          </div>
          <div className="text-[10px] text-emerald-400">
            Consecutive present
          </div>
        </div>
      </div>
    </div>
  );
};
