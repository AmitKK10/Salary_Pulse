// ============================================================================
// SALARYPULSE — REUSABLE MANUAL PUNCH TIME MODAL
// Unified Modal for Start Work, Resume Work, Take Break, End Workday / Clock Out,
// and Direct Historical/Live Punch-In/Punch-Out Corrections.
// Mobile bottom-sheet with safe-area padding & sticky actions.
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  Edit3, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export type ManualPunchMode = 
  | 'start' 
  | 'resume' 
  | 'break' 
  | 'end' 
  | 'edit_punch_out' 
  | 'edit_punch_in';

export interface ManualPunchTimeModalProps {
  isOpen: boolean;
  mode: ManualPunchMode;
  initialDate?: string; // YYYY-MM-DD
  initialTime?: string; // HH:MM:SS or HH:MM
  initialNote?: string;
  initialBreakType?: 'lunch' | 'tea' | 'personal' | 'custom';
  sessionStartLimit?: string; // ISO or HH:MM:SS for punch-out validation (must be after this)
  currentDeviceTime?: string; // Displayed reference
  onClose: () => void;
  onConfirm: (data: {
    date: string;
    time: string;
    isoTimestamp: string;
    note: string;
    reason?: string;
    breakType?: 'lunch' | 'tea' | 'personal' | 'custom';
    isNow: boolean;
  }) => void;
  title?: string;
  subtitle?: string;
}

