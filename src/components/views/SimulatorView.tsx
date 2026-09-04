import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Calendar,
  Layers,
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RunningMonthBanner } from '../prediction/RunningMonthBanner';
import { FutureScenarioCalendar } from '../prediction/FutureScenarioCalendar';
import { SimulationTools } from '../prediction/SimulationTools';
import { OvertimeForecastCard } from '../prediction/OvertimeForecastCard';
import { ScenarioComparisonTable } from '../prediction/ScenarioComparisonTable';
import { PredictionAnalyticsCharts } from '../prediction/PredictionAnalyticsCharts';
import { CalculationStepsModal } from '../prediction/CalculationStepsModal';
import { formatCurrency } from '../../utils/formatters';

export const SimulatorView: React.FC = () => {
  const { 
    salaryConfig, 
    schedule, 
    holidays, 
    deductions,
    selectedMonth,
    setSelectedMonth,
    monthlyDaysDetails,
    rateDerivation,
    scenarios,
    activeScenarioId,
    activeScenario,
    selectedMonthProjection,
    scenarioComparison,
    createScenario,
    updateScenarioFutureDay,
    deleteScenario,
    duplicateScenario,
    resetScenarioToDefault,
    setActiveScenarioId,
    todayLiveActiveSeconds,
  } = useApp();

  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(Date.UTC(year, month - 2, 1));
    const newMonthStr = prevDate.toISOString().slice(0, 7);
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month, 1));
    const newMonthStr = nextDate.toISOString().slice(0, 7);
    setSelectedMonth(newMonthStr);
  };

  return (
    <div id="simulator-view" className="space-y-6 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header & Month Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif-display">
              <span>Salary & Overtime Prediction Suite</span>
            </h2>
            <p className="text-xs text-[#888888]">
              Running-month live forecast, future scenario modeling, and financial what-if simulators
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-[#0D0D0D] border border-[#262626] rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-mono font-bold text-white">
              {selectedMonth}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => resetScenarioToDefault(activeScenarioId)}
            className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition"
            title="Reset active scenario to standard schedule"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Active</span>
          </button>
        </div>
      </div>

      {/* 1. Main Running-Month Salary Projection Banner */}
      <RunningMonthBanner
        projection={selectedMonthProjection}
        selectedMonth={selectedMonth}
        onOpenHowCalculated={() => setShowHowCalculated(true)}
      />

      {/* 2. Interactive What-If Simulation Tools Suite */}
      <SimulationTools
        projection={selectedMonthProjection}
        rateDerivation={rateDerivation}
        schedule={schedule}
        salaryConfig={salaryConfig}
        todayLiveActiveSeconds={todayLiveActiveSeconds}
      />

      {/* 3. Future Scenario Calendar (Date-by-date simulator) */}
      <FutureScenarioCalendar
        scenario={activeScenario}
        schedule={schedule}
        holidays={holidays}
        onUpdateFutureDay={(dateStr, updates) => updateScenarioFutureDay(dateStr, updates)}
        onResetScenario={() => resetScenarioToDefault(activeScenarioId)}
      />

      {/* 4. Overtime Forecast vs Monthly Threshold */}
      <OvertimeForecastCard
        projection={selectedMonthProjection}
        rateDerivation={rateDerivation}
        salaryConfig={salaryConfig}
        selectedMonth={selectedMonth}
      />

      {/* 5. Scenario Manager & Side-by-Side Comparison Matrix */}
      <ScenarioComparisonTable
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        comparisonItems={scenarioComparison}
        selectedMonth={selectedMonth}
        onSelectScenario={(id) => setActiveScenarioId(id)}
        onCreateScenario={(name, assumption) => createScenario(name, assumption)}
        onDuplicateScenario={(id) => duplicateScenario(id)}
        onDeleteScenario={(id) => deleteScenario(id)}
        onResetScenario={(id) => resetScenarioToDefault(id)}
      />

      {/* 6. Running-Month Recharts Analytics */}
      <PredictionAnalyticsCharts
        projection={selectedMonthProjection}
        monthlyDaysDetails={monthlyDaysDetails}
        selectedMonth={selectedMonth}
      />

      {/* Calculation Audit Modal */}
      {showHowCalculated && (
        <CalculationStepsModal
          projection={selectedMonthProjection}
          rateDerivation={rateDerivation}
          onClose={() => setShowHowCalculated(false)}
        />
      )}
    </div>
  );
};
