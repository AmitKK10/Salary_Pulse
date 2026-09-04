// ============================================================================
// SALARYPULSE — SAMPLE OFFICE BIOMETRIC ATTENDANCE DATA & DOCUMENTS
// Authentic Indian corporate biometric exports (Matrix, ESSL, Keka, Darwinbox)
// ============================================================================

import { ExtractedDayRecord, ExtractedEmployee } from '../types/reconciliation';

export interface SampleReportPackage {
  id: string;
  name: string;
  badge: string;
  fileName: string;
  companyName: string;
  period: string;
  description: string;
  targetEmployeeName: string;
  employees: ExtractedEmployee[];
  records: ExtractedDayRecord[];
  rawText: string;
}

export const SAMPLE_OFFICE_REPORTS: SampleReportPackage[] = [
  {
    id: 'matrix-cosec-aug-2026-amit',
    name: 'Office Biometric Punch Report (August 2026)',
    badge: 'RECOMMENDED FOR AMIT',
    fileName: 'TechCorp_Biometric_Monthly_Aug_2026.pdf',
    companyName: 'TechCorp Solutions Pvt. Ltd. (Bengaluru SEZ)',
    period: '01-Aug-2026 to 31-Aug-2026',
    description: 'Matrix COSEC biometric swipe export containing 31 days with official punch logs, overtime approvals, and lunch breaks.',
    targetEmployeeName: 'Amit Kumar',
    employees: [
      {
        employeeId: 'EMP-1042',
        name: 'Amit Kumar',
        department: 'Core Platform Engineering',
        designation: 'Senior Lead Software Engineer',
        totalRecordsCount: 31,
        isTargetMatch: true,
      },
      {
        employeeId: 'EMP-1088',
        name: 'Priya Sharma',
        department: 'Product Management',
        designation: 'Product Lead',
        totalRecordsCount: 31,
        isTargetMatch: false,
      },
      {
        employeeId: 'EMP-1104',
        name: 'Rajesh Patel',
        department: 'DevOps & Cloud Ops',
        designation: 'Staff SRE',
        totalRecordsCount: 31,
        isTargetMatch: false,
      },
    ],
    records: [
      {
        date: '2026-08-01',
        dayName: 'Saturday',
        shift: '09:00 - 18:00',
        inTime: '09:02 AM',
        outTime: '06:14 PM',
        totalDurationHours: 9.2,
        workDurationSeconds: 29640, // 8h 14m
        overtimeSeconds: 840,      // 14 min OT
        overtimeHours: 0.23,
        status: 'PRESENT',
        remarks: 'Punched at Gate-2 biometric. 14 min OT.',
        rawPunches: ['09:02', '13:10', '14:10', '18:14'],
      },
      {
        date: '2026-08-02',
        dayName: 'Sunday',
        shift: 'OFF',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'WEEKLY_OFF',
        remarks: 'Scheduled Weekly Off',
        rawPunches: [],
      },
      {
        date: '2026-08-03',
        dayName: 'Monday',
        shift: '09:00 - 18:00',
        inTime: '09:04 AM',
        outTime: '07:42 PM',
        totalDurationHours: 10.63,
        workDurationSeconds: 34920, // 9h 42m
        overtimeSeconds: 6120,     // 1h 42m OT
        overtimeHours: 1.7,
        status: 'PRESENT',
        remarks: 'Production release shift. OT 1h 42m approved by Manager.',
        rawPunches: ['09:04', '13:15', '14:15', '19:42'],
      },
      {
        date: '2026-08-04',
        dayName: 'Tuesday',
        shift: '09:00 - 18:00',
        inTime: '08:58 AM',
        outTime: '06:30 PM',
        totalDurationHours: 9.53,
        workDurationSeconds: 30720, // 8h 32m
        overtimeSeconds: 1920,     // 32 min OT
        overtimeHours: 0.53,
        status: 'PRESENT',
        remarks: 'Normal day + 32m overtime.',
        rawPunches: ['08:58', '13:00', '14:00', '18:30'],
      },
      {
        date: '2026-08-05',
        dayName: 'Wednesday',
        shift: '09:00 - 18:00',
        inTime: '09:05 AM',
        outTime: '06:05 PM',
        totalDurationHours: 9.0,
        workDurationSeconds: 28800, // 8h 00m
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PRESENT',
        remarks: 'Standard 8h working day.',
        rawPunches: ['09:05', '13:30', '14:30', '18:05'],
      },
      {
        date: '2026-08-06',
        dayName: 'Thursday',
        shift: '09:00 - 18:00',
        inTime: '09:12 AM',
        outTime: '07:15 PM',
        totalDurationHours: 10.05,
        workDurationSeconds: 32580, // 9h 03m
        overtimeSeconds: 3780,     // 1h 03m OT
        overtimeHours: 1.05,
        status: 'PRESENT',
        remarks: 'Sprint planning session. Approved 1h 03m OT.',
        rawPunches: ['09:12', '13:00', '14:00', '19:15'],
      },
      {
        date: '2026-08-07',
        dayName: 'Friday',
        shift: '09:00 - 18:00',
        inTime: '08:55 AM',
        outTime: '08:10 PM',
        totalDurationHours: 11.25,
        workDurationSeconds: 36900, // 10h 15m
        overtimeSeconds: 8100,     // 2h 15m OT
        overtimeHours: 2.25,
        status: 'PRESENT',
        remarks: 'Client live demo night. 2h 15m OT approved.',
        rawPunches: ['08:55', '13:10', '14:10', '20:10'],
      },
      {
        date: '2026-08-08',
        dayName: 'Saturday',
        shift: '09:00 - 18:00',
        inTime: '10:00 AM',
        outTime: '03:30 PM',
        totalDurationHours: 5.5,
        workDurationSeconds: 19800, // 5.5h (Special weekend project support)
        overtimeSeconds: 19800,    // All weekend hours treated as OT
        overtimeHours: 5.5,
        status: 'PRESENT',
        remarks: 'Special Saturday deployment sprint. Weekend OT authorized.',
        rawPunches: ['10:00', '15:30'],
      },
      {
        date: '2026-08-09',
        dayName: 'Sunday',
        shift: 'OFF',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'WEEKLY_OFF',
        remarks: 'Weekly Off',
        rawPunches: [],
      },
      {
        date: '2026-08-10',
        dayName: 'Monday',
        shift: '09:00 - 18:00',
        inTime: '09:02 AM',
        outTime: '06:08 PM',
        totalDurationHours: 9.1,
        workDurationSeconds: 29160, // 8h 06m
        overtimeSeconds: 360,
        overtimeHours: 0.1,
        status: 'PRESENT',
        remarks: 'Present, 6 min OT.',
        rawPunches: ['09:02', '13:00', '14:00', '18:08'],
      },
      {
        date: '2026-08-11',
        dayName: 'Tuesday',
        shift: '09:00 - 18:00',
        inTime: '08:59 AM',
        outTime: '06:12 PM',
        totalDurationHours: 9.21,
        workDurationSeconds: 29580, // 8h 13m
        overtimeSeconds: 780,
        overtimeHours: 0.21,
        status: 'PRESENT',
        remarks: 'Present on time.',
        rawPunches: ['08:59', '13:15', '14:15', '18:12'],
      },
      {
        date: '2026-08-12',
        dayName: 'Wednesday',
        shift: '09:00 - 18:00',
        inTime: '09:10 AM',
        outTime: '06:15 PM',
        totalDurationHours: 9.08,
        workDurationSeconds: 29100, // 8h 05m
        overtimeSeconds: 300,
        overtimeHours: 0.08,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:10', '13:00', '14:00', '18:15'],
      },
      {
        date: '2026-08-13',
        dayName: 'Thursday',
        shift: '09:00 - 18:00',
        inTime: '09:00 AM',
        outTime: '06:00 PM',
        totalDurationHours: 9.0,
        workDurationSeconds: 28800, // 8h 00m
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PRESENT',
        remarks: 'Standard shift.',
        rawPunches: ['09:00', '13:00', '14:00', '18:00'],
      },
      {
        date: '2026-08-14',
        dayName: 'Friday',
        shift: '09:00 - 18:00',
        inTime: '09:05 AM',
        outTime: '07:30 PM',
        totalDurationHours: 10.41,
        workDurationSeconds: 33900, // 9h 25m
        overtimeSeconds: 5100,     // 1h 25m OT
        overtimeHours: 1.41,
        status: 'PRESENT',
        remarks: 'Pre-Independence Day release. 1h 25m OT.',
        rawPunches: ['09:05', '13:00', '14:00', '19:30'],
      },
      {
        date: '2026-08-15',
        dayName: 'Saturday',
        shift: 'HOLIDAY',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PAID_HOLIDAY',
        remarks: 'Independence Day (National Paid Holiday)',
        rawPunches: [],
      },
      {
        date: '2026-08-16',
        dayName: 'Sunday',
        shift: 'OFF',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'WEEKLY_OFF',
        remarks: 'Weekly Off',
        rawPunches: [],
      },
      {
        date: '2026-08-17',
        dayName: 'Monday',
        shift: '09:00 - 18:00',
        inTime: '09:04 AM',
        outTime: '06:20 PM',
        totalDurationHours: 9.26,
        workDurationSeconds: 29760, // 8h 16m
        overtimeSeconds: 960,
        overtimeHours: 0.26,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:04', '13:00', '14:00', '18:20'],
      },
      {
        date: '2026-08-18',
        dayName: 'Tuesday',
        shift: '09:00 - 18:00',
        inTime: '09:00 AM',
        outTime: '06:05 PM',
        totalDurationHours: 9.08,
        workDurationSeconds: 29100, // 8h 05m
        overtimeSeconds: 300,
        overtimeHours: 0.08,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:00', '13:00', '14:00', '18:05'],
      },
      {
        date: '2026-08-19',
        dayName: 'Wednesday',
        shift: '09:00 - 18:00',
        inTime: '09:15 AM',
        outTime: '06:30 PM',
        totalDurationHours: 9.25,
        workDurationSeconds: 29700, // 8h 15m
        overtimeSeconds: 900,
        overtimeHours: 0.25,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:15', '13:15', '14:15', '18:30'],
      },
      {
        date: '2026-08-20',
        dayName: 'Thursday',
        shift: '09:00 - 18:00',
        inTime: '08:58 AM',
        outTime: '06:10 PM',
        totalDurationHours: 9.2,
        workDurationSeconds: 29520, // 8h 12m
        overtimeSeconds: 720,
        overtimeHours: 0.2,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['08:58', '13:00', '14:00', '18:10'],
      },
      {
        date: '2026-08-21',
        dayName: 'Friday',
        shift: '09:00 - 18:00',
        inTime: '09:02 AM',
        outTime: '07:45 PM',
        totalDurationHours: 10.71,
        workDurationSeconds: 34980, // 9h 43m
        overtimeSeconds: 6180,     // 1h 43m OT
        overtimeHours: 1.71,
        status: 'PRESENT',
        remarks: 'Bug bash evening. Approved OT.',
        rawPunches: ['09:02', '13:00', '14:00', '19:45'],
      },
      {
        date: '2026-08-22',
        dayName: 'Saturday',
        shift: '09:00 - 18:00',
        inTime: '09:00 AM',
        outTime: '06:00 PM',
        totalDurationHours: 9.0,
        workDurationSeconds: 28800,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PRESENT',
        remarks: 'Working Saturday.',
        rawPunches: ['09:00', '13:00', '14:00', '18:00'],
      },
      {
        date: '2026-08-23',
        dayName: 'Sunday',
        shift: 'OFF',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'WEEKLY_OFF',
        remarks: 'Weekly Off',
        rawPunches: [],
      },
      {
        date: '2026-08-24',
        dayName: 'Monday',
        shift: '09:00 - 18:00',
        inTime: '09:03 AM',
        outTime: '06:03 PM',
        totalDurationHours: 9.0,
        workDurationSeconds: 28800,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:03', '13:00', '14:00', '18:03'],
      },
      {
        date: '2026-08-25',
        dayName: 'Tuesday',
        shift: '09:00 - 18:00',
        inTime: '09:00 AM',
        outTime: '06:10 PM',
        totalDurationHours: 9.16,
        workDurationSeconds: 29400,
        overtimeSeconds: 600,
        overtimeHours: 0.16,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:00', '13:00', '14:00', '18:10'],
      },
      {
        date: '2026-08-26',
        dayName: 'Wednesday',
        shift: '09:00 - 18:00',
        inTime: '09:10 AM',
        outTime: '06:15 PM',
        totalDurationHours: 9.08,
        workDurationSeconds: 29100,
        overtimeSeconds: 300,
        overtimeHours: 0.08,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:10', '13:00', '14:00', '18:15'],
      },
      {
        date: '2026-08-27',
        dayName: 'Thursday',
        shift: '09:00 - 18:00',
        inTime: '08:55 AM',
        outTime: '06:05 PM',
        totalDurationHours: 9.16,
        workDurationSeconds: 29400,
        overtimeSeconds: 600,
        overtimeHours: 0.16,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['08:55', '13:00', '14:00', '18:05'],
      },
      {
        date: '2026-08-28',
        dayName: 'Friday',
        shift: '09:00 - 18:00',
        inTime: '09:00 AM',
        outTime: '08:30 PM',
        totalDurationHours: 11.5,
        workDurationSeconds: 37800, // 10.5h
        overtimeSeconds: 9000,     // 2.5h OT
        overtimeHours: 2.5,
        status: 'PRESENT',
        remarks: 'End-of-month financial audit deployment. 2h 30m OT approved.',
        rawPunches: ['09:00', '13:00', '14:00', '20:30'],
      },
      {
        date: '2026-08-29',
        dayName: 'Saturday',
        shift: '09:00 - 18:00',
        inTime: '09:04 AM',
        outTime: '06:04 PM',
        totalDurationHours: 9.0,
        workDurationSeconds: 28800,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'PRESENT',
        remarks: 'Present.',
        rawPunches: ['09:04', '13:00', '14:00', '18:04'],
      },
      {
        date: '2026-08-30',
        dayName: 'Sunday',
        shift: 'OFF',
        inTime: '--:--',
        outTime: '--:--',
        totalDurationHours: 0,
        workDurationSeconds: 0,
        overtimeSeconds: 0,
        overtimeHours: 0,
        status: 'WEEKLY_OFF',
        remarks: 'Weekly Off',
        rawPunches: [],
      },
      {
        date: '2026-08-31',
        dayName: 'Monday',
        shift: '09:00 - 18:00',
        inTime: '09:02 AM',
        outTime: '06:05 PM',
        totalDurationHours: 9.05,
        workDurationSeconds: 28980,
        overtimeSeconds: 180,
        overtimeHours: 0.05,
        status: 'PRESENT',
        remarks: 'Month-end wrap up.',
        rawPunches: ['09:02', '13:00', '14:00', '18:05'],
      },
    ],
    rawText: `================================================================================
COMPANY: TechCorp Solutions Pvt. Ltd.
DOCUMENT: Monthly Biometric Attendance & Shift Reconciliation Report
PERIOD: 01-Aug-2026 to 31-Aug-2026
SYSTEM: Matrix COSEC Biometric Server v8.4.2
================================================================================
EMPLOYEE RECORDS FOUND IN BATCH:
1. EMP-1042 | Amit Kumar | Core Platform Engineering | Senior Lead Software Engineer
2. EMP-1088 | Priya Sharma | Product Management | Product Lead
3. EMP-1104 | Rajesh Patel | DevOps & Cloud Ops | Staff SRE

--------------------------------------------------------------------------------
ATTENDANCE LOGS FOR: Amit Kumar (EMP-1042)
--------------------------------------------------------------------------------
DATE         DAY   SHIFT         IN PUNCH   OUT PUNCH  WORK DURATION  OT EARNED  STATUS
2026-08-01   SAT   09:00-18:00   09:02 AM   06:14 PM   08h 14m        00h 14m    PRESENT
2026-08-02   SUN   OFF           --:--      --:--      00h 00m        00h 00m    WEEKLY_OFF
2026-08-03   MON   09:00-18:00   09:04 AM   07:42 PM   09h 42m        01h 42m    PRESENT (Approved OT)
2026-08-04   TUE   09:00-18:00   08:58 AM   06:30 PM   08h 32m        00h 32m    PRESENT
2026-08-05   WED   09:00-18:00   09:05 AM   06:05 PM   08h 00m        00h 00m    PRESENT
2026-08-06   THU   09:00-18:00   09:12 AM   07:15 PM   09h 03m        01h 03m    PRESENT (Approved OT)
2026-08-07   FRI   09:00-18:00   08:55 AM   08:10 PM   10h 15m        02h 15m    PRESENT (Approved OT)
2026-08-08   SAT   09:00-18:00   10:00 AM   03:30 PM   05h 30m        05h 30m    PRESENT (Weekend OT)
2026-08-09   SUN   OFF           --:--      --:--      00h 00m        00h 00m    WEEKLY_OFF
2026-08-10   MON   09:00-18:00   09:02 AM   06:08 PM   08h 06m        00h 06m    PRESENT
2026-08-11   TUE   09:00-18:00   08:59 AM   06:12 PM   08h 13m        00h 13m    PRESENT
2026-08-12   WED   09:00-18:00   09:10 AM   06:15 PM   08h 05m        00h 05m    PRESENT
2026-08-13   THU   09:00-18:00   09:00 AM   06:00 PM   08h 00m        00h 00m    PRESENT
2026-08-14   FRI   09:00-18:00   09:05 AM   07:30 PM   09h 25m        01h 25m    PRESENT (Approved OT)
2026-08-15   SAT   HOLIDAY       --:--      --:--      00h 00m        00h 00m    PAID_HOLIDAY
2026-08-16   SUN   OFF           --:--      --:--      00h 00m        00h 00m    WEEKLY_OFF
2026-08-17   MON   09:00-18:00   09:04 AM   06:20 PM   08h 16m        00h 16m    PRESENT
2026-08-18   TUE   09:00-18:00   09:00 AM   06:05 PM   08h 05m        00h 05m    PRESENT
2026-08-19   WED   09:00-18:00   09:15 AM   06:30 PM   08h 15m        00h 15m    PRESENT
2026-08-20   THU   09:00-18:00   08:58 AM   06:10 PM   08h 12m        00h 12m    PRESENT
2026-08-21   FRI   09:00-18:00   09:02 AM   07:45 PM   09h 43m        01h 43m    PRESENT (Approved OT)
2026-08-22   SAT   09:00-18:00   09:00 AM   06:00 PM   08h 00m        00h 00m    PRESENT
2026-08-23   SUN   OFF           --:--      --:--      00h 00m        00h 00m    WEEKLY_OFF
2026-08-24   MON   09:00-18:00   09:03 AM   06:03 PM   08h 00m        00h 00m    PRESENT
2026-08-25   TUE   09:00-18:00   09:00 AM   06:10 PM   08h 10m        00h 10m    PRESENT
2026-08-26   WED   09:00-18:00   09:10 AM   06:15 PM   08h 05m        00h 05m    PRESENT
2026-08-27   THU   09:00-18:00   08:55 AM   06:05 PM   08h 10m        00h 10m    PRESENT
2026-08-28   FRI   09:00-18:00   09:00 AM   08:30 PM   10h 30m        02h 30m    PRESENT (Approved OT)
2026-08-29   SAT   09:00-18:00   09:04 AM   06:04 PM   08h 00m        00h 00m    PRESENT
2026-08-30   SUN   OFF           --:--      --:--      00h 00m        00h 00m    WEEKLY_OFF
2026-08-31   MON   09:00-18:00   09:02 AM   06:05 PM   08h 03m        00h 03m    PRESENT
================================================================================`,
  },
];
