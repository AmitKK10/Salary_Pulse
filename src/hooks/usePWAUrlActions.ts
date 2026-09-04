import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationService } from '../services/notificationService';

export function usePWAUrlActions() {
  const { 
    startWork, 
    startBreak, 
    resumeWork, 
    endDay, 
    setActiveTab, 
    isCurrentlyWorking, 
    isOnBreak 
  } = useApp();

  const executedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || executedRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const mode = urlParams.get('mode');
    const tab = urlParams.get('tab');

    if (!action && !mode && !tab) return;

    executedRef.current = true;

    // Handle View Navigation
    if (mode === 'widget' || tab === 'widget') {
      setActiveTab('widget');
    } else if (tab && ['dashboard', 'live-work', 'calendar', 'salary', 'simulator', 'analytics', 'attendance', 'reconciliation', 'salary-reconciliation', 'settings'].includes(tab)) {
      setActiveTab(tab as any);
    }

    // Handle Quick Punch Actions
    if (action) {
      setTimeout(() => {
        switch (action) {
          case 'start-work':
          case 'start':
            if (!isCurrentlyWorking && !isOnBreak) {
              const res = startWork('Launched from Android / PWA Shortcut');
              if (res.success) {
                NotificationService.pushInAppNotification({
                  id: `action-${Date.now()}`,
                  title: 'Workday Started',
                  message: 'Active timer initiated via Android Home Screen shortcut.',
                  severity: 'success',
                  timestamp: new Date().toISOString(),
                  autoDismissMs: 4000
                });
              }
            }
            break;

          case 'take-break':
          case 'break':
            if (isCurrentlyWorking && !isOnBreak) {
              const res = startBreak('lunch', 'Break started via Android / PWA Shortcut');
              if (res.success) {
                NotificationService.pushInAppNotification({
                  id: `action-${Date.now()}`,
                  title: 'Break Initiated',
                  message: 'Lunch countdown running. Tap resume when back at desk.',
                  severity: 'info',
                  timestamp: new Date().toISOString(),
                  autoDismissMs: 4000
                });
              }
            }
            break;

          case 'resume-work':
          case 'resume':
            if (isOnBreak) {
              const res = resumeWork('Resumed via Android / PWA Shortcut');
              if (res.success) {
                NotificationService.pushInAppNotification({
                  id: `action-${Date.now()}`,
                  title: 'Work Resumed',
                  message: 'Active work session resumed.',
                  severity: 'success',
                  timestamp: new Date().toISOString(),
                  autoDismissMs: 4000
                });
              }
            }
            break;

          case 'clock-out':
          case 'end':
            if (isCurrentlyWorking || isOnBreak) {
              const res = endDay('Workday ended via Android / PWA Shortcut');
              if (res.success) {
                NotificationService.pushInAppNotification({
                  id: `action-${Date.now()}`,
                  title: 'Clocked Out',
                  message: 'Daily earnings and attendance record finalized.',
                  severity: 'success',
                  timestamp: new Date().toISOString(),
                  autoDismissMs: 4000
                });
              }
            }
            break;

          default:
            break;
        }

        // Clean up URL query parameters without reloading the page
        const cleanUrl = window.location.pathname + (mode === 'widget' ? '?mode=widget' : '');
        window.history.replaceState({}, document.title, cleanUrl);
      }, 150);
    } else if (mode === 'widget') {
      // Keep mode=widget in URL for bookmarking / standalone widget pop-out
    } else {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isCurrentlyWorking, isOnBreak, startWork, startBreak, resumeWork, endDay, setActiveTab]);
}
