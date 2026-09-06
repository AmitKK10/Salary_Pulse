// ============================================================================
// SALARYPULSE — OFFICIAL EMPLOYEE PUNCH DATASET & CONVERTER
// Authoritative Dataset: Entry1/Exit1 + Entry2/Exit2 Biometric / Shift Punches
// Schedule: 26 Working Days × 8 Hours/Day (208h) | Monthly Salary: ₹15,000
// Seeded for May 2026, June 2026, August 2026, and September 2026 (73 Records)
// ============================================================================

import { AttendanceDay, AttendanceStatus, BreakSession, WorkSession } from '../types';

export interface RawPunchRecord {
  date: string;
  entry1: string | null;
  exit1: string | null;
  entry2?: string | null;
  exit2?: string | null;
  inTime?: string | null;
  outTime?: string | null;
  workDuration?: string | null;
  ot?: string | null;
  totalDuration?: string | null;
  lateBy?: string | null;
  earlyGoingBy?: string | null;
  status?: string | null;
  punchRecords?: string | null;
  source?: string | null;
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
  {
    "date": "2026-05-25",
    "entry1": "09:38:28",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:08:13",
    "inTime": "09:38:28",
    "outTime": "18:08:13",
    "workDuration": "7:30",
    "ot": "00:00",
    "totalDuration": "7:30",
    "lateBy": "00:38",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-26",
    "entry1": "08:50:11",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:07:49",
    "inTime": "08:50:11",
    "outTime": "18:07:49",
    "workDuration": "8:17",
    "ot": "00:00",
    "totalDuration": "8:17",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-27",
    "entry1": "08:57:43",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:21:34",
    "inTime": "08:57:43",
    "outTime": "18:21:34",
    "workDuration": "8:24",
    "ot": "00:00",
    "totalDuration": "8:24",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-28",
    "entry1": "08:48:45",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:11:35",
    "inTime": "08:48:45",
    "outTime": "18:11:35",
    "workDuration": "8:23",
    "ot": "00:00",
    "totalDuration": "8:23",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-29",
    "entry1": "08:48:55",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:58:53",
    "inTime": "08:48:55",
    "outTime": "18:58:53",
    "workDuration": "9:10",
    "ot": "00:00",
    "totalDuration": "9:10",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-30",
    "entry1": "08:56:44",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:04:44",
    "inTime": "08:56:44",
    "outTime": "18:04:44",
    "workDuration": "8:08",
    "ot": "00:00",
    "totalDuration": "8:08",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-05-31",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "Offic_Attendance_May(1).pdf (page 13)"
  },
  {
    "date": "2026-06-01",
    "entry1": "08:56:08",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:18:27",
    "inTime": "08:56:08",
    "outTime": "18:18:27",
    "workDuration": "8:22",
    "ot": "00:00",
    "totalDuration": "8:22",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-02",
    "entry1": "08:47:12",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:19:11",
    "inTime": "08:47:12",
    "outTime": "18:19:11",
    "workDuration": "8:32",
    "ot": "00:00",
    "totalDuration": "8:32",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-03",
    "entry1": "08:53:50",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:05:03",
    "inTime": "08:53:50",
    "outTime": "18:05:03",
    "workDuration": "8:12",
    "ot": "00:00",
    "totalDuration": "8:12",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-04",
    "entry1": "08:56:19",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:12:36",
    "inTime": "08:56:19",
    "outTime": "18:12:36",
    "workDuration": "8:16",
    "ot": "00:00",
    "totalDuration": "8:16",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-05",
    "entry1": "08:54:48",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:13:39",
    "inTime": "08:54:48",
    "outTime": "18:13:39",
    "workDuration": "8:19",
    "ot": "00:00",
    "totalDuration": "8:19",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-06",
    "entry1": "08:55:01",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:49:16",
    "inTime": "08:55:01",
    "outTime": "18:49:16",
    "workDuration": "8:54",
    "ot": "00:00",
    "totalDuration": "8:54",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-07",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 11)"
  },
  {
    "date": "2026-06-08",
    "entry1": "08:52:18",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:23:57",
    "inTime": "08:52:18",
    "outTime": "18:23:57",
    "workDuration": "8:31",
    "ot": "00:00",
    "totalDuration": "8:31",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-09",
    "entry1": "08:52:56",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "19:03:22",
    "inTime": "08:52:56",
    "outTime": "19:03:22",
    "workDuration": "9:11",
    "ot": "00:00",
    "totalDuration": "9:11",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-10",
    "entry1": "08:58:17",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:23:10",
    "inTime": "08:58:17",
    "outTime": "18:23:10",
    "workDuration": "8:25",
    "ot": "00:00",
    "totalDuration": "8:25",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-11",
    "entry1": "09:02:03",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:27:47",
    "inTime": "09:02:03",
    "outTime": "18:27:47",
    "workDuration": "8:25",
    "ot": "00:00",
    "totalDuration": "8:25",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-12",
    "entry1": "09:03:33",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:27:42",
    "inTime": "09:03:33",
    "outTime": "18:27:42",
    "workDuration": "8:24",
    "ot": "00:00",
    "totalDuration": "8:24",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-13",
    "entry1": "08:59:21",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "19:23:09",
    "inTime": "08:59:21",
    "outTime": "19:23:09",
    "workDuration": "9:24",
    "ot": "00:00",
    "totalDuration": "9:24",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-14",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-15",
    "entry1": "09:01:52",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:22:49",
    "inTime": "09:01:52",
    "outTime": "18:22:49",
    "workDuration": "8:21",
    "ot": "00:00",
    "totalDuration": "8:21",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-16",
    "entry1": "09:00:24",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:17:46",
    "inTime": "09:00:24",
    "outTime": "18:17:46",
    "workDuration": "8:17",
    "ot": "00:00",
    "totalDuration": "8:17",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-17",
    "entry1": "09:02:46",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:17:07",
    "inTime": "09:02:46",
    "outTime": "18:17:07",
    "workDuration": "8:15",
    "ot": "00:00",
    "totalDuration": "8:15",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-18",
    "entry1": "09:06:00",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:25:32",
    "inTime": "09:06:00",
    "outTime": "18:25:32",
    "workDuration": "8:19",
    "ot": "00:00",
    "totalDuration": "8:19",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-19",
    "entry1": "09:08:57",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:20:30",
    "inTime": "09:08:57",
    "outTime": "18:20:30",
    "workDuration": "8:12",
    "ot": "00:00",
    "totalDuration": "8:12",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-20",
    "entry1": "09:10:20",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:13:44",
    "inTime": "09:10:20",
    "outTime": "18:13:44",
    "workDuration": "8:03",
    "ot": "00:00",
    "totalDuration": "8:03",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-21",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-22",
    "entry1": "09:07:28",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:24:13",
    "inTime": "09:07:28",
    "outTime": "18:24:13",
    "workDuration": "8:17",
    "ot": "00:00",
    "totalDuration": "8:17",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-23",
    "entry1": "09:03:15",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:34:31",
    "inTime": "09:03:15",
    "outTime": "18:34:31",
    "workDuration": "8:31",
    "ot": "00:00",
    "totalDuration": "8:31",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-24",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 12)"
  },
  {
    "date": "2026-06-25",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-06-26",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-06-27",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-06-28",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-06-29",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-06-30",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Absent",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (2) (1).pdf (page 13)"
  },
  {
    "date": "2026-08-01",
    "entry1": "14:37:57",
    "exit1": "18:22:00",
    "entry2": null,
    "exit2": null,
    "inTime": "14:37:57",
    "outTime": "18:22:00",
    "workDuration": "3:45",
    "ot": "00:00",
    "totalDuration": "3:45",
    "lateBy": "5:37",
    "earlyGoingBy": "00:00",
    "status": "½Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-02",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-03",
    "entry1": "09:03:37",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:33:00",
    "inTime": "09:03:37",
    "outTime": "18:33:00",
    "workDuration": "8:30",
    "ot": "00:00",
    "totalDuration": "8:30",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-04",
    "entry1": "09:06:32",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:37:39",
    "inTime": "09:06:32",
    "outTime": "18:37:39",
    "workDuration": "8:31",
    "ot": "00:00",
    "totalDuration": "8:31",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-05",
    "entry1": "09:04:29",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:18:26",
    "inTime": "09:04:29",
    "outTime": "18:18:26",
    "workDuration": "8:14",
    "ot": "00:00",
    "totalDuration": "8:14",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-06",
    "entry1": "09:05:45",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:20:28",
    "inTime": "09:05:45",
    "outTime": "18:20:28",
    "workDuration": "8:15",
    "ot": "00:00",
    "totalDuration": "8:15",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-07",
    "entry1": "09:03:06",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:28:49",
    "inTime": "09:03:06",
    "outTime": "18:28:49",
    "workDuration": "8:25",
    "ot": "00:00",
    "totalDuration": "8:25",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-08",
    "entry1": "09:01:35",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:15:11",
    "inTime": "09:01:35",
    "outTime": "18:15:11",
    "workDuration": "8:14",
    "ot": "00:00",
    "totalDuration": "8:14",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 14)"
  },
  {
    "date": "2026-08-09",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-10",
    "entry1": "09:05:10",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:34:38",
    "inTime": "09:05:10",
    "outTime": "18:34:38",
    "workDuration": "8:29",
    "ot": "00:00",
    "totalDuration": "8:29",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-11",
    "entry1": "09:06:11",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:17:32",
    "inTime": "09:06:11",
    "outTime": "18:17:32",
    "workDuration": "8:11",
    "ot": "00:00",
    "totalDuration": "8:11",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-12",
    "entry1": "09:09:31",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:14:48",
    "inTime": "09:09:31",
    "outTime": "18:14:48",
    "workDuration": "8:05",
    "ot": "00:00",
    "totalDuration": "8:05",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-13",
    "entry1": "09:34:01",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:32:15",
    "inTime": "09:34:01",
    "outTime": "18:32:15",
    "workDuration": "7:58",
    "ot": "00:00",
    "totalDuration": "7:58",
    "lateBy": "00:34",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-14",
    "entry1": "09:06:53",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:28:58",
    "inTime": "09:06:53",
    "outTime": "18:28:58",
    "workDuration": "8:22",
    "ot": "00:00",
    "totalDuration": "8:22",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-15",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Holiday",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-16",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-17",
    "entry1": "09:04:28",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:05:28",
    "inTime": "09:04:28",
    "outTime": "18:05:28",
    "workDuration": "8:01",
    "ot": "00:00",
    "totalDuration": "8:01",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-18",
    "entry1": "09:09:52",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:15:07",
    "inTime": "09:09:52",
    "outTime": "18:15:07",
    "workDuration": "8:06",
    "ot": "00:00",
    "totalDuration": "8:06",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-19",
    "entry1": "09:01:57",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:11:34",
    "inTime": "09:01:57",
    "outTime": "18:11:34",
    "workDuration": "8:10",
    "ot": "00:00",
    "totalDuration": "8:10",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-20",
    "entry1": "09:04:07",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:29:16",
    "inTime": "09:04:07",
    "outTime": "18:29:16",
    "workDuration": "8:25",
    "ot": "00:00",
    "totalDuration": "8:25",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-21",
    "entry1": "08:57:46",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:16:53",
    "inTime": "08:57:46",
    "outTime": "18:16:53",
    "workDuration": "8:19",
    "ot": "00:00",
    "totalDuration": "8:19",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-22",
    "entry1": "08:58:19",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:09:53",
    "inTime": "08:58:19",
    "outTime": "18:09:53",
    "workDuration": "8:11",
    "ot": "00:00",
    "totalDuration": "8:11",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-23",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-24",
    "entry1": "09:02:12",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:22:56",
    "inTime": "09:02:12",
    "outTime": "18:22:56",
    "workDuration": "8:20",
    "ot": "00:00",
    "totalDuration": "8:20",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-25",
    "entry1": "09:00:00",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:16:25",
    "inTime": "09:00:00",
    "outTime": "18:16:25",
    "workDuration": "8:16",
    "ot": "00:00",
    "totalDuration": "8:16",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-26",
    "entry1": "08:59:32",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:10:56",
    "inTime": "08:59:32",
    "outTime": "18:10:56",
    "workDuration": "8:11",
    "ot": "00:00",
    "totalDuration": "8:11",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 15)"
  },
  {
    "date": "2026-08-27",
    "entry1": "08:57:35",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:10:27",
    "inTime": "08:57:35",
    "outTime": "18:10:27",
    "workDuration": "8:13",
    "ot": "00:00",
    "totalDuration": "8:13",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 16)"
  },
  {
    "date": "2026-08-28",
    "entry1": "09:00:43",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:07:34",
    "inTime": "09:00:43",
    "outTime": "18:07:34",
    "workDuration": "8:07",
    "ot": "00:00",
    "totalDuration": "8:07",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 16)"
  },
  {
    "date": "2026-08-29",
    "entry1": "08:57:58",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:16:37",
    "inTime": "08:57:58",
    "outTime": "18:16:37",
    "workDuration": "8:19",
    "ot": "00:00",
    "totalDuration": "8:19",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 16)"
  },
  {
    "date": "2026-08-30",
    "entry1": null,
    "exit1": null,
    "entry2": null,
    "exit2": null,
    "inTime": null,
    "outTime": null,
    "workDuration": "00:00",
    "ot": "00:00",
    "totalDuration": "00:00",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "WeeklyOff",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 16)"
  },
  {
    "date": "2026-08-31",
    "entry1": "09:06:42",
    "exit1": "13:30:00",
    "entry2": "14:30:00",
    "exit2": "18:10:47",
    "inTime": "09:06:42",
    "outTime": "18:10:47",
    "workDuration": "8:04",
    "ot": "00:00",
    "totalDuration": "8:04",
    "lateBy": "00:00",
    "earlyGoingBy": "00:00",
    "status": "Present",
    "punchRecords": null,
    "source": "DailyAttendance_DetailSummaryReport (14).pdf (page 16)"
  },
  {
    "date": "2026-09-01",
    "entry1": "09:00:00",
    "exit1": "14:02:00",
    "entry2": "14:55:00",
    "exit2": "18:13:00",
    "inTime": "09:00:00",
    "outTime": "18:13:00",
    "workDuration": "08:20",
    "ot": "00:00",
    "totalDuration": "08:20",
    "lateBy": null,
    "earlyGoingBy": null,
    "status": "Present",
    "punchRecords": "09:00:in, 14:02:out; 14:55:in, 18:13:out",
    "source": "salarypulse-backup-2026-09-05.csv"
  },
  {
    "date": "2026-09-02",
    "entry1": "09:08:00",
    "exit1": "14:10:00",
    "entry2": "15:04:00",
    "exit2": "18:16:00",
    "inTime": "09:08:00",
    "outTime": "18:16:00",
    "workDuration": "08:14",
    "ot": "00:00",
    "totalDuration": "08:14",
    "lateBy": null,
    "earlyGoingBy": null,
    "status": "Present",
    "punchRecords": "09:08:in, 14:10:out; 15:04:in, 18:16:out",
    "source": "salarypulse-backup-2026-09-05.csv"
  },
  {
    "date": "2026-09-03",
    "entry1": "09:01:00",
    "exit1": "14:15:00",
    "entry2": "15:01:00",
    "exit2": "18:33:00",
    "inTime": "09:01:00",
    "outTime": "18:33:00",
    "workDuration": "08:46",
    "ot": "00:00",
    "totalDuration": "08:46",
    "lateBy": null,
    "earlyGoingBy": null,
    "status": "Present",
    "punchRecords": "09:01:in, 14:15:out; 15:01:in, 18:33:out",
    "source": "salarypulse-backup-2026-09-05.csv"
  },
  {
    "date": "2026-09-04",
    "entry1": "09:03:00",
    "exit1": "14:03:00",
    "entry2": "15:10:00",
    "exit2": "18:28:00",
    "inTime": "09:03:00",
    "outTime": "18:28:00",
    "workDuration": "08:18",
    "ot": "00:00",
    "totalDuration": "08:18",
    "lateBy": null,
    "earlyGoingBy": null,
    "status": "Present",
    "punchRecords": "09:03:in, 14:03:out; 15:10:in, 18:28:out",
    "source": "salarypulse-backup-2026-09-05.csv"
  },
  {
    "date": "2026-09-05",
    "entry1": "08:56:00",
    "exit1": "13:51:00",
    "entry2": "15:10:00",
    "exit2": "18:36:00",
    "inTime": "08:56:00",
    "outTime": "18:36:00",
    "workDuration": "08:21",
    "ot": "00:00",
    "totalDuration": "08:21",
    "lateBy": null,
    "earlyGoingBy": null,
    "status": "Present",
    "punchRecords": "08:56:in, 13:51:out; 15:10:in, 18:36:out",
    "source": "salarypulse-backup-2026-09-05.csv"
  }
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
  const { date, entry1, exit1, entry2, exit2, inTime, outTime, workDuration, status: rawStatus, punchRecords } = record;
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay(); // 0 is Sunday
  const isSunday = dayOfWeek === 0;
  const requiredSeconds = scheduleRequiredHours * 3600;

  // 1. Holiday detection (e.g. Aug 15 Independence Day)
  if (rawStatus === 'Holiday' || date === '2026-08-15') {
    return {
      id: `att-${date}`,
      date,
      status: 'PAID_HOLIDAY' as AttendanceStatus,
      workdayStatus: 'PAID_HOLIDAY',
      totalActiveSeconds: 0,
      creditedNormalSeconds: requiredSeconds, // 8 hours credited paid holiday!
      totalBreakSeconds: 0,
      overtimeSeconds: 0,
      workSessions: [],
      breakSessions: [],
      source: 'IMPORTED',
      isLateEntry: false,
      isEarlyExit: false,
      notes: 'Paid Public Holiday (Independence Day)',
    };
  }

  // 2. WeeklyOff
  if (rawStatus === 'WeeklyOff' || (isSunday && !entry1 && !inTime)) {
    return {
      id: `att-${date}`,
      date,
      status: 'WEEKLY_OFF' as AttendanceStatus,
      workdayStatus: 'WEEKLY_OFF',
      totalActiveSeconds: 0,
      creditedNormalSeconds: 0,
      totalBreakSeconds: 0,
      overtimeSeconds: 0,
      workSessions: [],
      breakSessions: [],
      source: 'IMPORTED',
      isLateEntry: false,
      isEarlyExit: false,
      notes: 'Sunday Weekly Off',
    };
  }

  // 3. Absent
  if (rawStatus === 'Absent' || (!entry1 && !inTime && !exit1 && !outTime)) {
    return {
      id: `att-${date}`,
      date,
      status: 'ABSENT' as AttendanceStatus,
      workdayStatus: 'ABSENT',
      totalActiveSeconds: 0,
      creditedNormalSeconds: 0,
      totalBreakSeconds: 0,
      overtimeSeconds: 0,
      workSessions: [],
      breakSessions: [],
      source: 'IMPORTED',
      isLateEntry: false,
      isEarlyExit: false,
      notes: 'Absent without notice',
    };
  }

  // 4. Present / Half Day
  const firstPunchIn = inTime ? `${date}T${inTime}` : (entry1 ? `${date}T${entry1}` : undefined);
  const lastPunchOut = outTime ? `${date}T${outTime}` : (exit2 ? `${date}T${exit2}` : (exit1 ? `${date}T${exit1}` : undefined));

  const workSessions: WorkSession[] = [];
  const breakSessions: BreakSession[] = [];
  let totalActiveSec = 0;
  let totalBreakSec = 0;

  // Multi-session extraction
  if (entry1 && exit1) {
    const s1Start = `${date}T${entry1}`;
    const s1End = `${date}T${exit1}`;
    const dur1 = Math.max(0, Math.round((new Date(s1End).getTime() - new Date(s1Start).getTime()) / 1000));
    workSessions.push({
      id: `ws-1-${date}`,
      startTime: s1Start,
      endTime: s1End,
      durationSeconds: dur1,
      status: 'COMPLETED',
      source: 'IMPORTED',
    });
  }

  if (exit1 && entry2) {
    const bStart = `${date}T${exit1}`;
    const bEnd = `${date}T${entry2}`;
    const bDur = Math.max(0, Math.round((new Date(bEnd).getTime() - new Date(bStart).getTime()) / 1000));
    breakSessions.push({
      id: `bs-lunch-${date}`,
      type: 'lunch',
      startTime: bStart,
      endTime: bEnd,
      durationSeconds: bDur,
      isPaid: false,
      source: 'IMPORTED',
    });
    totalBreakSec += bDur;
  }

  if (entry2 && exit2) {
    const s2Start = `${date}T${entry2}`;
    const s2End = `${date}T${exit2}`;
    const dur2 = Math.max(0, Math.round((new Date(s2End).getTime() - new Date(s2Start).getTime()) / 1000));
    workSessions.push({
      id: `ws-2-${date}`,
      startTime: s2Start,
      endTime: s2End,
      durationSeconds: dur2,
      status: 'COMPLETED',
      source: 'IMPORTED',
    });
  }

  // Single session fallback
  if (workSessions.length === 0 && firstPunchIn && lastPunchOut) {
    const startMs = new Date(firstPunchIn).getTime();
    const endMs = new Date(lastPunchOut).getTime();
    const officeSpan = Math.max(0, Math.floor((endMs - startMs) / 1000));
    // Single punch in / punch out: no lunch break is deducted
    const takesLunch = false;
    const lunchSec = 0;
    workSessions.push({
      id: `ws-1-${date}`,
      startTime: firstPunchIn,
      endTime: lastPunchOut,
      durationSeconds: officeSpan,
      status: 'COMPLETED',
      source: 'IMPORTED',
    });
    if (takesLunch) {
      breakSessions.push({
        id: `bs-lunch-${date}`,
        type: 'lunch',
        startTime: `${date}T13:30:00`,
        endTime: `${date}T14:30:00`,
        durationSeconds: lunchSec,
        isPaid: false,
        source: 'IMPORTED',
      });
      totalBreakSec += lunchSec;
    }
  }

  // Work Duration Priority:
  // If official workDuration is present, parse it directly (hh:mm)
  if (workDuration) {
    const [wh, wm] = workDuration.split(':').map(Number);
    totalActiveSec = wh * 3600 + wm * 60;
    if (workSessions.length === 1 && !entry2 && !exit2) {
      workSessions[0].durationSeconds = totalActiveSec;
    }
  } else if (workSessions.length > 0) {
    totalActiveSec = workSessions.reduce((acc, ws) => acc + ws.durationSeconds, 0);
  } else if (firstPunchIn && lastPunchOut) {
    const startMs = new Date(firstPunchIn).getTime();
    const endMs = new Date(lastPunchOut).getTime();
    const officeSpan = Math.max(0, Math.floor((endMs - startMs) / 1000));
    totalActiveSec = officeSpan;
  }

  const overtimeSeconds = Math.max(0, totalActiveSec - requiredSeconds);
  const creditedNormalSeconds = Math.min(totalActiveSec, requiredSeconds);

  const isHalfDay = rawStatus === '½Present' || rawStatus === 'HALF_DAY';
  const status: AttendanceStatus = isHalfDay ? 'half_day' : (totalActiveSec >= requiredSeconds * 0.5 ? 'PRESENT' : 'PARTIAL');

  const firstTimeStr = (inTime || entry1 || '').substring(0, 8);
  const lastTimeStr = (outTime || exit2 || exit1 || '').substring(0, 8);

  const isLateEntry = firstTimeStr ? firstTimeStr > '09:00:00' : false;
  const isEarlyExit = lastTimeStr ? lastTimeStr < '18:00:00' : false;

  return {
    id: `att-${date}`,
    date,
    status,
    workdayStatus: isHalfDay ? 'PARTIAL' : (totalActiveSec >= requiredSeconds ? 'COMPLETED' : 'PARTIAL'),
    totalActiveSeconds: totalActiveSec,
    creditedNormalSeconds,
    totalBreakSeconds: totalBreakSec,
    overtimeSeconds,
    firstPunchIn,
    lastPunchOut,
    workSessions,
    breakSessions,
    source: 'IMPORTED',
    isLateEntry,
    isEarlyExit,
    notes: isHalfDay ? 'Half Day Present' : (rawStatus === 'Present' ? 'Full Day Present' : undefined),
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
