// ============================================================================
// SALARYPULSE — NOTIFICATION SERVICE
// Browser Web Notifications, anti-duplication memory, and in-app toast notification queue
// ============================================================================

import { InAppNotification, NotificationSettings } from '../types';
import { MilestoneEvaluationResult } from '../engine/notificationEngine';

type InAppNotificationListener = (notifications: InAppNotification[]) => void;

const NOTIFIED_KEYS_STORAGE = 'salarypulse_notified_milestones';

export class NotificationService {
  private static inAppNotifications: InAppNotification[] = [];
  private static listeners: Set<InAppNotificationListener> = new Set();
  private static notifiedKeys: Set<string> = new Set();

  /**
   * Initialize notification service and load previously fired milestone keys
   */
  static init(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(NOTIFIED_KEYS_STORAGE);
        if (stored) {
          const parsed: string[] = JSON.parse(stored);
          this.notifiedKeys = new Set(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Request native browser notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (e) {
      console.warn('NotificationService: Permission request error:', e);
      return 'denied';
    }
  }

  /**
   * Get current browser notification permission
   */
  static getPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Subscribe to in-app notifications
   */
  static subscribe(listener: InAppNotificationListener): () => void {
    this.listeners.add(listener);
    listener([...this.inAppNotifications]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Dispatch milestone evaluations from NotificationEngine
   */
  static processMilestones(
    milestones: MilestoneEvaluationResult[],
    settings: NotificationSettings
  ): void {
    for (const milestone of milestones) {
      if (this.notifiedKeys.has(milestone.milestoneKey)) {
        continue; // Prevent duplicate alerts for the same event on the same day
      }

      // Record as notified
      this.markNotified(milestone.milestoneKey);

      // 1. Post in-app notification toast
      this.pushInAppNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: milestone.title,
        message: milestone.message,
        severity: milestone.severity,
        timestamp: new Date().toISOString(),
        milestoneKey: milestone.milestoneKey,
        autoDismissMs: milestone.severity === 'alert' ? 12000 : 7000,
      });

      // 2. Post native Browser OS notification if enabled and allowed
      if (settings.enabled && this.getPermission() === 'granted') {
        try {
          const bodyText = settings.privacyMode ? milestone.osMessage : milestone.message;
          const notif = new Notification(milestone.title, {
            body: bodyText,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: milestone.milestoneKey,
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        } catch (e) {
          console.warn('NotificationService: Web Notification error:', e);
        }
      }
    }
  }

  /**
   * Push a custom in-app notification toast
   */
  static pushInAppNotification(notif: InAppNotification): void {
    this.inAppNotifications = [notif, ...this.inAppNotifications.slice(0, 4)];
    this.notifyListeners();

    if (notif.autoDismissMs && notif.autoDismissMs > 0) {
      setTimeout(() => {
        this.dismissInAppNotification(notif.id);
      }, notif.autoDismissMs);
    }
  }

  /**
   * Dismiss an in-app notification
   */
  static dismissInAppNotification(id: string): void {
    this.inAppNotifications = this.inAppNotifications.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Send an immediate test notification
   */
  static async sendTestNotification(settings: NotificationSettings): Promise<{ success: boolean; message: string }> {
    if (this.getPermission() !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') {
        this.pushInAppNotification({
          id: `test-${Date.now()}`,
          title: 'Browser Notifications Blocked',
          message: 'Web notifications are not permitted by your browser. In-app notifications will continue to work seamlessly.',
          severity: 'warning',
          timestamp: new Date().toISOString(),
          autoDismissMs: 5000,
        });
        return { success: false, message: 'Notification permission not granted' };
      }
    }

    try {
      const title = 'SalaryPulse Test Notification';
      const body = settings.privacyMode
        ? 'SalaryPulse: Active session tracking is running smoothly.'
        : 'SalaryPulse: Real-time salary tracking and overtime monitoring are active.';

      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'salarypulse-test',
      });

      this.pushInAppNotification({
        id: `test-${Date.now()}`,
        title: 'Test Notification Sent',
        message: 'System test notification dispatched successfully to your device.',
        severity: 'success',
        timestamp: new Date().toISOString(),
        autoDismissMs: 4000,
      });

      return { success: true, message: 'Test notification sent successfully' };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  }

  private static markNotified(key: string): void {
    this.notifiedKeys.add(key);
    try {
      // Keep up to 100 historical keys
      const arr = Array.from(this.notifiedKeys).slice(-100);
      localStorage.setItem(NOTIFIED_KEYS_STORAGE, JSON.stringify(arr));
    } catch (e) {
      // ignore
    }
  }

  private static notifyListeners(): void {
    this.listeners.forEach((l) => l([...this.inAppNotifications]));
  }
}
