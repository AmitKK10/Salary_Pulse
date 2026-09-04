// ============================================================================
// SALARYPULSE — FORENSIC SALARY NARRATIVE CARD (STEP 7)
// "Why is my salary different?" Explanation Tool with Key Drivers & Action Steps
// ============================================================================

import React, { useState } from 'react';
import { 
  HelpCircle, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert
} from 'lucide-react';
import { ForensicSalaryNarrative } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ForensicNarrativeCardProps {
  narrative: ForensicSalaryNarrative;
  onOpenHRDisputeModal: () => void;
}

export const ForensicNarrativeCard: React.FC<ForensicNarrativeCardProps> = ({
  narrative,
  onOpenHRDisputeModal,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    headline = 'Normal Alignment',
    netVariance = 0,
    keyFinancialDrivers = [],
    explanationSteps = [],
    actionRecommendations = [],
    suggestedHRDisputeTemplate = ''
  } = narrative || {};

  const handleCopyTemplate = () => {
    if (!suggestedHRDisputeTemplate) return;
    navigator.clipboard.writeText(suggestedHRDisputeTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="forensic-narrative-card" className="rounded-2xl bg-[#0E0E0E] border border-[#262626] p-6 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#D4AF37] via-[#EAB308] to-[#10B981]" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-serif-display">
                Forensic Analysis: Why is my salary different?
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                Math.abs(netVariance) < 1 
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                  : netVariance < 0 
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30' 
                    : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
              }`}>
                {headline}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Automated deterministic diagnosis comparing biometric work logs against official payroll lines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {suggestedHRDisputeTemplate && (
            <button
              id="btn-draft-hr-query"
              onClick={onOpenHRDisputeModal}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 transition shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Draft HR Query</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1F1F1F] text-[#737373] hover:text-white border border-[#262626] transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Key Financial Impact Drivers (Chips) */}
      {keyFinancialDrivers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {keyFinancialDrivers.map((driver, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                driver.direction === 'NEGATIVE' 
                  ? 'bg-[#141010] border-[#EF4444]/20 text-[#EF4444]' 
                  : driver.direction === 'POSITIVE' 
                    ? 'bg-[#101412] border-[#10B981]/20 text-[#10B981]' 
                    : 'bg-[#141414] border-[#262626] text-white'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-[#A3A3A3]">
                <span className="truncate pr-1">{driver.label}</span>
                {driver.direction === 'NEGATIVE' ? (
                  <TrendingDown className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                ) : driver.direction === 'POSITIVE' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                ) : null}
              </div>
              <div className="text-base font-bold font-mono mt-1">
                {driver.amount > 0 ? '+' : ''}{formatCurrency(driver.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Narrative Breakdown & Action Steps */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-[#1C1C1C]">
          {/* Step by step bullet narrative */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] font-mono">
              Diagnostic Forensic Trace
            </h4>
            <div className="space-y-2 pl-1">
              {explanationSteps.map((step, i) => (
                <div key={i} className="text-xs text-[#CCCCCC] leading-relaxed flex items-start gap-2">
                  <span className="text-[#D4AF37] font-bold shrink-0 mt-0.5">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Recommendations */}
          {actionRecommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                <span>Recommended Recovery Actions</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-[#A3A3A3]">
                {actionRecommendations.map((action, idx) => (
                  <li key={idx} className="text-[#D4D4D4]">{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
