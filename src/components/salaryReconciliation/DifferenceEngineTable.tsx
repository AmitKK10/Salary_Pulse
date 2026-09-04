// ============================================================================
// SALARYPULSE — DIFFERENCE ENGINE TABLE COMPONENT (STEP 7)
// Line-by-line itemized salary comparison with variance drivers & resolution actions
// ============================================================================

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  ChevronRight,
  MessageSquare,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { ItemizedSalaryDiscrepancy, ResolutionStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface DifferenceEngineTableProps {
  discrepancies: ItemizedSalaryDiscrepancy[];
  isLocked: boolean;
  onUpdateResolution: (discrepancyId: string, resolution: ResolutionStatus, userNote?: string) => void;
}

export const DifferenceEngineTable: React.FC<DifferenceEngineTableProps> = ({
  discrepancies,
  isLocked,
  onUpdateResolution,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const safeDiscrepancies = discrepancies || [];
  const filtered = safeDiscrepancies.filter(d => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'DISCREPANCIES_ONLY') return Math.abs(d.variance) > 0.01;
    return d.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string, variance: number) => {
    if (Math.abs(variance) < 0.01) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" /> Matched
        </span>
      );
    }
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> High Variance
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> Medium
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 text-[10px] font-bold uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" /> Minor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#737373]/15 text-[#A3A3A3] text-[10px] font-bold uppercase tracking-wider">
            Info
          </span>
        );
    }
  };

  const getResolutionColor = (status: ResolutionStatus) => {
    switch (status) {
      case 'DISPUTED_WITH_HR':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      case 'ACCEPTED_OFFICIAL':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
      case 'TIMING_DIFFERENCE':
        return 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30';
      case 'PENDING_CLARIFICATION':
        return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'RECONCILED':
      default:
        return 'text-[#737373] bg-[#1F1F1F] border-[#333333]';
    }
  };

  const handleSaveNote = (id: string) => {
    onUpdateResolution(id, discrepancies.find(d => d.id === id)?.userResolution || 'PENDING_CLARIFICATION', tempNote);
    setEditingNoteId(null);
  };

  return (
    <div id="difference-engine-card" className="rounded-2xl bg-[#0E0E0E] border border-[#262626] p-6 space-y-4 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span>Itemized Salary Difference Engine</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#A3A3A3] font-normal">
              {safeDiscrepancies.length} Line Items
            </span>
          </h3>
          <p className="text-xs text-[#737373] mt-0.5">
            Component-by-component audit comparing biometric accrual vs official company slip lines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#262626] rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
                filterSeverity === 'ALL' ? 'bg-[#262626] text-white font-bold' : 'text-[#737373] hover:text-white'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterSeverity('DISCREPANCIES_ONLY')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
                filterSeverity === 'DISCREPANCIES_ONLY' ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold' : 'text-[#737373] hover:text-white'
              }`}
            >
              Variances Only
            </button>
            <button
              onClick={() => setFilterSeverity('HIGH')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
                filterSeverity === 'HIGH' ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold' : 'text-[#737373] hover:text-white'
              }`}
            >
              High Impact
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1F1F1F]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#141414] border-b border-[#262626] text-[#737373] uppercase tracking-wider font-mono text-[10px]">
              <th className="py-3 px-4 font-semibold">Salary Component</th>
              <th className="py-3 px-4 font-semibold text-right">Pulse Accrued</th>
              <th className="py-3 px-4 font-semibold text-right">Official Slip</th>
              <th className="py-3 px-4 font-semibold text-right">Variance</th>
              <th className="py-3 px-4 font-semibold">Impact Driver</th>
              <th className="py-3 px-4 font-semibold">Resolution Action</th>
              <th className="py-3 px-4 font-semibold text-right">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]">
            {filtered.map((item) => {
              const isMatch = Math.abs(item.variance) < 0.01;
              return (
                <tr 
                  key={item.id}
                  className={`hover:bg-[#141414]/80 transition ${
                    !isMatch && item.severity === 'CRITICAL' ? 'bg-[#EF4444]/5' : ''
                  }`}
                >
                  {/* Component Name */}
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span>{item.title || (item as any).componentName}</span>
                      {getSeverityBadge(item.severity, item.variance)}
                    </div>
                  </td>

                  {/* Pulse Accrued */}
                  <td className="py-3 px-4 font-mono text-right text-[#D4AF37] font-semibold">
                    {formatCurrency(item.pulseAmount)}
                  </td>

                  {/* Official Slip */}
                  <td className="py-3 px-4 font-mono text-right text-white">
                    {formatCurrency(item.officialAmount)}
                  </td>

                  {/* Variance */}
                  <td className="py-3 px-4 font-mono text-right font-bold">
                    <span className={
                      isMatch 
                        ? 'text-[#10B981]' 
                        : item.variance < 0 
                          ? 'text-[#EF4444]' 
                          : 'text-[#10B981]'
                    }>
                      {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                    </span>
                  </td>

                  {/* Driver / Description */}
                  <td className="py-3 px-4 text-[#A3A3A3] max-w-xs">
                    <div className="line-clamp-2 text-[11px] leading-relaxed">
                      {item.driver || (item as any).potentialDriver || item.description}
                    </div>
                  </td>

                  {/* Resolution Status Dropdown */}
                  <td className="py-3 px-4">
                    {isMatch ? (
                      <span className="text-[11px] text-[#10B981] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    ) : isLocked ? (
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${getResolutionColor(item.userResolution)}`}>
                        {item.userResolution.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <select
                        value={item.userResolution}
                        onChange={(e) => onUpdateResolution(item.id, e.target.value as ResolutionStatus, item.userNote)}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border transition bg-[#141414] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] ${getResolutionColor(item.userResolution)}`}
                      >
                        <option value="DISPUTED_WITH_HR">Disputed with HR</option>
                        <option value="ACCEPTED_OFFICIAL">Accepted Official</option>
                        <option value="TIMING_DIFFERENCE">Timing Difference</option>
                        <option value="PENDING_CLARIFICATION">Pending Clarification</option>
                        <option value="RECONCILED">Reconciled</option>
                      </select>
                    )}
                  </td>

                  {/* Notes / Action */}
                  <td className="py-3 px-4 text-right">
                    {editingNoteId === item.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Add note..."
                          className="bg-[#1A1A1A] border border-[#333] rounded px-2 py-0.5 text-xs text-white focus:outline-none w-32"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          className="px-2 py-0.5 rounded bg-[#D4AF37] text-black font-bold text-[10px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end">
                        {item.userNote ? (
                          <span className="text-[11px] text-[#A3A3A3] italic truncate max-w-[120px]" title={item.userNote}>
                            "{item.userNote}"
                          </span>
                        ) : null}
                        {!isLocked && (
                          <button
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setTempNote(item.userNote || '');
                            }}
                            className="p-1 rounded hover:bg-[#262626] text-[#737373] hover:text-[#D4AF37] transition"
                            title="Add/Edit Note"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
