// ============================================================================
// SALARYPULSE — OFFICIAL EMPLOYEE PUNCH DATASET & CONVERTER
// Default Demo Dataset: Entry1/Exit1 + Entry2/Exit2 Biometric / Shift Punches
// Schedule: 26 Working Days × 8 Hours/Day (208h) | Monthly Salary: ₹15,000
// ============================================================================

import { AttendanceDay, AttendanceStatus, BreakSession, WorkSession } from '../types';

export interface RawPunchRecord {
  date: string;
  entry1: string | null;
  exit1: string | null;
  entry2: string | null;
  exit2: string | null;
}

export interface EmployeePunchDataset {
  format: 'SalaryPulseAttendancePunches';
  version: '1.0';
  employeeId?: string;
  employeeName?: string;
  department?: string;
  defaultMonthlySalary?: number;
  workingDaysPerMonth?: number;
  hoursPerDay?: number;
  records: RawPunchRecord[];
}

export const RAW_EMPLOYEE_PUNCH_RECORDS: RawPunchRecord[] = [
  { "date": "2026-05-25", "entry1": "08:00:00", "exit1": "12:00:00", "entry2": "13:00:00", "exit2": "17:15:00" },
  { "date": "2026-05-26", "entry1": "08:00:00", "exit1": "12:00:00", "entry2": "13:00:00", "exit2": "17:15:00" },
  { "date": "2026-05-27", "entry1": "08:00:00", "exit1": "12:00:00", "entry2": "13:00:00", "exit2": "17:15:00" },
  { "date": "2026-05-28", "entry1": "08:00:00", "exit1": "12:00:00", "entry2": "13:00:00", "exit2": "17:15:00" },
  { "date": "2026-05-29", "entry1": "08:47:00", "exit1": "14:01:00", "entry2": "15:11:00", "exit2": "18:58:00" },
  { "date": "2026-05-30", "entry1": "08:56:00", "exit1": "15:11:00", "entry2": "16:24:00", "exit2": "18:12:00" },
  { "date": "2026-05-31", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-01", "entry1": "08:56:00", "exit1": "13:37:00", "entry2": "14:44:00", "exit2": "18:18:00" },
  { "date": "2026-06-02", "entry1": "08:47:00", "exit1": "13:45:00", "entry2": "14:44:00", "exit2": "18:19:00" },
  { "date": "2026-06-03", "entry1": "08:53:00", "exit1": "13:37:00", "entry2": "14:39:00", "exit2": "18:09:00" },
  { "date": "2026-06-04", "entry1": "08:56:00", "exit1": "13:41:00", "entry2": "14:50:00", "exit2": "18:12:00" },
  { "date": "2026-06-05", "entry1": "08:54:00", "exit1": "13:58:00", "entry2": "14:57:00", "exit2": "18:13:00" },
  { "date": "2026-06-06", "entry1": "08:55:00", "exit1": "13:15:00", "entry2": "14:18:00", "exit2": "18:49:00" },
  { "date": "2026-06-07", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-08", "entry1": "08:52:00", "exit1": "13:45:00", "entry2": "14:46:00", "exit2": "18:23:00" },
  { "date": "2026-06-09", "entry1": "08:52:00", "exit1": "13:46:00", "entry2": "14:47:00", "exit2": "19:03:00" },
  { "date": "2026-06-10", "entry1": "08:58:00", "exit1": "13:46:00", "entry2": "14:49:00", "exit2": "18:23:00" },
  { "date": "2026-06-11", "entry1": "09:02:00", "exit1": "13:50:00", "entry2": "14:58:00", "exit2": "18:27:00" },
  { "date": "2026-06-12", "entry1": "09:03:00", "exit1": "13:36:00", "entry2": "14:59:00", "exit2": "18:27:00" },
  { "date": "2026-06-13", "entry1": "08:59:00", "exit1": "14:01:00", "entry2": "15:04:00", "exit2": "19:23:00" },
  { "date": "2026-06-14", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-15", "entry1": "09:01:00", "exit1": "13:45:00", "entry2": "14:59:00", "exit2": "18:22:00" },
  { "date": "2026-06-16", "entry1": "09:00:00", "exit1": "13:55:00", "entry2": "15:05:00", "exit2": "18:17:00" },
  { "date": "2026-06-17", "entry1": "09:02:00", "exit1": "13:49:00", "entry2": "15:01:00", "exit2": "18:17:00" },
  { "date": "2026-06-18", "entry1": "09:06:00", "exit1": "13:54:00", "entry2": "15:03:00", "exit2": "18:25:00" },
  { "date": "2026-06-19", "entry1": "09:08:00", "exit1": "14:05:00", "entry2": "15:08:00", "exit2": "18:20:00" },
  { "date": "2026-06-20", "entry1": "09:10:00", "exit1": "14:26:00", "entry2": "15:21:00", "exit2": "18:13:00" },
  { "date": "2026-06-21", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-22", "entry1": "09:07:00", "exit1": "14:10:00", "entry2": "15:02:00", "exit2": "18:24:00" },
  { "date": "2026-06-23", "entry1": "09:03:00", "exit1": "14:11:00", "entry2": "15:08:00", "exit2": "18:35:00" },
  { "date": "2026-06-24", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-25", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-26", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-27", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-28", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-29", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-06-30", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-01", "entry1": "14:37:00", "exit1": "18:22:00", "entry2": null, "exit2": null },
  { "date": "2026-08-02", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-03", "entry1": "09:03:00", "exit1": "14:01:00", "entry2": "15:10:00", "exit2": "18:32:00" },
  { "date": "2026-08-04", "entry1": "09:06:00", "exit1": "14:01:00", "entry2": "14:57:00", "exit2": "18:37:00" },
  { "date": "2026-08-05", "entry1": "09:04:00", "exit1": "14:19:00", "entry2": "15:14:00", "exit2": "18:18:00" },
  { "date": "2026-08-06", "entry1": "09:05:00", "exit1": "13:55:00", "entry2": "15:05:00", "exit2": "18:22:00" },
  { "date": "2026-08-07", "entry1": "09:03:00", "exit1": "13:56:00", "entry2": "15:08:00", "exit2": "18:28:00" },
  { "date": "2026-08-08", "entry1": "09:01:00", "exit1": "14:03:00", "entry2": "15:04:00", "exit2": "18:15:00" },
  { "date": "2026-08-09", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-10", "entry1": "09:05:00", "exit1": "13:54:00", "entry2": "15:03:00", "exit2": "18:34:00" },
  { "date": "2026-08-11", "entry1": "09:06:00", "exit1": "14:00:00", "entry2": "15:02:00", "exit2": "18:17:00" },
  { "date": "2026-08-12", "entry1": "09:09:00", "exit1": "13:57:00", "entry2": "14:46:00", "exit2": "18:14:00" },
  { "date": "2026-08-13", "entry1": "09:34:00", "exit1": "14:01:00", "entry2": "14:39:00", "exit2": "18:32:00" },
  { "date": "2026-08-14", "entry1": "09:06:00", "exit1": "13:56:00", "entry2": "15:05:00", "exit2": "18:28:00" },
  { "date": "2026-08-15", "entry1": "09:00:00", "exit1": "13:00:00", "entry2": "14:00:00", "exit2": "18:00:00" },
  { "date": "2026-08-16", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-17", "entry1": "09:04:00", "exit1": "13:59:00", "entry2": "14:56:00", "exit2": "18:05:00" },
  { "date": "2026-08-18", "entry1": "09:09:00", "exit1": "13:57:00", "entry2": "14:49:00", "exit2": "18:15:00" },
  { "date": "2026-08-19", "entry1": "09:01:00", "exit1": "14:04:00", "entry2": "15:00:00", "exit2": "18:11:00" },
  { "date": "2026-08-20", "entry1": "09:04:00", "exit1": "14:07:00", "entry2": "15:06:00", "exit2": "18:29:00" },
  { "date": "2026-08-21", "entry1": "08:57:00", "exit1": "12:02:00", "entry2": "13:09:00", "exit2": "18:16:00" },
  { "date": "2026-08-22", "entry1": "08:58:00", "exit1": "14:00:00", "entry2": "14:54:00", "exit2": "18:09:00" },
  { "date": "2026-08-23", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-24", "entry1": "09:04:00", "exit1": "13:57:00", "entry2": "14:55:00", "exit2": "18:22:00" },
  { "date": "2026-08-25", "entry1": "08:59:00", "exit1": "14:08:00", "entry2": "15:11:00", "exit2": "18:16:00" },
  { "date": "2026-08-26", "entry1": "08:59:00", "exit1": "14:06:00", "entry2": "14:59:00", "exit2": "18:10:00" },
  { "date": "2026-08-27", "entry1": "08:57:00", "exit1": "13:31:00", "entry2": "14:29:00", "exit2": "18:10:00" },
  { "date": "2026-08-28", "entry1": "09:00:00", "exit1": "14:06:00", "entry2": "15:02:00", "exit2": "18:07:00" },
  { "date": "2026-08-29", "entry1": "08:57:00", "exit1": "14:10:00", "entry2": "15:07:00", "exit2": "18:16:00" },
  { "date": "2026-08-30", "entry1": null, "exit1": null, "entry2": null, "exit2": null },
  { "date": "2026-08-31", "entry1": "09:06:00", "exit1": null, "entry2": null, "exit2": null }
];

export const EMPLOYEE_DEMO_PUNCH_DATASET: EmployeePunchDataset = {
  format: "SalaryPulseAttendancePunches",
  version: "1.0",
  employeeId: "EMP-2026-884",
  employeeName: "Amit Kiran",
  department: "Production & Logistics",
  defaultMonthlySalary: 15000,
  workingDaysPerMonth: 26,
  hoursPerDay: 8,
  records: RAW_EMPLOYEE_PUNCH_RECORDS,
};

/**
 * Converts a raw punch record into an authoritative SalaryPulse AttendanceDay
 */
export function convertRawPunchesToAttendanceDay(
  record: RawPunchRecord,
  scheduleRequiredHours: number = 8.0
): AttendanceDay {
  const { date, entry1, exit1, entry2, exit2 } = record;
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay(); // 0 is Sunday
  const isSunday = dayOfWeek === 0;

  const workSessions: WorkSession[] = [];
  const breakSessions: BreakSession[] = [];
  let totalActiveSec = 0;
  let totalBreakSec = 0;

  // Session 1
  if (entry1) {
    const startIso = `${date}T${entry1}`;
    const endIso = exit1 ? `${date}T${exit1}` : undefined;
    let dur = 0;
    if (exit1) {
      dur = Math.max(0, Math.round((new Date(endIso!).getTime() - new Date(startIso).getTime()) / 1000));
    }
    workSessions.push({
      id: `ws-1-${date}`,
      startTime: startIso,
      endTime: endIso,
      durationSeconds: dur,
      status: exit1 ? 'COMPLETED' : 'OPEN',
      source: exit1 ? 'IMPORTED' : 'LIVE',
    });
    totalActiveSec += dur;
  }

  // Lunch Break (between exit1 and entry2)
  if (exit1 && entry2) {
    const breakStartIso = `${date}T${exit1}`;
    const breakEndIso = `${date}T${entry2}`;
    const breakDur = Math.max(0, Math.round((new Date(breakEndIso).getTime() - new Date(breakStartIso).getTime()) / 1000));
    breakSessions.push({
      id: `bs-lunch-${date}`,
      type: 'lunch',
      startTime: breakStartIso,
      endTime: breakEndIso,
      durationSeconds: breakDur,
      isPaid: false,
      source: 'IMPORTED',
    });
    totalBreakSec += breakDur;
  }

  // Session 2
  if (entry2) {
    const startIso = `${date}T${entry2}`;
    const endIso = exit2 ? `${date}T${exit2}` : undefined;
    let dur = 0;
    if (exit2) {
      dur = Math.max(0, Math.round((new Date(endIso!).getTime() - new Date(startIso).getTime()) / 1000));
    }
    workSessions.push({
      id: `ws-2-${date}`,
      startTime: startIso,
      endTime: endIso,
      durationSeconds: dur,
      status: exit2 ? 'COMPLETED' : 'OPEN',
      source: exit2 ? 'IMPORTED' : 'LIVE',
    });
    totalActiveSec += dur;
  }

  // Determine firstPunchIn and lastPunchOut
  const firstPunchIn = entry1 ? `${date}T${entry1}` : (entry2 ? `${date}T${entry2}` : undefined);
  const lastPunchOut = exit2 ? `${date}T${exit2}` : (exit1 ? `${date}T${exit1}` : undefined);

  // Authoritative Office Working-Time Rule:
  // Office Span = Last Punch-Out - First Punch-In
  // Actual Working Time = Office Span - Configured Lunch Duration (01:00:00)
  if (firstPunchIn && lastPunchOut) {
    const startMs = new Date(firstPunchIn).getTime();
    const endMs = new Date(lastPunchOut).getTime();
    if (endMs >= startMs) {
      const officeSpan = Math.floor((endMs - startMs) / 1000);
      const configuredLunchSec = 3600; // 01:00:00
      totalActiveSec = Math.max(0, officeSpan - configuredLunchSec);
    } else {
      totalActiveSec = 0;
    }
  }

  // Overtime and Credited Normal Seconds
  const requiredSeconds = scheduleRequiredHours * 3600;
  const overtimeSeconds = Math.max(0, totalActiveSec - requiredSeconds);
  const creditedNormalSeconds = Math.min(totalActiveSec, requiredSeconds);

  const hasOpenSession = workSessions.some(s => s.status === 'OPEN' || !s.endTime);

  // Status calculation
  let status: AttendanceStatus;
  if (!entry1 && !exit1 && !entry2 && !exit2) {
    if (isSunday) {
      status = 'WEEKLY_OFF';
    } else {
      status = 'ABSENT';
    }
  } else {
    if (hasOpenSession || totalActiveSec >= requiredSeconds * 0.5) {
      status = 'PRESENT';
    } else if (totalActiveSec > 0) {
      status = 'PARTIAL';
    } else {
      status = 'PRESENT';
    }
  }

  // Punctuality flags based on standard shift 09:00 - 18:00
  const firstTimeStr = entry1 || entry2;
  const lastTimeStr = exit2 || exit1;
  const isLateEntry = firstTimeStr ? firstTimeStr > '09:00:00' : false;
  const isEarlyExit = lastTimeStr ? lastTimeStr < '18:00:00' : false;

  return {
    id: `att-${date}`,
    date,
    status,
    workdayStatus: hasOpenSession ? 'WORKING' : (totalActiveSec >= requiredSeconds ? 'COMPLETED' : (totalActiveSec > 0 ? 'PARTIAL' : (isSunday ? 'WEEKLY_OFF' : 'NOT_STARTED'))),
    totalActiveSeconds: totalActiveSec,
    creditedNormalSeconds,
    totalBreakSeconds: totalBreakSec,
    overtimeSeconds,
    firstPunchIn,
    lastPunchOut,
    workSessions,
    breakSessions,
    source: hasOpenSession ? 'LIVE' : 'IMPORTED',
    isLateEntry,
    isEarlyExit,
    notes: isSunday ? 'Sunday Weekly Off' : undefined,
  };
}

/**
 * Convert all records in the demo employee dataset into AttendanceDay[]
 */
export function getDemoEmployeeAttendanceDays(scheduleRequiredHours: number = 8.0): AttendanceDay[] {
  return RAW_EMPLOYEE_PUNCH_RECORDS.map(rec => convertRawPunchesToAttendanceDay(rec, scheduleRequiredHours));
}

/**
 * Universal Parser for Attendance Punch input (JSON object, JSON array, or CSV text)
 */
export function parseAttendancePunchInput(
  input: string,
  scheduleRequiredHours: number = 8.0
): { success: boolean; records: RawPunchRecord[]; days: AttendanceDay[]; error?: string } {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, records: [], days: [], error: 'Input is empty' };
    }

    let records: RawPunchRecord[] = [];

    // Attempt JSON parse
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        records = parsed.map(item => normalizeRawPunchRecord(item));
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.records)) {
          records = parsed.records.map((item: any) => normalizeRawPunchRecord(item));
        } else if (Array.isArray(parsed.data)) {
          records = parsed.data.map((item: any) => normalizeRawPunchRecord(item));
        }
      }
    } else {
      // CSV parse
      const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length === 0) {
        return { success: false, records: [], days: [], error: 'No data lines found in CSV' };
      }

      const header = lines[0].toLowerCase();
      const startIndex = (header.includes('date') || header.includes('entry') || header.includes('punch') || header.includes('in')) ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 1 || !parts[0]) continue;

        const date = normalizeDate(parts[0]);
        if (!date) continue;

        // Formats:
        // 5 columns: Date, Entry1, Exit1, Entry2, Exit2
        // 3 columns: Date, PunchIn, PunchOut
        // 4 columns: Date, PunchIn, PunchOut, Status
        if (parts.length >= 5) {
          records.push({
            date,
            entry1: normalizeTime(parts[1]),
            exit1: normalizeTime(parts[2]),
            entry2: normalizeTime(parts[3]),
            exit2: normalizeTime(parts[4]),
          });
        } else if (parts.length >= 2) {
          records.push({
            date,
            entry1: normalizeTime(parts[1]),
            exit1: normalizeTime(parts[2] || null),
            entry2: null,
            exit2: null,
          });
        }
      }
    }

    if (records.length === 0) {
      return { success: false, records: [], days: [], error: 'Could not extract valid punch records.' };
    }

    // Filter valid dates and sort chronologically
    records = records.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date)).sort((a, b) => a.date.localeCompare(b.date));
    const days = records.map(r => convertRawPunchesToAttendanceDay(r, scheduleRequiredHours));

    return {
      success: true,
      records,
      days,
    };
  } catch (err: any) {
    return {
      success: false,
      records: [],
      days: [],
      error: err?.message || 'Failed to parse attendance punch data',
    };
  }
}

