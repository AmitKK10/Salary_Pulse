// ============================================================================
// SALARYPULSE — ATTENDANCE BONUS ENGINE
// State machine & qualification logic for attendance performance incentives
// ============================================================================

import { AttendanceDay, BonusStatus, SalaryConfig } from '../types';

export interface BonusEvaluation {
  qualifyingDaysCount: number;
  requiredDays: number;
  bonusAmount: number;
  status: BonusStatus;
  isEligible: boolean;
  isConfirmedPayable: boolean;
  potentialBonusAmount: number;
  confirmedBonusAmount: number;
  reason: string;
}

export class BonusEngine {
  /**
   * Evaluates qualifying attendance days and returns authoritative bonus state
   */
  static evaluateAttendanceBonus(
    yearMonth: string,
    attendanceDays: AttendanceDay[],
    config: SalaryConfig,
    manualApprovalState?: BonusStatus | boolean
  ): BonusEvaluation {
    if (!config.attendanceBonusEnabled) {
      return {
        qualifyingDaysCount: 0,
        requiredDays: config.attendanceBonusEligibleDays,
        bonusAmount: 0,
        status: 'NOT_ELIGIBLE',
        isEligible: false,
        isConfirmedPayable: false,
        potentialBonusAmount: 0,
        confirmedBonusAmount: 0,
        reason: 'Attendance bonus program is disabled in company settings',
      };
    }

    const monthDays = attendanceDays.filter(d => d.date.startsWith(yearMonth));

    // Calculate qualifying days:
    // PRESENT count + 0.5 for PARTIAL (or 1 for full present) + paid holidays
    let qualifyingDays = 0;
    for (const day of monthDays) {
      const st = String(day.status).toUpperCase();
      if (st === 'PRESENT') {
        qualifyingDays += 1;
      } else if (st === 'PARTIAL' || st === 'HALF_DAY') {
        qualifyingDays += 0.5;
      } else if (st === 'PAID_HOLIDAY' || st === 'HOLIDAY') {
        qualifyingDays += 1; // Paid company holiday counts toward attendance qualification
      }
    }

    const requiredDays = config.attendanceBonusEligibleDays || 26;
    const bonusAmount = config.attendanceBonusAmount || 3000;
    const isEligible = qualifyingDays >= requiredDays;

    let status: BonusStatus = 'NOT_ELIGIBLE';

    if (!isEligible) {
      status = 'NOT_ELIGIBLE';
    } else {
      // Reached 26 days! Check approval requirement
      if (manualApprovalState === 'APPROVED' || manualApprovalState === true) {
        status = 'APPROVED';
      } else if (manualApprovalState === 'PAID') {
        status = 'PAID';
      } else if (manualApprovalState === 'REJECTED' || manualApprovalState === false) {
        status = 'REJECTED';
      } else if (manualApprovalState === 'ELIGIBLE') {
        status = 'ELIGIBLE';
      } else {
        // Default when threshold crossed
        if (config.bonusRequiresApproval) {
          status = 'PENDING_APPROVAL';
        } else {
          status = 'APPROVED';
        }
      }
    }

    // Only APPROVED or PAID bonuses are payable in confirmed net salary
    const isConfirmedPayable = status === 'APPROVED' || status === 'PAID';
    const potentialBonusAmount = isEligible ? bonusAmount : 0;
    const confirmedBonusAmount = isConfirmedPayable ? bonusAmount : 0;

    let reason = '';
    switch (status) {
      case 'APPROVED':
        reason = `Bonus approved by HR (${qualifyingDays}/${requiredDays} qualifying days achieved)`;
        break;
      case 'PAID':
        reason = `Bonus disbursed (${qualifyingDays}/${requiredDays} qualifying days achieved)`;
        break;
      case 'PENDING_APPROVAL':
        reason = `Criteria met (${qualifyingDays}/${requiredDays} qualifying days). Awaiting HR sign-off`;
        break;
      case 'REJECTED':
        reason = 'Bonus approval rejected by HR administrator';
        break;
      case 'ELIGIBLE':
        reason = `Qualifying threshold reached (${qualifyingDays}/${requiredDays} days)`;
        break;
      case 'NOT_ELIGIBLE':
      default:
        reason = `In progress: ${qualifyingDays} of ${requiredDays} qualifying days logged`;
        break;
    }

    return {
      qualifyingDaysCount: qualifyingDays,
      requiredDays,
      bonusAmount,
      status,
      isEligible,
      isConfirmedPayable,
      potentialBonusAmount,
      confirmedBonusAmount,
      reason,
    };
  }
}
