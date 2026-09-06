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
  TrendingUp,
  LogIn,
  LogOut
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
    if (notif.milestoneKey === 'check-in') {
      return <LogIn className="w-4 h-4 text-[#10B981]" />;
    }
    if (notif.milestoneKey === 'check-out') {
      return <LogOut className="w-4 h-4 text-emerald-400" />;
    }
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
        return 'border-amber-500/40 bg-[#16130B]/95 shadow-[0_10px_30px_rgba(245,158,11,0.15)]';
      case 'success':
        return 'border-[#10B981]/50 bg-[#0B1612]/95 shadow-[0_10px_35px_rgba(16,185,129,0.22)] ring-1 ring-[#10B981]/30';
      default:
        return 'border-[#262626] bg-[#141414]/95 shadow-xl';
    }
  };

  return (
    <div
      id="in-app-notification-center"
      className="fixed top-16 sm:top-20 right-4 sm:right-6 md:right-8 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          id={`toast-${notif.id}`}
          className={`pointer-events-auto p-4 rounded-2xl border ${getBorderColor(
            notif.severity
          )} animate-slideIn backdrop-blur-md transition-all duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
              notif.severity === 'success'
                ? 'bg-[#10B981]/15 border-[#10B981]/40'
                : notif.severity === 'alert' || notif.severity === 'warning'
                ? 'bg-amber-500/15 border-amber-500/40'
                : 'bg-[#1A1A1A] border-[#2D2D2D]'
            }`}>
              {getIcon(notif)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
                    {notif.title}
                  </h5>
                  {notif.severity === 'success' && (
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-[#10B981]/25 text-[#10B981] shrink-0 border border-[#10B981]/40">
                      SUCCESS
                    </span>
                  )}
                </div>
                <button
                  onClick={() => NotificationService.dismissInAppNotification(notif.id)}
                  className="text-[#737373] hover:text-white transition p-0.5 shrink-0 cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#D1D1D6] mt-1 leading-relaxed">
                {notif.message}
              </p>

              {notif.actionLabel && notif.onAction && (
                <button
                  onClick={() => {
                    notif.onAction?.();
                    NotificationService.dismissInAppNotification(notif.id);
                  }}
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:underline cursor-pointer"
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
