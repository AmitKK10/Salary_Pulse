// ============================================================================
// SALARYPULSE — TODAY TIMELINE CARD
// Section 6: Premium Vertical Timeline with Recorded Sessions & Expected Finish
// ============================================================================

import React from 'react';
import { 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Coffee, 
  Hourglass,
  Play
} from 'lucide-react';
import { formatCurrency, formatSecondsToHMS, formatTimeDisplay } from '../../../utils/formatters';
import { WorkSession, BreakSession } from '../../../types';

export interface TimelineDisplayItem {
  id: string;
  isBreak: boolean;
  title: string;
  startTime: string;
  endTime?: string;
  duration: number;
  isOpen: boolean;
  isPaid: boolean;
  source: string;
  raw: WorkSession | BreakSession;
}

interface TodayTimelineCardProps {
  timelineItems: TimelineDisplayItem[];
  expectedFinishTime?: string;
  isCurrentlyWorking: boolean;
  isOnBreak: boolean;
  isTargetCompleted?: boolean;
  isWorkdayConcluded?: boolean;
  perSecondRate: number;
  onAddWork: () => void;
  onAddBreak: () => void;
  onEditWork: (session: WorkSession) => void;
  onEditBreak: (breakSession: BreakSession) => void;
  onDeleteSession: (id: string, isBreak: boolean, title: string) => void;
}

export const TodayTimelineCard: React.FC<TodayTimelineCardProps> = ({
  timelineItems,
  expectedFinishTime,
  isCurrentlyWorking,
  isOnBreak,
  isTargetCompleted,
  isWorkdayConcluded,
  perSecondRate,
  onAddWork,
  onAddBreak,
  onEditWork,
  onEditBreak,
  onDeleteSession,
}) => {
  const showExpectedCompletion =
    (isCurrentlyWorking || isOnBreak) &&
    !isTargetCompleted &&
    !isWorkdayConcluded &&
    !!expectedFinishTime &&
    expectedFinishTime !== '--:--' &&
    expectedFinishTime !== 'Target Completed' &&
    expectedFinishTime !== 'Workday Concluded';
  return (
    <div 
      id="today-timeline-card" 
      className="p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl space-y-5"
    >
      {/* Header with Title & Quick Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C1C1C] pb-3 font-mono">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>TODAY TIMELINE</span>
          </h3>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Sequential punch events and dynamic shift projection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddWork}
            className="px-2.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[11px] text-[#10B981] font-bold flex items-center gap-1.5 transition border border-[#2A2A2A] cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Work</span>
          </button>

          <button
            onClick={onAddBreak}
            className="px-2.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] text-[11px] text-[#D4AF37] font-bold flex items-center gap-1.5 transition border border-[#2A2A2A] cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Break</span>
          </button>
        </div>
      </div>

      {/* Vertical Timeline Nodes */}
      <div className="relative pl-6 sm:pl-8 space-y-4 font-mono before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#222222]">
        {timelineItems.length === 0 ? (
          <div className="py-6 text-center text-[#737373] text-xs font-sans">
            No work or break sessions recorded yet today. Click "START WORK" to begin.
          </div>
        ) : (
          timelineItems.map((item, idx) => {
            const timeInStr = item.startTime.includes('T') 
              ? item.startTime.split('T')[1].substring(0, 5) 
              : item.startTime.substring(0, 5);
            
            const timeOutStr = item.endTime 
              ? (item.endTime.includes('T') ? item.endTime.split('T')[1].substring(0, 5) : item.endTime.substring(0, 5))
              : null;

            const isItemRunning = item.isOpen;
            const earned = !item.isBreak ? item.duration * perSecondRate : 0;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 ${
                  item.isBreak
                    ? 'border-[#D4AF37] bg-[#18150B]'
                    : isItemRunning
                      ? 'border-[#10B981] bg-[#10B981] animate-ping'
                      : 'border-[#10B981] bg-[#121212]'
                }`} />
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 ${
                  item.isBreak
                    ? 'border-[#D4AF37] bg-[#18150B]'
                    : isItemRunning
                      ? 'border-[#10B981] bg-[#10B981]'
                      : 'border-[#10B981] bg-[#121212]'
                }`} />

                {/* Event Card */}
                <div className="p-3 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#333333] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tabular-nums">
                        {timeInStr}
                      </span>
                      {timeOutStr && (
                        <span className="text-xs text-[#737373] tabular-nums">
                          → {timeOutStr}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                        item.isBreak
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                          : isItemRunning
                            ? 'bg-[#10B981]/20 text-[#10B981] animate-pulse'
                            : 'bg-[#1F1F1F] text-[#A3A3A3]'
                      }`}>
                        {item.isBreak ? 'Lunch / Break' : (isItemRunning ? 'Active Work' : 'Work Session')}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#A3A3A3] flex items-center gap-2">
                      <span>{item.title}</span>
                      <span>·</span>
                      <span className="text-white font-bold">{formatSecondsToHMS(item.duration)}</span>
                      {!item.isBreak && earned > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#D4AF37] font-semibold">{formatCurrency(earned)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete Interval Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => item.isBreak ? onEditBreak(item.raw as BreakSession) : onEditWork(item.raw as WorkSession)}
                      className="p-1.5 rounded-lg bg-[#202020] hover:bg-[#2B2B2B] text-[#A3A3A3] hover:text-white transition cursor-pointer"
                      title="Edit Interval"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteSession(item.id, item.isBreak, item.title)}
                      className="p-1.5 rounded-lg bg-[#202020] hover:bg-rose-950 text-[#A3A3A3] hover:text-rose-400 transition cursor-pointer"
                      title="Delete Interval"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Expected Completion Node - ONLY shown during an active ongoing shift before target completion */}
        {showExpectedCompletion && (
          <div className="relative">
            {/* Projected Dot */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-[#3B82F6] bg-[#121212]" />

            <div className="p-3 rounded-xl bg-[#141820] border border-[#1E293B] flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3B82F6] tabular-nums">
                    {expectedFinishTime}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                    Expected Completion
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  Projected 8-hour shift target milestone completion
                </div>
              </div>
              <Hourglass className="w-4 h-4 text-[#3B82F6] shrink-0" />
            </div>
          </div>
        )}

        {/* Workday Concluded / Shift Complete Node */}
        {isWorkdayConcluded && (
          <div className="relative">
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-[#10B981] bg-[#10B981]" />

            <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#10B981]">
                    Shift Complete
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] font-bold uppercase">
                    Workday Concluded
                  </span>
                </div>
                <div className="text-[11px] text-[#A3A3A3]">
                  Attendance logged and verified for today
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
