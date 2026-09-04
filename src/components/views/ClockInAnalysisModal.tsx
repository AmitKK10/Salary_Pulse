// ============================================================================
// SALARYPULSE — CLOCK-IN ANALYSIS & SHIFT PUNCTUALITY AUDIT MODAL
// Flags and records instances of late arrival after 09:00 AM,
// early departure before 06:00 PM, lunch overruns, and shift target pacing
// ============================================================================

import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Coffee,
  Sparkles,
  Info,
  Timer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClockInLogItem } from '../../types';
import { WorkSessionEngine } from '../../engine/workSessionEngine';

interface ClockInAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectDay: (dateStr: string) => void;
}

export const ClockInAnalysisModal: React.FC<ClockInAnalysisModalProps> = ({
  isOpen,
  onClose,
  onInspectDay,
}) => {
  const { clockInAnalysisReport, schedule, selectedMonth } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'LATE_ARRIVALS' | 'EARLY_DEPARTURES' | 'ON_TIME' | 'LUNCH_OVERRUNS'>('ALL');

  if (!isOpen) return null;

  const {
    totalLoggedDays,
    punctualArrivalsCount,
    lateArrivalsCount,
    earlyArrivalsCount,
    punctualDeparturesCount,
    earlyDeparturesCount,
    lateDeparturesCount,
    totalLateArrivalMinutes,
    totalEarlyDepartureMinutes,
    avgLateArrivalMinutes,
    avgEarlyDepartureMinutes,
    lunchOverrunsCount,
    totalLunchOverrunMinutes,
    shortDaysCount,
    arrivalPunctualityScore,
    overallPunctualityScore,
    logs,
  } = clockInAnalysisReport;

  const schedStart = schedule.officeStartTime || '09:00';
  const schedEnd = schedule.officeEndTime || '18:00';

  // Filter logs according to active tab
  const filteredLogs = logs.filter((log) => {
    if (filterType === 'LATE_ARRIVALS') {
      return log.arrivalPunctuality === 'LATE_ENTRY';
    }
    if (filterType === 'EARLY_DEPARTURES') {
      return log.departurePunctuality === 'EARLY_GOING';
    }
    if (filterType === 'ON_TIME') {
      return log.arrivalPunctuality === 'ON_TIME' || log.departurePunctuality === 'ON_TIME';
    }
    if (filterType === 'LUNCH_OVERRUNS') {
      return log.lunchOverrunMinutes > 0;
    }
    return true;
  });

  const exportPunctualityCSV = () => {
    const headers = [
      'Date',
      'Day',
      'Scheduled Window',
      'First Punch-In',
      'Arrival Status',
      'Late Arrival Minutes',
      'Last Punch-Out',
      'Departure Status',
      'Early Departure Minutes',
      'Active Work (HH:MM)',
      'Lunch Overrun Minutes',
      'Short Workday (<8h)',
    ];

    const rows = logs.map((l) => [
      l.date,
      l.dayName,
      `${schedStart} - ${schedEnd}`,
      l.firstPunchIn ? l.firstPunchIn.split('T')[1]?.slice(0, 8) : '--:--',
      l.arrivalLabel,
      l.lateArrivalMinutes,
      l.lastPunchOut ? l.lastPunchOut.split('T')[1]?.slice(0, 8) : '--:--',
      l.departureLabel,
      l.earlyDepartureMinutes,
      (l.actualActiveSeconds / 3600).toFixed(2),
      l.lunchOverrunMinutes,
      l.isShortWorkDay ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SalaryPulse_Punctuality_Analysis_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="clockin-analysis-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl my-6 bg-[#111111] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#222222] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Clock-in & Shift Punctuality Analysis
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  {selectedMonth}
                </span>
              </div>
              <p className="text-xs text-[#888888] mt-0.5">
                Authoritative log of late arrivals after {schedStart} AM and early departures before {schedEnd} PM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportPunctualityCSV}
              className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[#A3A3A3] hover:text-white border border-[#2B2B2B] text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Export Audit</span> CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#737373] hover:text-white rounded-lg hover:bg-[#222222] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Shift Schedule Policy Banner */}
          <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#A3A3A3]">
              <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>
                Standard Shift Policy: <strong className="text-white">{schedStart} AM to {schedEnd} PM</strong> (8h Work + 1h Lunch)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-[#888888]">
                Late Threshold: <strong className="text-amber-300">&gt; {schedStart}</strong>
              </span>
              <span className="text-[#888888]">
                Early Threshold: <strong className="text-rose-300">&lt; {schedEnd}</strong>
              </span>
            </div>
          </div>

          {/* 4 Summary Scorecards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Overall Score */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373]">
                Punctuality Score
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-mono font-bold ${
                  overallPunctualityScore >= 90 ? 'text-[#10B981]' : overallPunctualityScore >= 75 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {overallPunctualityScore}%
                </span>
                <span className="text-[10px] text-[#888888] font-mono">
                  ({punctualArrivalsCount + earlyArrivalsCount}/{totalLoggedDays || 1} on-time in)
                </span>
              </div>
              <div className="text-[11px] text-[#A3A3A3] pt-1">
                {overallPunctualityScore >= 90 ? 'Excellent punctuality compliance' : 'Improvement recommended'}
              </div>
            </div>

            {/* Late Arrivals (>09:00 AM) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] flex items-center justify-between">
                <span>Late Arrivals (&gt; {schedStart})</span>
                {lateArrivalsCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400">
                  {lateArrivalsCount}
                </span>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  ({totalLateArrivalMinutes}m delayed total)
                </span>
              </div>
              <div className="text-[11px] text-[#A3A3A3] pt-1">
                Avg delay: <strong className="text-white">{avgLateArrivalMinutes} mins</strong> per late day
              </div>
            </div>

            {/* Early Departures (<06:00 PM) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] flex items-center justify-between">
                <span>Early Departures (&lt; {schedEnd})</span>
                {earlyDeparturesCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-400" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-400">
                  {earlyDeparturesCount}
                </span>
                <span className="text-[11px] text-rose-300/80 font-mono">
                  ({totalEarlyDepartureMinutes}m early lost)
                </span>
              </div>
              <div className="text-[11px] text-[#A3A3A3] pt-1">
                Avg early departure: <strong className="text-white">{avgEarlyDepartureMinutes} mins</strong>
              </div>
            </div>

            {/* Lunch Overruns (>60m) */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] flex items-center justify-between">
                <span>Lunch Overruns (&gt;1h)</span>
                {lunchOverrunsCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-400" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-mono font-bold ${lunchOverrunsCount > 0 ? 'text-rose-400' : 'text-[#10B981]'}`}>
                  {lunchOverrunsCount}
                </span>
                <span className="text-[11px] text-[#888888] font-mono">
                  ({totalLunchOverrunMinutes}m extra break)
                </span>
              </div>
              <div className="text-[11px] text-[#A3A3A3] pt-1">
                Short Workdays: <strong className={shortDaysCount > 0 ? 'text-amber-400' : 'text-white'}>{shortDaysCount} days (&lt;8h)</strong>
              </div>
            </div>
          </div>

          {/* Filter Pills Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-[#737373] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {[
                { id: 'ALL', label: `All Logs (${logs.length})` },
                { id: 'LATE_ARRIVALS', label: `Late Arrivals (${lateArrivalsCount})`, color: 'amber' },
                { id: 'EARLY_DEPARTURES', label: `Early Departures (${earlyDeparturesCount})`, color: 'rose' },
                { id: 'ON_TIME', label: `On Time (${punctualArrivalsCount})`, color: 'emerald' },
                { id: 'LUNCH_OVERRUNS', label: `Lunch Overruns (${lunchOverrunsCount})`, color: 'rose' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition border cursor-pointer ${
                    filterType === tab.id
                      ? tab.color === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : tab.color === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                        : 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 font-bold'
                      : 'bg-[#161616] text-[#888888] hover:text-white border-[#262626]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-[#888888]">
              Showing <strong>{filteredLogs.length}</strong> record{filteredLogs.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Detailed Punctuality Table */}
          <div className="rounded-xl bg-[#141414] border border-[#262626] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-[#222222] bg-[#181818] text-[#737373] uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3.5">Date / Day</th>
                    <th className="py-3 px-3.5">Target Shift</th>
                    <th className="py-3 px-3.5">First Punch In</th>
                    <th className="py-3 px-3.5">Arrival Punctuality</th>
                    <th className="py-3 px-3.5">Last Punch Out</th>
                    <th className="py-3 px-3.5">Departure Punctuality</th>
                    <th className="py-3 px-3.5">Active Work</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F] text-[#A3A3A3]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-[#737373]">
                        No records match the active punctuality filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const inTime = log.firstPunchIn ? log.firstPunchIn.split('T')[1]?.slice(0, 5) : '--:--';
                      const outTime = log.lastPunchOut ? log.lastPunchOut.split('T')[1]?.slice(0, 5) : '--:--';

                      const isLate = log.arrivalPunctuality === 'LATE_ENTRY';
                      const isEarlyExit = log.departurePunctuality === 'EARLY_GOING';

                      return (
                        <tr
                          key={log.date}
                          className={`hover:bg-[#1A1A1A] transition ${
                            isLate || isEarlyExit ? 'bg-[#181212]/30' : ''
                          }`}
                        >
                          {/* Date & Day */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="text-white font-semibold block">{log.date}</span>
                            <span className="text-[10px] text-[#737373]">{log.dayName}</span>
                          </td>

                          {/* Target Shift */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-[#888888]">
                            {schedStart} - {schedEnd}
                          </td>

                          {/* Punch In Time */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`font-semibold ${isLate ? 'text-amber-400' : 'text-white'}`}>
                              {inTime}
                            </span>
                          </td>

                          {/* Arrival Punctuality Badge */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {log.arrivalPunctuality === 'LATE_ENTRY' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Late by +{log.lateArrivalMinutes}m</span>
                              </span>
                            ) : log.arrivalPunctuality === 'EARLY_ENTRY' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Early by {log.earlyArrivalMinutes}m</span>
                              </span>
                            ) : log.arrivalPunctuality === 'ON_TIME' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>On Time</span>
                              </span>
                            ) : (
                              <span className="text-[#666666] text-[10px]">No Punch</span>
                            )}
                          </td>

                          {/* Punch Out Time */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`font-semibold ${isEarlyExit ? 'text-rose-400' : 'text-white'}`}>
                              {outTime}
                            </span>
                          </td>

                          {/* Departure Punctuality Badge */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {log.departurePunctuality === 'EARLY_GOING' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>Early Exit by {log.earlyDepartureMinutes}m</span>
                              </span>
                            ) : log.departurePunctuality === 'LATE_LEAVING' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6]">
                                <span>Overtime (+{log.lateDepartureMinutes}m)</span>
                              </span>
                            ) : log.departurePunctuality === 'ON_TIME' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>On Time</span>
                              </span>
                            ) : (
                              <span className="text-[#666666] text-[10px]">No Punch</span>
                            )}
                          </td>

                          {/* Active Work Hours & Short Day Flag */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`font-semibold ${log.isShortWorkDay ? 'text-amber-400' : 'text-white'}`}>
                              {WorkSessionEngine.formatSecondsToHMS(log.actualActiveSeconds)}
                            </span>
                            {log.isShortWorkDay && (
                              <span className="block text-[9px] text-amber-400 font-semibold mt-0.5">
                                &lt; 8 Hours (Short)
                              </span>
                            )}
                            {log.lunchOverrunMinutes > 0 && (
                              <span className="block text-[9px] text-rose-400 font-semibold mt-0.5">
                                Lunch Overrun: +{log.lunchOverrunMinutes}m
                              </span>
                            )}
                          </td>

                          {/* Inspect Action */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-center">
                            <button
                              onClick={() => {
                                onClose();
                                onInspectDay(log.date);
                              }}
                              className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2A2A2A] text-[#D4AF37] text-[10px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] bg-[#141414] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#737373]">
            Auto-audited in accordance with {schedStart}:00 entry and {schedEnd}:00 departure standards
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#222222] hover:bg-[#2E2E2E] text-white font-mono text-xs font-semibold transition cursor-pointer"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
