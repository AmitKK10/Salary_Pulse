import React from 'react';
import { AttendanceAnalyticsData } from '../../types';
import { Calendar, CheckCircle2, AlertTriangle, Briefcase, Award, Clock } from 'lucide-react';

interface AttendanceAnalyticsCardProps {
  attendanceData: AttendanceAnalyticsData;
  timeframeLabel: string;
}

export const AttendanceAnalyticsCard: React.FC<AttendanceAnalyticsCardProps> = ({
  attendanceData,
  timeframeLabel,
}) => {
  const totalDaysInPeriod = attendanceData.distribution.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 md:p-5 shadow-lg space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Attendance Distribution & Compliance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of work days, leaves, holidays, and scheduled rest days across {timeframeLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Attendance Rate:</span>
          <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded">
            {attendanceData.attendanceRate}%
          </span>
        </div>
      </div>

      {/* Distribution Stacked Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-[#0a0e17] rounded-full border border-[#1e293b] overflow-hidden flex">
          {attendanceData.distribution.map((item) => {
            const widthPct = (item.value / totalDaysInPeriod) * 100;
            return (
              <div
                key={item.name}
                className="h-full transition-all duration-300 relative group"
                style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                title={`${item.name}: ${item.value} days (${widthPct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          {attendanceData.distribution.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-sans">{item.name}:</span>
              <strong className="text-white">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Present (Full)</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {attendanceData.presentDays}
          </div>
          <div className="text-[10px] text-slate-500">100% daily rate</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Half Days</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {attendanceData.partialDays}
          </div>
          <div className="text-[10px] text-slate-500">50% daily rate</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Absent Days</div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-1">
            {attendanceData.absentDays}
          </div>
          <div className="text-[10px] text-slate-500">Unpaid absence</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Paid Leaves</div>
          <div className="text-lg font-bold font-mono text-sky-400 mt-1">
            {attendanceData.paidLeaveDays}
          </div>
          <div className="text-[10px] text-slate-500">Approved statutory</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Paid Holidays</div>
          <div className="text-lg font-bold font-mono text-purple-400 mt-1">
            {attendanceData.paidHolidays}
          </div>
          <div className="text-[10px] text-slate-500">Public holiday</div>
        </div>

        <div className="bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400">Weekly Offs</div>
          <div className="text-lg font-bold font-mono text-slate-400 mt-1">
            {attendanceData.weeklyOffDays}
          </div>
          <div className="text-[10px] text-slate-500">Scheduled rest</div>
        </div>
      </div>
    </div>
  );
};
