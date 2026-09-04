import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Clock, 
  Hourglass, 
  LogOut, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Calculator,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  MonthlyProjectionResult, 
  RateDerivation, 
  WorkSchedule, 
  SalaryConfig 
} from '../../types';
import { PredictionEngine } from '../../engine/predictionEngine';
import { formatCurrency } from '../../utils/formatters';

interface SimulationToolsProps {
  projection: MonthlyProjectionResult;
  rateDerivation: RateDerivation;
  schedule: WorkSchedule;
  salaryConfig: SalaryConfig;
  todayLiveActiveSeconds: number;
  todayLiveEarned?: number;
  isCurrentlyWorking?: boolean;
}

export const SimulationTools: React.FC<SimulationToolsProps> = ({
  projection,
  rateDerivation,
  schedule,
  salaryConfig,
  todayLiveActiveSeconds,
  todayLiveEarned = 0,
  isCurrentlyWorking = false,
}) => {
  const [activeTool, setActiveTool] = useState<'target' | 'work_until' | 'earn_amount' | 'leave_now'>('target');

  // Tool 1 State: Target Salary
  const [targetAmount, setTargetAmount] = useState<number>(() => {
    return Math.round((projection.projectedMonthEndWithBonus || 50000) + 2000);
  });

  const targetResult = useMemo(() => {
    return PredictionEngine.calculateTargetEarningOT(
      targetAmount,
      projection,
      salaryConfig,
      rateDerivation
    );
  }, [targetAmount, projection, salaryConfig, rateDerivation]);

  // Tool 2 State: Work Until
  const [workUntilTime, setWorkUntilTime] = useState<string>('20:00');
  const workUntilResult = useMemo(() => {
    return PredictionEngine.calculateWorkUntil(
      '2026-08-15T18:02:00Z',
      workUntilTime,
      todayLiveActiveSeconds,
      todayLiveEarned,
      isCurrentlyWorking,
      salaryConfig,
      rateDerivation,
      schedule
    );
  }, [workUntilTime, todayLiveActiveSeconds, todayLiveEarned, isCurrentlyWorking, salaryConfig, rateDerivation, schedule]);

  // Tool 3 State: How Long to Earn ₹X
  const [earnGoalAmount, setEarnGoalAmount] = useState<number>(500);
  const earnGoalResult = useMemo(() => {
    return PredictionEngine.calculateTimeToEarnAmount(
      earnGoalAmount,
      todayLiveEarned,
      todayLiveActiveSeconds,
      '2026-08-15T18:02:00Z',
      salaryConfig,
      rateDerivation,
      schedule
    );
  }, [earnGoalAmount, todayLiveEarned, todayLiveActiveSeconds, salaryConfig, rateDerivation, schedule]);

  // Tool 4 State: If I Leave Now
  const leaveNowResult = useMemo(() => {
    return PredictionEngine.calculateIfILeaveNow(
      '2026-08-15',
      todayLiveActiveSeconds,
      todayLiveEarned,
      projection,
      salaryConfig,
      schedule,
      rateDerivation
    );
  }, [todayLiveActiveSeconds, todayLiveEarned, projection, salaryConfig, schedule, rateDerivation]);

  return (
    <div id="simulation-tools-suite" className="bg-[#121212] border border-[#222222] rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Tool Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F1F] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif-display">
            <Calculator className="w-5 h-5 text-[#D4AF37]" />
            <span>Interactive Prediction & What-If Simulators</span>
          </h3>
          <p className="text-xs text-[#888888]">
            Instant deterministic models for target earnings, extended sessions, and early departure
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D0D0D] border border-[#222222] self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTool('target')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTool === 'target'
                ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Salary</span>
          </button>

          <button
            onClick={() => setActiveTool('work_until')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTool === 'work_until'
                ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>"Work Until"</span>
          </button>

          <button
            onClick={() => setActiveTool('earn_amount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTool === 'earn_amount'
                ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Earn ₹X Time</span>
          </button>

          <button
            onClick={() => setActiveTool('leave_now')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTool === 'leave_now'
                ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>"Leave Now"</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: TARGET SALARY CALCULATOR */}
      {activeTool === 'target' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider block">
                Desired Target Gross Salary (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10000"
                  max="150000"
                  step="1000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2B2B2B] text-white text-base font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Quick target presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#666666]">Presets:</span>
              {[50000, 55000, 60000, 70000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTargetAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                    targetAmount === amt
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#181818] border-[#2B2B2B] text-[#888888] hover:text-white'
                  }`}
                >
                  ₹{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] text-xs text-[#888888] space-y-1">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-mono text-white">{formatCurrency(targetResult.baseSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span>Potential Attendance Bonus:</span>
                <span className="font-mono text-[#D4AF37]">+{formatCurrency(targetResult.potentialBonus)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Rate:</span>
                <span className="font-mono text-emerald-400">₹{rateDerivation.overtimeHourlyRate.toFixed(2)}/hour</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0E0E0E] border border-[#202020] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#888888]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Required Overtime Effort</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  targetResult.isAchievable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {targetResult.isAchievable ? 'Feasible Plan' : 'High Overtime Required'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Total OT Hours</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {targetResult.requiredOTHours} hrs
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">OT Duration</span>
                  <span className="text-2xl font-bold font-mono text-[#D4AF37]">
                    {targetResult.formattedRequiredOT}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#888888] leading-relaxed">
                {targetResult.explanation}
              </p>
            </div>

            <div className="text-[11px] text-[#666666] pt-2 border-t border-[#1C1C1C]">
              Remaining salary deficit to bridge: {formatCurrency(targetResult.remainingDeficit)}.
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: "WORK UNTIL" SIMULATOR */}
      {activeTool === 'work_until' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider block">
                Simulated Punch-Out Time Today
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={workUntilTime}
                  onChange={(e) => setWorkUntilTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2B2B2B] text-white text-base font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Quick time presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#666666]">Presets:</span>
              {['18:30', '19:00', '20:00', '21:00'].map((tm) => (
                <button
                  key={tm}
                  onClick={() => setWorkUntilTime(tm)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                    workUntilTime === tm
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#181818] border-[#2B2B2B] text-[#888888] hover:text-white'
                  }`}
                >
                  {tm}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] text-xs text-[#888888] space-y-1">
              <div className="flex justify-between">
                <span>Standard Shift End:</span>
                <span className="font-mono text-white">{schedule.officeEndTime || '18:00'} (8.0h active)</span>
              </div>
              <div className="flex justify-between">
                <span>Current Live Earned:</span>
                <span className="font-mono text-amber-300">{formatCurrency(todayLiveEarned)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0E0E0E] border border-[#202020] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#888888]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Today's Shift Simulation</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono">
                  {workUntilResult.isOvertime ? 'Includes OT Premium' : 'Regular Shift Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Today's Total Pay</span>
                  <span className="text-2xl font-bold font-mono text-[#D4AF37]">
                    {formatCurrency(workUntilResult.projectedDailyEarned)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Extra vs Live Now</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    +{formatCurrency(workUntilResult.additionalEarned)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-[#A3A3A3] pt-1">
                <span>Additional Time to Work:</span>
                <span className="font-mono font-bold text-white">+{workUntilResult.formattedAdditionalWork} hrs</span>
              </div>
            </div>

            <div className="text-[11px] text-[#666666] pt-2 border-t border-[#1C1C1C]">
              Staying until {workUntilTime} adds {formatCurrency(workUntilResult.monthlyProjectedIncrease)} directly to your monthly total.
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: HOW LONG TO EARN ₹X */}
      {activeTool === 'earn_amount' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider block">
                Target Amount to Earn Today (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={earnGoalAmount}
                  onChange={(e) => setEarnGoalAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2B2B2B] text-white text-base font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Quick amount presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#666666]">Presets:</span>
              {[500, 1000, 1500, 2000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setEarnGoalAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                    earnGoalAmount === amt
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#181818] border-[#2B2B2B] text-[#888888] hover:text-white'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] text-xs text-[#888888] space-y-1">
              <div className="flex justify-between">
                <span>Base Per-Minute Rate:</span>
                <span className="font-mono text-white">₹{(rateDerivation.perSecondRate * 60).toFixed(2)}/min</span>
              </div>
              <div className="flex justify-between">
                <span>Current Live Work So Far:</span>
                <span className="font-mono text-amber-300">{(todayLiveActiveSeconds / 3600).toFixed(2)} hrs</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0E0E0E] border border-[#202020] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#888888]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Time Required to Earn</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold font-mono">
                  {earnGoalResult.formattedRequiredTime} hrs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Estimated Finish Time</span>
                  <span className="text-2xl font-bold font-mono text-[#D4AF37]">
                    {earnGoalResult.estimatedClockCompletion}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Remaining to Target</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {formatCurrency(earnGoalResult.remainingAmount)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#888888] leading-relaxed">
                {earnGoalResult.isOvertimeTransition 
                  ? 'Completing this target requires entering the overtime rate window.'
                  : 'Target is achievable within standard daytime shift hours.'}
              </p>
            </div>

            <div className="text-[11px] text-[#666666] pt-2 border-t border-[#1C1C1C]">
              Continuous work session without additional unpaid break time.
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: "IF I LEAVE NOW" SIMULATOR */}
      {activeTool === 'leave_now' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Early Departure Impact Analysis</span>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">
                Evaluating the exact financial consequence if you punch out immediately and record a partial workday.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#1F1F1F]">
                <div>
                  <span className="text-[#666666] text-[10px] block">Active Work Completed</span>
                  <span className="font-mono text-white font-bold">{leaveNowResult.todayActualWorkFormatted} hrs</span>
                </div>
                <div>
                  <span className="text-[#666666] text-[10px] block">Shortfall vs Standard Day</span>
                  <span className="font-mono text-rose-400 font-bold">-{leaveNowResult.todayDeficitFormatted} hrs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0E0E0E] border border-[#202020] rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-[#888888]">
                <span className="uppercase tracking-wider font-semibold text-[10px]">Financial Impact</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold font-mono">
                  -{formatCurrency(leaveNowResult.todayDeficitImpact)} deduction
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Today's Final Pay</span>
                  <span className="text-2xl font-bold font-mono text-[#D4AF37]">
                    {formatCurrency(leaveNowResult.todayEarned)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222222]">
                  <span className="text-[10px] text-[#737373] uppercase block">Projected Month Total</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {formatCurrency(leaveNowResult.monthlyProjectedTotalIfLeaveNow)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#888888] leading-relaxed">
                Leaving now results in a {leaveNowResult.todayDeficitFormatted}h deficit, reducing your month-end take-home by {formatCurrency(leaveNowResult.monthlyImpact)}.
              </p>
            </div>

            <div className="text-[11px] text-[#666666] pt-2 border-t border-[#1C1C1C]">
              No penalty beyond unworked hours; attendance bonus may be at risk if minimum daily threshold is unmet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
