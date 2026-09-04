// ============================================================================
// SALARYPULSE — IMPORT ATTENDANCE & CUSTOM SALARY CONFIGURATION MODAL
// Allows users to configure salary parameters, shift policies,
// and import attendance datasets (JSON/CSV) directly to localStorage
// ============================================================================

import React, { useState, useId } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Settings, 
  Check, 
  AlertTriangle, 
  X, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Info,
  Calendar,
  FileCode,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceDay, SalaryCalculationBasis, OvertimeMethod } from '../../types';
import { WorkSessionEngine } from '../../engine/workSessionEngine';
import { 
  RAW_EMPLOYEE_PUNCH_RECORDS, 
  getDemoEmployeeAttendanceDays,
  parseAttendancePunchInput,
  convertRawPunchesToAttendanceDay
} from '../../data/employeeDemoPunches';

interface ImportAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportAttendanceModal: React.FC<ImportAttendanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const fileInputId = useId();
  const { 
    salaryConfig, 
    schedule, 
    importAttendanceDataWithConfig,
    selectedMonth 
  } = useApp();

  const [activeStep, setActiveStep] = useState<'CONFIG' | 'DATA' | 'PREVIEW'>('CONFIG');
  
  // Step 1: Salary & Schedule Configuration State (Defaults: ₹15,000 monthly base & 26 days * 8h)
  const [baseSalary, setBaseSalary] = useState<number>(salaryConfig.monthlyBaseSalary || 15000);
  const [calcMethod, setCalcMethod] = useState<SalaryCalculationBasis>(salaryConfig.calculationBasis || 'monthly_scheduled_hours');
  const [shiftStart, setShiftStart] = useState<string>(schedule.officeStartTime || '09:00');
  const [shiftEnd, setShiftEnd] = useState<string>(schedule.officeEndTime || '18:00');
  const [requiredDailyHours, setRequiredDailyHours] = useState<number>(schedule.requiredActiveHoursPerDay || 8.0);
  const [lunchMinutes, setLunchMinutes] = useState<number>(60);
  const [otRateMultiplier, setOtRateMultiplier] = useState<number>(salaryConfig.overtimeMultiplier || 2.0);

  // Step 2: Data Input State
  const [importMode, setImportMode] = useState<'REPLACE' | 'APPEND'>('REPLACE');
  const [rawTextData, setRawTextData] = useState<string>('');
  const [parsedDays, setParsedDays] = useState<AttendanceDay[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Official Employee Punch Dataset (May 25 to Aug 31, 2026 - 69 records)
  const handleLoadOfficialEmployeeData = () => {
    setBaseSalary(15000);
    setRequiredDailyHours(8.0);
    setCalcMethod('monthly_scheduled_hours');
    
    const demoDays = getDemoEmployeeAttendanceDays(8.0);
    setParsedDays(demoDays);
    setRawTextData(JSON.stringify(RAW_EMPLOYEE_PUNCH_RECORDS, null, 2));
    setParseError(null);
    setActiveStep('PREVIEW');
  };

  // Sample Generator for 1-Click Short Demo Testing
  const handleLoadSampleData = () => {
    handleLoadOfficialEmployeeData();
  };

  // Parse CSV or JSON data from text or file
  const handleParseInput = (raw: string) => {
    setParseError(null);
    const trimmed = raw.trim();
    if (!trimmed) {
      setParseError('Please provide attendance data in CSV or JSON format.');
      return;
    }

    try {
      // First try dedicated punch converter for multi-punch biometric records
      const punchRes = parseAttendancePunchInput(trimmed, requiredDailyHours);
      if (punchRes.success && punchRes.days.length > 0) {
        setParsedDays(punchRes.days);
        setActiveStep('PREVIEW');
        return;
      }

      // 1. Try standard JSON parsing
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        const list = Array.isArray(json) ? json : json.attendanceDays || json.records || [json];
        if (list.length === 0) {
          setParseError('JSON does not contain any attendance day records.');
          return;
        }

        const validDays: AttendanceDay[] = list.map((d: any, idx: number) => {
          if (d.entry1 !== undefined || d.exit1 !== undefined) {
            return convertRawPunchesToAttendanceDay(d, requiredDailyHours);
          }
          const date = d.date || `${selectedMonth}-${String(idx + 1).padStart(2, '0')}`;
          const activeSec = d.totalActiveSeconds !== undefined 
            ? Number(d.totalActiveSeconds) 
            : (d.activeHours ? Number(d.activeHours) * 3600 : requiredDailyHours * 3600);

          return {
            id: d.id || `att-${date}`,
            date,
            status: d.status || 'PRESENT',
            workdayStatus: d.workdayStatus || 'COMPLETED',
            firstPunchIn: d.firstPunchIn || (d.inTime ? `${date}T${d.inTime}:00` : `${date}T${shiftStart}:00`),
            lastPunchOut: d.lastPunchOut || (d.outTime ? `${date}T${d.outTime}:00` : `${date}T${shiftEnd}:00`),
            totalActiveSeconds: activeSec,
            creditedNormalSeconds: Math.min(activeSec, requiredDailyHours * 3600),
            totalBreakSeconds: d.totalBreakSeconds || lunchMinutes * 60,
            overtimeSeconds: Math.max(0, activeSec - (requiredDailyHours * 3600)),
            source: d.source || 'MANUAL',
            workSessions: d.workSessions || [],
            breakSessions: d.breakSessions || [],
          };
        });

        setParsedDays(validDays);
        setActiveStep('PREVIEW');
        return;
      }

      // 2. Try CSV parsing
      const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        setParseError('CSV must have a header row and at least one data record row.');
        return;
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const dateIdx = header.findIndex(h => h.includes('date'));
      const inIdx = header.findIndex(h => h.includes('in') || h.includes('start') || h.includes('entry1'));
      const outIdx = header.findIndex(h => h.includes('out') || h.includes('end') || h.includes('exit2') || h.includes('exit1'));
      const statusIdx = header.findIndex(h => h.includes('status'));

      const validDays: AttendanceDay[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 2) continue;

        const date = dateIdx >= 0 ? cols[dateIdx] : cols[0];
        const inVal = inIdx >= 0 ? cols[inIdx] : cols[1] || shiftStart;
        const outVal = outIdx >= 0 ? cols[outIdx] : cols[2] || shiftEnd;
        const status = (statusIdx >= 0 ? cols[statusIdx]?.toUpperCase() : 'PRESENT') || 'PRESENT';

        const inIso = inVal.includes('T') ? inVal : `${date}T${inVal.length === 5 ? inVal + ':00' : inVal}`;
        const outIso = outVal.includes('T') ? outVal : `${date}T${outVal.length === 5 ? outVal + ':00' : outVal}`;

        const durSec = WorkSessionEngine.getDurationSeconds(inIso, outIso);
        const breakSec = lunchMinutes * 60;
        const activeSec = Math.max(0, durSec - breakSec);

        validDays.push({
          id: `att-${date}`,
          date,
          status: status as any,
          workdayStatus: 'COMPLETED',
          firstPunchIn: inIso,
          lastPunchOut: outIso,
          totalActiveSeconds: activeSec,
          creditedNormalSeconds: Math.min(activeSec, requiredDailyHours * 3600),
          totalBreakSeconds: breakSec,
          overtimeSeconds: Math.max(0, activeSec - (requiredDailyHours * 3600)),
          source: 'MANUAL',
          workSessions: [
            {
              id: `ws-${date}-1`,
              attendanceDayId: `att-${date}`,
              startTime: inIso,
              endTime: outIso,
              durationSeconds: activeSec,
              status: 'COMPLETED',
              source: 'MANUAL',
              createdAt: inIso,
              updatedAt: outIso,
            }
          ],
          breakSessions: []
        });
      }

      if (validDays.length === 0) {
        setParseError('Could not extract any valid attendance day records from the CSV.');
        return;
      }

      setParsedDays(validDays);
      setActiveStep('PREVIEW');
    } catch (e: any) {
      setParseError(`Parse error: ${e.message || 'Invalid format'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawTextData(content);
      handleParseInput(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedDays.length === 0) return;
    setIsProcessing(true);
    setImportSuccess(null);

    try {
      const res = await importAttendanceDataWithConfig({
        salaryConfig: {
          monthlyBaseSalary: Number(baseSalary),
          calculationBasis: calcMethod,
          overtimeMultiplier: Number(otRateMultiplier),
        },
        schedule: {
          officeStartTime: shiftStart,
          officeEndTime: shiftEnd,
          requiredActiveHoursPerDay: Number(requiredDailyHours),
        },
        attendanceDays: parsedDays,
        mode: importMode,
      });

      setImportSuccess(res.message);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1500);
    } catch (e: any) {
      setIsProcessing(false);
      setParseError(e.message || 'Import failed.');
    }
  };

  return (
    <div 
      id="import-attendance-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-6 bg-[#111111] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#222222] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Import Attendance & Configure Salary
              </h2>
              <p className="text-xs text-[#888888]">
                Set your salary rules, office shifts, and import punch records to localStorage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-white rounded-lg hover:bg-[#222222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-[#222222] bg-[#161616] text-xs">
          <button
            onClick={() => setActiveStep('CONFIG')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeStep === 'CONFIG'
                ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#1B1B1B]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Salary & Shift Settings</span>
          </button>

          <button
            onClick={() => setActiveStep('DATA')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeStep === 'DATA'
                ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#1B1B1B]'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Upload / Input Data</span>
          </button>

          <button
            onClick={() => setActiveStep('PREVIEW')}
            disabled={parsedDays.length === 0}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeStep === 'PREVIEW'
                ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#1B1B1B]'
                : parsedDays.length === 0
                ? 'border-transparent text-[#555555] cursor-not-allowed'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>3. Review & Store ({parsedDays.length})</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          
          {/* Notification Messages */}
          {parseError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* STEP 1: SALARY & SHIFT CONFIGURATION */}
          {activeStep === 'CONFIG' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-[#171717] border border-[#262626] text-[#A3A3A3] text-xs">
                Configure your base salary and standard working shift before importing attendance. These settings directly calculate your daily rates, hourly wages, and punctuality flags.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Base Monthly Salary */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888]">
                    Base Monthly Salary (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#737373]">₹</span>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                    />
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    Standard monthly gross base compensation
                  </div>
                </div>

                {/* Calculation Method */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888]">
                    Calculation Formula Method
                  </label>
                  <select
                    value={calcMethod}
                    onChange={(e) => setCalcMethod(e.target.value as SalaryCalculationBasis)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs"
                  >
                    <option value="monthly_scheduled_hours">Monthly Scheduled Hours (Working Days × Target Daily Hours)</option>
                    <option value="fixed_monthly">Fixed Monthly Calendar Days Basis</option>
                    <option value="daily_rate">Daily Pro-Rata Rate Basis</option>
                    <option value="hourly_rate">Direct Hourly Rate Basis</option>
                  </select>
                  <div className="text-[10px] text-[#737373]">
                    Divisor used to calculate per-day and per-hour rates
                  </div>
                </div>

                {/* Shift Start Time */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Office Shift Start Time (Late Threshold)</span>
                  </label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                  />
                  <div className="text-[10px] text-amber-400/80">
                    Punches after {shiftStart} will be flagged as Late Arrival
                  </div>
                </div>

                {/* Shift End Time */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Office Shift End Time (Early Threshold)</span>
                  </label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                  />
                  <div className="text-[10px] text-rose-400/80">
                    Departures before {shiftEnd} will be flagged as Early Exit
                  </div>
                </div>

                {/* Required Active Hours */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888]">
                    Daily Active Work Requirement (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={requiredDailyHours}
                    onChange={(e) => setRequiredDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                  />
                  <div className="text-[10px] text-[#737373]">
                    Standard target (e.g. 8.0 hours / day)
                  </div>
                </div>

                {/* Lunch Break Limit */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
                  <label className="text-[11px] uppercase font-bold text-[#888888]">
                    Lunch Break Allowance (Minutes)
                  </label>
                  <input
                    type="number"
                    value={lunchMinutes}
                    onChange={(e) => setLunchMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#111111] border border-[#333333] text-white focus:outline-none focus:border-[#D4AF37] text-xs font-bold"
                  />
                  <div className="text-[10px] text-[#737373]">
                    Overruns beyond {lunchMinutes}m are tracked in punctuality logs
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep('DATA')}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Proceed to Data Input</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD / INPUT DATA */}
          {activeStep === 'DATA' && (
            <div className="space-y-5">
              
              {/* Demo Sample Loader Banner */}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#2B2B2B] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">
                      Official Employee Shift Punches (May 25 – Aug 31, 2026)
                    </div>
                    <div className="text-[11px] text-[#888888]">
                      69 Biometric punch records (Entry1/Exit1 + Entry2/Exit2) · Salary: ₹15,000 / 26d × 8h
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLoadOfficialEmployeeData}
                  className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold transition cursor-pointer shadow"
                >
                  Load Official Dataset (1-Click)
                </button>
              </div>

              {/* File Upload Zone */}
              <div className="p-6 rounded-xl bg-[#141414] border-2 border-dashed border-[#2B2B2B] hover:border-[#D4AF37]/50 transition text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[#737373] mx-auto" />
                <div className="text-xs text-white font-bold">
                  Upload CSV or JSON Attendance File
                </div>
                <p className="text-[11px] text-[#737373]">
                  Drag and drop your export file or browse your computer
                </p>
                <div className="pt-2">
                  <label htmlFor={fileInputId} className="px-4 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-white border border-[#333333] text-xs font-bold transition inline-block cursor-pointer">
                    Browse File
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Or Paste Raw Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#888888]">
                  <span>Or paste CSV / JSON content directly:</span>
                  <span className="text-[10px] text-[#666666]">Supported: Date, InTime, OutTime, Status</span>
                </div>
                <textarea
                  rows={6}
                  value={rawTextData}
                  onChange={(e) => setRawTextData(e.target.value)}
                  placeholder={`Example CSV:\nDate,PunchIn,PunchOut,Status\n2026-08-01,09:00,18:00,PRESENT\n2026-08-02,09:20,18:00,PRESENT\n2026-08-03,08:50,17:40,PRESENT`}
                  className="w-full p-3 rounded-xl bg-[#131313] border border-[#2B2B2B] text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep('CONFIG')}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#242424] text-[#A3A3A3] text-xs transition cursor-pointer"
                >
                  Back to Settings
                </button>
                <button
                  onClick={() => handleParseInput(rawTextData)}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Parse & Preview Data</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: PREVIEW, CONFLICT RESOLUTION & STORE */}
          {activeStep === 'PREVIEW' && (
            <div className="space-y-5">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                  <div className="text-[10px] text-[#737373] uppercase">Total Records</div>
                  <div className="text-xl font-bold text-white">{parsedDays.length} Days</div>
                </div>

                <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                  <div className="text-[10px] text-[#737373] uppercase">Configured Base</div>
                  <div className="text-xl font-bold text-[#D4AF37]">₹{baseSalary.toLocaleString()}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                  <div className="text-[10px] text-[#737373] uppercase">Shift Standard</div>
                  <div className="text-xl font-bold text-white">{shiftStart} - {shiftEnd}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#161616] border border-[#262626]">
                  <div className="text-[10px] text-[#737373] uppercase">Import Target</div>
                  <div className="text-xl font-bold text-[#10B981]">localStorage</div>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] space-y-2">
                <div className="text-[11px] uppercase font-bold text-[#888888]">
                  Import Strategy
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    onClick={() => setImportMode('REPLACE')}
                    className={`p-3 rounded-lg border cursor-pointer block transition ${
                      importMode === 'REPLACE'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                        : 'bg-[#111111] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'REPLACE'}
                        onChange={() => setImportMode('REPLACE')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="font-bold text-white text-xs">Replace All Records</span>
                    </div>
                    <p className="text-[10px] text-[#A3A3A3] mt-1">
                      Overwrites existing attendance days with this newly imported dataset.
                    </p>
                  </label>

                  <label 
                    onClick={() => setImportMode('APPEND')}
                    className={`p-3 rounded-lg border cursor-pointer block transition ${
                      importMode === 'APPEND'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                        : 'bg-[#111111] border-[#262626] text-[#888888]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'APPEND'}
                        onChange={() => setImportMode('APPEND')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="font-bold text-white text-xs">Append / Merge by Date</span>
                    </div>
                    <p className="text-[10px] text-[#A3A3A3] mt-1">
                      Preserves existing days and merges these records on matching dates.
                    </p>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="rounded-xl bg-[#141414] border border-[#262626] overflow-hidden">
                <div className="p-3 bg-[#181818] border-b border-[#222222] text-xs font-bold text-white flex justify-between items-center">
                  <span>Parsed Attendance Records ({parsedDays.length})</span>
                  <span className="text-[11px] text-[#888888]">Ready for storage</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-[#222222] bg-[#121212] text-[#737373] text-[10px] uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">First In</th>
                        <th className="py-2.5 px-3">Last Out</th>
                        <th className="py-2.5 px-3">Active Hours</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F] text-[#A3A3A3]">
                      {parsedDays.map((day) => {
                        const inTime = day.firstPunchIn ? day.firstPunchIn.split('T')[1]?.slice(0, 5) : '--:--';
                        const outTime = day.lastPunchOut ? day.lastPunchOut.split('T')[1]?.slice(0, 5) : '--:--';
                        const isLate = inTime > shiftStart;
                        const isEarly = outTime < shiftEnd && outTime !== '--:--';

                        return (
                          <tr key={day.date} className="hover:bg-[#1A1A1A]">
                            <td className="py-2 px-3 text-white font-semibold">{day.date}</td>
                            <td className="py-2 px-3">
                              <span className={isLate ? 'text-amber-400 font-bold' : 'text-white'}>
                                {inTime} {isLate && '(Late)'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={isEarly ? 'text-rose-400 font-bold' : 'text-white'}>
                                {outTime} {isEarly && '(Early)'}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              {(day.totalActiveSeconds / 3600).toFixed(2)} hrs
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                                {day.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Execution Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep('DATA')}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#242424] text-[#A3A3A3] text-xs transition cursor-pointer"
                >
                  Edit Input Data
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isProcessing ? 'Saving to LocalStorage...' : 'Save & Import to LocalStorage'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] bg-[#141414] flex items-center justify-between text-[11px] text-[#737373]">
          <span>All imported data and salary parameters are safely stored locally in your browser.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
