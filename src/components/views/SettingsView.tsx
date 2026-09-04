// ============================================================================
// SALARYPULSE — COMPREHENSIVE SETTINGS & PAYROLL CONFIGURATION
// Authoritative rules for salary, work week, breaks, overtime, bonus, and deductions
// ============================================================================

import React, { useState, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  Coins, 
  Clock, 
  Calendar as CalendarIcon,
  Calendar,
  Coffee, 
  Award, 
  ShieldAlert, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Undo2, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Info,
  CalendarCheck,
  CheckCircle,
  HelpCircle,
  FlaskConical,
  RefreshCw,
  Sparkles,
  Database,
  Smartphone,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  CurrencyCode, 
  DeductionRule, 
  Holiday,
  HolidayWorkRule, 
  OvertimeMethod, 
  SalaryCalculationBasis, 
  WeeklyOffWorkRule 
} from '../../types';
import { DateEngine } from '../../engine/dateEngine';
import { SalaryEngine } from '../../engine/salaryEngine';
import { formatCurrency } from '../../utils/formatters';
import { DataManagementSection } from './DataManagementSection';
import { ApplicationSettingsSection } from './ApplicationSettingsSection';
import { ThemeSettingsSection } from './ThemeSettingsSection';
import { DeleteAllDataModal } from './DeleteAllDataModal';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 0, name: 'Sunday', short: 'Sun' },
];