function normalizeRawPunchRecord(item: any): RawPunchRecord {
  const date = normalizeDate(item.date || item.Date || item.day || '');
  return {
    date,
    entry1: normalizeTime(item.entry1 ?? item.in1 ?? item.punchIn1 ?? item.firstPunchIn ?? item.punchIn ?? null),
    exit1: normalizeTime(item.exit1 ?? item.out1 ?? item.punchOut1 ?? item.firstPunchOut ?? null),
    entry2: normalizeTime(item.entry2 ?? item.in2 ?? item.punchIn2 ?? item.secondPunchIn ?? null),
    exit2: normalizeTime(item.exit2 ?? item.out2 ?? item.punchOut2 ?? item.lastPunchOut ?? item.punchOut ?? null),
  };
}

function normalizeDate(str: string): string {
  if (!str) return '';
  const clean = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  // Try DD-MM-YYYY or DD/MM/YYYY
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return clean;
}

function normalizeTime(val: string | null | undefined): string | null {
  if (!val || val === 'null' || val === 'undefined' || val === '--' || val === '-') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{1}:\d{2}:\d{2}$/.test(trimmed)) return `0${trimmed}`;
  if (/^\d{1}:\d{2}$/.test(trimmed)) return `0${trimmed}:00`;
  return trimmed;
}