export const ManualPunchTimeModal: React.FC<ManualPunchTimeModalProps> = ({
  isOpen,
  mode,
  initialDate,
  initialTime,
  initialNote = '',
  initialBreakType = 'lunch',
  sessionStartLimit,
  currentDeviceTime,
  onClose,
  onConfirm,
  title,
  subtitle,
}) => {
  // Device reference time ticker
  const [deviceTimeStr, setDeviceTimeStr] = useState<string>(() => {
    return new Date().toTimeString().slice(0, 8);
  });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDeviceTimeStr(new Date().toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Clean body scroll restoration
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Form states
  const [punchMethod, setPunchMethod] = useState<'now' | 'manual'>('manual');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (initialTime) {
      return initialTime.length === 5 ? `${initialTime}:00` : initialTime;
    }
    return new Date().toTimeString().slice(0, 8);
  });

  const [breakType, setBreakType] = useState<'lunch' | 'tea' | 'personal' | 'custom'>(initialBreakType);
  const [note, setNote] = useState<string>(initialNote);
  const [auditReason, setAuditReason] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial props when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;
      const nowTimeStr = now.toTimeString().slice(0, 8);

      setSelectedDate(initialDate || todayStr);
      setSelectedTime(initialTime ? (initialTime.length === 5 ? `${initialTime}:00` : initialTime) : nowTimeStr);
      setBreakType(initialBreakType || 'lunch');
      setNote(initialNote || '');
      setAuditReason('');
      setValidationError(null);
      setPunchMethod(mode === 'edit_punch_out' || mode === 'edit_punch_in' ? 'manual' : 'manual');
    }
  }, [isOpen, mode, initialDate, initialTime, initialNote, initialBreakType]);

  // Validation Logic
  const validation = useMemo<{ isValid: boolean; message: string | null }>(() => {
    const effectiveTime = punchMethod === 'now' ? deviceTimeStr : selectedTime;
    if (!effectiveTime || !selectedDate) {
      return { isValid: false, message: 'Please provide a valid date and time.' };
    }

    const constructedIso = `${selectedDate}T${effectiveTime.length === 5 ? `${effectiveTime}:00` : effectiveTime}`;
    const targetTimestamp = new Date(constructedIso).getTime();

    if (isNaN(targetTimestamp)) {
      return { isValid: false, message: 'Invalid timestamp format.' };
    }

    // Punch out validation against session start
    if ((mode === 'end' || mode === 'edit_punch_out') && sessionStartLimit) {
      const startIso = sessionStartLimit.includes('T') 
        ? sessionStartLimit 
        : `${selectedDate}T${sessionStartLimit}`;
      const startTimestamp = new Date(startIso).getTime();
      
      if (!isNaN(startTimestamp) && targetTimestamp < startTimestamp) {
        const startDisplay = startIso.split('T')[1]?.slice(0, 8) || sessionStartLimit;
        return { 
          isValid: false, 
          message: `Punch-out (${effectiveTime}) cannot be earlier than session start (${startDisplay}).` 
        };
      }
    }

    // Reason validation for edit modes
    if ((mode === 'edit_punch_out' || mode === 'edit_punch_in') && !auditReason.trim()) {
      return { isValid: false, message: 'Audit reason is mandatory for timestamp corrections.' };
    }

    return { isValid: true, message: null };
  }, [punchMethod, deviceTimeStr, selectedTime, selectedDate, mode, sessionStartLimit, auditReason]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    const effectiveTime = punchMethod === 'now' ? deviceTimeStr : selectedTime;
    const finalTime = effectiveTime.length === 5 ? `${effectiveTime}:00` : effectiveTime;
    const isoTimestamp = `${selectedDate}T${finalTime}`;

    onConfirm({
      date: selectedDate,
      time: finalTime,
      isoTimestamp,
      note: note.trim(),
      reason: auditReason.trim() || undefined,
      breakType: mode === 'break' ? breakType : undefined,
      isNow: punchMethod === 'now',
    });
  };

  // Header configuration by mode
  const getHeaderInfo = () => {
    switch (mode) {
      case 'start':
        return {
          icon: <Play className="w-5 h-5 text-[#10B981] fill-current" />,
          title: title || 'Start Work / Punch-In',
          subtitle: subtitle || 'Record initial shift start timestamp',
          accentColor: '#10B981',
          submitText: 'Save & Start',
        };
      case 'resume':
        return {
          icon: <Play className="w-5 h-5 text-[#10B981] fill-current" />,
          title: title || 'Resume Work / End Break',
          subtitle: subtitle || 'Record break completion and resume active tracking',
          accentColor: '#10B981',
          submitText: 'Save & Resume',
        };
      case 'break':
        return {
          icon: <Coffee className="w-5 h-5 text-[#D4AF37]" />,
          title: title || 'Take Break / Lunch',
          subtitle: subtitle || 'Select break category and start timestamp',
          accentColor: '#D4AF37',
          submitText: 'Save & Begin Break',
        };
      case 'end':
        return {
          icon: <Square className="w-5 h-5 text-rose-400" />,
          title: title || 'End Workday / Clock Out',
          subtitle: subtitle || 'Enter actual biometric punch-out timestamp',
          accentColor: '#F43F5E',
          submitText: 'Save & End Day',
        };
      case 'edit_punch_out':
        return {
          icon: <Edit3 className="w-5 h-5 text-[#D4AF37]" />,
          title: title || 'Edit Punch-Out Timestamp',
          subtitle: subtitle || 'Correct historical end-of-day punch with audit record',
          accentColor: '#D4AF37',
          submitText: 'Save Correction',
        };
      case 'edit_punch_in':
        return {
          icon: <Edit3 className="w-5 h-5 text-[#D4AF37]" />,
          title: title || 'Edit Punch-In Timestamp',
          subtitle: subtitle || 'Correct shift start punch with audit record',
          accentColor: '#D4AF37',
          submitText: 'Save Correction',
        };
    }
  };

  const header = getHeaderInfo();

  const modalContent = (
    <div
      id="manual-punch-time-modal"
      className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div
        className="bg-[#121212] border-t sm:border border-[#2B2B2B] rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh] overflow-hidden animate-slideUp sm:animate-scaleUp z-10"
      >
        {/* Fixed / Sticky Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-[#242424] bg-[#141414] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: `${header.accentColor}1A`,
                borderColor: `${header.accentColor}4D`,
              }}
            >
              {header.icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                {header.title}
              </h2>
              <p className="text-xs text-[#A3A3A3] line-clamp-1">
                {header.subtitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-manual-punch-modal"
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-white rounded-lg hover:bg-[#202020] transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="manual-punch-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-5 space-y-3.5 sm:space-y-4 focus:outline-none"
        >
          {/* Reference: Live Device Time Indicator */}
          <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#A3A3A3]">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Current Device Time:</span>
            </div>
            <span className="font-mono font-bold text-white text-sm tabular-nums">
              {currentDeviceTime || deviceTimeStr}
            </span>
          </div>

          {/* Punch Mode Switcher (Now vs Manual) - Hidden in edit modes */}
          {mode !== 'edit_punch_out' && mode !== 'edit_punch_in' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#1A1A1A] rounded-xl border border-[#2E2E2E]">
              <button
                id="btn-punch-method-manual"
                type="button"
                onClick={() => {
                  setPunchMethod('manual');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  punchMethod === 'manual'
                    ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Manual Punch Time</span>
              </button>
              <button
                id="btn-punch-method-now"
                type="button"
                onClick={() => {
                  setPunchMethod('now');
                  setSelectedTime(deviceTimeStr);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  punchMethod === 'now'
                    ? 'bg-[#10B981] text-black font-bold shadow-md'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Current Time</span>
              </button>
            </div>
          )}

          {/* Break Category Selector (Only for 'break' mode) */}
          {mode === 'break' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3] block">
                Break Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'lunch', label: 'Lunch Break (60m)', desc: 'Unpaid Shift Break' },
                  { id: 'tea', label: 'Tea Break (15m)', desc: 'Paid Short Break' },
                  { id: 'personal', label: 'Personal Break', desc: 'Unpaid Interval' },
                  { id: 'custom', label: 'Custom Break', desc: 'Flexible Length' },
                ].map((b) => (
                  <button
                    key={b.id}
                    id={`btn-break-type-${b.id}`}
                    type="button"
                    onClick={() => setBreakType(b.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                      breakType === b.id
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-semibold'
                        : 'bg-[#161616] border-[#262626] text-[#A3A3A3] hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-white">{b.label}</div>
                    <div className="text-[10px] text-[#737373] mt-0.5">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Time Input Controls */}
          <div className="p-3.5 sm:p-4 bg-[#161616] border border-[#292929] rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Workday Date</span>
                </label>
                <input
                  id="input-punch-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] transition"
                  required
                />
              </div>

              {/* Time Input (HH:MM:SS) */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {mode === 'end' || mode === 'edit_punch_out'
                      ? 'Actual Punch-Out (HH:MM:SS)'
                      : mode === 'start' || mode === 'edit_punch_in'
                      ? 'Actual Punch-In (HH:MM:SS)'
                      : 'Actual Timestamp (HH:MM:SS)'}
                  </span>
                </label>
                <input
                  id="input-punch-time"
                  type="time"
                  step="1"
                  disabled={punchMethod === 'now'}
                  value={punchMethod === 'now' ? deviceTimeStr : selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] transition disabled:opacity-60 disabled:bg-[#1A1A1A]"
                  required
                />
              </div>
            </div>

            {/* Formatted Date/Time Summary Preview */}
            <div className="text-[11px] text-[#A3A3A3] font-mono flex items-center justify-between pt-1 border-t border-[#222222]">
              <span>Selected Timestamp:</span>
              <span className="text-[#D4AF37] font-semibold">
                {selectedDate} • {punchMethod === 'now' ? deviceTimeStr : selectedTime}
              </span>
            </div>
          </div>

          {/* Session Note / Tag */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
              {mode === 'end' ? 'Wrap-Up Note (Optional)' : 'Session Tag / Note (Optional)'}
            </label>
            <input
              id="input-punch-note"
              type="text"
              placeholder={
                mode === 'end'
                  ? 'e.g. Completed shift tasks, sprint handover...'
                  : mode === 'start'
                  ? 'e.g. Morning General Shift, On-site Biometric...'
                  : 'Optional note or tag...'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {/* Audit Reason (Mandatory for corrections, optional for regular punches) */}
          {(mode === 'edit_punch_out' || mode === 'edit_punch_in' || mode === 'end') && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#737373] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {mode.startsWith('edit_') ? 'Audit Correction Reason (Mandatory)' : 'Punch Reason / Reference (Optional)'}
                  </span>
                </span>
                {mode.startsWith('edit_') && (
                  <span className="text-[9px] text-[#D4AF37] font-bold">REQUIRED</span>
                )}
              </label>
              <input
                id="input-punch-audit-reason"
                type="text"
                placeholder={
                  mode.startsWith('edit_')
                    ? 'e.g. Biometric machine sync adjustment, corrected punch time...'
                    : 'e.g. Biometric machine punch at 18:07...'
                }
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                required={mode.startsWith('edit_')}
                className="w-full bg-[#161616] border border-[#2B2B2B] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37] transition"
              />
            </div>
          )}

          {/* Validation Warning Box */}
          {(!validation.isValid || validationError) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validation.message || validationError}</span>
            </div>
          )}
        </form>

        {/* STICKY ACTION FOOTER (Always fixed & visible above mobile safe-area) */}
        <div className="px-5 py-3 sm:py-3.5 border-t border-[#242424] bg-[#141414] flex items-center justify-between gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            id="btn-cancel-manual-punch"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition cursor-pointer active:scale-95 uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            id="btn-save-manual-punch"
            type="submit"
            form="manual-punch-form"
            onClick={handleSubmit}
            disabled={!validation.isValid}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer uppercase tracking-wider active:scale-95 ${
              !validation.isValid
                ? 'bg-[#292929] text-[#737373] border border-[#3A3A3A] cursor-not-allowed'
                : 'bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-[#D4AF37]/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{header.submitText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
