// ============================================================================
// SALARYPULSE — EXTENDED SEPTEMBER ATTENDANCE DAYS (2026-09-07 to 2026-09-16)
// Completes the full 82-day career history dataset through September 16, 2026
// ============================================================================

import { AttendanceDay } from '../types';

export const SEPTEMBER_EXTENDED_ATTENDANCE_DAYS: AttendanceDay[] = [
  {
    id: "att-2026-09-07",
    date: "2026-09-07",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29640,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4140,
    overtimeSeconds: 840,
    workSessions: [
      {
        id: "ws-1788785834714",
        attendanceDayId: "att-2026-09-07",
        startTime: "2026-09-07T09:04:00",
        durationSeconds: 18000,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-07T09:04:00",
        updatedAt: "2026-09-07T14:04:00",
        endTime: "2026-09-07T14:04:00"
      },
      {
        id: "ws-1788785877188",
        attendanceDayId: "att-2026-09-07",
        startTime: "2026-09-07T15:13:00",
        durationSeconds: 11100,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-07T15:13:00",
        updatedAt: "2026-09-07T18:18:00",
        endTime: "2026-09-07T18:18:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1788785857265",
        type: "lunch",
        startTime: "2026-09-07T14:04:00",
        durationSeconds: 4140,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 9m)",
        createdAt: "2026-09-07T14:04:00",
        updatedAt: "2026-09-07T15:13:00",
        endTime: "2026-09-07T15:13:00"
      }
    ],
    source: "MANUAL",
    firstPunchIn: "2026-09-07T09:04:00",
    updatedAt: "2026-09-07T18:18:00",
    finishedAt: "2026-09-07T18:18:00",
    lastPunchOut: "2026-09-07T18:18:00",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-08",
    date: "2026-09-08",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29040,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4800,
    overtimeSeconds: 240,
    workSessions: [
      {
        id: "ws-1788838499518",
        attendanceDayId: "att-2026-09-08",
        startTime: "2026-09-08T09:03:00",
        durationSeconds: 17340,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-08T09:03:00",
        updatedAt: "2026-09-08T13:52:00",
        endTime: "2026-09-08T13:52:00"
      },
      {
        id: "ws-1788860643065",
        attendanceDayId: "att-2026-09-08",
        startTime: "2026-09-08T15:12:00",
        durationSeconds: 10500,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-08T15:12:00",
        updatedAt: "2026-09-08T18:07:00",
        endTime: "2026-09-08T18:07:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1788860636467",
        type: "lunch",
        startTime: "2026-09-08T13:52:00",
        durationSeconds: 4800,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 20m)",
        createdAt: "2026-09-08T13:52:00",
        updatedAt: "2026-09-08T15:12:00",
        endTime: "2026-09-08T15:12:00"
      }
    ],
    source: "MANUAL",
    firstPunchIn: "2026-09-08T09:03:00",
    updatedAt: "2026-09-08T18:07:00",
    finishedAt: "2026-09-08T18:07:00",
    lastPunchOut: "2026-09-08T18:07:00",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-09",
    date: "2026-09-09",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29220,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4260,
    overtimeSeconds: 420,
    workSessions: [
      {
        id: "ws-1788924854459",
        attendanceDayId: "att-2026-09-09",
        startTime: "2026-09-09T09:02:00",
        durationSeconds: 17820,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-09T09:02:00",
        updatedAt: "2026-09-09T13:59:00",
        endTime: "2026-09-09T13:59:00"
      },
      {
        id: "ws-1788946899953",
        attendanceDayId: "att-2026-09-09",
        startTime: "2026-09-09T15:10:00",
        durationSeconds: 10740,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-09T15:10:00",
        updatedAt: "2026-09-09T18:09:00",
        endTime: "2026-09-09T18:09:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1788946892143",
        type: "lunch",
        startTime: "2026-09-09T13:59:00",
        durationSeconds: 4260,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 11m)",
        createdAt: "2026-09-09T13:59:00",
        updatedAt: "2026-09-09T15:10:00",
        endTime: "2026-09-09T15:10:00"
      }
    ],
    source: "MANUAL",
    firstPunchIn: "2026-09-09T09:02:00",
    updatedAt: "2026-09-09T18:09:00",
    finishedAt: "2026-09-09T18:09:00",
    lastPunchOut: "2026-09-09T18:09:00",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-10",
    date: "2026-09-10",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29040,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4020,
    overtimeSeconds: 240,
    workSessions: [
      {
        id: "ws-1789031576031",
        attendanceDayId: "att-2026-09-10",
        startTime: "2026-09-10T09:03:00",
        durationSeconds: 18000,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-10T09:03:00",
        updatedAt: "2026-09-10T14:03:00",
        endTime: "2026-09-10T14:03:00"
      },
      {
        id: "ws-1789056392566",
        attendanceDayId: "att-2026-09-10",
        startTime: "2026-09-10T15:10:00",
        durationSeconds: 10620,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-10T15:10:00",
        updatedAt: "2026-09-10T18:07:00",
        endTime: "2026-09-10T18:07:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1789031589356",
        type: "lunch",
        startTime: "2026-09-10T14:03:00",
        durationSeconds: 4020,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 7m)",
        createdAt: "2026-09-10T14:03:00",
        updatedAt: "2026-09-10T15:10:00",
        endTime: "2026-09-10T15:10:00"
      }
    ],
    source: "MANUAL",
    firstPunchIn: "2026-09-10T09:03:00",
    updatedAt: "2026-09-10T18:07:00",
    finishedAt: "2026-09-10T18:07:00",
    lastPunchOut: "2026-09-10T18:07:00",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-11",
    date: "2026-09-11",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29050,
    creditedNormalSeconds: 28800,
    totalBreakSeconds: 4200,
    overtimeSeconds: 250,
    workSessions: [
      {
        id: "ws-1789097670446",
        attendanceDayId: "att-2026-09-11",
        startTime: "2026-09-11T09:03:00",
        durationSeconds: 18000,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-11T09:03:00",
        updatedAt: "2026-09-11T14:03:00",
        endTime: "2026-09-11T14:03:00"
      },
      {
        id: "ws-1789127548665",
        attendanceDayId: "att-2026-09-11",
        startTime: "2026-09-11T15:13:00",
        durationSeconds: 10200,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-11T15:13:00",
        updatedAt: "2026-09-11T12:37:36.165Z",
        endTime: "2026-09-11T18:03:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1789116176035",
        type: "lunch",
        startTime: "2026-09-11T14:03:00",
        durationSeconds: 4200,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 10m)",
        createdAt: "2026-09-11T14:03:00",
        updatedAt: "2026-09-11T15:13:00",
        endTime: "2026-09-11T15:13:00"
      }
    ],
    source: "MANUAL",
    createdAt: "2026-09-11T03:34:23.551Z",
    updatedAt: "2026-09-11T12:37:36.165Z",
    firstPunchIn: "2026-09-11T09:03:00",
    finishedAt: "2026-09-11T18:07:10",
    lastPunchOut: "2026-09-11T18:07:10",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-12",
    date: "2026-09-12",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29040,
    creditedNormalSeconds: 28800,
    totalBreakSeconds: 4080,
    overtimeSeconds: 240,
    firstPunchIn: "2026-09-12T09:04:00",
    lastPunchOut: "2026-09-12T18:08:00",
    workSessions: [
      {
        id: "ws-2026-09-12-1",
        attendanceDayId: "att-2026-09-12",
        startTime: "2026-09-12T09:04:00",
        endTime: "2026-09-12T14:08:00",
        durationSeconds: 18240,
        status: "COMPLETED",
        source: "DEVICE",
        note: "Pre-Lunch Shift",
        createdAt: "2026-09-12T09:04:00",
        updatedAt: "2026-09-15T18:55:44.192Z"
      },
      {
        id: "ws-2026-09-12-2",
        attendanceDayId: "att-2026-09-12",
        startTime: "2026-09-12T15:16:00",
        endTime: "2026-09-12T18:08:00",
        durationSeconds: 10320,
        status: "COMPLETED",
        source: "DEVICE",
        note: "Post-Lunch Shift",
        createdAt: "2026-09-12T15:16:00",
        updatedAt: "2026-09-15T18:55:44.192Z"
      }
    ],
    breakSessions: [
      {
        id: "bs-2026-09-12-1",
        type: "lunch",
        startTime: "2026-09-12T14:08:00",
        endTime: "2026-09-12T15:16:00",
        durationSeconds: 4080,
        isPaid: false,
        source: "DEVICE",
        note: "Lunch Break"
      }
    ],
    notes: "",
    source: "DEVICE",
    updatedAt: "2026-09-15T18:55:44.192Z"
  },
  {
    id: "att-2026-09-14",
    date: "2026-09-14",
    status: "PRESENT",
    workdayStatus: "PARTIAL",
    totalActiveSeconds: 21540,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 3600,
    overtimeSeconds: 0,
    firstPunchIn: "2026-09-14T09:07:00",
    lastPunchOut: "2026-09-14T16:06:00",
    workSessions: [
      {
        id: "ws-2026-09-14-1",
        attendanceDayId: "att-2026-09-14",
        startTime: "2026-09-14T09:07:00",
        endTime: "2026-09-14T13:00:00",
        durationSeconds: 13980,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Pre-Lunch Shift",
        createdAt: "2026-09-14T09:07:00",
        updatedAt: "2026-09-15T18:54:44.048Z"
      },
      {
        id: "ws-2026-09-14-2",
        attendanceDayId: "att-2026-09-14",
        startTime: "2026-09-14T14:00:00",
        endTime: "2026-09-14T16:06:00",
        durationSeconds: 7560,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Post-Lunch Shift",
        createdAt: "2026-09-14T14:00:00",
        updatedAt: "2026-09-15T18:54:44.048Z"
      }
    ],
    breakSessions: [
      {
        id: "bs-2026-09-14-1",
        type: "lunch",
        startTime: "2026-09-14T13:00:00",
        endTime: "2026-09-14T14:00:00",
        durationSeconds: 3600,
        isPaid: false,
        source: "MANUAL",
        note: "Lunch Break"
      }
    ],
    notes: "Workday concluded",
    source: "MANUAL",
    updatedAt: "2026-09-15T18:54:44.048Z"
  },
  {
    id: "att-2026-09-15",
    date: "2026-09-15",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 28980,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4200,
    overtimeSeconds: 180,
    workSessions: [
      {
        id: "ws-1789461971624",
        attendanceDayId: "att-2026-09-15",
        startTime: "2026-09-15T09:06:00",
        durationSeconds: 17760,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-15T09:06:00",
        updatedAt: "2026-09-15T14:02:00",
        endTime: "2026-09-15T14:02:00"
      },
      {
        id: "ws-1789465851738",
        attendanceDayId: "att-2026-09-15",
        startTime: "2026-09-15T15:12:00",
        durationSeconds: 10620,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-15T15:12:00",
        updatedAt: "2026-09-15T18:09:00",
        endTime: "2026-09-15T18:09:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1789461983709",
        type: "lunch",
        startTime: "2026-09-15T14:02:00",
        durationSeconds: 4200,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 10m)",
        createdAt: "2026-09-15T14:02:00",
        updatedAt: "2026-09-15T15:12:00",
        endTime: "2026-09-15T15:12:00"
      }
    ],
    source: "MANUAL",
    createdAt: "2026-09-15T08:45:56.524Z",
    updatedAt: "2026-09-15T18:09:00",
    firstPunchIn: "2026-09-15T09:06:00",
    finishedAt: "2026-09-15T18:09:00",
    lastPunchOut: "2026-09-15T18:09:00",
    notes: "Workday concluded"
  },
  {
    id: "att-2026-09-16",
    date: "2026-09-16",
    status: "PRESENT",
    workdayStatus: "COMPLETED",
    totalActiveSeconds: 29220,
    creditedNormalSeconds: 0,
    totalBreakSeconds: 4200,
    overtimeSeconds: 420,
    workSessions: [
      {
        id: "ws-1789529867003",
        attendanceDayId: "att-2026-09-16",
        startTime: "2026-09-16T09:04:00",
        durationSeconds: 18120,
        status: "COMPLETED",
        source: "MANUAL",
        note: "General Work Session",
        createdAt: "2026-09-16T09:04:00",
        updatedAt: "2026-09-16T14:06:00",
        endTime: "2026-09-16T14:06:00"
      },
      {
        id: "ws-1789559204005",
        attendanceDayId: "att-2026-09-16",
        startTime: "2026-09-16T15:16:00",
        durationSeconds: 10500,
        status: "COMPLETED",
        source: "MANUAL",
        note: "Work Resumed",
        createdAt: "2026-09-16T15:16:00",
        updatedAt: "2026-09-16T18:11:00",
        endTime: "2026-09-16T18:11:00"
      }
    ],
    breakSessions: [
      {
        id: "bs-1789547865184",
        type: "lunch",
        startTime: "2026-09-16T14:06:00",
        durationSeconds: 4200,
        isPaid: false,
        source: "MANUAL",
        note: "LUNCH Break (1 Hour Lunch Over · Delayed by 10m)",
        createdAt: "2026-09-16T14:06:00",
        updatedAt: "2026-09-16T15:16:00",
        endTime: "2026-09-16T15:16:00"
      }
    ],
    source: "MANUAL",
    createdAt: "2026-09-16T03:37:37.209Z",
    updatedAt: "2026-09-16T18:11:00",
    firstPunchIn: "2026-09-16T09:04:00",
    finishedAt: "2026-09-16T18:11:00",
    lastPunchOut: "2026-09-16T18:11:00",
    notes: "Workday concluded"
  }
];
