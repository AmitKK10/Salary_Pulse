// ============================================================================
// SALARYPULSE — DAY EDIT & DAILY PUNCH/ENTRY-EXIT MODAL
// Allows fine-grained correction of punches (Entry/Exit), status, sessions,
// holiday compensation amounts, and notes with mandatory audit logging.
// Mobile-first, tactile UI with direct time adjustments and persistent state.
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  Clock, 
  FileText, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Sparkles,
  ShieldCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  IndianRupee,
  Sliders,
  CheckCircle2,
  Coffee,
  Sun,
  Moon,
  RotateCcw,
  Minus
} from 'lucide-react';
import { 
  AttendanceDay, 
  AttendanceStatus, 
  DayCalculationDetails, 
  WorkSession, 
  BreakSession, 
  SessionSource 
} from '../../types';
import { useApp } from '../../context/AppContext';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { SalaryEngine } from '../../engine/salaryEngine';

interface DayEditModalProps {
  dayDetails: DayCalculationDetails;
  onClose: () => void;
  onSaved?: () => void;
}

// Time string normalization helper
const normalizeTime = (t: string): string => {
  if (!t) return '09:00:00';
  const parts = t.trim().split(':');
  const h = (parts[0] || '09').padStart(2, '0');
  const m = (parts[1] || '00').padStart(2, '0');
  const s = (parts[2] || '00').padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// Returns HH:MM for native input[type="time"]
const displayTime = (t: string): string => {
  if (!t) return '09:00';
  return t.slice(0, 5);
};

// Adjust time by given minutes (+ or -)
const adjustTimeMinutes = (timeStr: string, deltaMinutes: number): string => {
  const norm = normalizeTime(timeStr);
  const [h, m, s] = norm.split(':').map(Number);
  let totalMinutes = (h * 60 + m + deltaMinutes) % (24 * 60);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const newH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const newM = String(totalMinutes % 60).padStart(2, '0');
  const newS = String(s || 0).padStart(2, '0');
  return `${newH}:${newM}:${newS}`;
};

export const DayEditModal: React.FC<DayEditModalProps> = ({ dayDetails, onClose, onSaved }) => {
  const { 
    editAttendanceDayWithAudit, 
    deleteAttendanceDay, 
    getDayDetails, 
    schedule,
    salaryConfig,
    rateDerivation,
    holidays
  } = useApp();

  // Active editable date
  const [selectedDate, setSelectedDate] = useState<string>(dayDetails.date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'SIMPLE_PUNCH' | 'CUSTOM_INTERVALS'>('SIMPLE_PUNCH');

  // Form states
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  
  // Primary Entry/Exit Punch State (Simple Mode)
  const [entryTime, setEntryTime] = useState<string>('09:00:00');
  const [exitTime, setExitTime] = useState<string>('18:00:00');
  const [hasLunchBreak, setHasLunchBreak] = useState<boolean>(true);
  const [lunchStartTime, setLunchStartTime] = useState<string>('13:00:00');
  const [lunchEndTime, setLunchEndTime] = useState<string>('14:00:00');
  
  // Split Shift / Second Punch State
  const [enableSecondPunch, setEnableSecondPunch] = useState<boolean>(false);
  const [entry2Time, setEntry2Time] = useState<string>('14:00:00');
  const [exit2Time, setExit2Time] = useState<string>('18:00:00');

  // Holiday custom amount
  const [holidayAmount, setHolidayAmount] = useState<number>(500);

  // Custom intervals state (Advanced Mode)
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);

  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<SessionSource>('CORRECTED');
  const [auditReason, setAuditReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Track the date that has already been loaded into draft state
  // CRITICAL FIX: Prevents background second-ticks or context re-renders from wiping user edits!
  const lastLoadedDateRef = useRef<string>('');

  // Lock background scroll when modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Sync form state ONLY when selectedDate actually changes
  useEffect(() => {
    if (lastLoadedDateRef.current === selectedDate) {
      return; // Already initialized for this date; do not overwrite user edits!
    }
    lastLoadedDateRef.current = selectedDate;

    const currentDetails = getDayDetails(selectedDate);
    const st = currentDetails.status;
    
    if (st === 'PRESENT' || st === 'COMPLETED' || st === 'WORKING') setStatus('PRESENT');
    else if (st === 'PARTIAL' || st === 'ON_BREAK' || (st as any) === 'HALF_DAY') setStatus('PARTIAL');
    else if (st === 'ABSENT') setStatus('ABSENT');
    else if (st === 'PAID_LEAVE' || (st as any) === 'LEAVE') setStatus('PAID_LEAVE');
    else if (st === 'PAID_HOLIDAY' || (st as any) === 'HOLIDAY') setStatus('PAID_HOLIDAY');
    else if (st === 'WEEKLY_OFF' || st === 'WEEKLY_OFF_WORKED') setStatus('WEEKLY_OFF');
    else setStatus('PRESENT');

    // Check holiday config
    const foundHoliday = holidays.find(h => h.date === selectedDate);
    const defaultHolAmount = foundHoliday?.customAmount !== undefined 
      ? foundHoliday.customAmount 
      : (salaryConfig.defaultHolidayAmount || 500);
    setHolidayAmount(defaultHolAmount);

    const sessions = currentDetails.workSessions || [];
    const breaks = currentDetails.breakSessions || [];

    if (sessions.length > 0) {
      setWorkSessions(JSON.parse(JSON.stringify(sessions)));

      // First punch in and last punch out
      const firstSession = sessions[0];
      const lastSession = sessions[sessions.length - 1];

      const startIsoTime = currentDetails.firstPunchIn 
        ? currentDetails.firstPunchIn.split('T')[1]?.slice(0, 8) 
        : firstSession.startTime ? firstSession.startTime.split('T')[1]?.slice(0, 8) : '09:00:00';

      const endIsoTime = currentDetails.lastPunchOut
        ? currentDetails.lastPunchOut.split('T')[1]?.slice(0, 8)
        : lastSession.endTime ? lastSession.endTime.split('T')[1]?.slice(0, 8) : '18:00:00';

      setEntryTime(normalizeTime(startIsoTime));
      setExitTime(normalizeTime(endIsoTime));
      setEnableSecondPunch(false);
    } else {
      // Default standard 9:00 to 18:00
      setEntryTime(schedule.officeStartTime ? normalizeTime(`${schedule.officeStartTime}:00`) : '09:00:00');
      setExitTime(schedule.officeEndTime ? normalizeTime(`${schedule.officeEndTime}:00`) : '18:00:00');
      setEnableSecondPunch(false);

      setWorkSessions([
        {
          id: `ws-${Date.now()}-1`,
          startTime: `${selectedDate}T${schedule.officeStartTime || '09:00'}:00`,
          endTime: `${selectedDate}T13:00:00`,
          durationSeconds: 14400,
          source: 'MANUAL',
          note: 'Morning Shift',
        },
        {
          id: `ws-${Date.now()}-2`,
          startTime: `${selectedDate}T14:00:00`,
          endTime: `${selectedDate}T${schedule.officeEndTime || '18:00'}:00`,
          durationSeconds: 14400,
          source: 'MANUAL',
          note: 'Afternoon Shift',
        }
      ]);
    }

    if (breaks.length > 0) {
      setBreakSessions(JSON.parse(JSON.stringify(breaks)));
      const lunchBreak = breaks.find(b => b.type === 'lunch') || breaks[0];
      if (lunchBreak) {
        setHasLunchBreak(true);
        setLunchStartTime(normalizeTime(lunchBreak.startTime?.split('T')[1]?.slice(0, 8) || '13:00:00'));
        setLunchEndTime(normalizeTime(lunchBreak.endTime?.split('T')[1]?.slice(0, 8) || '14:00:00'));
      } else {
        setHasLunchBreak(false);
      }
    } else {
      setHasLunchBreak(true);
      setLunchStartTime('13:00:00');
      setLunchEndTime('14:00:00');
      setBreakSessions([
        {
          id: `bs-${Date.now()}-1`,
          type: 'lunch',
          startTime: `${selectedDate}T13:00:00`,
          endTime: `${selectedDate}T14:00:00`,
          durationSeconds: 3600,
          isPaid: false,
          source: 'MANUAL',
          note: 'Lunch Break',
        }
      ]);
    }

    setNotes(currentDetails.notes || '');
    setSource(currentDetails.source || 'CORRECTED');
    setAuditReason('');
    setErrorMsg('');
    setShowDeleteConfirm(false);
  }, [selectedDate, getDayDetails, holidays, salaryConfig, schedule]);

  // Navigate to previous or next day
  const handleShiftDay = (deltaDays: number) => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + deltaDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${dayNum}`);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (presetType: 'STANDARD_8H' | 'OVERTIME_9_5H' | 'HALF_DAY_4H' | 'LEAVE_ABSENT' | 'PAID_HOLIDAY') => {
    if (presetType === 'STANDARD_8H') {
      setStatus('PRESENT');
      setEntryTime('09:00:00');
      setExitTime('18:00:00');
      setHasLunchBreak(true);
      setLunchStartTime('13:00:00');
      setLunchEndTime('14:00:00');
      setEnableSecondPunch(false);
      setAuditReason('Regularized to Standard 8h Shift (09:00 - 18:00)');
    } else if (presetType === 'OVERTIME_9_5H') {
      setStatus('PRESENT');
      setEntryTime('09:00:00');
      setExitTime('19:30:00');
      setHasLunchBreak(true);
      setLunchStartTime('13:00:00');
      setLunchEndTime('14:00:00');
      setEnableSecondPunch(false);
      setAuditReason('Shift Overtime Approved (+1h 30m OT)');
    } else if (presetType === 'HALF_DAY_4H') {
      setStatus('PARTIAL');
      setEntryTime('09:00:00');
      setExitTime('13:30:00');
      setHasLunchBreak(false);
      setEnableSecondPunch(false);
      setAuditReason('Half Day / Partial Shift Approved');
    } else if (presetType === 'LEAVE_ABSENT') {
      setStatus('PAID_LEAVE');
      setWorkSessions([]);
      setBreakSessions([]);
      setAuditReason('Leave Approved by HR');
    } else if (presetType === 'PAID_HOLIDAY') {
      setStatus('PAID_HOLIDAY');
      setHolidayAmount(salaryConfig.defaultHolidayAmount || 500);
      setAuditReason('Paid Holiday Credit Applied');
    }
  };

  // Calculate live preview metrics for the edited day
  const livePreview = useMemo(() => {
    let activeSec = 0;
    let breakSec = 0;
    const requiredSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    if (status === 'ABSENT' || status === 'UNPAID_LEAVE') {
      activeSec = 0;
      breakSec = 0;
    } else if (editorMode === 'SIMPLE_PUNCH') {
      const lunchRule = schedule?.breakRules?.find(r => r.type === 'lunch' || r.id === 'brk-lunch');
      const configuredLunchSec = ((schedule?.defaultLunchDurationMinutes || lunchRule?.durationMinutes || 60) * 60);

      if (enableSecondPunch) {
        const in1Iso = `${selectedDate}T${normalizeTime(entryTime)}`;
        const out2Iso = `${selectedDate}T${normalizeTime(exit2Time)}`;
        const grossSpan = WorkSessionEngine.getDurationSeconds(in1Iso, out2Iso);
        activeSec = Math.max(0, grossSpan - configuredLunchSec);
        breakSec = configuredLunchSec;
      } else {
        const inIso = `${selectedDate}T${normalizeTime(entryTime)}`;
        const outIso = `${selectedDate}T${normalizeTime(exitTime)}`;
        const grossSpan = WorkSessionEngine.getDurationSeconds(inIso, outIso);

        if (hasLunchBreak) {
          const lunchInIso = `${selectedDate}T${normalizeTime(lunchStartTime)}`;
          const lunchOutIso = `${selectedDate}T${normalizeTime(lunchEndTime)}`;
          const customBreak = WorkSessionEngine.getDurationSeconds(lunchInIso, lunchOutIso);
          breakSec = customBreak > 0 ? customBreak : configuredLunchSec;
        } else {
          breakSec = 0;
        }

        activeSec = Math.max(0, grossSpan - breakSec);
      }
    } else {
      const lunchRule = schedule?.breakRules?.find(r => r.type === 'lunch' || r.id === 'brk-lunch');
      const configuredLunchSec = ((schedule?.defaultLunchDurationMinutes || lunchRule?.durationMinutes || 60) * 60);
      const res = WorkSessionEngine.calculateDayActiveSeconds(
        workSessions,
        undefined,
        selectedDate,
        12,
        configuredLunchSec,
        breakSessions
      );
      activeSec = res.totalActiveSeconds;
      breakSec = configuredLunchSec;
    }

    const otSec = Math.max(0, activeSec - requiredSec);
    let dayEarned = 0;

    const foundHoliday = holidays.find(h => h.date === selectedDate);

    if (status === 'PAID_HOLIDAY') {
      const holCredit = holidayAmount !== undefined && holidayAmount > 0 
        ? holidayAmount 
        : (foundHoliday?.customAmount !== undefined ? foundHoliday.customAmount : rateDerivation.perDayRate);
      
      if (activeSec > 0) {
        const workEarned = (activeSec / 3600) * rateDerivation.perHourRate;
        dayEarned = holCredit + workEarned;
      } else {
        dayEarned = holCredit;
      }
    } else if (status === 'PAID_LEAVE') {
      dayEarned = rateDerivation.perDayRate;
    } else if (status === 'WEEKLY_OFF') {
      if (activeSec > 0) {
        dayEarned = (activeSec / 3600) * rateDerivation.perHourRate * 1.5;
      } else {
        dayEarned = 0;
      }
    } else if (status === 'ABSENT' || status === 'UNPAID_LEAVE') {
      dayEarned = 0;
    } else {
      const normalActive = Math.min(activeSec, requiredSec);
      const normalEarned = SalaryEngine.calculateDailyEarning(normalActive / 60, rateDerivation.dailyRate);
      const otEarned = (otSec / 3600) * (rateDerivation.overtimeHourlyRate || 75);
      dayEarned = normalEarned + otEarned;
    }

    return {
      activeSeconds: activeSec,
      breakSeconds: breakSec,
      overtimeSeconds: otSec,
      dayEarned: Math.max(0, dayEarned),
      activeFormatted: WorkSessionEngine.formatSecondsToHMS(activeSec),
      breakFormatted: WorkSessionEngine.formatSecondsToHMS(breakSec),
      otFormatted: WorkSessionEngine.formatSecondsToHMS(otSec),
    };
  }, [
    status,
    editorMode,
    enableSecondPunch,
    entryTime,
    exitTime,
    entry2Time,
    exit2Time,
    hasLunchBreak,
    lunchStartTime,
    lunchEndTime,
    workSessions,
    breakSessions,
    selectedDate,
    holidayAmount,
    holidays,
    rateDerivation,
    salaryConfig,
    schedule
  ]);

  const handleDeleteDay = () => {
    deleteAttendanceDay(selectedDate, auditReason.trim() || `Deleted attendance record for ${selectedDate}`);
    if (onSaved) onSaved();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const effectiveAuditReason = auditReason.trim() || 'Manual punch timing update';
    const requiredSec = Math.round((schedule.requiredActiveHoursPerDay || 8.0) * 3600);

    let finalWorkSessions: WorkSession[] = [];
    let finalBreakSessions: BreakSession[] = [];
    let firstIn: string | undefined;
    let lastOut: string | undefined;

    if (status === 'ABSENT' || status === 'PAID_LEAVE' || status === 'UNPAID_LEAVE' || status === 'WEEKLY_OFF') {
      finalWorkSessions = [];
      finalBreakSessions = [];
    } else if (editorMode === 'SIMPLE_PUNCH') {
      if (enableSecondPunch) {
        const in1Iso = `${selectedDate}T${normalizeTime(entryTime)}`;
        const out1Iso = `${selectedDate}T${normalizeTime(exitTime)}`;
        const in2Iso = `${selectedDate}T${normalizeTime(entry2Time)}`;
        const out2Iso = `${selectedDate}T${normalizeTime(exit2Time)}`;

        if (out1Iso <= in1Iso || out2Iso <= in2Iso) {
          setErrorMsg('Exit time must be strictly after Entry time for each punch session.');
          return;
        }

        firstIn = in1Iso;
        lastOut = out2Iso;

        finalWorkSessions = [
          {
            id: `ws-${selectedDate}-1`,
            attendanceDayId: `att-${selectedDate}`,
            startTime: in1Iso,
            endTime: out1Iso,
            durationSeconds: WorkSessionEngine.getDurationSeconds(in1Iso, out1Iso),
            status: 'COMPLETED',
            source,
            note: 'Morning Shift Punch',
            createdAt: in1Iso,
            updatedAt: new Date().toISOString(),
          },
          {
            id: `ws-${selectedDate}-2`,
            attendanceDayId: `att-${selectedDate}`,
            startTime: in2Iso,
            endTime: out2Iso,
            durationSeconds: WorkSessionEngine.getDurationSeconds(in2Iso, out2Iso),
            status: 'COMPLETED',
            source,
            note: 'Afternoon Shift Punch',
            createdAt: in2Iso,
            updatedAt: new Date().toISOString(),
          }
        ];

        finalBreakSessions = [
          {
            id: `bs-${selectedDate}-1`,
            type: 'lunch',
            startTime: out1Iso,
            endTime: in2Iso,
            durationSeconds: WorkSessionEngine.getDurationSeconds(out1Iso, in2Iso),
            isPaid: false,
            source,
            note: 'Lunch Mid-day Interval',
          }
        ];
      } else {
        const inIso = `${selectedDate}T${normalizeTime(entryTime)}`;
        const outIso = `${selectedDate}T${normalizeTime(exitTime)}`;

        if (outIso <= inIso) {
          setErrorMsg('Shift Out time must be after Shift In time.');
          return;
        }

        firstIn = inIso;
        lastOut = outIso;

        if (hasLunchBreak) {
          const lunchInIso = `${selectedDate}T${normalizeTime(lunchStartTime)}`;
          const lunchOutIso = `${selectedDate}T${normalizeTime(lunchEndTime)}`;
          const lunchDuration = WorkSessionEngine.getDurationSeconds(lunchInIso, lunchOutIso);

          // If the shift spans across the lunch break window
          if (inIso < lunchInIso && outIso > lunchOutIso) {
            finalWorkSessions = [
              {
                id: `ws-${selectedDate}-1`,
                attendanceDayId: `att-${selectedDate}`,
                startTime: inIso,
                endTime: lunchInIso,
                durationSeconds: WorkSessionEngine.getDurationSeconds(inIso, lunchInIso),
                status: 'COMPLETED',
                source,
                note: 'Pre-Lunch Shift',
                createdAt: inIso,
                updatedAt: new Date().toISOString(),
              },
              {
                id: `ws-${selectedDate}-2`,
                attendanceDayId: `att-${selectedDate}`,
                startTime: lunchOutIso,
                endTime: outIso,
                durationSeconds: WorkSessionEngine.getDurationSeconds(lunchOutIso, outIso),
                status: 'COMPLETED',
                source,
                note: 'Post-Lunch Shift',
                createdAt: lunchOutIso,
                updatedAt: new Date().toISOString(),
              }
            ];

            finalBreakSessions = [
              {
                id: `bs-${selectedDate}-1`,
                type: 'lunch',
                startTime: lunchInIso,
                endTime: lunchOutIso,
                durationSeconds: lunchDuration,
                isPaid: false,
                source,
                note: 'Lunch Break',
              }
            ];
          } else {
            // Shift does not cross lunch window (e.g. morning half day or afternoon shift)
            finalWorkSessions = [
              {
                id: `ws-${selectedDate}-1`,
                attendanceDayId: `att-${selectedDate}`,
                startTime: inIso,
                endTime: outIso,
                durationSeconds: WorkSessionEngine.getDurationSeconds(inIso, outIso),
                status: 'COMPLETED',
                source,
                note: 'Office Shift',
                createdAt: inIso,
                updatedAt: new Date().toISOString(),
              }
            ];
            finalBreakSessions = [];
          }
        } else {
          finalWorkSessions = [
            {
              id: `ws-${selectedDate}-1`,
              attendanceDayId: `att-${selectedDate}`,
              startTime: inIso,
              endTime: outIso,
              durationSeconds: WorkSessionEngine.getDurationSeconds(inIso, outIso),
              status: 'COMPLETED',
              source,
              note: 'Continuous Shift',
              createdAt: inIso,
              updatedAt: new Date().toISOString(),
            }
          ];
          finalBreakSessions = [];
        }
      }
    } else {
      finalWorkSessions = workSessions.map(w => ({ ...w, source }));
      finalBreakSessions = breakSessions.map(b => ({ ...b, source }));
      firstIn = workSessions.length > 0 ? workSessions[0].startTime : undefined;
      lastOut = workSessions.length > 0 ? workSessions[workSessions.length - 1].endTime : undefined;
    }

    const updatedDay: AttendanceDay = {
      id: `att-${selectedDate}`,
      date: selectedDate,
      status,
      workdayStatus: livePreview.activeSeconds >= requiredSec 
        ? 'COMPLETED' 
        : livePreview.activeSeconds > 0 
        ? 'PARTIAL' 
        : status === 'PAID_HOLIDAY' 
        ? 'PAID_HOLIDAY' 
        : status === 'WEEKLY_OFF'
        ? 'WEEKLY_OFF'
        : 'ABSENT',
      totalActiveSeconds: livePreview.activeSeconds,
      creditedNormalSeconds: status === 'PAID_HOLIDAY' || status === 'PAID_LEAVE' ? requiredSec : 0,
      totalBreakSeconds: livePreview.breakSeconds,
      overtimeSeconds: livePreview.overtimeSeconds,
      firstPunchIn: firstIn,
      lastPunchOut: lastOut,
      workSessions: finalWorkSessions,
      breakSessions: finalBreakSessions,
      customHolidayAmount: status === 'PAID_HOLIDAY' ? holidayAmount : undefined,
      notes: notes.trim(),
      source,
      updatedAt: new Date().toISOString(),
    };

    editAttendanceDayWithAudit(updatedDay, effectiveAuditReason);

    if (onSaved) onSaved();
    onClose();
  };

  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedDateTitle = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const foundHoliday = holidays.find(h => h.date === selectedDate);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      id="day-edit-modal-backdrop" 
      className="fixed inset-0 z-[10000] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#121212] border-t sm:border border-[#2E2E38] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono animate-in slide-in-from-bottom-5 sm:fade-in sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar */}
        <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden bg-[#141414] shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#444444]" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#222222] flex items-center justify-between bg-[#141414] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>Edit Shift:</span>
                <span className="text-[#D4AF37]">{formattedDateTitle}</span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                <span>ISO: {selectedDate}</span>
                <span>•</span>
                <span className="text-[#10B981]">Instant Recalculation</span>
              </div>
            </div>
          </div>

          {/* Date Switcher Steppers & Close */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <div className="flex items-center bg-[#1E1E1E] border border-[#333333] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => handleShiftDay(-1)}
                className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#2A2A2A] transition"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleShiftDay(1)}
                className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#2A2A2A] transition"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#222222] transition ml-1"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Shift Presets Bar */}
        <div className="px-3.5 sm:px-6 py-2 bg-[#171717] border-b border-[#242424] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
          <span className="text-[#737373] text-[10px] uppercase font-semibold shrink-0 mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('STANDARD_8H')}
            className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] border border-[#333333] text-white hover:text-[#D4AF37] transition shrink-0 active:scale-95 text-xs font-semibold"
          >
            Standard (9-6)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('OVERTIME_9_5H')}
            className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] border border-[#333333] text-[#10B981] transition shrink-0 active:scale-95 text-xs font-semibold"
          >
            +1.5h OT (9-7:30)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('HALF_DAY_4H')}
            className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] border border-[#333333] text-amber-400 transition shrink-0 active:scale-95 text-xs font-semibold"
          >
            Half Day (9-1:30)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('PAID_HOLIDAY')}
            className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] border border-purple-500/30 text-purple-300 transition shrink-0 active:scale-95 text-xs font-semibold"
          >
            Paid Holiday
          </button>
        </div>

        {/* Form Root with Scrollable Body and Sticky Docked Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3.5 text-xs">
            
            {/* Live Calculation Preview Hero Banner */}
            <div className="p-3 bg-gradient-to-r from-[#142318] to-[#121A15] border border-[#10B981]/30 rounded-xl flex items-center justify-between gap-3 shadow-inner">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3A3A3] uppercase font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#10B981]" />
                  Recalculated Impact
                </span>
                <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
                  <span>Work: <strong className="text-[#10B981] font-bold text-sm">{livePreview.activeFormatted}</strong></span>
                  <span>Lunch: <strong className="text-[#D4AF37] font-semibold">{livePreview.breakFormatted}</strong></span>
                  {livePreview.overtimeSeconds > 0 && (
                    <span className="text-[#10B981] font-bold px-1.5 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30 text-[11px]">
                      +{livePreview.otFormatted} OT
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#A3A3A3] block uppercase font-semibold">Day Earnings</span>
                <span className="text-base sm:text-lg font-bold text-[#D4AF37] font-mono">
                  ₹{livePreview.dayEarned.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Delete Confirmation Alert Banner */}
            {showDeleteConfirm && (
              <div className="p-4 bg-rose-950/50 border border-rose-500/50 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Reset / Delete Day Attendance?</h3>
                    <p className="text-xs text-rose-200/80 mt-0.5">
                      This will delete all recorded punches and restore scheduled status for <strong>{selectedDate}</strong>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#333333] text-xs text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDay}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Status Selector Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#A3A3A3] font-semibold flex items-center justify-between">
                <span>Attendance Status</span>
                <span className="text-[10px] text-[#737373]">Select Workday Mode</span>
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: 'PRESENT', label: 'Present', color: 'text-[#10B981] border-[#10B981]' },
                  { id: 'PARTIAL', label: 'Half Day', color: 'text-amber-400 border-amber-400' },
                  { id: 'PAID_HOLIDAY', label: 'Holiday', color: 'text-purple-300 border-purple-400' },
                  { id: 'PAID_LEAVE', label: 'Leave', color: 'text-sky-300 border-sky-400' },
                  { id: 'WEEKLY_OFF', label: 'Off Day', color: 'text-zinc-300 border-zinc-400' },
                  { id: 'ABSENT', label: 'Absent', color: 'text-rose-400 border-rose-400' },
                ].map((s) => {
                  const isSelected = status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id as AttendanceStatus)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isSelected 
                          ? `bg-[#242424] ${s.color} shadow-md` 
                          : 'bg-[#181818] text-[#888888] border-[#2B2B2B] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Holiday Amount Editor (when status is PAID_HOLIDAY) */}
            {status === 'PAID_HOLIDAY' && (
              <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <IndianRupee className="w-4 h-4 text-purple-400" />
                  <span>Holiday Base Compensation Credit</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-[#A3A3A3] font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={holidayAmount}
                      onChange={(e) => setHolidayAmount(Number(e.target.value))}
                      className="w-full bg-[#141414] border border-purple-500/40 rounded-lg pl-7 pr-3 py-2 text-white font-bold focus:outline-none focus:border-purple-400 font-mono text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setHolidayAmount(rateDerivation.perDayRate)}
                    className="px-3 py-2 rounded-lg bg-[#222222] hover:bg-[#333333] text-purple-300 border border-purple-500/30 text-xs transition shrink-0"
                  >
                    1 Day (₹{rateDerivation.perDayRate.toFixed(0)})
                  </button>
                </div>
              </div>
            )}

            {/* PUNCH ENTRY & EXIT CONFIGURATION */}
            {status !== 'ABSENT' && status !== 'PAID_LEAVE' && status !== 'UNPAID_LEAVE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-white uppercase tracking-wider text-xs">
                      Shift Timing & Punches
                    </span>
                  </div>

                  <div className="flex items-center bg-[#1A1A1A] p-0.5 rounded-lg border border-[#333333]">
                    <button
                      type="button"
                      onClick={() => setEditorMode('SIMPLE_PUNCH')}
                      className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer font-semibold ${
                        editorMode === 'SIMPLE_PUNCH'
                          ? 'bg-[#D4AF37] text-black'
                          : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Simple Punch
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('CUSTOM_INTERVALS')}
                      className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer font-semibold ${
                        editorMode === 'CUSTOM_INTERVALS'
                          ? 'bg-[#D4AF37] text-black'
                          : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      Multi-Intervals
                    </button>
                  </div>
                </div>

                {/* MODE 1: SIMPLE PUNCH IN / PUNCH OUT */}
                {editorMode === 'SIMPLE_PUNCH' && (
                  <div className="space-y-3.5">
                    
                    {/* Punch Cards: Entry & Exit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* CARD 1: PUNCH IN (ENTRY) */}
                      <div className="p-3.5 bg-[#171717] border border-[#2B2B2B] rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Punch In (Entry)</span>
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">
                            {entryTime}
                          </span>
                        </div>

                        {/* Large Time Input */}
                        <div className="relative">
                          <input
                            type="time"
                            step="60"
                            value={displayTime(entryTime)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) setEntryTime(normalizeTime(val));
                            }}
                            className="w-full bg-[#0F0F12] border border-[#383838] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-xl font-bold font-mono text-white text-center focus:outline-none min-h-[48px] shadow-inner"
                          />
                        </div>

                        {/* Quick Step Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[-15, -5, -1, 1, 5, 15].map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => setEntryTime(prev => adjustTimeMinutes(prev, delta))}
                              className="flex-1 py-1 px-0.5 rounded-lg bg-[#222222] hover:bg-[#2E2E2E] active:bg-[#D4AF37] active:text-black border border-[#333333] text-[10px] font-mono text-[#CCCCCC] transition text-center"
                              title={`${delta > 0 ? '+' : ''}${delta} minutes`}
                            >
                              {delta > 0 ? `+${delta}m` : `${delta}m`}
                            </button>
                          ))}
                        </div>

                        {/* Quick Entry Preset Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {['09:00:00', '09:01:00', '09:05:00', '09:15:00', '09:30:00'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setEntryTime(preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${
                                entryTime === preset
                                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
                                  : 'bg-[#1C1C1C] text-[#888888] border-[#2D2D2D] hover:text-white'
                              }`}
                            >
                              {preset.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CARD 2: PUNCH OUT (EXIT) */}
                      <div className="p-3.5 bg-[#171717] border border-[#2B2B2B] rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5 uppercase">
                            <Moon className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>Punch Out (Exit)</span>
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">
                            {exitTime}
                          </span>
                        </div>

                        {/* Large Time Input */}
                        <div className="relative">
                          <input
                            type="time"
                            step="60"
                            value={displayTime(exitTime)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) setExitTime(normalizeTime(val));
                            }}
                            className="w-full bg-[#0F0F12] border border-[#383838] focus:border-[#D4AF37] rounded-xl px-3 py-2.5 text-xl font-bold font-mono text-white text-center focus:outline-none min-h-[48px] shadow-inner"
                          />
                        </div>

                        {/* Quick Step Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[-15, -5, -1, 1, 5, 15].map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              onClick={() => setExitTime(prev => adjustTimeMinutes(prev, delta))}
                              className="flex-1 py-1 px-0.5 rounded-lg bg-[#222222] hover:bg-[#2E2E2E] active:bg-[#D4AF37] active:text-black border border-[#333333] text-[10px] font-mono text-[#CCCCCC] transition text-center"
                              title={`${delta > 0 ? '+' : ''}${delta} minutes`}
                            >
                              {delta > 0 ? `+${delta}m` : `${delta}m`}
                            </button>
                          ))}
                        </div>

                        {/* Quick Exit Preset Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {['17:30:00', '18:00:00', '18:03:00', '18:13:00', '18:30:00', '19:30:00'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setExitTime(preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition border ${
                                exitTime === preset
                                  ? 'bg-sky-400/20 text-sky-300 border-sky-400/40 font-bold'
                                  : 'bg-[#1C1C1C] text-[#888888] border-[#2D2D2D] hover:text-white'
                              }`}
                            >
                              {preset.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Lunch Break Deduction Toggle Card */}
                    <div className="p-3 bg-[#181818] border border-[#2B2B2B] rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasLunchBreak}
                            onChange={(e) => setHasLunchBreak(e.target.checked)}
                            className="w-4 h-4 rounded bg-[#101010] border-[#383838] accent-[#D4AF37]"
                          />
                          <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                            <Coffee className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Deduct 1-Hour Lunch Break</span>
                          </span>
                        </label>
                        <span className="text-[11px] text-[#A3A3A3] font-mono">
                          {hasLunchBreak ? '1:00 PM – 2:00 PM' : 'No Break Deducted'}
                        </span>
                      </div>

                      <p className="text-[10px] text-[#737373]">
                        {hasLunchBreak 
                          ? 'Authoritative rule: Office Span = Exit − Entry. 1 hour lunch is subtracted from total span.' 
                          : 'Continuous work span without lunch break deduction.'}
                      </p>

                      {hasLunchBreak && (
                        <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[#242424]">
                          <div>
                            <span className="text-[10px] text-[#737373] block mb-1">Lunch Start</span>
                            <input
                              type="time"
                              value={displayTime(lunchStartTime)}
                              onChange={(e) => {
                                if (e.target.value) setLunchStartTime(normalizeTime(e.target.value));
                              }}
                              className="w-full bg-[#121212] border border-[#333333] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#737373] block mb-1">Lunch End</span>
                            <input
                              type="time"
                              value={displayTime(lunchEndTime)}
                              onChange={(e) => {
                                if (e.target.value) setLunchEndTime(normalizeTime(e.target.value));
                              }}
                              className="w-full bg-[#121212] border border-[#333333] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* MODE 2: MULTI-INTERVALS ADVANCED PUNCHES */}
                {editorMode === 'CUSTOM_INTERVALS' && (
                  <div className="space-y-3 bg-[#161616] border border-[#262626] rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Work Punch Sessions</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSession: WorkSession = {
                            id: `ws-${Date.now()}`,
                            startTime: `${selectedDate}T09:00:00`,
                            endTime: `${selectedDate}T18:00:00`,
                            durationSeconds: 32400,
                            source: 'MANUAL',
                            note: 'Shift Session',
                          };
                          setWorkSessions([...workSessions, newSession]);
                        }}
                        className="px-2 py-1 rounded bg-[#252525] hover:bg-[#333333] text-white text-[11px] flex items-center gap-1 font-mono"
                      >
                        <Plus className="w-3 h-3 text-[#D4AF37]" /> Add Session
                      </button>
                    </div>

                    <div className="space-y-2">
                      {workSessions.map((ws, idx) => (
                        <div key={ws.id || idx} className="p-2.5 bg-[#1B1B1B] border border-[#2B2B2B] rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#D4AF37] font-semibold">Session #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setWorkSessions(workSessions.filter(s => s.id !== ws.id))}
                              className="text-rose-400 hover:text-rose-300 text-xs p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-[#737373] block">Start Time</span>
                              <input
                                type="time"
                                value={displayTime(ws.startTime?.split('T')[1] || '09:00')}
                                onChange={(e) => {
                                  const t = e.target.value ? normalizeTime(e.target.value) : '09:00:00';
                                  const updated = `${selectedDate}T${t}`;
                                  setWorkSessions(workSessions.map(s => s.id === ws.id ? { 
                                    ...s, 
                                    startTime: updated,
                                    durationSeconds: WorkSessionEngine.getDurationSeconds(updated, s.endTime || updated)
                                  } : s));
                                }}
                                className="w-full bg-[#121212] border border-[#333333] rounded px-2 py-1 text-white font-mono text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-[#737373] block">End Time</span>
                              <input
                                type="time"
                                value={displayTime(ws.endTime?.split('T')[1] || '18:00')}
                                onChange={(e) => {
                                  const t = e.target.value ? normalizeTime(e.target.value) : '18:00:00';
                                  const updated = `${selectedDate}T${t}`;
                                  setWorkSessions(workSessions.map(s => s.id === ws.id ? { 
                                    ...s, 
                                    endTime: updated,
                                    durationSeconds: WorkSessionEngine.getDurationSeconds(s.startTime || updated, updated)
                                  } : s));
                                }}
                                className="w-full bg-[#121212] border border-[#333333] rounded px-2 py-1 text-white font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Audit Reason & Suggestions */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] uppercase tracking-wider text-[#A3A3A3] font-semibold flex items-center justify-between">
                <span>Audit Reason / Edit Justification</span>
                <span className="text-[10px] text-[#D4AF37]">Logged to Audit Trail</span>
              </label>
              
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="e.g. Biometric Missed Punch Correction or Approved OT"
                className="w-full bg-[#171717] border border-[#333333] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none min-h-[42px]"
              />

              {/* Suggestions chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[
                  'Biometric Missed Punch Correction',
                  'Shift Overtime Approved',
                  'Regularized Entry/Exit Timings',
                  'Holiday Compensation Applied'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAuditReason(chip)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E1E1E] hover:bg-[#282828] text-[10px] text-[#D4AF37] border border-[#D4AF37]/25 transition cursor-pointer active:scale-95"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Notes */}
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-[#737373]">
                Optional Daily Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional comments on production tasks, projects, or shifts..."
                className="w-full bg-[#171717] border border-[#2B2B2B] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none"
              />
            </div>

          </div>

          {/* Sticky Docked Bottom Action Bar */}
          <div className="bg-[#141414] border-t border-[#262626] p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2.5 sm:gap-3 shrink-0 shadow-[0_-8px_25px_rgba(0,0,0,0.8)] z-50">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2.5 bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-500/30 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer min-h-[48px] shrink-0"
              title="Delete Day Record"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#202020] hover:bg-[#2B2B2B] text-[#A3A3A3] hover:text-white rounded-xl text-xs font-semibold uppercase transition cursor-pointer min-h-[48px]"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C29E2E] text-black font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-[#D4AF37]/25 cursor-pointer whitespace-nowrap min-h-[48px]"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
};

export default DayEditModal;
