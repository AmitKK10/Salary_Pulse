// ============================================================================
// SALARYPULSE — LIVE WORK & ATTENDANCE COMMAND CENTER
// Executive Financial Terminal UI: Real-time multi-session tracking, drift-free
// timestamp timers, manual punch entry modals, active session editing,
// dynamic completion times, KPI grid, timeline, and full audit logging.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  FileText,
  Clock,
  Edit3,
  Square
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BreakSession, WorkSession } from '../../types';
import { EndOfDaySummaryModal } from './EndOfDaySummaryModal';
import { ForgottenSessionModal } from './ForgottenSessionModal';
import { ManualPunchTimeModal, ManualPunchMode } from '../common/ManualPunchTimeModal';

// Sub-components for Executive Terminal Layout
import { LiveHeroCard } from './live/LiveHeroCard';
import { TodayProgressCard } from './live/TodayProgressCard';
import { WorkStatusGrid } from './live/WorkStatusGrid';
import { WeeklyMonthlyCards } from './live/WeeklyMonthlyCards';
import { LiveMoneyCard } from './live/LiveMoneyCard';
import { NextMilestoneCard } from './live/NextMilestoneCard';
import { TodayTimelineCard } from './live/TodayTimelineCard';

export const LiveWorkView: React.FC = () => {
  const { 
    todayDate,
    setTodayDate,
    startNewDay,
    deleteAttendanceDay,
    reopenDay,
    todayAttendance,
    isCurrentlyWorking, 
    isOnBreak, 
    currentWorkdayStatus,
    openWorkSession,
    openBreakSession,
    activeWorkResult,
    todayLiveActiveSeconds,
    todayCompletedActiveSeconds,
    todayLiveBreakSeconds,
    todayLiveEarned,
    todayRemainingActiveSeconds,
    todayEstimatedCompletion,
    lunchStats,
    liveOtInfo,
    salaryConfig, 
    schedule,
    monthlyRunningSummary,
    monthlyDaysDetails,
    startWork, 
    pauseWork, 
    startBreak, 
    endBreak,
    resumeWork,
    endDay,
    editPunchIn,
    editPunchOut,
    correctWorkSession,
    correctBreakSession,
    addManualWorkSession,
    addManualBreakSession,
    deleteSession,
    auditLogs,
    rateDerivation
  } = useApp();

  // Unified Manual Punch Modal State
  const [punchModal, setPunchModal] = useState<{
    isOpen: boolean;
    mode: ManualPunchMode;
    initialDate?: string;
    initialTime?: string;
    initialNote?: string;
    initialBreakType?: 'lunch' | 'tea' | 'personal' | 'custom';
    sessionStartLimit?: string;
    title?: string;
    subtitle?: string;
  }>({
    isOpen: false,
    mode: 'start',
  });

  // Manual Session Builder / Editor (for adding custom interval or editing past session in timeline)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMode, setManualMode] = useState<'add_work' | 'add_break' | 'edit_work' | 'edit_break'>('add_work');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState(todayDate);
  const [manualStartTime, setManualStartTime] = useState('09:00:00');
  const [manualEndTime, setManualEndTime] = useState('13:00:00');
  const [manualNote, setManualNote] = useState('');
  const [manualReason, setManualReason] = useState('Manual punch correction');
  const [manualIsPaid, setManualIsPaid] = useState(false);
  const [manualBreakType, setManualBreakType] = useState<'lunch' | 'tea' | 'personal' | 'custom'>('lunch');

  // In-App Deletion Confirmation State (replaces blocked window.confirm)
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<{
    id: string;
    isBreak: boolean;
    title: string;
  } | null>(null);

  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [showForgottenModal, setShowForgottenModal] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Clean body scroll restoration when modals close
  useEffect(() => {
    const isAnyModalOpen = punchModal.isOpen || showManualModal || showEndDayModal || showForgottenModal || showAuditDrawer || !!deleteConfirmSession;
    if (!isAnyModalOpen) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [punchModal.isOpen, showManualModal, showEndDayModal, showForgottenModal, showAuditDrawer, deleteConfirmSession]);

  // Target values
  const requiredDailySeconds = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);
  const isTargetCompleted = todayLiveActiveSeconds >= requiredDailySeconds;

  // Navigate active work date
  const handleShiftDay = (deltaDays: number) => {
    const d = new Date(`${todayDate}T12:00:00`);
    d.setDate(d.getDate() + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${dayNum}`;
    setTodayDate(newDateStr);
    setStatusMessage(`Switched active workday to ${newDateStr}.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartNewDayAction = () => {
    const result = startNewDay();
    setStatusMessage(`Started new workday on ${result.date}. Ready for shift.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Open Edit Modal for Work Session in Timeline
  const handleEditWork = (session: WorkSession) => {
    setManualMode('edit_work');
    setEditingSessionId(session.id);
    const dateStr = session.startTime.includes('T') ? session.startTime.split('T')[0] : todayDate;
    const startStr = session.startTime.includes('T') ? session.startTime.split('T')[1].substring(0, 8) : session.startTime;
    const endStr = session.endTime ? (session.endTime.includes('T') ? session.endTime.split('T')[1].substring(0, 8) : session.endTime) : '';
    setManualDate(dateStr);
    setManualStartTime(startStr);
    setManualEndTime(endStr);
    setManualNote(session.note || '');
    setManualReason('Timestamp adjustment');
    setShowManualModal(true);
  };

  // Open Edit Modal for Break Session in Timeline
  const handleEditBreak = (breakItem: BreakSession) => {
    setManualMode('edit_break');
    setEditingSessionId(breakItem.id);
    const dateStr = breakItem.startTime.includes('T') ? breakItem.startTime.split('T')[0] : todayDate;
    const startStr = breakItem.startTime.includes('T') ? breakItem.startTime.split('T')[1].substring(0, 8) : breakItem.startTime;
    const endStr = breakItem.endTime ? (breakItem.endTime.includes('T') ? breakItem.endTime.split('T')[1].substring(0, 8) : breakItem.endTime) : '';
    setManualDate(dateStr);
    setManualStartTime(startStr);
    setManualEndTime(endStr);
    setManualNote(breakItem.note || '');
    setManualBreakType((breakItem.type as any) || 'lunch');
    setManualIsPaid(breakItem.isPaid);
    setManualReason('Break duration adjustment');
    setShowManualModal(true);
  };

  // Handler for ManualPunchTimeModal confirmation
  const handleConfirmPunchModal = (data: {
    date: string;
    time: string;
    isoTimestamp: string;
    note: string;
    reason?: string;
    breakType?: 'lunch' | 'tea' | 'personal' | 'custom';
    isNow: boolean;
  }) => {
    const { mode } = punchModal;
    setPunchModal(prev => ({ ...prev, isOpen: false }));

    if (mode === 'start') {
      const res = startWork(data.note || 'General Work Session', data.isoTimestamp);
      if (res.success) {
        setStatusMessage('Work session clocked in successfully.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } else if (mode === 'break') {
      const res = startBreak(data.breakType || 'lunch', data.note || `${(data.breakType || 'lunch').toUpperCase()} Break`, data.isoTimestamp);
      if (res.success) {
        setStatusMessage(`${(data.breakType || 'lunch').toUpperCase()} break started.`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } else if (mode === 'resume') {
      const res = resumeWork(data.note || 'Work Resumed', data.isoTimestamp);
      if (res.success) {
        setStatusMessage('Break completed. Work resumed.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } else if (mode === 'end') {
      const res = endDay(data.reason || data.note || 'Workday concluded', data.isoTimestamp);
      if (res.success) {
        setStatusMessage('Workday concluded successfully.');
        setShowEndDayModal(true);
        setTimeout(() => setStatusMessage(null), 3000);
      } else if (res.message) {
        setStatusMessage(`Error: ${res.message}`);
      }
    } else if (mode === 'edit_punch_in') {
      const res = editPunchIn(todayDate, data.isoTimestamp, data.reason || 'Manual punch-in correction');
      if (res.success) {
        setStatusMessage('Punch-in time corrected and audit logged.');
        setTimeout(() => setStatusMessage(null), 3000);
      } else if (res.message) {
        setStatusMessage(`Error: ${res.message}`);
      }
    } else if (mode === 'edit_punch_out') {
      const res = editPunchOut(todayDate, data.isoTimestamp, data.reason || 'Manual punch-out correction');
      if (res.success) {
        setStatusMessage('Punch-out time corrected and audit logged.');
        setTimeout(() => setStatusMessage(null), 3000);
      } else if (res.message) {
        setStatusMessage(`Error: ${res.message}`);
      }
    }
  };

  // Save Manual Entry or Correction (for add/edit interval)
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = `${todayDate}T${manualStartTime.length === 5 ? manualStartTime + ':00' : manualStartTime}`;
    const endIso = manualEndTime ? `${todayDate}T${manualEndTime.length === 5 ? manualEndTime + ':00' : manualEndTime}` : undefined;

    if (manualMode === 'add_work') {
      addManualWorkSession({
        startTime: startIso,
        endTime: endIso,
        durationSeconds: 0,
        note: manualNote || 'Manual Work Session',
        source: 'MANUAL',
      }, manualReason);
    } else if (manualMode === 'add_break') {
      addManualBreakSession({
        type: manualBreakType,
        startTime: startIso,
        endTime: endIso,
        durationSeconds: 0,
        isPaid: manualIsPaid,
        note: manualNote || `${manualBreakType.toUpperCase()} Break`,
        source: 'MANUAL',
      }, manualReason);
    } else if (manualMode === 'edit_work' && editingSessionId) {
      correctWorkSession(editingSessionId, {
        startTime: startIso,
        endTime: endIso,
        note: manualNote,
      }, manualReason);
    } else if (manualMode === 'edit_break' && editingSessionId) {
      correctBreakSession(editingSessionId, {
        startTime: startIso,
        endTime: endIso,
        type: manualBreakType,
        isPaid: manualIsPaid,
        note: manualNote,
      }, manualReason);
    }

    setShowManualModal(false);
    setStatusMessage('Record saved and audit log updated.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Trigger End Day Modal (opens ManualPunchTimeModal in mode='end')
  const handleTriggerEndDay = () => {
    const activeStart = openWorkSession?.startTime || openBreakSession?.startTime || todayAttendance?.firstPunchIn;
    setPunchModal({
      isOpen: true,
      mode: 'end',
      initialDate: todayDate,
      initialTime: new Date().toTimeString().slice(0, 8),
      sessionStartLimit: activeStart,
      title: 'End Workday / Clock Out',
      subtitle: 'Record actual biometric punch-out timestamp',
    });
  };

  // Combined timeline items sorted chronologically
  const timelineItems = [
    ...(todayAttendance?.workSessions || []).map(ws => ({
      id: ws.id,
      isBreak: false,
      title: ws.note || 'Work Session',
      startTime: ws.startTime,
      endTime: ws.endTime,
      duration: ws.endTime ? ws.durationSeconds : Math.max(0, todayLiveActiveSeconds - todayCompletedActiveSeconds),
      isOpen: !ws.endTime,
      isPaid: true,
      source: ws.source || 'DEVICE',
      raw: ws,
    })),
    ...(todayAttendance?.breakSessions || []).map(bs => ({
      id: bs.id,
      isBreak: true,
      title: bs.note || `${bs.type.toUpperCase()} Break`,
      startTime: bs.startTime,
      endTime: bs.endTime,
      duration: bs.endTime ? bs.durationSeconds : (lunchStats.elapsedSeconds || 0),
      isOpen: !bs.endTime,
      isPaid: bs.isPaid,
      source: bs.source || 'DEVICE',
      raw: bs,
    })),
  ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Date formatter for display
  const formatHumanDate = (dateStr: string): string => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  // Weekly Statistics Calculation
  const getWeeklyStats = () => {
    const targetDateObj = new Date(`${todayDate}T12:00:00`);
    const dayOfWeek = targetDateObj.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayObj = new Date(targetDateObj);
    mondayObj.setDate(mondayObj.getDate() + distanceToMonday);

    const sundayObj = new Date(mondayObj);
    sundayObj.setDate(sundayObj.getDate() + 6);

    const mondayStr = mondayObj.toISOString().split('T')[0];
    const sundayStr = sundayObj.toISOString().split('T')[0];

    const weekDays = (monthlyDaysDetails || []).filter(d => d.date >= mondayStr && d.date <= sundayStr);

    let weekWorked = 0;
    let weekTarget = 0;

    if (weekDays.length > 0) {
      weekDays.forEach(d => {
        if (d.date === todayDate) {
          weekWorked += todayLiveActiveSeconds;
        } else {
          weekWorked += d.actualActiveSeconds || 0;
        }
        weekTarget += (d.requiredNormalSeconds || (d.isWeeklyOff || d.isHoliday ? 0 : requiredDailySeconds));
      });
    } else {
      weekWorked = todayLiveActiveSeconds;
      weekTarget = (schedule.workingDays?.length || 6) * requiredDailySeconds;
    }

    if (weekTarget === 0) {
      weekTarget = (schedule.workingDays?.length || 6) * requiredDailySeconds;
    }

    const weekRemaining = Math.max(0, weekTarget - weekWorked);
    const weekProgressPct = weekTarget > 0 ? Math.min(100, (weekWorked / weekTarget) * 100) : 0;

    return {
      weekWorkedSeconds: weekWorked,
      weekTargetSeconds: weekTarget,
      weekRemainingSeconds: weekRemaining,
      weekProgressPct,
    };
  };

  const weeklyStats = getWeeklyStats();

  // Monthly Statistics
  const monthWorkedSeconds = (monthlyRunningSummary.actualWorkSeconds || 0) + (todayAttendance?.workSessions?.length && todayAttendance.date === todayDate ? Math.max(0, todayLiveActiveSeconds - (todayAttendance.totalActiveSeconds || 0)) : 0);
  const monthTargetSeconds = monthlyRunningSummary.requiredNormalSeconds || (26 * requiredDailySeconds);
  const monthRemainingSeconds = Math.max(0, monthTargetSeconds - monthWorkedSeconds);
  const monthAttendanceRatio = `${monthlyRunningSummary.presentDaysCount + (todayAttendance?.workSessions?.length && todayAttendance.date === todayDate && (todayAttendance.totalActiveSeconds || 0) === 0 ? 1 : 0)} / ${monthlyRunningSummary.scheduledWorkDaysCount || 26}`;
  const monthBonusProgress = monthlyRunningSummary.normalHoursPercentage ? monthlyRunningSummary.normalHoursPercentage.toFixed(1) : ((monthWorkedSeconds / (monthTargetSeconds || 1)) * 100).toFixed(1);

  return (
    <div id="live-work-view" className="space-y-5 pb-16 animate-fadeIn max-w-5xl mx-auto px-2 sm:px-4">
      {/* Top Banner Alert if any */}
      {statusMessage && (
        <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl text-xs text-[#10B981] flex items-center justify-between animate-fadeIn font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#A3A3A3] hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP WORKDAY SELECTOR & START NEW DAY BAR */}
      <div className="p-3 sm:p-4 bg-[#141414] border border-[#262626] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-mono uppercase text-[#A3A3A3] font-semibold">Active Workday:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleShiftDay(-1)}
              className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2B2B2B] text-[#A3A3A3] hover:text-white transition cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={todayDate}
              onChange={(e) => {
                setTodayDate(e.target.value);
                setStatusMessage(`Switched active workday to ${e.target.value}.`);
                setTimeout(() => setStatusMessage(null), 3000);
              }}
              className="bg-[#101010] border border-[#333333] rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              onClick={() => handleShiftDay(1)}
              className="p-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2B2B2B] text-[#A3A3A3] hover:text-white transition cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-[#D4AF37] font-semibold ml-2">
            ({formatHumanDate(todayDate)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const now = new Date();
              const y = now.getFullYear();
              const m = String(now.getMonth() + 1).padStart(2, '0');
              const d = String(now.getDate()).padStart(2, '0');
              setTodayDate(`${y}-${m}-${d}`);
              setStatusMessage(`Switched to device date ${y}-${m}-${d}.`);
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-white text-xs font-mono transition cursor-pointer"
          >
            Today
          </button>
          <button
            id="btn-start-new-day"
            onClick={handleStartNewDayAction}
            className="px-3.5 py-1.5 rounded-xl bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/50 text-[#10B981] font-bold text-xs font-mono flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Advance to next workday"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Day</span>
          </button>
        </div>
      </div>

      {/* STALE SESSION SAFETY WARNING BANNER (If open session crossed midnight or safety cap) */}
      {activeWorkResult?.isStale && (
        <div id="stale-session-warning-card" className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  OPEN SESSION NEEDS REVIEW
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Session Exceeds Standard Limits
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              SAFETY CAPPED
            </span>
          </div>

          <p className="text-xs text-[#D1D5DB] leading-relaxed">
            {activeWorkResult.staleReason || 'This session has been running unusually long. Earnings are safely protected and capped to standard shift duration.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setShowForgottenModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review Session</span>
            </button>

            <button
              onClick={() => {
                setPunchModal({
                  isOpen: true,
                  mode: 'edit_punch_out',
                  initialDate: todayDate,
                  initialTime: new Date().toTimeString().slice(0, 8),
                  sessionStartLimit: openWorkSession?.startTime,
                  title: 'Correct Punch-Out Time',
                  subtitle: 'Enter the actual time you finished your shift',
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#262626] hover:bg-[#333333] border border-[#404040] text-[#D4AF37] font-semibold text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Correct Time</span>
            </button>

            <button
              onClick={handleTriggerEndDay}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 text-rose-400" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: LIVE HERO & SECTION 7: LUNCH BREAK STATE */}
      <LiveHeroCard
        todayDate={todayDate}
        isCurrentlyWorking={isCurrentlyWorking}
        isOnBreak={isOnBreak}
        currentWorkdayStatus={currentWorkdayStatus}
        todayLiveActiveSeconds={todayLiveActiveSeconds}
        todayCompletedActiveSeconds={todayCompletedActiveSeconds}
        todayRemainingActiveSeconds={todayRemainingActiveSeconds}
        todayLiveEarned={todayLiveEarned}
        openWorkSession={openWorkSession}
        openBreakSession={openBreakSession}
        lunchStats={lunchStats}
        rateDerivation={rateDerivation}
        auditLogsCount={auditLogs.length}
        formatHumanDate={formatHumanDate}
        onClockIn={() => {
          setPunchModal({
            isOpen: true,
            mode: 'start',
            initialDate: todayDate,
            initialTime: new Date().toTimeString().slice(0, 8),
            title: 'Start Work / Punch-In',
            subtitle: 'Record shift start timestamp and optional note',
          });
        }}
        onTakeBreak={() => {
          setPunchModal({
            isOpen: true,
            mode: 'break',
            initialDate: todayDate,
            initialTime: new Date().toTimeString().slice(0, 8),
            initialBreakType: 'lunch',
            title: 'Take Break / Lunch',
            subtitle: 'Select break category and start timestamp',
          });
        }}
        onResumeWork={() => {
          setPunchModal({
            isOpen: true,
            mode: 'resume',
            initialDate: todayDate,
            initialTime: new Date().toTimeString().slice(0, 8),
            title: 'Resume Work / End Break',
            subtitle: 'Record break end timestamp and resume tracking',
          });
        }}
        onClockOut={handleTriggerEndDay}
        onEditPunchIn={() => {
          if (!openWorkSession) return;
          setPunchModal({
            isOpen: true,
            mode: 'edit_punch_in',
            initialDate: todayDate,
            initialTime: openWorkSession.startTime.includes('T') ? openWorkSession.startTime.split('T')[1].slice(0, 8) : openWorkSession.startTime.slice(0, 8),
            initialNote: openWorkSession.note || '',
            title: 'Edit Punch-In Timestamp',
            subtitle: 'Adjust biometric shift start time with audit log',
          });
        }}
        onOpenAudit={() => setShowAuditDrawer(true)}
      />

      {/* SECTION 2: TODAY PROGRESS CARD */}
      <TodayProgressCard
        todayLiveActiveSeconds={todayLiveActiveSeconds}
        requiredDailySeconds={requiredDailySeconds}
        todayRemainingActiveSeconds={todayRemainingActiveSeconds}
        expectedFinishTime={todayEstimatedCompletion.formattedTime}
        finishedAt={todayAttendance.finishedAt || todayAttendance.lastPunchOut}
        isCurrentlyWorking={isCurrentlyWorking}
        isOnBreak={isOnBreak}
        isTargetCompleted={isTargetCompleted}
        isWorkdayConcluded={currentWorkdayStatus === 'COMPLETED' || todayAttendance.workdayStatus === 'COMPLETED' || (!isCurrentlyWorking && !isOnBreak && !!(todayAttendance.finishedAt || todayAttendance.lastPunchOut))}
      />

      {/* SECTION 3: WORK STATUS GRID */}
      <WorkStatusGrid
        workedSeconds={todayLiveActiveSeconds}
        remainingSeconds={todayRemainingActiveSeconds}
        breakSeconds={todayLiveBreakSeconds}
        overtimeSeconds={liveOtInfo.overtimeSecondsToday}
      />

      {/* SECTION 4: WEEKLY STATUS & SECTION 5: MONTHLY STATUS */}
      <WeeklyMonthlyCards
        weekWorkedSeconds={weeklyStats.weekWorkedSeconds}
        weekTargetSeconds={weeklyStats.weekTargetSeconds}
        weekRemainingSeconds={weeklyStats.weekRemainingSeconds}
        weekProgressPct={weeklyStats.weekProgressPct}
        monthWorkedSeconds={monthWorkedSeconds}
        monthTargetSeconds={monthTargetSeconds}
        monthRemainingSeconds={monthRemainingSeconds}
        monthAttendanceRatio={monthAttendanceRatio}
        monthBonusProgress={monthBonusProgress}
      />

      {/* SECTION 8: LIVE MONEY CARD */}
      <LiveMoneyCard
        hourlyRate={rateDerivation.perHourRate}
        perMinuteRate={rateDerivation.perMinuteRate}
        perSecondRate={rateDerivation.perSecondRate}
        isOvertimeActive={liveOtInfo.isOvertimeActive}
        overtimeMultiplier={salaryConfig.overtimeMultiplier}
      />

      {/* SECTION 9: NEXT MILESTONE */}
      <NextMilestoneCard
        todayRemainingActiveSeconds={todayRemainingActiveSeconds}
        isTodayTargetCompleted={isTargetCompleted}
        monthlyRemainingNormalSeconds={monthRemainingSeconds}
        isMonthlyThresholdReached={monthlyRunningSummary.isThresholdReached}
        presentDaysCount={monthlyRunningSummary.presentDaysCount}
        bonusTargetDays={salaryConfig.attendanceBonusEligibleDays || 26}
        bonusAmount={salaryConfig.attendanceBonusAmount || 3000}
      />

      {/* SECTION 6: TODAY TIMELINE */}
      <TodayTimelineCard
        timelineItems={timelineItems}
        expectedFinishTime={todayEstimatedCompletion.formattedTime}
        isCurrentlyWorking={isCurrentlyWorking}
        isOnBreak={isOnBreak}
        isTargetCompleted={isTargetCompleted}
        isWorkdayConcluded={currentWorkdayStatus === 'COMPLETED' || todayAttendance.workdayStatus === 'COMPLETED' || (!isCurrentlyWorking && !isOnBreak && !!todayAttendance.lastPunchOut)}
        perSecondRate={rateDerivation.perSecondRate}
        onAddWork={() => {
          setManualMode('add_work');
          setManualStartTime('09:00:00');
          setManualEndTime('13:00:00');
          setManualNote('');
          setManualReason('Manual session addition');
          setShowManualModal(true);
        }}
        onAddBreak={() => {
          setManualMode('add_break');
          setManualStartTime('13:00:00');
          setManualEndTime('14:00:00');
          setManualNote('');
          setManualReason('Manual break addition');
          setShowManualModal(true);
        }}
        onEditWork={handleEditWork}
        onEditBreak={handleEditBreak}
        onDeleteSession={(id, isBreak, title) => {
          setDeleteConfirmSession({
            id,
            isBreak,
            title,
          });
        }}
      />

      {/* IN-APP DELETE SESSION CONFIRMATION MODAL */}
      {deleteConfirmSession && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Delete Session Interval?</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-white font-mono">"{deleteConfirmSession.title}"</strong>? This will recompute daily totals and create an audit log.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-white font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSession(deleteConfirmSession.id, deleteConfirmSession.isBreak, 'User requested interval deletion');
                  setDeleteConfirmSession(null);
                  setStatusMessage('Session interval deleted successfully.');
                  setTimeout(() => setStatusMessage(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-900/30"
              >
                Delete Interval
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* UNIFIED MANUAL PUNCH TIME MODAL (Start, Break, Resume, Clock-Out, Corrections) */}
      <ManualPunchTimeModal
        isOpen={punchModal.isOpen}
        mode={punchModal.mode}
        initialDate={punchModal.initialDate}
        initialTime={punchModal.initialTime}
        initialNote={punchModal.initialNote}
        initialBreakType={punchModal.initialBreakType}
        sessionStartLimit={punchModal.sessionStartLimit}
        title={punchModal.title}
        subtitle={punchModal.subtitle}
        onConfirm={handleConfirmPunchModal}
        onClose={() => setPunchModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* MODAL: TIMELINE ADD / EDIT WORK OR BREAK INTERVAL */}
      {showManualModal && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-hidden animate-fadeIn">
          <div className="bg-[#141414] border-t sm:border border-[#2B2B2B] rounded-t-2xl sm:rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[85dvh] overflow-hidden animate-slideUp sm:animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#242424] px-5 py-3.5 bg-[#141414] shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white">
                  {manualMode === 'add_work' && 'Add Manual Work Session'}
                  {manualMode === 'add_break' && 'Add Manual Break Session'}
                  {manualMode === 'edit_work' && 'Edit Work Interval'}
                  {manualMode === 'edit_break' && 'Edit Break Interval'}
                </h3>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">Start Time (HH:MM:SS)</label>
                  <input
                    type="time"
                    step="1"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">End Time (Optional)</label>
                  <input
                    type="time"
                    step="1"
                    value={manualEndTime}
                    onChange={(e) => setManualEndTime(e.target.value)}
                    className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {(manualMode === 'add_break' || manualMode === 'edit_break') && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">Break Type</label>
                    <select
                      value={manualBreakType}
                      onChange={(e) => setManualBreakType(e.target.value as any)}
                      className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="lunch">Lunch</option>
                      <option value="tea">Tea</option>
                      <option value="personal">Personal</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="manualIsPaid"
                      checked={manualIsPaid}
                      onChange={(e) => setManualIsPaid(e.target.checked)}
                      className="rounded border-[#333333] text-[#D4AF37] focus:ring-0"
                    />
                    <label htmlFor="manualIsPaid" className="text-white text-xs cursor-pointer select-none">Paid Break</label>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">Description / Label</label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. Afternoon shift session, Client meeting"
                  className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-[#737373] block mb-1 font-semibold">Audit Reason (Required)</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Reason for manual modification"
                  className="w-full bg-[#101010] border border-[#333333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#A3A3A3] hover:text-white font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#DFBE52] text-black font-bold transition cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 5: END OF DAY SUMMARY */}
      <EndOfDaySummaryModal
        isOpen={showEndDayModal}
        onClose={() => setShowEndDayModal(false)}
      />

      {/* MODAL 6: FORGOTTEN ACTIVE SESSION CORRECTION */}
      <ForgottenSessionModal
        isOpen={showForgottenModal}
        onClose={() => setShowForgottenModal(false)}
      />

      {/* DRAWER: AUDIT TRAIL */}
      {showAuditDrawer && createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-end">
          <div className="bg-[#121212] border-l border-[#262626] w-full max-w-md h-full p-6 space-y-4 overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-base font-bold text-white">Punch Audit Logs</h3>
              </div>
              <button onClick={() => setShowAuditDrawer(false)} className="text-[#737373] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-center py-8 text-[#737373] font-sans">No audit events recorded yet.</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#171717] border border-[#222222] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#737373]">
                      <span className="font-bold text-[#D4AF37] uppercase">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white text-xs font-sans">{log.reason || 'Audit event logged'}</p>
                    {log.oldValue && log.newValue && (
                      <div className="text-[10px] text-[#A3A3A3] pt-0.5">
                        <span className="line-through text-rose-400">{log.oldValue}</span> → <span className="text-[#10B981]">{log.newValue}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
