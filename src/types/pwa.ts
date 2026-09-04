// ============================================================================
// SALARYPULSE — PWA, NOTIFICATIONS & DAILY WORKFLOW TYPES (STEP 10)
// ============================================================================

export interface NotificationSettings {
  enabled: boolean;
  privacyMode: boolean; // Hide currency figures in OS lock screen previews (default: true)
  lunchCountdown: boolean;
  lunchComplete: boolean;
  target8HoursReached: boolean;
  monthlyOTStarted: boolean;
  bonusMilestone: boolean;
  forgottenSession: boolean;
  backupReminder: boolean;
}

export interface PwaState {
  isInstalled: boolean;
  isInstallPromptAvailable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  swRegistered: boolean;
  installPromptDismissed: boolean;
}

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'alert';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  milestoneKey?: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number;
}

export interface EndOfDaySummaryData {
  date: string;
  activeWorkSeconds: number;
  totalBreakSeconds: number;
  normalSeconds: number;
  overtimeSeconds: number;
  todayEarnings: number;
  monthlyOtSeconds: number;
  monthlyEarnings: number;
  bonusDaysPresent: number;
  bonusTargetDays: number;
  bonusStatus: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  privacyMode: true,
  lunchCountdown: true,
  lunchComplete: true,
  target8HoursReached: true,
  monthlyOTStarted: true,
  bonusMilestone: true,
  forgottenSession: true,
  backupReminder: true,
};
