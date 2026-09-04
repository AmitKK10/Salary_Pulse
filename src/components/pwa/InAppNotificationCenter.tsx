// ============================================================================
// SALARYPULSE — IN-APP NOTIFICATION CENTER
// Non-intrusive floating toasts for break countdowns, targets, OT triggers, and bonus alerts
// ============================================================================

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Coffee, 
  Award, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { NotificationService } from '../../services/notificationService';
import { InAppNotification } from '../../types';

export const InAppNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    return NotificationService.subscribe((list) => {
      setNotifications(list);
    });
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (notif: InAppNotification) => {
    if (notif.milestoneKey?.includes('lunch')) {
      return <Coffee className="w-4 h-4 text-[#D4AF37]" />;
    }
    if (notif.milestoneKey?.includes('bonus')) {
      return <Award className="w-4 h-4 text-[#D4AF37]" />;
    }
    if (notif.milestoneKey?.includes('ot')) {
      return <TrendingUp className="w-4 h-4 text-[#10B981]" />;
    }
    if (notif.severity === 'alert' || notif.severity === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    if (notif.severity === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
    }
    return <Info className="w-4 h-4 text-[#D4AF37]" />;
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'alert':
      case 'warning':
        return 'border-amber-500/40 bg-[#16130B]';
      case 'success':
        return 'border-[#10B981]/40 bg-[#0B1612]';
      default:
        return 'border-[#262626] bg-[#141414]';
    }
  };

  return (
    <div
      id="in-app-notification-center"
      className="fixed top-18 right-4 md:right-8 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`pointer-events-auto p-4 rounded-2xl border ${getBorderColor(
            notif.severity
          )} shadow-2xl animate-slideIn backdrop-blur-md transition-all duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] shrink-0 mt-0.5">
              {getIcon(notif)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
                  {notif.title}
                </h5>
                <button
                  onClick={() => NotificationService.dismissInAppNotification(notif.id)}
                  className="text-[#737373] hover:text-white transition p-0.5 shrink-0"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed">
                {notif.message}
              </p>

              {notif.actionLabel && notif.onAction && (
                <button
                  onClick={() => {
                    notif.onAction?.();
                    NotificationService.dismissInAppNotification(notif.id);
                  }}
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:underline"
                >
                  {notif.actionLabel} →
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
