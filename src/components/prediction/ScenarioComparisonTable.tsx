import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Copy, 
  Trash2, 
  Check, 
  Edit2, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  ProjectionScenario, 
  ScenarioComparisonItem, 
  AssumptionType 
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ScenarioComparisonTableProps {
  scenarios: ProjectionScenario[];
  activeScenarioId: string;
  comparisonItems: ScenarioComparisonItem[];
  selectedMonth: string;
  onSelectScenario: (id: string) => void;
  onCreateScenario: (name: string, assumptionType?: AssumptionType) => void;
  onDuplicateScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onResetScenario: (id: string) => void;
}

export const ScenarioComparisonTable: React.FC<ScenarioComparisonTableProps> = ({
  scenarios,
  activeScenarioId,
  comparisonItems,
  selectedMonth,
  onSelectScenario,
  onCreateScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onResetScenario,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [newAssumptionType, setNewAssumptionType] = useState<AssumptionType>('EXPECTED');

  const handleCreate = () => {
    if (!newScenarioName.trim()) return;
    onCreateScenario(newScenarioName, newAssumptionType);
    setNewScenarioName('');
    setShowCreateModal(false);
  };

  return (
    <div id="scenario-comparison-matrix" className="bg-[#121212] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-serif-display">
              Scenario Management & Comparison Matrix
            </h3>
            <p className="text-xs text-[#888888]">
              Compare financial projections across multiple working hypotheses for {selectedMonth}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C29F30] text-black text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Scenario</span>
        </button>
      </div>

      {/* Scenario Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {(scenarios || []).map((scen) => {
          const isActive = scen.id === activeScenarioId;
          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-md'
                  : 'bg-[#0E0E0E] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
              }`}
            >
              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>{scen.name}</span>
              <span className="text-[10px] opacity-60 font-mono">({scen.assumptionType})</span>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1F1F1F]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0A0A0A] border-b border-[#1F1F1F] text-[#888888] font-mono uppercase text-[10px]">
              <th className="p-3">Scenario</th>
              <th className="p-3">Assumption</th>
              <th className="p-3">Take-Home (w/ Bonus)</th>
              <th className="p-3">Base Net</th>
              <th className="p-3">Worked Days</th>
              <th className="p-3">Projected OT</th>
              <th className="p-3">Bonus Status</th>
              <th className="p-3">Salary Gap</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181818] bg-[#0E0E0E]">
            {(comparisonItems || []).map((item) => {
              const isActive = item.scenarioId === activeScenarioId;
              return (
                <tr
                  key={item.scenarioId}
                  className={`transition hover:bg-[#141414] ${
                    isActive ? 'bg-[#D4AF37]/5 font-medium' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                      <span className={`font-semibold ${isActive ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {item.scenarioName}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[#A3A3A3]">
                    {item.assumptionType}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#D4AF37]">
                    {formatCurrency(item.projectedTotalWithBonus)}
                  </td>
                  <td className="p-3 font-mono text-white">
                    {formatCurrency(item.projectedTotal)}
                  </td>
                  <td className="p-3 font-mono text-[#A3A3A3]">
                    {item.projectedAttendance} days
                  </td>
                  <td className="p-3 font-mono text-emerald-400">
                    +{item.projectedOT}h (+{formatCurrency(item.projectedOTPay)})
                  </td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      item.bonusStatus === 'LIKELY ELIGIBLE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : item.bonusStatus === 'AT RISK'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {item.bonusStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-rose-400">
                    {item.salaryGap > 0 ? `-${formatCurrency(item.salaryGap)}` : '₹0'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onDuplicateScenario(item.scenarioId)}
                        className="p-1 rounded hover:bg-[#222222] text-[#888888] hover:text-white"
                        title="Duplicate Scenario"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onResetScenario(item.scenarioId)}
                        className="p-1 rounded hover:bg-[#222222] text-[#888888] hover:text-white"
                        title="Reset to Schedule"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      {scenarios.length > 1 && (
                        <button
                          onClick={() => onDeleteScenario(item.scenarioId)}
                          className="p-1 rounded hover:bg-[#222222] text-rose-400 hover:text-rose-300"
                          title="Delete Scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white font-serif-display">
              Create New What-If Scenario
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A3A3A3] block">Scenario Name</label>
              <input
                type="text"
                placeholder="e.g. Extra Weekend OT, Doctor Leave Week"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2B2B2B] text-white text-xs placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#A3A3A3] block">Base Assumption Archetype</label>
              <select
                value={newAssumptionType}
                onChange={(e) => setNewAssumptionType(e.target.value as AssumptionType)}
                className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2B2B2B] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="EXPECTED">Expected (Standard full shifts)</option>
                <option value="BEST_CASE">Best Case (High OT sprint on all shifts)</option>
                <option value="WORST_CASE">Worst Case (Projected leave / absences)</option>
                <option value="CUSTOM">Custom Tailored Days</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#222222]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1F1F1F] text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#C29F30] text-black text-xs font-bold transition"
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
