// ============================================================================
// SALARYPULSE — FORGOTTEN SESSION ALERT MODAL (STEP 10)
// Safeguard for long-running open sessions with options to continue, end, or correct
// ============================================================================

import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Clock, Power, Edit3, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatSecondsToHMS, formatTimeDisplay } from '../../utils/formatters';

interface ForgottenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCorrectTime?: () => void;
}

export const ForgottenSessionModal: React.FC<ForgottenSessionModalProps> = ({
  isOpen,
  onClose,
  onCorrectTime,
}) => {
  const { openWorkSession, endDay, setActiveTab, activeWorkResult } = useApp();

  if (!isOpen || !openWorkSession) return null;

  const startStr = formatTimeDisplay(openWorkSession.startTime);
  const rawElapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(openWorkSession.startTime).getTime()) / 1000));
  const elapsedHMS = formatSecondsToHMS(rawElapsedSeconds);

  const handleEndSession = () => {
    endDay('Closed after long running session review');
    onClose();
  };

  const handleCorrect = () => {
    setActiveTab('live-work');
    if (onCorrectTime) onCorrectTime();
    onClose();
  };

  const modalContent = (
    <div
      id="forgotten-session-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-hidden"
    >
      <div className="bg-[#141414] border border-amber-500/40 rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                OPEN SESSION NEEDS REVIEW
              </span>
              <h3 className="text-lg font-bold text-white font-serif-display mt-0.5">
                Active for {elapsedHMS}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#A3A3A3] leading-relaxed mb-4">
          {activeWorkResult?.staleReason || 'This session has been open unusually long. Please verify your punch-out time.'}
        </p>

        <div className="p-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-xl text-xs font-mono text-[#A3A3A3] space-y-1 mb-6">
          <div className="flex justify-between">
            <span>Shift Started:</span>
            <span className="text-white font-semibold">{startStr}</span>
          </div>
          <div className="flex justify-between">
            <span>Raw Elapsed:</span>
            <span className="text-amber-400 font-semibold">{elapsedHMS}</span>
          </div>
          <div className="flex justify-between text-[11px] text-[#737373]">
            <span>Salary Safe Cap:</span>
            <span className="text-[#10B981]">Standard 08:00:00</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleCorrect}
            className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-[#D4AF37]/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Correct Punch-Out Time</span>
          </button>

          <button
            onClick={handleEndSession}
            className="w-full py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Power className="w-4 h-4" />
            <span>End Workday Session</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] text-[#A3A3A3] hover:text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
          >
            Continue Working
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

