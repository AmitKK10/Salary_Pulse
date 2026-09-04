// ============================================================================
// SALARYPULSE — SALARY RECONCILIATION ENGINE (STEP 7)
// High-precision three-way comparison, forensic difference analyzer,
// automated explanation builder, and dispute generator
// ============================================================================

import { 
  ActualBankReceipt, 
  ForensicSalaryNarrative, 
  ItemizedSalaryDiscrepancy, 
  OfficialPayrollSlip, 
  PulseCalculatedSummary, 
  SalaryReconciliationRecord, 
  SalaryReconciliationStatus,
  User,
  YearlySalarySummaryItem
} from '../types';
import { formatCurrency } from '../utils/formatters';

export class SalaryReconciliationEngine {
  /**
   * Run three-way comparison between Pulse Calculation, Official HR Slip, and Bank Receipt
   */
  static runThreeWayComparison(
    pulseData: PulseCalculatedSummary,
    officialSlip: OfficialPayrollSlip,
    bankReceipt: ActualBankReceipt,
    user?: User,
    monthPeriod: string = '2026-08'
  ): {
    discrepancies: ItemizedSalaryDiscrepancy[];
    forensicSummary: ForensicSalaryNarrative;
    status: SalaryReconciliationStatus;
  } {
    const discrepancies: ItemizedSalaryDiscrepancy[] = [];

    // 1. BASE PAY COMPARISON
    const baseVariance = officialSlip.isProvided ? (officialSlip.basePay - pulseData.basePay) : 0;
    if (!officialSlip.isProvided) {
      discrepancies.push({
        id: 'disc-base-unprovided',
        category: 'BASE_PAY',
        title: 'Official Base Pay Not Provided',
        description: `SalaryPulse calculated base pay is ${formatCurrency(pulseData.basePay)} for ${pulseData.scheduledWorkingDays} scheduled working days.`,
        pulseAmount: pulseData.basePay,
        officialAmount: 0,
        variance: -pulseData.basePay,
        severity: 'INFO',
        driver: 'Official payroll slip has not been inputted or uploaded yet.',
        impactNote: 'Awaiting official slip input.',
        userResolution: 'PENDING_CLARIFICATION',
      });
    } else if (Math.abs(baseVariance) < 1.0) {
      discrepancies.push({
        id: 'disc-base-match',
        category: 'BASE_PAY',
        title: 'Base Pay Matches Exactly',
        description: `Both SalaryPulse and Official HR Slip record base salary of ${formatCurrency(officialSlip.basePay)}.`,
        pulseAmount: pulseData.basePay,
        officialAmount: officialSlip.basePay,
        variance: 0,
        severity: 'MATCH',
        driver: 'Scheduled working days and base salary rate match official records.',
        impactNote: 'Zero variance.',
        userResolution: 'RECONCILED',
      });
    } else {
      const isUnder = baseVariance < 0;
      discrepancies.push({
        id: 'disc-base-variance',
        category: 'BASE_PAY',
        title: isUnder ? 'Base Pay Underpaid by HR' : 'Base Pay Higher than Projected',
        description: `Official slip reports ${formatCurrency(officialSlip.basePay)} vs SalaryPulse calculated ${formatCurrency(pulseData.basePay)} (variance of ${baseVariance > 0 ? '+' : ''}${formatCurrency(baseVariance)}).`,
        pulseAmount: pulseData.basePay,
        officialAmount: officialSlip.basePay,
        variance: baseVariance,
        severity: Math.abs(baseVariance) > 500 ? 'CRITICAL' : 'WARNING',
        driver: officialSlip.reportedPresentDays && officialSlip.reportedPresentDays !== pulseData.presentDays 
          ? `HR counted ${officialSlip.reportedPresentDays} days instead of ${pulseData.presentDays} logged days in SalaryPulse.`
          : 'Working days or daily rate calculation basis differs between company policy and setup.',
        impactNote: `${isUnder ? 'Underpaid' : 'Overpaid'} by ${formatCurrency(Math.abs(baseVariance))}.`,
        userResolution: isUnder ? 'DISPUTED_WITH_HR' : 'ACCEPTED_OFFICIAL',
      });
    }

    // 2. OVERTIME PAY COMPARISON
    if (officialSlip.isProvided) {
      const otVariance = officialSlip.overtimePay - pulseData.overtimePay;
      if (Math.abs(otVariance) < 1.0) {
        discrepancies.push({
          id: 'disc-ot-match',
          category: 'OVERTIME',
          title: 'Overtime Pay Matches',
          description: `Overtime compensation of ${formatCurrency(officialSlip.overtimePay)} aligns between both sources.`,
          pulseAmount: pulseData.overtimePay,
          officialAmount: officialSlip.overtimePay,
          variance: 0,
          severity: 'MATCH',
          driver: 'Logged overtime hours and multiplier match payroll calculation.',
          impactNote: 'Zero variance.',
          userResolution: 'RECONCILED',
        });
      } else {
        const isUnder = otVariance < 0;
        discrepancies.push({
          id: 'disc-ot-diff',
          category: 'OVERTIME',
          title: isUnder ? 'Unpaid / Under-calculated Overtime' : 'Additional Overtime Credited',
          description: `SalaryPulse logged ${pulseData.otHours.toFixed(1)} OT hours (${formatCurrency(pulseData.overtimePay)}) vs Official OT of ${formatCurrency(officialSlip.overtimePay)}.`,
          pulseAmount: pulseData.overtimePay,
          officialAmount: officialSlip.overtimePay,
          variance: otVariance,
          severity: Math.abs(otVariance) > 300 ? 'CRITICAL' : 'WARNING',
          driver: isUnder 
            ? `HR payroll may have applied a single 1.0x rate or excluded ${Math.abs(otVariance / (pulseData.perHourRate * 2)).toFixed(1)} hrs of evening/weekend overtime.`
            : 'HR credited additional overtime or shift allowance.',
          impactNote: `Net OT variance: ${otVariance > 0 ? '+' : ''}${formatCurrency(otVariance)}.`,
          userResolution: isUnder ? 'DISPUTED_WITH_HR' : 'ACCEPTED_OFFICIAL',
        });
      }
    }

    // 3. ATTENDANCE BONUS COMPARISON
    if (officialSlip.isProvided) {
      const bonusVariance = officialSlip.attendanceBonus - pulseData.attendanceBonus;
      if (Math.abs(bonusVariance) < 1.0) {
        if (pulseData.attendanceBonus > 0) {
          discrepancies.push({
            id: 'disc-bonus-match',
            category: 'ATTENDANCE_BONUS',
            title: 'Attendance Bonus Approved & Paid',
            description: `Full attendance incentive of ${formatCurrency(officialSlip.attendanceBonus)} was disbursed as calculated.`,
            pulseAmount: pulseData.attendanceBonus,
            officialAmount: officialSlip.attendanceBonus,
            variance: 0,
            severity: 'MATCH',
            driver: 'Perfect attendance qualification verified by HR.',
            impactNote: 'Zero variance.',
            userResolution: 'RECONCILED',
          });
        }
      } else {
        const isUnder = bonusVariance < 0;
        discrepancies.push({
          id: 'disc-bonus-diff',
          category: 'ATTENDANCE_BONUS',
          title: isUnder ? 'Attendance Bonus Omitted or Reduced' : 'Higher Attendance Incentive Paid',
          description: `SalaryPulse projected attendance bonus of ${formatCurrency(pulseData.attendanceBonus)} vs Official HR Slip amount of ${formatCurrency(officialSlip.attendanceBonus)}.`,
          pulseAmount: pulseData.attendanceBonus,
          officialAmount: officialSlip.attendanceBonus,
          variance: bonusVariance,
          severity: 'CRITICAL',
          driver: isUnder 
            ? 'HR system attendance threshold may differ or requires manager sign-off.'
            : 'Discretionary incentive granted.',
          impactNote: `Bonus variance: ${bonusVariance > 0 ? '+' : ''}${formatCurrency(bonusVariance)}.`,
          userResolution: isUnder ? 'DISPUTED_WITH_HR' : 'ACCEPTED_OFFICIAL',
        });
      }
    }

    // 4. PERFORMANCE & SPECIAL ALLOWANCES
    if (officialSlip.isProvided) {
      const perfDiff = officialSlip.performanceBonus - pulseData.performanceBonus;
      if (Math.abs(perfDiff) >= 1.0) {
        discrepancies.push({
          id: 'disc-perf-diff',
          category: 'PERFORMANCE_BONUS',
          title: perfDiff > 0 ? 'Performance Bonus Credited' : 'Performance Bonus Reduced',
          description: `Official slip includes ${formatCurrency(officialSlip.performanceBonus)} performance bonus vs ${formatCurrency(pulseData.performanceBonus)} estimated.`,
          pulseAmount: pulseData.performanceBonus,
          officialAmount: officialSlip.performanceBonus,
          variance: perfDiff,
          severity: 'INFO',
          driver: 'Quarterly/monthly KPI evaluation result.',
          impactNote: `Variance: ${perfDiff > 0 ? '+' : ''}${formatCurrency(perfDiff)}.`,
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }

      const specDiff = officialSlip.specialAllowance - pulseData.specialAllowance;
      if (Math.abs(specDiff) >= 1.0) {
        discrepancies.push({
          id: 'disc-spec-diff',
          category: 'SPECIAL_ALLOWANCE',
          title: specDiff > 0 ? 'Special Allowance Added' : 'Special Allowance Lower',
          description: `Official slip includes ${formatCurrency(officialSlip.specialAllowance)} special allowance.`,
          pulseAmount: pulseData.specialAllowance,
          officialAmount: officialSlip.specialAllowance,
          variance: specDiff,
          severity: 'INFO',
          driver: 'HRA / Medical / Transport component in HR salary structure.',
          impactNote: `Variance: ${specDiff > 0 ? '+' : ''}${formatCurrency(specDiff)}.`,
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }
    }

    // 5. STATUTORY & OTHER DEDUCTIONS
    if (officialSlip.isProvided) {
      const d = officialSlip.deductions;
      
      // PF Deduction
      if (d.pf > 0) {
        discrepancies.push({
          id: 'disc-ded-pf',
          category: 'PF_STATUTORY',
          title: 'Provident Fund (PF) Statutory Deduction',
          description: `Official slip deducted ${formatCurrency(d.pf)} towards employee PF (EPFO).`,
          pulseAmount: 0,
          officialAmount: d.pf,
          variance: -d.pf,
          severity: 'INFO',
          driver: 'Mandatory statutory retirement savings contribution (12% of basic).',
          impactNote: 'Statutory compliance deduction.',
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }

      // Professional Tax (PT)
      if (d.pt > 0) {
        discrepancies.push({
          id: 'disc-ded-pt',
          category: 'PT_TAX',
          title: 'Professional Tax (PT)',
          description: `State Government Professional Tax of ${formatCurrency(d.pt)} deducted on official slip.`,
          pulseAmount: 0,
          officialAmount: d.pt,
          variance: -d.pt,
          severity: 'INFO',
          driver: 'State statutory professional tax levy.',
          impactNote: 'Mandatory state deduction.',
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }

      // TDS / Income Tax
      if (d.tds > 0) {
        discrepancies.push({
          id: 'disc-ded-tds',
          category: 'TAX_TDS',
          title: 'Tax Deducted at Source (TDS)',
          description: `Income tax of ${formatCurrency(d.tds)} withheld at source by employer.`,
          pulseAmount: 0,
          officialAmount: d.tds,
          variance: -d.tds,
          severity: d.tds > 1000 ? 'WARNING' : 'INFO',
          driver: 'Income tax regime withholding based on declared investments and annual projection.',
          impactNote: 'Tax withheld for Form 16 / 26AS.',
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }

      // ESI Deduction
      if (d.esi > 0) {
        discrepancies.push({
          id: 'disc-ded-esi',
          category: 'ESI_DEDUCTION',
          title: 'Employee State Insurance (ESI)',
          description: `ESI medical insurance contribution of ${formatCurrency(d.esi)} deducted.`,
          pulseAmount: 0,
          officialAmount: d.esi,
          variance: -d.esi,
          severity: 'INFO',
          driver: 'Statutory healthcare insurance for employees under threshold.',
          impactNote: 'Mandatory ESI deduction.',
          userResolution: 'ACCEPTED_OFFICIAL',
        });
      }

      // Loss of Pay / Late Penalty
      if (d.lop > 0) {
        discrepancies.push({
          id: 'disc-ded-lop',
          category: 'PENALTY_LOP',
          title: 'Loss of Pay (LOP) / Late Punch Penalty',
          description: `HR payroll levied a deduction of ${formatCurrency(d.lop)} for unapproved absence or late arrivals.`,
          pulseAmount: 0,
          officialAmount: d.lop,
          variance: -d.lop,
          severity: 'CRITICAL',
          driver: 'Attendance system penalty applied by company HR.',
          impactNote: 'Direct loss of take-home pay.',
          userResolution: 'DISPUTED_WITH_HR',
        });
      }

      // Other Deductions
      if (d.other > 0) {
        discrepancies.push({
          id: 'disc-ded-other',
          category: 'OTHER_DEDUCTIONS',
          title: d.otherDescription || 'Miscellaneous Deduction',
          description: `Deduction of ${formatCurrency(d.other)} recorded under ${d.otherDescription || 'Other deductions'}.`,
          pulseAmount: 0,
          officialAmount: d.other,
          variance: -d.other,
          severity: 'WARNING',
          driver: 'Internal company charges, canteen, loan recovery, or uniform deposit.',
          impactNote: 'Take-home reduced.',
          userResolution: 'PENDING_CLARIFICATION',
        });
      }
    }

    // 6. BANK RECEIPT vs OFFICIAL NET PAY COMPARISON
    if (bankReceipt.isProvided && officialSlip.isProvided) {
      const bankVariance = bankReceipt.amountReceived - officialSlip.netSalary;
      if (Math.abs(bankVariance) < 1.0) {
        discrepancies.push({
          id: 'disc-bank-match',
          category: 'BANK_TRANSFER',
          title: 'Bank Deposit Matches Official Net Exactly',
          description: `Bank credited ${formatCurrency(bankReceipt.amountReceived)} on ${bankReceipt.depositDate} (Ref: ${bankReceipt.transactionRef || 'NEFT/IMPS'}), perfectly matching the official slip net salary.`,
          pulseAmount: officialSlip.netSalary,
          officialAmount: officialSlip.netSalary,
          variance: 0,
          severity: 'MATCH',
          driver: 'Complete and accurate electronic salary remittance.',
          impactNote: 'Bank deposit verified.',
          userResolution: 'RECONCILED',
        });
      } else {
        const isUnder = bankVariance < 0;
        discrepancies.push({
          id: 'disc-bank-diff',
          category: 'BANK_TRANSFER',
          title: isUnder ? 'Bank Credit Less than Official Net' : 'Bank Credit Exceeds Official Net',
          description: `Bank received ${formatCurrency(bankReceipt.amountReceived)} vs Official Net Salary ${formatCurrency(officialSlip.netSalary)} (Variance: ${bankVariance > 0 ? '+' : ''}${formatCurrency(bankVariance)}).`,
          pulseAmount: officialSlip.netSalary,
          officialAmount: bankReceipt.amountReceived,
          variance: bankVariance,
          severity: 'CRITICAL',
          driver: isUnder 
            ? 'Possible bank processing fee, partial split transfer, or second installment pending.'
            : 'Reimbursement or arrear combined in bank transfer.',
          impactNote: `Deposit variance: ${bankVariance > 0 ? '+' : ''}${formatCurrency(bankVariance)}.`,
          userResolution: isUnder ? 'DISPUTED_WITH_HR' : 'ACCEPTED_OFFICIAL',
        });
      }
    }

    // FORENSIC NARRATIVE GENERATION
    const netVariance = officialSlip.isProvided ? (officialSlip.netSalary - pulseData.netPay) : 0;
    const bankVariance = (bankReceipt.isProvided && officialSlip.isProvided) 
      ? (bankReceipt.amountReceived - officialSlip.netSalary) 
      : 0;

    const criticalCount = discrepancies.filter(d => d.severity === 'CRITICAL').length;
    const warningCount = discrepancies.filter(d => d.severity === 'WARNING').length;

    // Build step-by-step narrative
    const explanationSteps: string[] = [];
    const keyDrivers: Array<{ label: string; amount: number; direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }> = [];
    const actionRecommendations: string[] = [];

    if (!officialSlip.isProvided) {
      explanationSteps.push('Official HR salary slip has not been inputted yet. Comparison is currently against estimated accrual.');
      actionRecommendations.push('Enter your official pay slip line items or click "Pre-fill from Calculation" to start reconciliation.');
    } else {
      if (Math.abs(netVariance) < 1.0) {
        explanationSteps.push(`Your official take-home salary (${formatCurrency(officialSlip.netSalary)}) perfectly matches SalaryPulse calculated projection (${formatCurrency(pulseData.netPay)}).`);
      } else if (netVariance < 0) {
        explanationSteps.push(`Official take-home (${formatCurrency(officialSlip.netSalary)}) is ${formatCurrency(Math.abs(netVariance))} lower than SalaryPulse projected net (${formatCurrency(pulseData.netPay)}).`);
      } else {
        explanationSteps.push(`Official take-home (${formatCurrency(officialSlip.netSalary)}) is ${formatCurrency(netVariance)} higher than SalaryPulse baseline (${formatCurrency(pulseData.netPay)}).`);
      }

      // Add drivers
      if (Math.abs(baseVariance) >= 1.0) {
        keyDrivers.push({
          label: 'Base Pay Difference',
          amount: baseVariance,
          direction: baseVariance > 0 ? 'POSITIVE' : 'NEGATIVE',
        });
        explanationSteps.push(`• Base Salary: ${baseVariance > 0 ? '+' : ''}${formatCurrency(baseVariance)} (${officialSlip.reportedPresentDays ? `HR counted ${officialSlip.reportedPresentDays} days vs ${pulseData.presentDays} days in app` : 'Rate calculation disparity'}).`);
      }

      const otDiff = officialSlip.overtimePay - pulseData.overtimePay;
      if (Math.abs(otDiff) >= 1.0) {
        keyDrivers.push({
          label: 'Overtime Pay Difference',
          amount: otDiff,
          direction: otDiff > 0 ? 'POSITIVE' : 'NEGATIVE',
        });
        explanationSteps.push(`• Overtime Variance: ${otDiff > 0 ? '+' : ''}${formatCurrency(otDiff)} (Logged ${pulseData.otHours.toFixed(1)} hrs in SalaryPulse vs ${officialSlip.reportedOTHours || 'unspecified'} hrs on pay slip).`);
      }

      const bonusDiff = officialSlip.attendanceBonus - pulseData.attendanceBonus;
      if (Math.abs(bonusDiff) >= 1.0) {
        keyDrivers.push({
          label: 'Attendance Bonus Difference',
          amount: bonusDiff,
          direction: bonusDiff > 0 ? 'POSITIVE' : 'NEGATIVE',
        });
        explanationSteps.push(`• Attendance Bonus: ${bonusDiff > 0 ? '+' : ''}${formatCurrency(bonusDiff)} (${bonusDiff < 0 ? 'Bonus threshold not credited by HR' : 'Incentive paid'}).`);
      }

      if (officialSlip.totalDeductions > 0) {
        keyDrivers.push({
          label: 'Statutory & Payroll Deductions',
          amount: -officialSlip.totalDeductions,
          direction: 'NEGATIVE',
        });
        explanationSteps.push(`• Payroll Deductions: -${formatCurrency(officialSlip.totalDeductions)} (PF: ${formatCurrency(officialSlip.deductions.pf)}, PT: ${formatCurrency(officialSlip.deductions.pt)}, TDS: ${formatCurrency(officialSlip.deductions.tds)}, LOP: ${formatCurrency(officialSlip.deductions.lop)}).`);
      }

      // Bank receipt step
      if (bankReceipt.isProvided) {
        if (Math.abs(bankVariance) < 1.0) {
          explanationSteps.push(`• Bank Remittance: Deposited ${formatCurrency(bankReceipt.amountReceived)} on ${bankReceipt.depositDate} matches Official Net exactly.`);
        } else {
          explanationSteps.push(`• Bank Discrepancy: Actual deposit (${formatCurrency(bankReceipt.amountReceived)}) differs from Official Net (${formatCurrency(officialSlip.netSalary)}) by ${bankVariance > 0 ? '+' : ''}${formatCurrency(bankVariance)}.`);
          actionRecommendations.push('Contact payroll immediately regarding bank credit variance vs finalized salary slip.');
        }
      } else {
        explanationSteps.push('• Bank Deposit: Pending actual bank credit entry.');
        actionRecommendations.push('Record your actual bank deposit amount once credited to complete 3-way verification.');
      }

      // Action recommendations based on critical items
      if (officialSlip.deductions.lop > 0) {
        actionRecommendations.push(`Request HR attendance logs to dispute the -${formatCurrency(officialSlip.deductions.lop)} LOP/Late penalty using your SalaryPulse biometric punch records.`);
      }
      if (otDiff < -200) {
        actionRecommendations.push(`Submit your detailed overtime timesheet (${pulseData.otHours.toFixed(1)} hours) to HR to claim ${formatCurrency(Math.abs(otDiff))} in uncredited OT.`);
      }
      if (bonusDiff < 0 && pulseData.presentDays >= 26) {
        actionRecommendations.push(`Submit proof of ${pulseData.presentDays} present days to claim your ${formatCurrency(Math.abs(bonusDiff))} attendance incentive.`);
      }
    }

    // Dispute Template Generator
    const userName = user?.name || 'Employee';
    const empId = user?.id || 'EMP-1042';
    const suggestedHRDisputeTemplate = `To: Payroll / Human Resources Department
Subject: Salary Discrepancy Clarification Request - ${monthPeriod} - ${userName} (${empId})

Dear HR & Payroll Team,

I am writing to request clarification regarding my salary slip for the pay period of ${monthPeriod}. 

Upon reviewing my detailed daily biometric work logs and recorded hours against the issued salary slip (Net: ${formatCurrency(officialSlip.netSalary)}), I observed the following variances:

${(discrepancies || []).filter(d => d.severity === 'CRITICAL' || d.severity === 'WARNING').map((d, i) => `${i + 1}. ${d.title}:
   - As per logged active work records: ${formatCurrency(d.pulseAmount)}
   - As per payroll slip: ${formatCurrency(d.officialAmount)}
   - Discrepancy / Variance: ${d.variance > 0 ? '+' : ''}${formatCurrency(d.variance)}
   - Context: ${d.driver}`).join('\n\n')}

Summary of Impact:
- Calculated Expected Take-Home: ${formatCurrency(pulseData.netPay)}
- Official Slip Net Salary: ${formatCurrency(officialSlip.netSalary)}
- Total Net Difference: ${netVariance > 0 ? '+' : ''}${formatCurrency(netVariance)}
${bankReceipt.isProvided ? `- Actual Bank Amount Credited: ${formatCurrency(bankReceipt.amountReceived)} (Ref: ${bankReceipt.transactionRef || 'N/A'})` : ''}

I have attached my itemized daily attendance and overtime log report for your ready reference. Kindly review these items and arrange for the necessary adjustments in the upcoming payroll cycle.

Thank you for your assistance.

Sincerely,
${userName}
Employee ID: ${empId}
Date: ${new Date().toISOString().split('T')[0]}`;

    // Determine status
    let status: SalaryReconciliationStatus = 'NOT_STARTED';
    if (!officialSlip.isProvided && !bankReceipt.isProvided) {
      status = 'NOT_STARTED';
    } else if (officialSlip.isProvided && !bankReceipt.isProvided) {
      status = 'IN_PROGRESS';
    } else if (criticalCount > 0) {
      status = 'DISPUTE_RAISED';
    } else if (warningCount > 0) {
      status = 'DISCREPANCY_EXPLAINED';
    } else {
      status = 'RECONCILED_MATCH';
    }

    const forensicSummary: ForensicSalaryNarrative = {
      headline: officialSlip.isProvided 
        ? Math.abs(netVariance) < 1.0 
          ? 'Payroll Fully Reconciled: Zero Variance'
          : `Net Take-Home Discrepancy: ${netVariance > 0 ? '+' : ''}${formatCurrency(netVariance)}`
        : 'Official Payroll Slip Awaiting Input',
      netVariance,
      bankVariance,
      totalDiscrepanciesCount: discrepancies.length,
      criticalCount,
      warningCount,
      explanationSteps,
      keyFinancialDrivers: keyDrivers,
      actionRecommendations: actionRecommendations.length > 0 ? actionRecommendations : ['All line items verified. You can now lock this month for historical audit.'],
      suggestedHRDisputeTemplate,
    };

    return {
      discrepancies,
      forensicSummary,
      status,
    };
  }

  /**
   * Create or update a full SalaryReconciliationRecord
   */
  static buildRecord(
    month: string,
    pulseData: PulseCalculatedSummary,
    officialSlip: OfficialPayrollSlip,
    bankReceipt: ActualBankReceipt,
    user?: User,
    existingRecord?: Partial<SalaryReconciliationRecord>
  ): SalaryReconciliationRecord {
    const { discrepancies, forensicSummary, status } = this.runThreeWayComparison(
      pulseData,
      officialSlip,
      bankReceipt,
      user,
      month
    );

    return {
      id: existingRecord?.id || `recon-sal-${month}`,
      month,
      status: existingRecord?.isLocked ? 'LOCKED_FINAL' : (existingRecord?.status || status),
      isLocked: existingRecord?.isLocked || false,
      lockedAt: existingRecord?.lockedAt,
      lockedBy: existingRecord?.lockedBy,
      lastUpdated: new Date().toISOString(),
      pulseData,
      officialSlip,
      bankReceipt,
      itemizedDiscrepancies: discrepancies,
      forensicSummary,
      disputeNotes: existingRecord?.disputeNotes || '',
      disputeTicketRef: existingRecord?.disputeTicketRef || '',
      disputeStatus: existingRecord?.disputeStatus || 'NONE',
      auditNotes: existingRecord?.auditNotes || '',
    };
  }

  /**
   * Generate Yearly Summary array for charts and multi-month comparison
   */
  static buildYearlySummary(records: SalaryReconciliationRecord[]): YearlySalarySummaryItem[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return (records || [])
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(rec => {
        const [year, mStr] = rec.month.split('-');
        const monthIndex = parseInt(mStr, 10) - 1;
        const monthLabel = `${monthNames[monthIndex] || mStr} ${year.slice(2)}`;

        return {
          month: rec.month,
          monthLabel,
          pulseNet: rec.pulseData.netPay,
          officialNet: rec.officialSlip.isProvided ? rec.officialSlip.netSalary : rec.pulseData.netPay,
          bankReceived: rec.bankReceipt.isProvided ? rec.bankReceipt.amountReceived : (rec.officialSlip.isProvided ? rec.officialSlip.netSalary : rec.pulseData.netPay),
          variance: rec.officialSlip.isProvided ? (rec.officialSlip.netSalary - rec.pulseData.netPay) : 0,
          status: rec.status,
          isLocked: rec.isLocked,
        };
      });
  }
}
