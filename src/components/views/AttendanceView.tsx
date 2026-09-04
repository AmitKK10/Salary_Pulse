// ============================================================================
// SALARYPULSE — ATTENDANCE REGISTRY & AUDIT HISTORY VIEW
// Comprehensive table view, multi-status filters, source tracking,
// suspicious record detection, Day Details inspection, and Day Edit Modals
// ============================================================================

import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Edit3, 
  Eye,
  Clock, 
  Calendar as CalendarIcon,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  Download,
  IndianRupee,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { DayCalculationDetails } from '../../types';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { DayDetailsDrawer } from './DayDetailsDrawer';
import { DayEditModal } from './DayEditModal';
import { ClockInAnalysisModal } from './ClockInAnalysisModal';
import { DeleteAllDataModal } from './DeleteAllDataModal';
import { ImportAttendanceModal } from './ImportAttendanceModal';

export const AttendanceView: React.FC = () => {
  const { 
    selectedMonth, 
    monthlyDaysDetails,
    monthlyRunningSummary,
    getDayDetails,
    todayDate,
    setActiveTab,
    clockInAnalysisReport,
    schedule,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const [inspectDay, setInspectDay] = useState<DayCalculationDetails | null>(null);
  const [editingDay, setEditingDay] = useState<DayCalculationDetails | null>(null);

  // New Modals
  const [isClockInAnalysisOpen, setIsClockInAnalysisOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Filter and sort days
  const filteredDays = monthlyDaysDetails
    .filter((d) => {
      // Status filter
      if (filterStatus === 'present' && d.status !== 'PRESENT' && d.status !== 'COMPLETED' && d.status !== 'WORKING') return false;
      if (filterStatus === 'partial' && d.status !== 'PARTIAL' && d.status !== 'ON_BREAK') return false;
      if (filterStatus === 'absent' && d.status !== 'ABSENT') return false;
      if (filterStatus === 'holiday' && d.status !== 'PAID_HOLIDAY' && d.status !== 'UNPAID_HOLIDAY') return false;
      if (filterStatus === 'weekly_off' && d.status !== 'WEEKLY_OFF' && d.status !== 'WEEKLY_OFF_WORKED') return false;
      if (filterStatus === 'late' && d.entryPunctuality !== 'LATE_ENTRY') return false;
      if (filterStatus === 'early_exit' && d.exitPunctuality !== 'EARLY_GOING') return false;
      if (filterStatus === 'ot' && d.overtimeSeconds <= 0) return false;
      if (filterStatus === 'review' && !d.isSuspicious) return false;

      // Source filter
      if (filterSource !== 'all' && d.source !== filterSource) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const dateMatch = d.date.toLowerCase().includes(q);
        const dayMatch = d.dayName.toLowerCase().includes(q);
        const noteMatch = d.notes?.toLowerCase().includes(q);
        if (!dateMatch && !dayMatch && !noteMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });

  const exportCSV = () => {
    const headers = ['Date', 'Day', 'Status', 'First In', 'Last Out', 'Active Hours', 'Break Hours', 'Normal Hours', 'OT Hours', 'Daily Earning (INR)', 'Source'];
    const rows = filteredDays.map(d => [
      d.date,
      d.dayName,
      d.status,
      d.firstPunchIn ? d.firstPunchIn.split('T')[1]?.slice(0, 8) : '',
      d.lastPunchOut ? d.lastPunchOut.split('T')[1]?.slice(0, 8) : '',
      (d.actualActiveSeconds / 3600).toFixed(2),
      (d.totalBreakSeconds / 3600).toFixed(2),
      (d.normalSecondsWorked / 3600).toFixed(2),
      (d.overtimeSeconds / 3600).toFixed(2),
      d.totalDailyEarned.toFixed(2),
      d.source || 'DEVICE'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SalaryPulse_Attendance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="attendance-view" className="space-y-6 pb-16 animate-fadeIn max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Attendance Registry & Audit History
            </h1>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Authoritative multi-session punch logs, wage accrual eligibility, and audit trail
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsClockInAnalysisOpen(true)}
            className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Clock-in Analysis</span>
            {clockInAnalysisReport.lateArrivalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-amber-200 font-bold ml-1">
                {clockInAnalysisReport.lateArrivalsCount} Late
              </span>
            )}
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Import Attendance</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Data</span>
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className="px-3.5 py-2 bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] border border-[#2B2B2B] rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Reconcile PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-[#181818] hover:bg-[#222222] text-[#A3A3A3] hover:text-white border border-[#2B2B2B] rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Punctuality Audit Insights Quick Strip */}
      <div className="p-3.5 rounded-xl bg-[#151515] border border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-[#A3A3A3]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Shift Target: <strong className="text-white">{schedule.officeStartTime || '09:00'} AM – {schedule.officeEndTime || '18:00'} PM</strong></span>
          </div>
          <span className="text-[#333333] hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#888888]">Late Arrivals (&gt;09:00):</span>
            <strong className={`font-bold ${clockInAnalysisReport.lateArrivalsCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {clockInAnalysisReport.lateArrivalsCount} days ({clockInAnalysisReport.totalLateArrivalMinutes}m total)
            </strong>
          </div>
          <span className="text-[#333333] hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#888888]">Early Departures (&lt;18:00):</span>
            <strong className={`font-bold ${clockInAnalysisReport.earlyDeparturesCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {clockInAnalysisReport.earlyDeparturesCount} days ({clockInAnalysisReport.totalEarlyDepartureMinutes}m total)
            </strong>
          </div>
        </div>

        <button
          onClick={() => setIsClockInAnalysisOpen(true)}
          className="text-xs font-mono text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Full Punctuality Logs</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* 2. Filters, Search & Sort Ribbon */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222222] space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#737373]" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD), day, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#2B2B2B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 bg-[#181818] border border-[#2B2B2B] rounded-lg text-[#A3A3A3] hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1F1F1F]">
          <span className="text-[10px] font-mono uppercase text-[#737373] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {[
            { id: 'all', label: 'All Days' },
            { id: 'present', label: `Present (${monthlyRunningSummary.presentDaysCount})` },
            { id: 'late', label: `Late Arrival (${clockInAnalysisReport.lateArrivalsCount})`, color: 'amber' },
            { id: 'early_exit', label: `Early Exit (${clockInAnalysisReport.earlyDeparturesCount})`, color: 'rose' },
            { id: 'partial', label: `Partial (${monthlyRunningSummary.partialDaysCount})` },
            { id: 'absent', label: `Absent (${monthlyRunningSummary.absentDaysCount})` },
            { id: 'holiday', label: `Holidays (${monthlyRunningSummary.paidHolidaysCount})` },
            { id: 'weekly_off', label: `Weekly Off (${monthlyRunningSummary.weeklyOffsCount})` },
            { id: 'ot', label: 'Overtime Active' },
            { id: 'review', label: `Needs Review (${monthlyRunningSummary.needsReviewCount})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors border cursor-pointer ${
                filterStatus === st.id
                  ? st.color === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : st.color === 'rose'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                    : st.id === 'review'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                    : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/35 font-semibold'
                  : 'bg-[#161616] text-[#737373] hover:text-white border-[#242424]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Attendance Table */}
      <div className="rounded-2xl bg-[#121212] border border-[#222222] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F1F] bg-[#141414] text-[#737373] uppercase text-[10px] tracking-wider font-mono font-semibold">
                <th className="py-3.5 px-4">Date / Day</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">First In</th>
                <th className="py-3.5 px-4">Last Out</th>
                <th className="py-3.5 px-4">Active Work</th>
                <th className="py-3.5 px-4">Breaks</th>
                <th className="py-3.5 px-4">Normal</th>
                <th className="py-3.5 px-4">Overtime</th>
                <th className="py-3.5 px-4 text-right">Daily Earning</th>
                <th className="py-3.5 px-4 text-center">Source</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B1B1B] font-mono text-[#A3A3A3]">
              {filteredDays.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-xs text-[#737373]">
                    No attendance records match your active search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDays.map((day) => {
                  const isToday = day.isToday;
                  const isWeeklyOff = day.isWeeklyOff;
                  const isHoliday = day.isHoliday;
                  const hasSuspicious = day.isSuspicious;

                  const firstIn = day.firstPunchIn ? day.firstPunchIn.split('T')[1]?.slice(0, 5) : '--:--';
                  const actualFinish = day.finishedAt || day.lastPunchOut;
                  const lastOut = actualFinish 
                    ? actualFinish.split('T')[1]?.slice(0, 5) 
                    : day.isToday 
                    ? (day.isWorkdayConcluded ? 'DONE' : 'LIVE') 
                    : '--:--';

                  return (
                    <tr
                      key={day.date}
                      id={`attendance-row-${day.date}`}
                      className={`hover:bg-[#181818] transition-colors ${
                        isToday
                          ? 'bg-[#10B981]/5'
                          : hasSuspicious
                          ? 'bg-rose-950/20'
                          : isHoliday
                          ? 'bg-purple-950/10'
                          : ''
                      }`}
                    >
                      {/* Date & Day */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className={`font-semibold ${isToday ? 'text-[#10B981]' : 'text-white'}`}>
                              {day.date}
                            </span>
                            <span className="text-[10px] text-[#737373] block uppercase">
                              {day.dayName} {isToday ? '• TODAY' : ''}
                            </span>
                          </div>
                          {hasSuspicious && (
                            <span title={day.suspiciousReasons.join(', ')}>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          status={day.status}
                          label={day.statusLabel}
                          size="xs"
                        />
                      </td>

                      {/* First In */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-white font-mono">{firstIn}</span>
                        {day.entryLabel && day.entryPunctuality !== 'NONE' && (
                          <span className={`block text-[9px] font-mono mt-0.5 ${
                            day.entryPunctuality === 'LATE_ENTRY' ? 'text-amber-400 font-semibold' : 'text-[#10B981]'
                          }`}>
                            {day.entryLabel}
                          </span>
                        )}
                      </td>

                      {/* Last Out */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-mono ${day.isToday && !day.lastPunchOut ? 'text-[#10B981] font-semibold' : 'text-white'}`}>
                          {lastOut}
                        </span>
                        {day.exitLabel && day.exitPunctuality !== 'NONE' && (
                          <span className={`block text-[9px] font-mono mt-0.5 ${
                            day.exitPunctuality === 'EARLY_GOING' ? 'text-rose-400 font-semibold' : 'text-[#10B981]'
                          }`}>
                            {day.exitLabel}
                          </span>
                        )}
                      </td>

                      {/* Active Work */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-semibold ${day.isShortWorkDay ? 'text-amber-400' : 'text-white'}`}>
                          {WorkSessionEngine.formatSecondsToHMS(day.actualActiveSeconds)}
                        </span>
                        <span className="text-[10px] text-[#737373] block">
                          {(day.actualActiveSeconds / 3600).toFixed(2)}h
                          {day.isShortWorkDay && (
                            <span className="text-amber-400 font-semibold ml-1">(&lt;8h)</span>
                          )}
                        </span>
                      </td>

                      {/* Breaks */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#D4AF37]">
                        {WorkSessionEngine.formatSecondsToHMS(day.totalBreakSeconds)}
                      </td>

                      {/* Normal Hours */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#CCCCCC]">
                        {WorkSessionEngine.formatSecondsToHMS(day.normalSecondsWorked)}
                      </td>

                      {/* Overtime */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={day.overtimeSeconds > 0 ? 'text-[#10B981] font-semibold' : 'text-[#737373]'}>
                          {day.overtimeSeconds > 0
                            ? `+${WorkSessionEngine.formatSecondsToHMS(day.overtimeSeconds)}`
                            : '00:00:00'}
                        </span>
                      </td>

                      {/* Daily Earning */}
                      <td className="py-3 px-4 whitespace-nowrap text-right font-semibold text-[#D4AF37]">
                        ₹{day.isFuture ? day.projectedDailyEarned.toFixed(2) : day.totalDailyEarned.toFixed(2)}
                        {day.isFuture && (
                          <span className="text-[9px] text-[#737373] block uppercase font-normal">
                            Projected
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#181818] border border-[#2B2B2B] text-[#A3A3A3] uppercase">
                          {day.source || 'DEVICE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setInspectDay(day)}
                            className="p-1.5 text-[#737373] hover:text-[#D4AF37] hover:bg-[#1F1F1F] rounded transition-colors"
                            title="Inspect Day Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingDay(day)}
                            className="p-1.5 text-[#737373] hover:text-white hover:bg-[#1F1F1F] rounded transition-colors"
                            title="Edit / Correct Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Day Details Inspection Drawer */}
      <DayDetailsDrawer
        dayDetails={inspectDay}
        onClose={() => setInspectDay(null)}
        onRefresh={() => {
          if (inspectDay) {
            setInspectDay(getDayDetails(inspectDay.date));
          }
        }}
      />

      {/* 5. Day Edit Modal */}
      {editingDay && (
        <DayEditModal
          dayDetails={editingDay}
          onClose={() => setEditingDay(null)}
          onSaved={() => {
            setEditingDay(null);
          }}
        />
      )}

      {/* 6. Clock-In Analysis Punctuality Modal */}
      <ClockInAnalysisModal
        isOpen={isClockInAnalysisOpen}
        onClose={() => setIsClockInAnalysisOpen(false)}
        onInspectDay={(dateStr) => {
          const details = getDayDetails(dateStr);
          setInspectDay(details);
        }}
      />

      {/* 7. Delete All Data Modal */}
      <DeleteAllDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* 8. Import Attendance & Configure Salary Modal */}
      <ImportAttendanceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

    </div>
  );
};
