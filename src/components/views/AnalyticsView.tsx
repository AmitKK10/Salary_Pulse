import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AnalyticsTimeframe,
  AnalyticsSectionTab,
  DailyWorkHourPoint,
} from '../../types';
import { AnalyticsEngine } from '../../engine/analyticsEngine';

// Components
import { AnalyticsTimeframeSelector } from '../analytics/AnalyticsTimeframeSelector';
import { CoreLifetimeKPIs } from '../analytics/CoreLifetimeKPIs';
import { MonthlySalaryGrowthChart } from '../analytics/MonthlySalaryGrowthChart';
import { SalaryTrendCard } from '../analytics/SalaryTrendCard';
import { BaseSalaryHistoryCard } from '../analytics/BaseSalaryHistoryCard';
import { DailyWorkingHoursChart } from '../analytics/DailyWorkingHoursChart';
import { MonthlyNormalHourProgressCard } from '../analytics/MonthlyNormalHourProgressCard';
import { WorkingHoursAnalyticsCard } from '../analytics/WorkingHoursAnalyticsCard';
import { OvertimeAnalyticsCard } from '../analytics/OvertimeAnalyticsCard';
import { AttendanceAnalyticsCard } from '../analytics/AttendanceAnalyticsCard';
import { AttendanceBonusAnalyticsCard } from '../analytics/AttendanceBonusAnalyticsCard';
import { AbsenceImpactCard } from '../analytics/AbsenceImpactCard';
import { SalaryGapHistoryCard } from '../analytics/SalaryGapHistoryCard';
import { PayrollReconciliationStatsCard } from '../analytics/PayrollReconciliationStatsCard';
import { ProjectionAccuracyCard } from '../analytics/ProjectionAccuracyCard';
import { MonthEndPaceCard } from '../analytics/MonthEndPaceCard';
import { DailyEarningTrajectoryChart } from '../analytics/DailyEarningTrajectoryChart';
import { TimeToMoneyCard } from '../analytics/TimeToMoneyCard';
import { BreakAndPunctualityCard } from '../analytics/BreakAndPunctualityCard';
import { PersonalRecordsCard } from '../analytics/PersonalRecordsCard';
import { YearlyAndFinancialYearDashboard } from '../analytics/YearlyAndFinancialYearDashboard';
import { MonthlySummaryGeneratorModal } from '../analytics/MonthlySummaryGeneratorModal';
import { DayDetailDrawer } from '../analytics/DayDetailDrawer';