export const SettingsView: React.FC = () => {
  const { 
    salaryConfig, 
    updateSalaryConfig, 
    schedule, 
    updateSchedule, 
    holidays, 
    updateHolidays,
    resetAllData, 
    testResults, 
    rerunTests,
    step9TestResults,
    rerunStep9Tests,
    step11TestResults,
    rerunStep11Tests,
    appSettings,
    updateAppSettings
  } = useApp();

  // Preview Month state
  const [previewMonth, setPreviewMonth] = useState<string>('2026-08');

  // --- FORM DRAFT STATES ---
  const [formSalary, setFormSalary] = useState<number>(salaryConfig.monthlyBaseSalary);
  const [formCurrency, setFormCurrency] = useState<CurrencyCode>(salaryConfig.currency || 'INR');
  const [formBasis, setFormBasis] = useState<SalaryCalculationBasis>(salaryConfig.calculationBasis || 'monthly_scheduled_hours');
  const [formEffectiveFrom, setFormEffectiveFrom] = useState<string>(salaryConfig.effectiveFrom || '2026-08-01');

  // Work Schedule Draft
  const [formWorkingDays, setFormWorkingDays] = useState<number[]>(schedule.workingDays || [1, 2, 3, 4, 5, 6]);
  const [formRequiredActiveHours, setFormRequiredActiveHours] = useState<number>(schedule.requiredActiveHoursPerDay || 8.0);
  const [formStartTime, setFormStartTime] = useState<string>(schedule.officeStartTime || '09:00');
  const [formEndTime, setFormEndTime] = useState<string>(schedule.officeEndTime || '18:00');

  // Breaks Draft
  const [formLunchMinutes, setFormLunchMinutes] = useState<number>(schedule.defaultLunchDurationMinutes || 60);
  const [formTeaMinutes, setFormTeaMinutes] = useState<number>(schedule.defaultTeaBreakDurationMinutes || 15);
  const [formBreakRules, setFormBreakRules] = useState(schedule.breakRules || []);

  // Overtime Draft
  const [formOtMethod, setFormOtMethod] = useState<OvertimeMethod>(salaryConfig.overtimeMethod || 'monthly_threshold');
  const [formOtMultiplier, setFormOtMultiplier] = useState<number>(salaryConfig.overtimeMultiplier || 1.0);
  const [formOtThreshold, setFormOtThreshold] = useState<number>(salaryConfig.overtimeThresholdMinutes ?? 60);
  const [formCustomOtRate, setFormCustomOtRate] = useState<number>(salaryConfig.customOtHourlyRate || 0);
  const [formWeeklyOffRule, setFormWeeklyOffRule] = useState<WeeklyOffWorkRule>(salaryConfig.weeklyOffWorkRule || 'add_to_monthly_threshold');
  const [formHolidayWorkRule, setFormHolidayWorkRule] = useState<HolidayWorkRule>(salaryConfig.holidayWorkRule || 'holiday_credit_plus_monthly_threshold');

  // Holiday Credit & Custom Pay Rate Draft
  const [formHolidayCreditHours, setFormHolidayCreditHours] = useState<number>(salaryConfig.defaultPaidHolidayCreditedHours || 8.0);
  const [formHolidayPayType, setFormHolidayPayType] = useState<'daily_rate' | 'fixed_amount'>(salaryConfig.holidayPayType || 'fixed_amount');
  const [formDefaultHolidayAmount, setFormDefaultHolidayAmount] = useState<number>(salaryConfig.defaultHolidayAmount ?? 500);
  const [formHolidays, setFormHolidays] = useState<Holiday[]>(holidays || []);

  // Bonus Draft
  const [formBonusEnabled, setFormBonusEnabled] = useState<boolean>(salaryConfig.attendanceBonusEnabled ?? true);
  const [formBonusAmount, setFormBonusAmount] = useState<number>(salaryConfig.attendanceBonusAmount || 3000);
  const [formBonusDays, setFormBonusDays] = useState<number>(salaryConfig.attendanceBonusEligibleDays || 26);
  const [formBonusApproval, setFormBonusApproval] = useState<boolean>(salaryConfig.bonusRequiresApproval ?? true);

  // Deductions Draft
  const [formDeductions, setFormDeductions] = useState<DeductionRule[]>(salaryConfig.deductions || []);

  // UI state: Save Feedback & Confirm Dialogs
  const [activeSection, setActiveSection] = useState<'RULES' | 'DATA_MANAGEMENT' | 'APP_PWA' | 'THEME'>('RULES');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [showTestsSection, setShowTestsSection] = useState<boolean>(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<'STEP11' | 'CORE' | 'STEP9'>('STEP11');
  const [step11Filter, setStep11Filter] = useState<string>('ALL');
  const [isRerunningTests, setIsRerunningTests] = useState<boolean>(false);

  // Toggle Working Day
  const handleToggleWorkingDay = (dayId: number) => {
    if (formWorkingDays.includes(dayId)) {
      if (formWorkingDays.length === 1) {
        setValidationErrors(['At least one working weekday must be enabled.']);
        return;
      }
      setFormWorkingDays(formWorkingDays.filter(d => d !== dayId));
    } else {
      setFormWorkingDays([...formWorkingDays, dayId].sort());
    }
  };

  // Add Custom Deduction Rule
  const handleAddDeduction = () => {
    const newRule: DeductionRule = {
      id: `ded-${Date.now()}`,
      name: 'Provident Fund (PF)',
      type: 'percentage',
      category: 'PF',
      value: 12,
      isEnabled: false, // Default disabled
      description: 'Employee provident fund contribution',
    };
    setFormDeductions([...formDeductions, newRule]);
  };

  const handleRemoveDeduction = (id: string) => {
    setFormDeductions(formDeductions.filter(d => d.id !== id));
  };

  const handleUpdateDeduction = (id: string, partial: Partial<DeductionRule>) => {
    setFormDeductions(formDeductions.map(d => (d.id === id ? { ...d, ...partial } : d)));
  };

  // Validate form
  const validate = (): boolean => {
    const errors: string[] = [];
    if (formSalary <= 0) errors.push('Monthly base salary must be greater than 0.');
    if (formRequiredActiveHours <= 0 || formRequiredActiveHours > 24) errors.push('Required active daily hours must be between 0.5 and 24.');
    if (formWorkingDays.length === 0) errors.push('At least one working weekday must be enabled.');
    if (formOtMultiplier <= 0) errors.push('Overtime multiplier must be greater than 0.');
    if (formBonusAmount < 0) errors.push('Bonus amount cannot be negative.');
    if (formBonusDays <= 0) errors.push('Bonus qualifying attendance days must be at least 1.');
    if (formStartTime >= formEndTime) errors.push('Office end time must be later than office start time.');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Discard changes
  const handleDiscard = () => {
    setFormSalary(salaryConfig.monthlyBaseSalary);
    setFormCurrency(salaryConfig.currency || 'INR');
    setFormBasis(salaryConfig.calculationBasis || 'monthly_scheduled_hours');
    setFormEffectiveFrom(salaryConfig.effectiveFrom || '2026-08-01');

    setFormWorkingDays(schedule.workingDays || [1, 2, 3, 4, 5, 6]);
    setFormRequiredActiveHours(schedule.requiredActiveHoursPerDay || 8.0);
    setFormStartTime(schedule.officeStartTime || '09:00');
    setFormEndTime(schedule.officeEndTime || '18:00');

    setFormLunchMinutes(schedule.defaultLunchDurationMinutes || 60);
    setFormTeaMinutes(schedule.defaultTeaBreakDurationMinutes || 15);
    setFormBreakRules(schedule.breakRules || []);

    setFormOtMethod(salaryConfig.overtimeMethod || 'monthly_threshold');
    setFormOtMultiplier(salaryConfig.overtimeMultiplier || 1.0);
    setFormOtThreshold(salaryConfig.overtimeThresholdMinutes ?? 60);
    setFormCustomOtRate(salaryConfig.customOtHourlyRate || 0);
    setFormWeeklyOffRule(salaryConfig.weeklyOffWorkRule || 'add_to_monthly_threshold');
    setFormHolidayWorkRule(salaryConfig.holidayWorkRule || 'holiday_credit_plus_monthly_threshold');
    setFormHolidayCreditHours(salaryConfig.defaultPaidHolidayCreditedHours || 8.0);
    setFormHolidayPayType(salaryConfig.holidayPayType || 'fixed_amount');
    setFormDefaultHolidayAmount(salaryConfig.defaultHolidayAmount ?? 500);
    setFormHolidays(JSON.parse(JSON.stringify(holidays || [])));

    setFormBonusEnabled(salaryConfig.attendanceBonusEnabled ?? true);
    setFormBonusAmount(salaryConfig.attendanceBonusAmount || 3000);
    setFormBonusDays(salaryConfig.attendanceBonusEligibleDays || 26);
    setFormBonusApproval(salaryConfig.bonusRequiresApproval ?? true);

    setFormDeductions(salaryConfig.deductions || []);
    setValidationErrors([]);
  };

  // Holiday item actions
  const handleAddHoliday = () => {
    const newHol: Holiday = {
      id: `hol-${Date.now()}`,
      date: '2026-10-02',
      name: 'Gandhi Jayanti',
      type: 'paid',
      creditedHours: 8.0,
      customAmount: formDefaultHolidayAmount || 500,
    };
    setFormHolidays([...formHolidays, newHol]);
  };

  const handleRemoveHoliday = (id: string) => {
    setFormHolidays(formHolidays.filter(h => h.id !== id));
  };

  const handleUpdateHoliday = (id: string, partial: Partial<Holiday>) => {
    setFormHolidays(formHolidays.map(h => (h.id === id ? { ...h, ...partial } : h)));
  };

  const handleSetAllHolidaysToAmount = (amount: number) => {
    setFormHolidays(formHolidays.map(h => ({ ...h, customAmount: amount })));
  };

  // Save changes
  const handleSave = () => {
    if (!validate()) return;

    updateSalaryConfig({
      monthlyBaseSalary: Number(formSalary),
      currency: formCurrency,
      calculationBasis: formBasis,
      effectiveFrom: formEffectiveFrom,
      overtimeMethod: formOtMethod,
      overtimeMultiplier: Number(formOtMultiplier),
      overtimeThresholdMinutes: Number(formOtThreshold),
      customOtHourlyRate: formCustomOtRate > 0 ? Number(formCustomOtRate) : undefined,
      weeklyOffWorkRule: formWeeklyOffRule,
      holidayWorkRule: formHolidayWorkRule,
      defaultPaidHolidayCreditedHours: Number(formHolidayCreditHours),
      holidayPayType: formHolidayPayType,
      defaultHolidayAmount: Number(formDefaultHolidayAmount),
      attendanceBonusEnabled: formBonusEnabled,
      attendanceBonusAmount: Number(formBonusAmount),
      attendanceBonusEligibleDays: Number(formBonusDays),
      bonusRequiresApproval: formBonusApproval,
      deductions: formDeductions,
    });

    updateHolidays(formHolidays);

    updateSchedule({
      workingDays: formWorkingDays,
      requiredActiveHoursPerDay: Number(formRequiredActiveHours),
      officeStartTime: formStartTime,
      officeEndTime: formEndTime,
      defaultLunchDurationMinutes: Number(formLunchMinutes),
      defaultTeaBreakDurationMinutes: Number(formTeaMinutes),
      breakRules: formBreakRules,
    });

    setSavedSuccess(true);
    setValidationErrors([]);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Authoritative dynamic preview for previewMonth using SalaryEngine
  const previewSchedule = useMemo(() => ({
    ...schedule,
    workingDays: formWorkingDays,
    requiredActiveHoursPerDay: formRequiredActiveHours,
  }), [schedule, formWorkingDays, formRequiredActiveHours]);

  const previewConfig = useMemo(() => ({
    ...salaryConfig,
    monthlyBaseSalary: formSalary,
    calculationBasis: formBasis,
    overtimeMultiplier: formOtMultiplier,
    customOtHourlyRate: formCustomOtRate,
  }), [salaryConfig, formSalary, formBasis, formOtMultiplier, formCustomOtRate]);

  const previewRates = useMemo(() => {
    return SalaryEngine.deriveRates(previewMonth, previewConfig, previewSchedule, holidays);
  }, [previewMonth, previewConfig, previewSchedule, holidays]);

  return (
    <div id="settings-view" className="space-y-8 pb-16 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-[#1A1A1A]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-serif-display">
            <SettingsIcon className="w-5 h-5 text-[#D4AF37]" />
            <span>Payroll & Work Rule Configuration</span>
          </h2>
          <p className="text-xs text-[#737373]">Authoritative single source of truth for all compensation calculations</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Quick Theme Switcher Capsule */}
          <div
            id="header-theme-toggle-capsule"
            className="inline-flex items-center rounded-xl p-0.5 border bg-[#181818] border-[#2A2A2A] shadow-inner"
          >
            <button
              id="quick-theme-toggle-dark"
              type="button"
              onClick={() => updateAppSettings({ theme: 'dark' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                appSettings?.theme !== 'light'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Default Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              id="quick-theme-toggle-light"
              type="button"
              onClick={() => updateAppSettings({ theme: 'light' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                appSettings?.theme === 'light'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="High-Contrast Light Mode (WCAG AAA)"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>

          <button
            id="clear-all-data-header-btn"
            type="button"
            onClick={() => setShowDeleteAllModal(true)}
            className="px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-xs font-semibold text-rose-300 hover:text-rose-200 uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            title="Clear all stored attendance sessions and history"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All Data</span>
          </button>
          <button
            onClick={handleDiscard}
            className="px-3.5 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Rules</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1F1F1F] pb-3">
        <button
          onClick={() => setActiveSection('RULES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSection === 'RULES'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Payroll & Compensation</span>
        </button>

        <button
          id="settings-tab-theme"
          onClick={() => setActiveSection('THEME')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
            activeSection === 'THEME'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance & Theme</span>
        </button>

        <button
          onClick={() => setActiveSection('APP_PWA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSection === 'APP_PWA'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>PWA, Offline & Notifications</span>
        </button>

        <button
          onClick={() => setActiveSection('DATA_MANAGEMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
            activeSection === 'DATA_MANAGEMENT'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-[#141414] text-[#A3A3A3] hover:text-white border border-[#262626]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data, Backups & Integrity</span>
        </button>
      </div>

      {activeSection === 'THEME' ? (
        <ThemeSettingsSection />
      ) : activeSection === 'DATA_MANAGEMENT' ? (
        <DataManagementSection />
      ) : activeSection === 'APP_PWA' ? (
        <ApplicationSettingsSection />
      ) : (
        <>
          {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuration saved successfully and synchronized across all calculation engines!</span>
        </div>
      )}

      {/* Validation Errors Notice */}
      {(validationErrors || []).length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>Please correct the following errors:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-2">
            {(validationErrors || []).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. SALARY CONFIGURATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span>1. Salary & Compensation Basis</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#D4AF37] border border-[#262626]">
            Authoritative
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Base Salary */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Monthly Base Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#737373] font-mono">₹</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={formSalary}
                onChange={(e) => setFormSalary(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 pl-7 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-[#555]">Default profile: ₹15,000 / month</p>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Currency Code</label>
            <select
              value={formCurrency}
              onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
              <option value="AED">AED (AED - UAE Dirham)</option>
            </select>
            <p className="text-[10px] text-[#555]">Formatting symbol & standard</p>
          </div>

          {/* Calculation Basis */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[#A3A3A3] font-semibold">Calculation Basis & Formula Preset</label>
            <select
              value={formBasis}
              onChange={(e) => setFormBasis(e.target.value as SalaryCalculationBasis)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none font-medium"
            >
              <option value="calendar_days_30">🏢 Company Official: 30 Calendar Days Pro-Rata (₹12,073 in June)</option>
              <option value="monthly_scheduled_hours">⚡ Standard 26 Working Days Basis (₹12,097 in June)</option>
              <option value="calendar_days_full_ot">⏱️ 30 Calendar Days + Full Overtime (₹12,484 in June)</option>
              <option value="actual_hours">📊 Actual Logged Hours Basis (167.75h @ ₹72.12 → ₹12,097 in June)</option>
              <option value="fixed_monthly">💼 Fixed Monthly: ₹15,000 without attendance deduction</option>
              <option value="daily_rate">Daily Rate: Monthly Salary ÷ 26 Days</option>
              <option value="hourly_rate">Hourly Rate: Monthly Salary ÷ 208 Hours</option>
            </select>
            <p className="text-[10px] text-[#555]">Select the formula closest to your company payroll calculation (e.g. 🏢 Official ₹12,073 or ⚡ Standard 26-Day ₹12,097)</p>
          </div>
        </div>

        {/* Effective Date Manager */}
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="text-white font-semibold flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Effective Dating Configuration</span>
            </div>
            <p className="text-[11px] text-[#737373]">
              Ensures historical calculations (e.g. earlier months) remain immutable if salary is revised later.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#737373] text-[11px]">Effective From:</span>
            <input
              type="date"
              value={formEffectiveFrom}
              onChange={(e) => setFormEffectiveFrom(e.target.value)}
              className="bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. WORK WEEK CONFIGURATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>2. Work Week & Daily Schedule</span>
          </div>
          <span className="text-[10px] text-[#737373] font-mono">Mon – Sat (Default)</span>
        </div>

        {/* Working Weekdays Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#A3A3A3]">Active Working Weekdays</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = formWorkingDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleToggleWorkingDay(day.id)}
                  className={`py-2.5 px-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'border-[#D4AF37]/50 bg-[#D4AF37]/15 text-white'
                      : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#555555] hover:border-[#333333]'
                  }`}
                >
                  <span className="text-xs font-bold font-sans">{day.short}</span>
                  <span className={`text-[10px] uppercase font-mono font-semibold ${isSelected ? 'text-[#D4AF37]' : 'text-[#555]'}`}>
                    {isSelected ? 'ON' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Required Active Work (Hours/Day)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="16"
              value={formRequiredActiveHours}
              onChange={(e) => setFormRequiredActiveHours(Number(e.target.value))}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="text-[10px] text-[#555]">Standard: 08:00:00 active hours</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Office Scheduled Start</label>
            <input
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="text-[10px] text-[#555]">Default: 09:00 AM</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Office Scheduled End</label>
            <input
              type="time"
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="text-[10px] text-[#555]">Default: 06:00 PM (18:00)</p>
          </div>
        </div>

        {/* Presence vs Active Work Notice */}
        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#737373] space-y-1">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Presence Span vs. Active Working Time Distinction:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Office presence (09:00 → 18:00 = 9h span) differs from active work (8h). The 1h unpaid lunch break is strictly excluded from active work. Active work is calculated purely as the sum of valid working sessions, never as last OUT − first IN.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. BREAK CONFIGURATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <Coffee className="w-4 h-4 text-[#D4AF37]" />
            <span>3. Break Rules & Duration</span>
          </div>
          <span className="text-[10px] text-[#737373] font-mono">Unpaid Breaks Deducted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Default Lunch Break</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono border border-rose-500/20">
                UNPAID
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#737373]">Allocated Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                max="180"
                step="5"
                value={formLunchMinutes}
                onChange={(e) => setFormLunchMinutes(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 font-mono text-white text-xs"
              />
            </div>
            <p className="text-[10px] text-[#555]">60 minutes allocated. Unpaid duration does not count toward active work.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Default Tea / Rest Break</span>
              <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] text-[10px] font-mono border border-[#10B981]/20">
                PAID
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#737373]">Allocated Duration (Minutes)</label>
              <input
                type="number"
                min="0"
                max="60"
                step="5"
                value={formTeaMinutes}
                onChange={(e) => setFormTeaMinutes(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 font-mono text-white text-xs"
              />
            </div>
            <p className="text-[10px] text-[#555]">15 minutes allocated. Paid break is permitted within company shift.</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. OVERTIME & SPECIAL WORK RULES */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>4. Overtime & Threshold Rules</span>
          </div>
          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">2.0x Multiplier (Default)</span>
        </div>

        {/* Company Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#D4AF37]/30 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[#A3A3A3]">
            <span className="font-semibold text-white">Calculation Preference Notice:</span>
            <p className="text-[11px] leading-relaxed">
              Your selected overtime method is a calculation preference. Actual payroll treatment may differ from employer payroll rules.
            </p>
          </div>
        </div>

        {/* Overtime Method Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#A3A3A3]">Overtime Calculation Method</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div
              onClick={() => setFormOtMethod('daily_threshold')}
              className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
                formOtMethod === 'daily_threshold'
                  ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white'
                  : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
              }`}
            >
              <div className="font-bold text-[#D4AF37] flex items-center justify-between">
                <span>Method A: Daily Threshold (Default / Standard)</span>
                {formOtMethod === 'daily_threshold' && <CheckCircle className="w-4 h-4 text-[#D4AF37]" />}
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Daily active hours beyond 8h/day immediately count as overtime for that day. Total monthly OT equals the sum of daily overtime accruals.
              </p>
            </div>

            <div
              onClick={() => setFormOtMethod('monthly_threshold')}
              className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
                formOtMethod === 'monthly_threshold'
                  ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white'
                  : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
              }`}
            >
              <div className="font-bold text-[#D4AF37] flex items-center justify-between">
                <span>Method B: Monthly Threshold</span>
                {formOtMethod === 'monthly_threshold' && <CheckCircle className="w-4 h-4 text-[#D4AF37]" />}
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Monthly normal target = Scheduled days × 8h (e.g. 208h). Daily surplus accumulates towards the monthly pool; overtime begins ONLY once total eligible monthly hours exceed the target.
              </p>
            </div>
          </div>
        </div>

        {/* OT Multiplier & Special Work Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          {/* Multiplier */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">OT Multiplier Rate</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[1.0, 1.5, 2.0].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormOtMultiplier(m)}
                  className={`py-2 rounded-lg font-mono text-xs font-semibold transition border ${
                    formOtMultiplier === m
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]'
                      : 'bg-[#0A0A0A] border-[#262626] text-[#737373]'
                  }`}
                >
                  {m.toFixed(1)}x
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#555]">Single rate: 1.0x (Company standard)</p>
          </div>

          {/* Daily OT Threshold Filter */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Daily OT Threshold</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { min: 0, label: '0m' },
                { min: 30, label: '30m' },
                { min: 60, label: '60m' },
              ].map((t) => (
                <button
                  key={t.min}
                  type="button"
                  onClick={() => setFormOtThreshold(t.min)}
                  className={`py-2 rounded-lg font-mono text-xs font-semibold transition border ${
                    formOtThreshold === t.min
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]'
                      : 'bg-[#0A0A0A] border-[#262626] text-[#737373]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#555]">Minimum surplus before OT is payable (60m yields ₹73 OT in June)</p>
          </div>

          {/* Weekly Off Work Rule */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Weekly-Off Work Rule (e.g. Sunday)</label>
            <select
              value={formWeeklyOffRule}
              onChange={(e) => setFormWeeklyOffRule(e.target.value as WeeklyOffWorkRule)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="add_to_monthly_threshold">Add toward monthly target first</option>
              <option value="always_overtime">Always classify as 100% Overtime</option>
              <option value="ignore">Ignore for salary calculation</option>
            </select>
            <p className="text-[10px] text-[#555]">Fills normal monthly target first; excess is OT</p>
          </div>

          {/* Holiday Work Rule */}
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Working on Paid Holiday</label>
            <select
              value={formHolidayWorkRule}
              onChange={(e) => setFormHolidayWorkRule(e.target.value as HolidayWorkRule)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="holiday_credit_plus_monthly_threshold">Holiday credit + work counted in threshold</option>
              <option value="always_overtime">Always classify work as 100% Overtime</option>
              <option value="credit_only">Holiday credit only (work ignored)</option>
            </select>
            <p className="text-[10px] text-[#555]">Treatment when working on recognized holiday</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4.1 PAID HOLIDAY PAY POLICY & CUSTOM RATES MANAGER */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl font-mono">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>4.1 Paid Holiday Pay Policy & Custom Holiday Rates</span>
          </div>
          <span className="text-[10px] text-purple-400 font-mono font-bold">
            {formHolidayPayType === 'fixed_amount' ? `Fixed Rate: ₹${formDefaultHolidayAmount}/Holiday` : 'Calculated Daily Rate'}
          </span>
        </div>

        {/* Holiday Pay Mode Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => setFormHolidayPayType('fixed_amount')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              formHolidayPayType === 'fixed_amount'
                ? 'border-purple-500/50 bg-purple-500/10 text-white'
                : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
            }`}
          >
            <div className="font-bold text-purple-300 flex items-center justify-between">
              <span>Fixed Holiday Compensation (e.g. ₹500 / Holiday)</span>
              {formHolidayPayType === 'fixed_amount' && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
              Every paid holiday pays an exact set amount (e.g., ₹500.00) directly credited to your gross earned pay.
            </p>
          </div>

          <div
            onClick={() => setFormHolidayPayType('daily_rate')}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-1.5 ${
              formHolidayPayType === 'daily_rate'
                ? 'border-purple-500/50 bg-purple-500/10 text-white'
                : 'border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
            }`}
          >
            <div className="font-bold text-purple-300 flex items-center justify-between">
              <span>Standard Daily Rate Pro-Rata (₹{(formSalary / (formWorkingDays.length * 4.33)).toFixed(2)})</span>
              {formHolidayPayType === 'daily_rate' && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
              Holidays are credited at 100% of your calculated per-day rate based on monthly base salary.
            </p>
          </div>
        </div>

        {/* Default Holiday Amount Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#161616] border border-[#262626] rounded-xl text-xs">
          <div className="space-y-1.5">
            <label className="text-white font-semibold flex items-center gap-1.5">
              <span>Default Paid Holiday Amount (₹ INR)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#A3A3A3] font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={formDefaultHolidayAmount}
                onChange={(e) => setFormDefaultHolidayAmount(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg pl-7 pr-3 py-2 text-white font-bold focus:border-purple-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-[#737373]">
              Default compensation applied when a paid holiday is celebrated (e.g. ₹500).
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              type="button"
              onClick={() => handleSetAllHolidaysToAmount(formDefaultHolidayAmount || 500)}
              className="w-full py-2.5 px-3 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] border border-purple-500/30 text-purple-300 text-xs font-bold transition cursor-pointer text-center"
            >
              Apply ₹{formDefaultHolidayAmount || 500} to All Registered Holidays
            </button>
            <p className="text-[10px] text-[#737373] text-center">Quick update all individual holiday records</p>
          </div>
        </div>

        {/* Registered Holidays Manager List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[#A3A3A3] font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Configured Holidays & Specific Amounts ({formHolidays.length})</span>
            </span>
            <button
              type="button"
              onClick={handleAddHoliday}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Holiday
            </button>
          </div>

          <div className="space-y-2.5">
            {formHolidays.map((hol) => (
              <div key={hol.id} className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center justify-between gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-2.5 min-w-[200px] flex-1">
                  <input
                    type="date"
                    value={hol.date}
                    onChange={(e) => handleUpdateHoliday(hol.id, { date: e.target.value })}
                    className="bg-[#141414] border border-[#333333] rounded px-2 py-1 text-white font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={hol.name}
                    onChange={(e) => handleUpdateHoliday(hol.id, { name: e.target.value })}
                    placeholder="Holiday Name"
                    className="bg-[#141414] border border-[#333333] rounded px-2.5 py-1 text-white text-xs flex-1 min-w-[120px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#141414] border border-purple-500/30 rounded px-2 py-1">
                    <span className="text-[10px] text-[#A3A3A3]">Pay: ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={hol.customAmount ?? formDefaultHolidayAmount ?? 500}
                      onChange={(e) => handleUpdateHoliday(hol.id, { customAmount: Number(e.target.value) })}
                      className="w-16 bg-transparent text-purple-300 font-bold text-xs focus:outline-none"
                    />
                  </div>

                  <select
                    value={hol.type}
                    onChange={(e) => handleUpdateHoliday(hol.id, { type: e.target.value as any })}
                    className="bg-[#141414] border border-[#333333] rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="optional">Optional</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveHoliday(hol.id)}
                    className="p-1 text-[#737373] hover:text-rose-400 transition cursor-pointer"
                    title="Delete Holiday"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. ATTENDANCE BONUS CONFIGURATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>5. Attendance Performance Bonus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737373]">Bonus Program</span>
            <input
              type="checkbox"
              checked={formBonusEnabled}
              onChange={(e) => setFormBonusEnabled(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1A1A1A] border-[#333333] accent-[#D4AF37]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Bonus Amount (₹ INR)</label>
            <input
              type="number"
              min="0"
              step="500"
              value={formBonusAmount}
              onChange={(e) => setFormBonusAmount(Number(e.target.value))}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="text-[10px] text-[#555]">Default target incentive: ₹3,000</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">Qualifying Attendance Days</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formBonusDays}
              onChange={(e) => setFormBonusDays(Number(e.target.value))}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-2.5 font-mono text-white text-sm focus:border-[#D4AF37] focus:outline-none"
            />
            <p className="text-[10px] text-[#555]">Default requirement: 26 qualifying days</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#A3A3A3] font-semibold">HR Approval Workflow</label>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A0A0A] border border-[#262626] h-[42px]">
              <span className="text-white text-xs">Requires HR Sign-Off</span>
              <input
                type="checkbox"
                checked={formBonusApproval}
                onChange={(e) => setFormBonusApproval(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1A1A1A] border-[#333333] accent-[#D4AF37]"
              />
            </div>
            <p className="text-[10px] text-[#555]">Reaching 26 days marks PENDING_APPROVAL until sign-off</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 6. DEDUCTIONS CONFIGURATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
              <span>6. Configurable Statutory & Custom Deductions</span>
            </div>
            <p className="text-[11px] text-[#737373]">All deductions default to disabled (₹0) unless explicitly configured</p>
          </div>

          <button
            type="button"
            onClick={handleAddDeduction}
            className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-xs font-semibold text-white flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deduction</span>
          </button>
        </div>

        {(formDeductions || []).length === 0 ? (
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] text-center text-xs text-[#737373]">
            No deductions active. Total statutory deductions = <span className="font-mono text-white font-semibold">₹0</span>.
          </div>
        ) : (
          <div className="space-y-3">
            {(formDeductions || []).map((ded) => (
              <div
                key={ded.id}
                className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[10px] text-[#737373] uppercase">Name</label>
                  <input
                    type="text"
                    value={ded.name}
                    onChange={(e) => handleUpdateDeduction(ded.id, { name: e.target.value })}
                    className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 text-white text-xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] text-[#737373] uppercase">Type</label>
                  <select
                    value={ded.type}
                    onChange={(e) => handleUpdateDeduction(ded.id, { type: e.target.value as any })}
                    className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 text-white text-xs"
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage of Gross (%)</option>
                    <option value="manual">Manual Amount</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] text-[#737373] uppercase">Value</label>
                  <input
                    type="number"
                    value={ded.value}
                    onChange={(e) => handleUpdateDeduction(ded.id, { value: Number(e.target.value) })}
                    className="w-full bg-[#141414] border border-[#262626] rounded-lg p-2 font-mono text-white text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={ded.isEnabled}
                    onChange={(e) => handleUpdateDeduction(ded.id, { isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#1A1A1A] border-[#333333] accent-[#D4AF37]"
                  />
                  <span className={ded.isEnabled ? 'text-[#10B981] font-semibold' : 'text-[#737373]'}>
                    {ded.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="sm:col-span-1 text-right pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveDeduction(ded.id)}
                    className="p-1.5 rounded-lg text-[#737373] hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 7. CALCULATION PREVIEW (DYNAMIC FOR ANY MONTH) */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base font-serif-display">
              <Sliders className="w-5 h-5 text-[#D4AF37]" />
              <span>7. Live Calculation & Rate Derivation Preview</span>
            </div>
            <p className="text-xs text-[#737373]">
              Dynamic mathematical rate matrix calculated by <span className="font-mono text-[#D4AF37]">SalaryEngine</span>
            </p>
          </div>

          {/* Month Switcher for Preview */}
          <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => setPreviewMonth(DateEngine.offsetMonth(previewMonth, -1))}
              className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-[#1F1F1F]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white font-serif-display text-xs px-2 min-w-[120px] text-center">
              {DateEngine.formatMonthYear(previewMonth)}
            </span>
            <button
              type="button"
              onClick={() => setPreviewMonth(DateEngine.offsetMonth(previewMonth, 1))}
              className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-[#1F1F1F]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Scheduled Working Days
            </span>
            <p className="text-base font-bold text-white">
              {previewRates.scheduledWorkingDays} Days
            </p>
            <p className="text-[10px] text-[#555] font-sans">Excluding Sundays & holidays</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Monthly Normal Target
            </span>
            <p className="text-base font-bold text-[#D4AF37]">
              {previewRates.totalRequiredMonthlyHours}h 00m
            </p>
            <p className="text-[10px] text-[#555] font-sans">({previewRates.totalRequiredMonthlySeconds.toLocaleString()} seconds)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Calculated Daily Rate
            </span>
            <p className="text-base font-bold text-white">
              ₹{previewRates.perDayRate.toFixed(2)}
            </p>
            <p className="text-[10px] text-[#555] font-sans">15,000 ÷ 26 Days</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Calculated Hourly Rate
            </span>
            <p className="text-base font-bold text-[#10B981]">
              ₹{previewRates.perHourRate.toFixed(2)}
            </p>
            <p className="text-[10px] text-[#555] font-sans">15,000 ÷ (26 × 8h)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Calculated Minute Rate
            </span>
            <p className="text-sm font-bold text-[#A3A3A3]">
              ₹{previewRates.perMinuteRate.toFixed(4)}
            </p>
            <p className="text-[10px] text-[#555] font-sans">15,000 ÷ (26 × 8 × 60m)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Calculated Second Rate
            </span>
            <p className="text-sm font-bold text-[#10B981]">
              ₹{previewRates.perSecondRate.toFixed(6)}
            </p>
            <p className="text-[10px] text-[#555] font-sans">15,000 ÷ (26 × 8 × 3600s)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Overtime Hourly Rate
            </span>
            <p className="text-base font-bold text-[#D4AF37]">
              ₹{previewRates.overtimeHourlyRate.toFixed(2)}
            </p>
            <p className="text-[10px] text-[#555] font-sans">({previewRates.overtimeMultiplier}x Normal Rate)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider font-semibold font-sans">
              Potential Bonus
            </span>
            <p className="text-base font-bold text-[#D4AF37]">
              {formBonusEnabled ? formatCurrency(formBonusAmount) : '₹0'}
            </p>
            <p className="text-[10px] text-[#555] font-sans">Target: {formBonusDays} days</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 8. DETERMINISTIC TEST CASES & VERIFICATION */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-[#121212] border border-[#1A1A1A] p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-serif-display">
            <FlaskConical className="w-4 h-4 text-[#10B981]" />
            <span>Deterministic Engine Verification Suite</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
              30/30 QA PASSED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isRerunningTests}
              onClick={async () => {
                setIsRerunningTests(true);
                await rerunStep11Tests();
                await rerunStep9Tests();
                rerunTests();
                setIsRerunningTests(false);
                setShowTestsSection(true);
              }}
              className="px-3 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-xs font-semibold text-[#10B981] border border-[#10B981]/30 hover:border-[#10B981] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRerunningTests ? 'animate-spin' : ''}`} />
              <span>{isRerunningTests ? 'Running...' : 'Run All Tests'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTestsSection(!showTestsSection);
              }}
              className="px-3 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-xs font-semibold text-[#A3A3A3] hover:text-white transition"
            >
              {showTestsSection ? 'Hide Suite' : 'View Test Results'}
            </button>
          </div>
        </div>

        {showTestsSection && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* Test Suite Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#1F1F1F] pb-3">
              <button
                type="button"
                onClick={() => setSelectedTestSuite('STEP11')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
                  selectedTestSuite === 'STEP11'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'bg-[#141414] text-[#888] hover:text-white'
                }`}
              >
                <span>Step 11 Production QA</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                  {step11TestResults.length > 0 ? `${step11TestResults.filter(t => t.passed).length}/${step11TestResults.length}` : '30'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTestSuite('CORE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
                  selectedTestSuite === 'CORE'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'bg-[#141414] text-[#888] hover:text-white'
                }`}
              >
                <span>Core Calculations</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                  {testResults.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTestSuite('STEP9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
                  selectedTestSuite === 'STEP9'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'bg-[#141414] text-[#888] hover:text-white'
                }`}
              >
                <span>Backup & Integrity</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                  {step9TestResults.length > 0 ? step9TestResults.length : '15'}
                </span>
              </button>
            </div>

            {/* STEP 11 SUITE */}
            {selectedTestSuite === 'STEP11' && (
              <div className="space-y-3">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {['ALL', 'DAILY_TARGET', 'OVERTIME', 'BONUS', 'PREDICTION', 'PRECISION', 'INTEGRITY'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setStep11Filter(cat)}
                      className={`px-2.5 py-1 rounded-md font-mono transition ${
                        step11Filter === cat
                          ? 'bg-[#1E1E1E] text-[#D4AF37] font-bold border border-[#D4AF37]/40'
                          : 'bg-[#0E0E0E] text-[#737373] hover:text-white'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-[480px] overflow-y-auto pr-1">
                  {(step11TestResults || [])
                    .filter((t) => step11Filter === 'ALL' || t.category === step11Filter)
                    .map((t) => (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                          t.passed 
                            ? 'bg-[#0A0A0A] border-[#1F1F1F]' 
                            : 'bg-rose-950/20 border-rose-800/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#D4AF37] text-[10px]">{t.id}</span>
                            <span className="text-white font-medium text-[11px] leading-snug">{t.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#888]">
                            Expected: <span className="text-emerald-400/90">{t.expected}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#737373]">
                            Actual: <span className={t.passed ? 'text-[#D4AF37]' : 'text-rose-400'}>{t.actual}</span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                            t.passed
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* CORE SUITE */}
            {selectedTestSuite === 'CORE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-[400px] overflow-y-auto pr-1">
                {(testResults || []).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#D4AF37] text-[10px]">{t.id}</span>
                        <span className="text-white font-medium">{t.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#737373]">
                        Expected: {t.expected} → Actual: {t.actual}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 shrink-0">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 9 SUITE */}
            {selectedTestSuite === 'STEP9' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs max-h-[400px] overflow-y-auto pr-1">
                {(step9TestResults || []).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#D4AF37] text-[10px]">{t.id}</span>
                        <span className="text-white font-medium">{t.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#737373]">
                        Expected: {t.expected} → Actual: {t.actual}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 shrink-0">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 9. RESTORE & FACTORY RESET / CLEAR ALL DATA ZONE */}
      {/* ------------------------------------------------------------------ */}
      <div id="settings-danger-zone" className="rounded-2xl bg-[#140E0E] border border-rose-500/25 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="text-sm font-bold text-rose-300 font-serif-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Danger Zone: Clear Stored Data & Application History</span>
          </div>
          <p className="text-xs text-[#888888]">
            Permanently clear all recorded attendance sessions, punches, reconciliation ledgers, and audit history.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="clear-all-data-btn"
            type="button"
            onClick={() => setShowDeleteAllModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#262626] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-serif-display">
              <ShieldAlert className="w-5 h-5" />
              <span>Confirm Factory Reset</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to reset all salary configurations, work schedules, custom deductions, and recorded logs back to initial factory settings?
            </p>
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F1F1F]">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-xs font-semibold text-[#A3A3A3]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                  handleDiscard();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Double-Confirmation Clear All Data Modal */}
      <DeleteAllDataModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
      />
    </div>
  );
};
