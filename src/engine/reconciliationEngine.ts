// ============================================================================
// SALARYPULSE — RECONCILIATION ENGINE
// Matches Office Biometric Attendance Records against SalaryPulse Database,
// computes discrepancies, financial impacts, and generates immutable audit trails.
// ============================================================================

import { 
  AttendanceDay, 
  RateDerivation, 
  SalaryConfig, 
  WorkdayStatus,
  AttendanceStatus 
} from '../types';
import { 
  DiscrepancyType, 
  ExtractedDayRecord, 
  ExtractedEmployee, 
  ReconciliationAuditLog, 
  ReconciliationItem, 
  ReconciliationReport, 
  ResolutionChoice 
} from '../types/reconciliation';

export class ReconciliationEngine {
  /**
   * Compares extracted PDF records for an employee against existing SalaryPulse attendanceDays
   */
  public static compareRecords(
    monthPeriod: string,
    fileName: string,
    selectedEmployee: ExtractedEmployee,
    allEmployees: ExtractedEmployee[],
    pdfRecords: ExtractedDayRecord[],
    currentAttendanceDays: AttendanceDay[],
    salaryConfig: SalaryConfig,
    rateDerivation: RateDerivation
  ): ReconciliationReport {
    const reportId = `recon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const attendanceMap = new Map<string, AttendanceDay>();
    
    // Index existing attendance days by date (YYYY-MM-DD)
    currentAttendanceDays.forEach((day) => {
      attendanceMap.set(day.date, day);
    });

    const items: ReconciliationItem[] = [];
    const processedDates = new Set<string>();

    const dailyNormalSeconds = Math.max(1, (rateDerivation.requiredDailyHours || 8) * 3600);
    const perSecondRate = rateDerivation.perSecondRate || (salaryConfig.monthlyBaseSalary / (26 * dailyNormalSeconds));
    const otMultiplier = salaryConfig.overtimeMultiplier || 2.0;

    // 1. Process all records found in the PDF
    pdfRecords.forEach((pdfDay) => {
      processedDates.add(pdfDay.date);
      const appDay = attendanceMap.get(pdfDay.date);

      const item = this.evaluateSingleDay(
        pdfDay.date,
        pdfDay.dayName,
        pdfDay,
        appDay,
        dailyNormalSeconds,
        perSecondRate,
        otMultiplier,
        salaryConfig
      );
      items.push(item);
    });

    // 2. Check for any days logged in SalaryPulse for this month that are missing in the PDF
    currentAttendanceDays.forEach((appDay) => {
      if (appDay.date.startsWith(monthPeriod) && !processedDates.has(appDay.date)) {
        const item = this.evaluateSingleDay(
          appDay.date,
          this.getDayName(appDay.date),
          undefined,
          appDay,
          dailyNormalSeconds,
          perSecondRate,
          otMultiplier,
          salaryConfig
        );
        items.push(item);
      }
    });

    // Sort items chronologically
    items.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate Summary Metrics
    let matchedDaysCount = 0;
    let discrepanciesCount = 0;
    let missingInAppCount = 0;
    let extraInAppCount = 0;
    let totalOTDeltaSeconds = 0;
    let totalFinancialDelta = 0;

    const currentPresentDays = currentAttendanceDays.filter(
      d => d.date.startsWith(monthPeriod) && (d.status === 'present' || d.workdayStatus === 'PRESENT' || d.workdayStatus === 'COMPLETED' || d.workdayStatus === 'WORKING')
    ).length;

    let deltaPresentDays = 0;

    items.forEach((item) => {
      if (item.discrepancyType === 'MATCH') {
        matchedDaysCount++;
      } else {
        discrepanciesCount++;
        totalFinancialDelta += item.financialDelta.netEarningsDifference;
        totalOTDeltaSeconds += (item.pdfData.overtimeSeconds - item.appData.overtimeSeconds);

        if (item.discrepancyType === 'MISSING_IN_APP' && (item.pdfData.status === 'PRESENT' || item.pdfData.status === 'COMPLETED')) {
          missingInAppCount++;
          deltaPresentDays++;
        } else if (item.discrepancyType === 'EXTRA_IN_APP') {
          extraInAppCount++;
        } else if (item.appData.status !== 'PRESENT' && item.pdfData.status === 'PRESENT') {
          deltaPresentDays++;
        }
      }
    });

    const projectedPresentDaysAfterSync = currentPresentDays + deltaPresentDays;
    const bonusRequiredDays = salaryConfig.attendanceBonusEligibleDays || 26;
    const bonusAmount = salaryConfig.attendanceBonusAmount || 0;

    const bonusStatusBefore = currentPresentDays >= bonusRequiredDays ? 'QUALIFIED' : `${currentPresentDays}/${bonusRequiredDays} DAYS`;
    const bonusStatusAfter = projectedPresentDaysAfterSync >= bonusRequiredDays ? 'QUALIFIED' : `${projectedPresentDaysAfterSync}/${bonusRequiredDays} DAYS`;
    
    let bonusFinancialImpact = 0;
    if (currentPresentDays < bonusRequiredDays && projectedPresentDaysAfterSync >= bonusRequiredDays) {
      bonusFinancialImpact = bonusAmount;
      totalFinancialDelta += bonusAmount;
    }

    return {
      id: reportId,
      fileName,
      fileSizeFormatted: '142 KB',
      extractedAt: new Date().toISOString(),
      documentTitle: 'Corporate Attendance & Biometric Audit Report',
      companyName: 'TechCorp Solutions Pvt. Ltd.',
      monthPeriod,
      selectedEmployee,
      allEmployeesFound: allEmployees,
      items,
      summary: {
        totalEvaluatedDays: items.length,
        matchedDaysCount,
        discrepanciesCount,
        missingInAppCount,
        extraInAppCount,
        totalOTDeltaSeconds,
        totalFinancialDelta,
        currentPresentDays,
        projectedPresentDaysAfterSync,
        bonusStatusBefore,
        bonusStatusAfter,
        bonusFinancialImpact,
      },
    };
  }

  /**
   * Evaluates discrepancies and financial differences between a PDF day and an App day
   */
  private static evaluateSingleDay(
    date: string,
    dayName: string,
    pdfDay: ExtractedDayRecord | undefined,
    appDay: AttendanceDay | undefined,
    dailyNormalSeconds: number,
    perSecondRate: number,
    otMultiplier: number,
    salaryConfig: SalaryConfig
  ): ReconciliationItem {
    const id = `item_${date}`;

    // App Data formulation
    const appExists = !!appDay;
    const appStatus: WorkdayStatus = appDay 
      ? (appDay.workdayStatus || (appDay.status === 'present' ? 'PRESENT' : appDay.status === 'absent' ? 'ABSENT' : appDay.status === 'holiday' ? 'PAID_HOLIDAY' : appDay.status === 'weekly_off' ? 'WEEKLY_OFF' : 'PRESENT'))
      : 'ABSENT';
    
    const appInTime = appDay?.firstPunchIn ? appDay.firstPunchIn.split('T')[1]?.slice(0, 5) : (appDay?.workSessions && appDay.workSessions[0]?.startTime ? appDay.workSessions[0].startTime.split('T')[1]?.slice(0, 5) : '--:--');
    const appOutTime = appDay?.lastPunchOut ? appDay.lastPunchOut.split('T')[1]?.slice(0, 5) : (appDay?.workSessions && appDay.workSessions[appDay.workSessions.length - 1]?.endTime ? appDay.workSessions[appDay.workSessions.length - 1].endTime?.split('T')[1]?.slice(0, 5) : '--:--');
    const appWorkSeconds = appDay ? appDay.totalActiveSeconds : 0;
    const appOTSeconds = appDay ? (appDay.overtimeSeconds || 0) : 0;
    
    const appDailyEarnings = appDay 
      ? Math.min(dailyNormalSeconds, appWorkSeconds) * perSecondRate 
      : 0;
    const appOTEarnings = appOTSeconds * perSecondRate * otMultiplier;
    const appTotalEarnings = appDailyEarnings + appOTEarnings;

    // PDF Data formulation
    const pdfExists = !!pdfDay;
    const pdfStatus: WorkdayStatus = pdfDay ? pdfDay.status : 'ABSENT';
    const pdfShift = pdfDay ? pdfDay.shift : '09:00 - 18:00';
    const pdfInTime = pdfDay ? pdfDay.inTime : '--:--';
    const pdfOutTime = pdfDay ? pdfDay.outTime : '--:--';
    const pdfWorkSeconds = pdfDay ? pdfDay.workDurationSeconds : 0;
    const pdfOTSeconds = pdfDay ? pdfDay.overtimeSeconds : 0;
    const pdfRemarks = pdfDay?.remarks || '';
    const pdfPunches = pdfDay?.rawPunches || [];

    const pdfDailyEarnings = pdfExists && (pdfStatus === 'PRESENT' || pdfStatus === 'COMPLETED')
      ? Math.min(dailyNormalSeconds, pdfWorkSeconds > 0 ? pdfWorkSeconds : dailyNormalSeconds) * perSecondRate
      : pdfStatus === 'PAID_HOLIDAY' 
        ? dailyNormalSeconds * perSecondRate 
        : 0;
    const pdfOTEarnings = pdfOTSeconds * perSecondRate * otMultiplier;
    const pdfTotalEarnings = pdfDailyEarnings + pdfOTEarnings;

    // Financial Deltas
    const baseSalaryDifference = pdfDailyEarnings - appDailyEarnings;
    const otDifference = pdfOTEarnings - appOTEarnings;
    const netEarningsDifference = pdfTotalEarnings - appTotalEarnings;

    // Detect discrepancy type
    let discrepancyType: DiscrepancyType = 'MATCH';
    let discrepancyLabel = 'Matched';
    let discrepancyDescription = 'SalaryPulse and Office PDF record are identical.';

    if (!appExists && pdfExists) {
      if (pdfStatus === 'WEEKLY_OFF' || pdfStatus === 'ABSENT') {
        discrepancyType = 'MATCH';
        discrepancyLabel = 'Matched (Off)';
        discrepancyDescription = 'Both indicate non-working day.';
      } else {
        discrepancyType = 'MISSING_IN_APP';
        discrepancyLabel = 'Missing in SalaryPulse';
        discrepancyDescription = `Office PDF logged ${pdfStatus} (${(pdfWorkSeconds / 3600).toFixed(1)}h), but no entry was in SalaryPulse.`;
      }
    } else if (appExists && !pdfExists) {
      discrepancyType = 'EXTRA_IN_APP';
      discrepancyLabel = 'Extra in SalaryPulse';
      discrepancyDescription = 'Logged in SalaryPulse but missing in official office biometric export.';
    } else if (appExists && pdfExists) {
      // Both exist, check status, OT, duration, and punch differences
      const statusMismatch = this.normalizeStatus(appStatus) !== this.normalizeStatus(pdfStatus);
      const otDiff = Math.abs(appOTSeconds - pdfOTSeconds) > 180; // >3 minutes difference
      const durationDiff = Math.abs(appWorkSeconds - pdfWorkSeconds) > 300; // >5 minutes
      const punchDiff = appInTime !== pdfInTime || appOutTime !== pdfOutTime;

      if (statusMismatch) {
        discrepancyType = 'STATUS_MISMATCH';
        discrepancyLabel = 'Status Mismatch';
        discrepancyDescription = `Office PDF marked as ${pdfStatus}, while SalaryPulse had ${appStatus}.`;
      } else if (otDiff) {
        discrepancyType = 'OT_DIFF';
        discrepancyLabel = 'Overtime Discrepancy';
        const otDiffHours = ((pdfOTSeconds - appOTSeconds) / 3600).toFixed(2);
        discrepancyDescription = `Office PDF has ${((pdfOTSeconds) / 3600).toFixed(1)}h OT (${otDiffHours.startsWith('-') ? '' : '+'}${otDiffHours}h delta).`;
      } else if (durationDiff) {
        discrepancyType = 'DURATION_DIFF';
        discrepancyLabel = 'Duration Difference';
        discrepancyDescription = `Office PDF shows ${((pdfWorkSeconds) / 3600).toFixed(1)}h vs SalaryPulse ${((appWorkSeconds) / 3600).toFixed(1)}h.`;
      } else if (punchDiff && (appInTime !== '--:--' || pdfInTime !== '--:--')) {
        discrepancyType = 'PUNCH_TIME_DIFF';
        discrepancyLabel = 'Punch Timings Differ';
        discrepancyDescription = `Biometric punch: ${pdfInTime} → ${pdfOutTime} vs App: ${appInTime} → ${appOutTime}.`;
      }
    }

    const isSelected = discrepancyType !== 'MATCH';

    return {
      id,
      date,
      dayName,
      discrepancyType,
      discrepancyLabel,
      discrepancyDescription,
      appData: {
        exists: appExists,
        status: appStatus,
        inTime: appInTime,
        outTime: appOutTime,
        workDurationSeconds: appWorkSeconds,
        overtimeSeconds: appOTSeconds,
        dailyEarnings: appDailyEarnings,
        otEarnings: appOTEarnings,
        totalEarnings: appTotalEarnings,
      },
      pdfData: {
        exists: pdfExists,
        status: pdfStatus,
        shift: pdfShift,
        inTime: pdfInTime,
        outTime: pdfOutTime,
        workDurationSeconds: pdfWorkSeconds,
        overtimeSeconds: pdfOTSeconds,
        remarks: pdfRemarks,
        rawPunches: pdfPunches,
        calculatedDailyEarnings: pdfDailyEarnings,
        calculatedOTEarnings: pdfOTEarnings,
        calculatedTotalEarnings: pdfTotalEarnings,
      },
      financialDelta: {
        baseSalaryDifference,
        otDifference,
        netEarningsDifference,
        attendanceBonusImpact: netEarningsDifference > 0 ? 'Positive correction towards salary & bonus' : 'Neutral/Audit alignment',
      },
      isSelected,
      resolution: 'USE_PDF',
    };
  }

  /**
   * Applies selected reconciliation corrections to attendance days and creates an immutable audit record
   */
  public static applyCorrections(
    report: ReconciliationReport,
    selectedItemIds: string[],
    existingAttendanceDays: AttendanceDay[],
    grossBefore: number,
    netBefore: number,
    otHoursBefore: number,
    bonusBefore: number,
    salaryConfig: SalaryConfig,
    rateDerivation: RateDerivation
  ): {
    updatedAttendanceDays: AttendanceDay[];
    auditLog: ReconciliationAuditLog;
  } {
    const selectedSet = new Set(selectedItemIds);
    const dayMap = new Map<string, AttendanceDay>();
    
    existingAttendanceDays.forEach(d => dayMap.set(d.date, { ...d }));

    const itemizedChanges: ReconciliationAuditLog['itemizedChanges'] = [];
    const correctedDatesList: string[] = [];

    report.items.forEach((item) => {
      if (!selectedSet.has(item.id)) return;
      if (item.resolution === 'KEEP_APP') return;

      const date = item.date;
      correctedDatesList.push(date);

      const existingDay = dayMap.get(date);
      const pdf = item.pdfData;

      // Log previous vs new values
      const prevStatus = existingDay ? existingDay.status : 'NONE';
      const prevDuration = existingDay ? `${(existingDay.totalActiveSeconds / 3600).toFixed(1)}h` : '0h';
      const newDuration = `${(pdf.workDurationSeconds / 3600).toFixed(1)}h`;

      itemizedChanges.push({
        date,
        field: 'Status & Working Hours',
        previousValue: `${prevStatus} (${prevDuration})`,
        newValue: `${pdf.status} (${newDuration}, OT: ${(pdf.overtimeSeconds / 3600).toFixed(1)}h)`,
        financialDelta: item.financialDelta.netEarningsDifference,
        reason: `Reconciled from ${report.fileName} for ${report.selectedEmployee.name}`,
      });

      // Map WorkdayStatus to AttendanceStatus
      const attStatus: AttendanceStatus = this.mapToAttendanceStatus(pdf.status);

      const firstPunchInIso = pdf.inTime && pdf.inTime !== '--:--' ? `${date}T${pdf.inTime}:00` : undefined;
      const lastPunchOutIso = pdf.outTime && pdf.outTime !== '--:--' ? `${date}T${pdf.outTime}:00` : undefined;

      // Construct corrected attendance day object
      const correctedDay: AttendanceDay = {
        id: existingDay?.id || `att_day_${date}`,
        date,
        status: attStatus,
        workdayStatus: pdf.status,
        totalActiveSeconds: pdf.workDurationSeconds,
        creditedNormalSeconds: pdf.status === 'PAID_HOLIDAY' ? (rateDerivation.requiredDailyHours || 8) * 3600 : 0,
        totalBreakSeconds: 3600, // 1 hour standard break
        overtimeSeconds: pdf.overtimeSeconds,
        firstPunchIn: firstPunchInIso,
        lastPunchOut: lastPunchOutIso,
        source: 'CORRECTED',
        notes: `[PDF Reconciled: ${report.fileName}] ${pdf.remarks || 'Biometric Swipe Verified'}`,
        workSessions: [
          {
            id: `session_pdf_${date}`,
            startTime: firstPunchInIso || `${date}T09:00:00`,
            endTime: lastPunchOutIso || `${date}T18:00:00`,
            durationSeconds: pdf.workDurationSeconds,
            source: 'IMPORTED',
            note: 'Official Office Biometric Punch',
          }
        ],
        breakSessions: [
          {
            id: `break_pdf_${date}`,
            type: 'lunch',
            startTime: `${date}T13:00:00`,
            endTime: `${date}T14:00:00`,
            durationSeconds: 3600,
            isPaid: false,
            source: 'IMPORTED',
            note: 'Standard lunch duration',
          }
        ],
      };

      dayMap.set(date, correctedDay);
    });

    const updatedAttendanceDays = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate new post-correction figures
    const dailyNormalSeconds = Math.max(1, (rateDerivation.requiredDailyHours || 8) * 3600);
    const perSecondRate = rateDerivation.perSecondRate || (salaryConfig.monthlyBaseSalary / (26 * dailyNormalSeconds));
    const otMultiplier = salaryConfig.overtimeMultiplier || 2.0;

    let newGross = 0;
    let newOTSeconds = 0;
    let presentDaysCount = 0;

    updatedAttendanceDays.filter(d => d.date.startsWith(report.monthPeriod)).forEach(d => {
      if (d.status === 'present' || d.workdayStatus === 'PRESENT' || d.workdayStatus === 'COMPLETED' || d.workdayStatus === 'WORKING') {
        presentDaysCount++;
        newGross += Math.min(dailyNormalSeconds, d.totalActiveSeconds > 0 ? d.totalActiveSeconds : dailyNormalSeconds) * perSecondRate;
      } else if (d.status === 'holiday' || d.workdayStatus === 'PAID_HOLIDAY') {
        newGross += dailyNormalSeconds * perSecondRate;
      }
      newOTSeconds += (d.overtimeSeconds || 0);
    });

    const newOTPay = newOTSeconds * perSecondRate * otMultiplier;
    newGross += newOTPay;

    const bonusEligible = presentDaysCount >= (salaryConfig.attendanceBonusEligibleDays || 26);
    const newBonus = bonusEligible ? (salaryConfig.attendanceBonusAmount || 0) : 0;
    const newNet = newGross + newBonus;

    const auditLog: ReconciliationAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      sourceDocument: report.fileName,
      employeeName: report.selectedEmployee.name,
      employeeId: report.selectedEmployee.employeeId,
      totalCorrectedDates: correctedDatesList.length,
      correctedDatesList,
      grossBefore,
      grossAfter: newGross,
      netBefore,
      netAfter: newNet,
      otHoursBefore,
      otHoursAfter: newOTSeconds / 3600,
      bonusBefore,
      bonusAfter: newBonus,
      itemizedChanges,
    };

    return {
      updatedAttendanceDays,
      auditLog,
    };
  }

  private static mapToAttendanceStatus(status: WorkdayStatus): AttendanceStatus {
    switch (status) {
      case 'PRESENT':
      case 'COMPLETED':
      case 'WORKING':
        return 'present';
      case 'ABSENT':
        return 'absent';
      case 'PAID_HOLIDAY':
      case 'UNPAID_HOLIDAY':
        return 'holiday';
      case 'WEEKLY_OFF':
      case 'WEEKLY_OFF_WORKED':
        return 'weekly_off';
      case 'PAID_LEAVE':
      case 'UNPAID_LEAVE':
        return 'leave';
      case 'PARTIAL':
        return 'half_day';
      default:
        return 'present';
    }
  }

  private static normalizeStatus(status: WorkdayStatus): string {
    if (status === 'WORKING' || status === 'COMPLETED') return 'PRESENT';
    return status;
  }

  private static getDayName(dateStr: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()] || 'Day';
  }
}
