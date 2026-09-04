import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Edit3, 
  RotateCcw, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  PlusCircle,
  Sun,
  Coffee,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { ProjectionDay, ProjectionScenario, WorkSchedule, Holiday } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface FutureScenarioCalendarProps {
  scenario: ProjectionScenario;
  schedule: WorkSchedule;
  holidays: Holiday[];
  onUpdateFutureDay: (dateStr: string, updates: Partial<ProjectionDay>) => void;
  onResetScenario: () => void;
}

export const FutureScenarioCalendar: React.FC<FutureScenarioCalendarProps> = ({
  scenario,
  schedule,
  holidays,
  onUpdateFutureDay,
  onResetScenario,
}) => {
  const [editingDay, setEditingDay] = useState<ProjectionDay | null>(null);
  const [editStatus, setEditStatus] = useState<ProjectionDay['status']>('PRESENT');
  const [editWorkHours, setEditWorkHours] = useState<number>(8.0);
  const [editOtHours, setEditOtHours] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const handleOpenEdit = (day: ProjectionDay) => {
    setEditingDay(day);
    setEditStatus(day.status);
    const standardDailyHours = schedule.requiredActiveHoursPerDay || 8.0;
    const totalHours = (day.plannedWorkSeconds || 0) / 3600;
    if (totalHours > standardDailyHours) {
      setEditWorkHours(standardDailyHours);
      setEditOtHours(totalHours - standardDailyHours);
    } else {
      setEditWorkHours(totalHours || standardDailyHours);
      setEditOtHours((day.plannedOvertimeSeconds || 0) / 3600);
    }
    setEditNotes(day.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingDay) return;
    const totalPlannedSec = editStatus === 'UNPAID_LEAVE' || editStatus === 'ABSENT' || editStatus === 'WEEKLY_OFF'
      ? 0 
      : Math.round((editWorkHours + editOtHours) * 3600);

    onUpdateFutureDay(editingDay.date, {
      status: editStatus,
      plannedWorkSeconds: totalPlannedSec,
      plannedOvertimeSeconds: Math.round(editOtHours * 3600),
      notes: editNotes.trim(),
      isUserModified: true,
    });
    setEditingDay(null);
  };

  const getStatusBadge = (day: ProjectionDay) => {
    switch (day.status) {
      case 'PRESENT':
        return (day.plannedWorkSeconds > (schedule.requiredActiveHoursPerDay || 8.0) * 3600)
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-[#1E1E1E] text-white border-[#333333]';
      case 'PAID_LEAVE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'UNPAID_LEAVE':
      case 'ABSENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WEEKLY_OFF':
        return 'bg-[#181818] text-[#737373] border-[#262626]';
      case 'PAID_HOLIDAY':
      case 'UNPAID_HOLIDAY':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  // Quick Preset Actions
  const applyAllPresent = () => {
    const standardSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    scenario.futureDays.forEach(d => {
      if (d.status !== 'WEEKLY_OFF' && d.status !== 'PAID_HOLIDAY' && d.status !== 'UNPAID_HOLIDAY') {
        onUpdateFutureDay(d.date, {
          status: 'PRESENT',
          plannedWorkSeconds: standardSec,
          plannedOvertimeSeconds: 0,
        });
      }
    });
  };

  const applyExtraOTToSaturdays = () => {
    const standardSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
    scenario.futureDays.forEach(d => {
      const dayOfWeek = new Date(`${d.date}T12:00:00Z`).getUTCDay();
      if (dayOfWeek === 6 && d.status !== 'WEEKLY_OFF') { // Saturday
        onUpdateFutureDay(d.date, {
          status: 'PRESENT',
          plannedWorkSeconds: standardSec + 7200, // +2h OT
          plannedOvertimeSeconds: 7200,
          notes: 'Saturday Overtime (+2h)',
        });
      }
    });
  };

  return (
    <div id="future-scenario-calendar" className="bg-[#121212] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-base font-bold text-white font-serif-display">
              Future Dates Scenario Simulator
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1C1C1C] text-[#A3A3A3] border border-[#2B2B2B]">
              {scenario.name}
            </span>
          </div>
          <p className="text-xs text-[#888888]">
            Click any future date to customize planned hours, simulate leave, or add overtime sprints.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={applyAllPresent}
            className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[11px] font-semibold text-[#D4AF37] flex items-center gap-1 transition"
            title="Set all future workdays to Standard Full Shift"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All Present</span>
          </button>

          <button
            onClick={applyExtraOTToSaturdays}
            className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[11px] font-semibold text-emerald-400 flex items-center gap-1 transition"
            title="Add +2h Overtime on upcoming Saturdays"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sat OT (+2h)</span>
          </button>

          <button
            onClick={onResetScenario}
            className="px-2.5 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[11px] text-[#888888] hover:text-white flex items-center gap-1 transition"
            title="Reset scenario to default schedule"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Grid of Future Days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {(scenario.futureDays || []).map((day) => {
          const dateObj = new Date(`${day.date}T12:00:00Z`);
          const dayNum = dateObj.getUTCDate();
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
          const totalPlannedH = (day.plannedWorkSeconds / 3600);
          const reqDailyH = schedule.requiredActiveHoursPerDay || 8.0;
          const otHours = Math.max(0, totalPlannedH - reqDailyH);

          return (
            <div
              key={day.date}
              onClick={() => handleOpenEdit(day)}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A] group flex flex-col justify-between min-h-[95px] relative ${
                day.isUserModified ? 'border-[#D4AF37]/50 bg-[#171717]' : 'border-[#1F1F1F] bg-[#0E0E0E]'
              }`}
            >
              {/* User modified dot */}
              {day.isUserModified && (
                <span 
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" 
                  title="Custom modified"
                />
              )}

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Aug {dayNum}
                  </span>
                  <span className="text-[10px] text-[#737373] uppercase font-medium">
                    {dayName}
                  </span>
                </div>
              </div>

              {/* Status & Hours */}
              <div className="pt-2">
                <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold inline-block border ${getStatusBadge(day)}`}>
                  {String(day.status).replace('_', ' ')}
                </div>
                <div className="text-[11px] text-[#A3A3A3] font-mono mt-1">
                  {day.status === 'UNPAID_LEAVE' || day.status === 'ABSENT' ? (
                    <span className="text-rose-400">0.0h (Leave)</span>
                  ) : day.status === 'PAID_HOLIDAY' ? (
                    <span className="text-amber-300">Holiday Credit</span>
                  ) : (
                    <span>
                      {totalPlannedH.toFixed(1)}h {otHours > 0 && <span className="text-emerald-400">+{otHours.toFixed(1)}h OT</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Edit Modal */}
      {editingDay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-[#131318] border border-[#2E2E38] rounded-2xl p-4 sm:p-6 max-w-md w-full my-auto space-y-4 sm:space-y-5 shadow-2xl max-h-[92dvh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#222222] pb-3">
              <div>
                <h4 className="text-base font-bold text-white font-serif-display">
                  Simulate Date: {editingDay.date}
                </h4>
                <p className="text-xs text-[#888888]">Adjust planned shift duration or status</p>
              </div>
              <button
                onClick={() => setEditingDay(null)}
                className="text-[#888888] hover:text-white p-1.5 rounded-lg hover:bg-[#222222] transition cursor-pointer"
                aria-label="Close simulation dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider block">
                Simulated Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PRESENT', 'UNPAID_LEAVE', 'PAID_LEAVE'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setEditStatus(st);
                      if (st === 'UNPAID_LEAVE') {
                        setEditWorkHours(0);
                        setEditOtHours(0);
                      } else if (st === 'PRESENT') {
                        setEditWorkHours(schedule.requiredActiveHoursPerDay || 8.0);
                      }
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition text-center cursor-pointer ${
                      editStatus === st
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#888888] hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Hours Slider */}
            {editStatus !== 'UNPAID_LEAVE' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A3A3A3] font-medium">Standard Active Work Hours</span>
                  <span className="font-mono text-white font-bold">{editWorkHours.toFixed(1)} hrs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={editWorkHours}
                  onChange={(e) => setEditWorkHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
              </div>
            )}

            {/* Planned Overtime Slider */}
            {editStatus !== 'UNPAID_LEAVE' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A3A3A3] font-medium">Planned Overtime</span>
                  <span className="font-mono text-emerald-400 font-bold">+{editOtHours.toFixed(1)} hrs OT</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.5"
                  value={editOtHours}
                  onChange={(e) => setEditOtHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A3A3A3] block">Scenario Note</label>
              <input
                type="text"
                placeholder="e.g. Doctor appointment, client site sprint..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2B2B2B] text-white text-xs placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1F1F24] hover:bg-[#282830] text-xs font-semibold font-mono uppercase text-[#A3A3A3] hover:text-white transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold font-mono uppercase transition flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 cursor-pointer whitespace-nowrap"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Apply to Scenario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
