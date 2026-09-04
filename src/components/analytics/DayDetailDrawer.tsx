import React from 'react';
import { DailyWorkHourPoint } from '../../types';
import { formatCurrency, formatDurationHM } from '../../utils/formatters';
import { X, Clock, Calendar, DollarSign, Coffee, Zap, UserCheck } from 'lucide-react';

interface DayDetailDrawerProps {
  dayPoint: DailyWorkHourPoint | null;
  onClose: () => void;
}

export const DayDetailDrawer: React.FC<DayDetailDrawerProps> = ({ dayPoint, onClose }) => {
  if (!dayPoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121824] border border-[#1e293b] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                {dayPoint.date}
              </h3>
              <p className="text-xs text-slate-400">{dayPoint.dayOfWeek} — Shift Detail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status and target badge */}
        <div className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
          <span className="text-xs text-slate-400">Attendance Status:</span>
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {dayPoint.status}
          </span>
        </div>

        {/* Work & Time details */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Active Work:</span>
            </span>
            <span className="text-base font-bold text-cyan-300 block mt-1">
              {dayPoint.activeHours}h ({formatDurationHM(dayPoint.activeSeconds)})
            </span>
          </div>

          <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Daily Surplus:</span>
            </span>
            <span className="text-base font-bold text-purple-300 block mt-1">
              {dayPoint.dailySurplusHours > 0 ? `+${dayPoint.dailySurplusHours}h` : '0h'}
            </span>
          </div>

          <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Coffee className="w-3 h-3 text-amber-400" />
              <span>Break Time:</span>
            </span>
            <span className="text-base font-bold text-amber-300 block mt-1">
              {formatDurationHM(dayPoint.breakSeconds)}
            </span>
          </div>

          <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Accrued Earnings:</span>
            </span>
            <span className="text-base font-bold text-emerald-400 block mt-1">
              {formatCurrency(dayPoint.dailyEarnings)}
            </span>
          </div>
        </div>

        {/* Punch In / Out details */}
        <div className="p-3 bg-[#0a0e17] border border-[#1e293b] rounded-lg space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>First Punch-In:</span>
            <span className="text-slate-200">
              {dayPoint.firstPunchIn ? dayPoint.firstPunchIn.split('T')[1]?.substring(0, 8) || '09:00:00' : '09:00:00'}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Last Punch-Out:</span>
            <span className="text-slate-200">
              {dayPoint.lastPunchOut ? dayPoint.lastPunchOut.split('T')[1]?.substring(0, 8) || '18:00:00' : '18:00:00'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#1e293b] hover:bg-[#283548] text-slate-200 text-xs font-semibold rounded-lg transition-all"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