import { BarChart3, FileText, Layers, TrendingUp } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    attendanceDays,
    salaryConfig,
    schedule,
    holidays,
    salaryCalculation,
    salaryReconciliationRecords,
    bonusApprovalState,
    selectedMonth,
    currentSalaryReconciliation,
  } = useApp();

  // State for timeframe, active tab, modal and selected day
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('this_month');
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-15');
  const [activeTab, setActiveTab] = useState<AnalyticsSectionTab>('overview');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedDayPoint, setSelectedDayPoint] = useState<DailyWorkHourPoint | null>(null);

  // Timeframe calculation
  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'today':
        return 'Today (15-Aug-2026)';
      case 'this_week':
        return 'Current Week (Aug 10 - Aug 15)';
      case 'this_month':
        return 'Running Month (August 2026)';
      case 'this_year':
        return 'Calendar Year 2026';
      case 'financial_year':
        return 'FY 2026–27 (April 2026 - March 2027)';
      case 'lifetime':
        return 'Career Lifetime (Jan 2026 - Present)';
      case 'custom_range':
        return `Custom (${customStartDate} to ${customEndDate})`;
      default:
        return 'Current Period';
    }
  }, [timeframe, customStartDate, customEndDate]);

  // Derived Analytics Datasets using AnalyticsEngine
  const kpis = useMemo(() => {
    return AnalyticsEngine.calculatePeriodCoreKPIs(
      timeframe,
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      salaryReconciliationRecords,
      customStartDate,
      customEndDate
    );
  }, [timeframe, attendanceDays, salaryConfig, schedule, holidays, salaryReconciliationRecords, customStartDate, customEndDate]);

  const growthComparison = useMemo(() => {
    return AnalyticsEngine.generateMonthlySalaryGrowthData(
      salaryReconciliationRecords,
      attendanceDays,
      salaryConfig,
      schedule,
      holidays
    );
  }, [salaryReconciliationRecords, attendanceDays, salaryConfig, schedule, holidays]);

  const salaryTrend = useMemo(() => {
    return AnalyticsEngine.calculateSalaryTrend(growthComparison, false);
  }, [growthComparison]);

  const baseSalaryHistory = useMemo(() => {
    return AnalyticsEngine.getBaseSalaryHistory(salaryConfig);
  }, [salaryConfig]);

  const dailyWorkPoints = useMemo(() => {
    return AnalyticsEngine.getDailyWorkingHoursData(
      selectedMonth || '2026-08',
      attendanceDays,
      schedule,
      salaryConfig,
      holidays
    );
  }, [selectedMonth, attendanceDays, schedule, salaryConfig, holidays]);

  const monthlyProgress = useMemo(() => {
    return AnalyticsEngine.getMonthlyNormalHourProgress(
      selectedMonth || '2026-08',
      attendanceDays,
      salaryConfig,
      schedule,
      holidays
    );
  }, [selectedMonth, attendanceDays, salaryConfig, schedule, holidays]);

  const overtimeData = useMemo(() => {
    return AnalyticsEngine.getOvertimeAnalytics(
      timeframe,
      attendanceDays,
      salaryConfig,
      schedule,
      holidays,
      salaryReconciliationRecords
    );
  }, [timeframe, attendanceDays, salaryConfig, schedule, holidays, salaryReconciliationRecords]);

  const attendanceData = useMemo(() => {
    return AnalyticsEngine.getAttendanceAnalytics(
      timeframe,
      attendanceDays,
      schedule,
      holidays,
      customStartDate,
      customEndDate
    );
  }, [timeframe, attendanceDays, schedule, holidays, customStartDate, customEndDate]);

  const attendanceBonusData = useMemo(() => {
    return AnalyticsEngine.getAttendanceBonusAnalytics(
      selectedMonth || '2026-08',
      attendanceDays,
      salaryConfig,
      bonusApprovalState,
      salaryReconciliationRecords
    );
  }, [selectedMonth, attendanceDays, salaryConfig, bonusApprovalState, salaryReconciliationRecords]);

  const absenceImpact = useMemo(() => {
    return AnalyticsEngine.getAbsenceImpact(
      selectedMonth || '2026-08',
      attendanceDays,
      salaryConfig,
      schedule,
      holidays
    );
  }, [selectedMonth, attendanceDays, salaryConfig, schedule, holidays]);

  const { history: salaryGaps, stats: reconciliationStats } = useMemo(() => {
    return AnalyticsEngine.getSalaryGapHistory(salaryReconciliationRecords);
  }, [salaryReconciliationRecords]);

  const projectionAccuracy = useMemo(() => {
    return AnalyticsEngine.getProjectionAccuracy(salaryReconciliationRecords);
  }, [salaryReconciliationRecords]);

  const monthEndPace = useMemo(() => {
    return AnalyticsEngine.getMonthEndPace(
      selectedMonth || '2026-08',
      attendanceDays,
      schedule,
      holidays
    );
  }, [selectedMonth, attendanceDays, schedule, holidays]);

  const dailyTrajectory = useMemo(() => {
    return AnalyticsEngine.getDailyEarningTrajectory(
      selectedMonth || '2026-08',
      attendanceDays,
      salaryConfig,
      schedule,
      holidays
    );
  }, [selectedMonth, attendanceDays, salaryConfig, schedule, holidays]);

  const timeMoneyConversion = useMemo(() => {
    return AnalyticsEngine.getTimeMoneyConversion(
      selectedMonth || '2026-08',
      salaryConfig,
      schedule,
      holidays
    );
  }, [selectedMonth, salaryConfig, schedule, holidays]);

  const { breakStats: breakAnalytics, punctuality: punctualityAnalytics } = useMemo(() => {
    return AnalyticsEngine.getBreakAndPunctualityAnalytics(
      selectedMonth || '2026-08',
      attendanceDays,
      schedule
    );
  }, [selectedMonth, attendanceDays, schedule]);

  const { records: personalRecords, bestWorst: bestWorstRecords } = useMemo(() => {
    return AnalyticsEngine.getPersonalRecords(attendanceDays, salaryReconciliationRecords);
  }, [attendanceDays, salaryReconciliationRecords]);

  const yearlyData = useMemo(() => {
    return AnalyticsEngine.getYearlyDashboardData(2026, salaryReconciliationRecords, salaryConfig);
  }, [salaryReconciliationRecords, salaryConfig]);

  const financialYearData = useMemo(() => {
    return AnalyticsEngine.getFinancialYearDashboardData(2026, salaryReconciliationRecords, salaryConfig);
  }, [salaryReconciliationRecords, salaryConfig]);

  const monthlySummary = useMemo(() => {
    return AnalyticsEngine.generateDeterministicMonthlySummary(
      selectedMonth || '2026-08',
      salaryCalculation,
      currentSalaryReconciliation
    );
  }, [selectedMonth, salaryCalculation, currentSalaryReconciliation]);

  return (
    <div id="analytics-view-container" className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121824] border border-[#1e293b] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Advanced Analytics & Personal Salary Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, calculation-based intelligence on time allocation, normal & overtime earnings, attendance compliance, and historical payroll audits.
          </p>
        </div>

        {/* Executive Action: Generate Monthly Summary */}
        <div className="flex items-center gap-2">
          <button
            id="analytics-generate-summary-btn-top"
            onClick={() => setIsSummaryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-emerald-900/30 transition-all font-mono"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Performance Statement</span>
          </button>
        </div>
      </div>

      {/* Timeframe & Sub-Navigation Tabs */}
      <AnalyticsTimeframeSelector
        activeTimeframe={timeframe}
        onTimeframeChange={setTimeframe}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dateRangeLabel={timeframeLabel}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartChange={setCustomStartDate}
        onCustomEndChange={setCustomEndDate}
        onOpenSummaryModal={() => setIsSummaryModalOpen(true)}
      />

      {/* TAB CONTENT SECTIONS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Lifetime / Timeframe KPIs */}
          <CoreLifetimeKPIs kpis={kpis} timeframeLabel={timeframeLabel} />

          {/* Time-to-Money Deterministic Rates Matrix */}
          <TimeToMoneyCard conversionData={timeMoneyConversion} />

          {/* Running Month Pacing & Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthEndPaceCard pace={monthEndPace} />
            <MonthlyNormalHourProgressCard progress={monthlyProgress} />
          </div>

          {/* Daily Trajectory Chart */}
          <DailyEarningTrajectoryChart 
            trajectoryPoints={dailyTrajectory} 
            targetBaseSalary={salaryConfig.monthlyBaseSalary || 15000}
            monthLabel={timeframeLabel}
          />

          {/* 3-Way Reconciliation Comparison Chart */}
          <MonthlySalaryGrowthChart growthPoints={growthComparison} />

          {/* Salary Trend Velocity */}
          <SalaryTrendCard trend={salaryTrend} />
        </div>
      )}

      {/* 2. SALARY GROWTH & GAPS TAB */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          {/* Cumulative Salary Growth Trend for Current Pay Period */}
          <DailyEarningTrajectoryChart 
            trajectoryPoints={dailyTrajectory} 
            targetBaseSalary={salaryConfig.monthlyBaseSalary || 15000}
            monthLabel={timeframeLabel}
          />

          {/* 3-Way Reconciliation Growth Chart */}
          <MonthlySalaryGrowthChart growthPoints={growthComparison} />

          {/* Salary Gap Forensic Breakdown */}
          <SalaryGapHistoryCard history={salaryGaps} />

          {/* Contractual Base Salary History */}
          <BaseSalaryHistoryCard history={baseSalaryHistory} />

          {/* Projection Accuracy for Completed Months */}
          <ProjectionAccuracyCard accuracyItems={projectionAccuracy} />

          {/* Time-to-Money Exact Conversion */}
          <TimeToMoneyCard conversionData={timeMoneyConversion} />
        </div>
      )}

      {/* 3. WORKING HOURS & PACING TAB */}
      {activeTab === 'work_hours' && (
        <div className="space-y-6">
          {/* Working Hours Summary */}
          <WorkingHoursAnalyticsCard kpis={kpis} timeframeLabel={timeframeLabel} />

          {/* Daily 8h Benchmark Chart */}
          <DailyWorkingHoursChart
            dailyPoints={dailyWorkPoints}
            onSelectDay={(pt) => setSelectedDayPoint(pt)}
          />

          {/* Normal Hours Progress & Month End Pace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyNormalHourProgressCard progress={monthlyProgress} />
            <MonthEndPaceCard pace={monthEndPace} />
          </div>

          {/* Active Month Per-Day, Per-Hour, Per-Minute, Per-Second Earnings Engine */}
          <TimeToMoneyCard conversionData={timeMoneyConversion} />

          {/* Break and Punctuality */}
          <BreakAndPunctualityCard
            breakStats={breakAnalytics}
            punctuality={punctualityAnalytics}
          />
        </div>
      )}

      {/* 4. OVERTIME ANALYSIS TAB */}
      {activeTab === 'overtime' && (
        <div className="space-y-6">
          <OvertimeAnalyticsCard otData={overtimeData} />

          {/* Time to Money Matrix */}
          <TimeToMoneyCard conversionData={timeMoneyConversion} />
        </div>
      )}

      {/* 5. ATTENDANCE & ABSENCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Distribution Card */}
          <AttendanceAnalyticsCard
            attendanceData={attendanceData}
            timeframeLabel={timeframeLabel}
          />

          {/* Attendance Bonus Lifecycle */}
          <AttendanceBonusAnalyticsCard bonusData={attendanceBonusData} />

          {/* Absence Impact Analyzer */}
          <AbsenceImpactCard absenceData={absenceImpact} />
        </div>
      )}

      {/* 6. BONUS & RATES TAB */}
      {activeTab === 'bonus' && (
        <div className="space-y-6">
          <AttendanceBonusAnalyticsCard bonusData={attendanceBonusData} />
          <TimeToMoneyCard conversionData={timeMoneyConversion} />
          <BaseSalaryHistoryCard history={baseSalaryHistory} />
        </div>
      )}

      {/* 7. RECONCILIATION AUDIT TAB */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <PayrollReconciliationStatsCard stats={reconciliationStats} />
          <SalaryGapHistoryCard history={salaryGaps} />
          <MonthlySalaryGrowthChart growthPoints={growthComparison} />
        </div>
      )}

      {/* 8. ANNUAL & LIFETIME HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <YearlyAndFinancialYearDashboard
            yearlyData={yearlyData}
            financialYearData={financialYearData}
          />

          <PersonalRecordsCard
            records={personalRecords}
            bestWorst={bestWorstRecords}
          />

          <SalaryTrendCard trend={salaryTrend} />
        </div>
      )}

      {/* MODAL: Monthly Performance & Salary Statement */}
      <MonthlySummaryGeneratorModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={monthlySummary}
      />

      {/* MODAL: Day Detail Inspector */}
      <DayDetailDrawer
        dayPoint={selectedDayPoint}
        onClose={() => setSelectedDayPoint(null)}
      />
    </div>
  );
};
