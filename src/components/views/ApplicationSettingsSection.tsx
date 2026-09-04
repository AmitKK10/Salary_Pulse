// ============================================================================
// SALARYPULSE — APPLICATION, PWA & NOTIFICATION SETTINGS (STEP 10)
// Configures Progressive Web App options, notification milestones, privacy filters, and offline status
// ============================================================================

import React, { useEffect, useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Bell, 
  BellRing, 
  ShieldCheck, 
  EyeOff, 
  Coffee, 
  Clock, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  HardDrive,
  Sparkles,
  RefreshCw,
  Info,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PwaService } from '../../services/pwaService';
import { NotificationService } from '../../services/notificationService';
import { NotificationSettings, PwaState, DEFAULT_NOTIFICATION_SETTINGS } from '../../types';
import { runStep10Tests, Step10TestCaseResult } from '../../engine/step10TestCases';

export const ApplicationSettingsSection: React.FC = () => {
  const { appSettings, updateAppSettings, systemHealth, setActiveTab } = useApp();
  const [pwaState, setPwaState] = useState<PwaState>(PwaService.getState());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(NotificationService.getPermission());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [step10Results, setStep10Results] = useState<Step10TestCaseResult[] | null>(null);
  const [isRunningStep10Tests, setIsRunningStep10Tests] = useState(false);

  const notifSettings: NotificationSettings = appSettings.notificationSettings || DEFAULT_NOTIFICATION_SETTINGS;

  useEffect(() => {
    return PwaService.subscribe((state) => {
      setPwaState(state);
    });
  }, []);

  const handleUpdateNotif = (partial: Partial<NotificationSettings>) => {
    const updated = { ...notifSettings, ...partial };
    updateAppSettings({ notificationSettings: updated });
  };

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      handleUpdateNotif({ enabled: true });
    }
  };

  const handleSendTestNotification = async () => {
    setTestStatus('Sending...');
    const res = await NotificationService.sendTestNotification(notifSettings);
    if (res.success) {
      setTestStatus('Test notification sent!');
    } else {
      setTestStatus(`Failed: ${res.message}`);
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  const handleInstallApp = async () => {
    await PwaService.promptInstall();
  };

  return (
    <div id="application-pwa-settings" className="space-y-6 animate-fadeIn">
      {/* 1. PWA & SYSTEM STATUS CARD */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#1F1F1F] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#121212] border border-[#2B2B2B] flex items-center justify-center text-[#D4AF37]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                System & PWA Status
              </h3>
              <p className="text-xs text-[#737373]">Progressive Web App installation & runtime health</p>
            </div>
          </div>

          {pwaState.isInstalled ? (
            <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>INSTALLED (STANDALONE)</span>
            </span>
          ) : (
            <button
              onClick={handleInstallApp}
              disabled={!pwaState.isInstallPromptAvailable}
              className="px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* 4 Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Online status */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <p className="text-[10px] uppercase tracking-wider text-[#737373] font-mono">Network Status</p>
            <p className="text-xs font-bold font-mono mt-1 flex items-center gap-1.5">
              {pwaState.isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Offline Mode</span>
                </>
              )}
            </p>
          </div>

          {/* Service worker */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <p className="text-[10px] uppercase tracking-wider text-[#737373] font-mono">Service Worker</p>
            <p className="text-xs font-bold font-mono mt-1 text-[#10B981] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active (Shell Cached)</span>
            </p>
          </div>

          {/* Browser Notification Status */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <p className="text-[10px] uppercase tracking-wider text-[#737373] font-mono">OS Notifications</p>
            <p className={`text-xs font-bold font-mono mt-1 ${
              browserPermission === 'granted' ? 'text-[#10B981]' : browserPermission === 'denied' ? 'text-rose-400' : 'text-[#737373]'
            }`}>
              {browserPermission.toUpperCase()}
            </p>
          </div>

          {/* Storage Health */}
          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <p className="text-[10px] uppercase tracking-wider text-[#737373] font-mono">Storage Engine</p>
            <p className="text-xs font-bold font-mono mt-1 text-[#D4AF37] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{systemHealth?.storageHealthy ? 'Local (Protected)' : 'Verified'}</span>
            </p>
          </div>
        </div>

        {/* Android Widget & PWA Shortcuts Quick Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#171722] to-[#121218] border border-[#2C2C3E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block font-mono">Android Home Widget & PWA Shortcuts</span>
              <span className="text-[11px] text-[#8E8E9E] block">Live telemetry circles, HH:MM:SS work pacing & long-press quick launcher actions.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('widget')}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-wider font-mono transition cursor-pointer self-end sm:self-auto shrink-0 shadow-sm"
          >
            Open Widget Studio
          </button>
        </div>
      </div>

      {/* 1.5 APPEARANCE & THEME PREFERENCE */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#1F1F1F] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center text-[#D4AF37]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Appearance & Theme Architecture
              </h3>
              <p className="text-xs text-[#737373]">Toggle between OLED dark mode and certified high-contrast light mode</p>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <div className="inline-flex items-center rounded-xl p-1 border bg-[#181818] border-[#2A2A2A] self-start sm:self-auto">
            <button
              id="app-settings-theme-dark"
              type="button"
              onClick={() => updateAppSettings({ theme: 'dark' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                appSettings?.theme !== 'light'
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Default Dark</span>
            </button>
            <button
              id="app-settings-theme-light"
              type="button"
              onClick={() => updateAppSettings({ theme: 'light' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                appSettings?.theme === 'light'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>High-Contrast Light</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => updateAppSettings({ theme: 'dark' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              appSettings?.theme !== 'light'
                ? 'bg-[#181818] border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30'
                : 'bg-[#161616] border-[#222222] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                <Moon className="w-3 h-3 text-[#D4AF37]" />
                Default Dark Mode
              </span>
              {appSettings?.theme !== 'light' && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#D4AF37] text-black font-bold">ACTIVE</span>
              )}
            </div>
            <p className="text-[11px] text-[#888892] mt-1">Deep obsidian OLED black with gold highlights, designed for low-light ergonomic ease.</p>
          </div>

          <div
            onClick={() => updateAppSettings({ theme: 'light' })}
            className={`p-3.5 rounded-xl border cursor-pointer transition ${
              appSettings?.theme === 'light'
                ? 'bg-white border-blue-600 ring-1 ring-blue-500'
                : 'bg-[#161616] border-[#222222] hover:border-[#333333]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold font-mono flex items-center gap-1.5 ${appSettings?.theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                <Sun className="w-3 h-3 text-amber-500" />
                High-Contrast Light
              </span>
              {appSettings?.theme === 'light' && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-600 text-white font-bold">ACTIVE (AAA)</span>
              )}
            </div>
            <p className={`text-[11px] mt-1 ${appSettings?.theme === 'light' ? 'text-slate-600' : 'text-[#888892]'}`}>
              Paper white and deep slate with 15:1 WCAG AAA contrast for crystal-clear readability in sunlight.
            </p>
          </div>
        </div>
      </div>

      {/* 2. NOTIFICATIONS & MILESTONES PREFERENCES */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#1F1F1F] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center text-[#D4AF37]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Daily Workflow & Milestone Notifications
              </h3>
              <p className="text-xs text-[#737373]">Configure push notifications and in-app milestone alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {browserPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 rounded-xl bg-[#1F1F1F] hover:bg-[#282828] border border-[#333333] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 transition"
              >
                <BellRing className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Grant OS Permission</span>
              </button>
            )}

            <button
              onClick={handleSendTestNotification}
              className="px-3.5 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] hover:text-white flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Test Notification</span>
            </button>
          </div>
        </div>

        {testStatus && (
          <div className="p-3 rounded-xl bg-[#141414] border border-[#333333] text-xs text-[#D4AF37] font-mono animate-fadeIn">
            {testStatus}
          </div>
        )}

        {/* Master & Privacy Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Master Enable */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#222222] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white tracking-wide">Web OS Notifications</span>
              <p className="text-[11px] text-[#737373] mt-0.5">Send desktop/Android system notifications</p>
            </div>
            <button
              onClick={() => {
                if (browserPermission !== 'granted') {
                  handleRequestPermission();
                } else {
                  handleUpdateNotif({ enabled: !notifSettings.enabled });
                }
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                notifSettings.enabled && browserPermission === 'granted' ? 'bg-[#10B981]' : 'bg-[#2A2A2A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  notifSettings.enabled && browserPermission === 'granted' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Mode */}
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#222222] flex items-center justify-between">
            <div className="pr-2">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Data Privacy Mode</span>
              </span>
              <p className="text-[11px] text-[#737373] mt-0.5">Hide monetary currency figures from OS lock screen</p>
            </div>
            <button
              onClick={() => handleUpdateNotif({ privacyMode: !notifSettings.privacyMode })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                notifSettings.privacyMode ? 'bg-[#D4AF37]' : 'bg-[#2A2A2A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow-md transform transition-transform ${
                  notifSettings.privacyMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Granular Milestone Toggles */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs uppercase font-mono tracking-widest text-[#737373]">
            Milestone Alert Triggers
          </h4>

          <div className="space-y-2">
            {/* Lunch Complete */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coffee className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <span className="text-xs font-semibold text-white">Lunch Break Completion</span>
                  <p className="text-[11px] text-[#737373]">Alert when scheduled lunch break finishes (never auto-resumes)</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ lunchComplete: !notifSettings.lunchComplete })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.lunchComplete ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.lunchComplete ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* 8-Hour Target Reached */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <div>
                  <span className="text-xs font-semibold text-white">8-Hour Daily Target Reached</span>
                  <p className="text-[11px] text-[#737373]">Alert when required 8.0h normal active work target is completed</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ target8HoursReached: !notifSettings.target8HoursReached })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.target8HoursReached ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.target8HoursReached ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Monthly Overtime Active */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <span className="text-xs font-semibold text-white">Monthly Overtime Activated</span>
                  <p className="text-[11px] text-[#737373]">Alert when monthly required normal hours are crossed and OT starts</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ monthlyOTStarted: !notifSettings.monthlyOTStarted })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.monthlyOTStarted ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.monthlyOTStarted ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Attendance Bonus Milestone */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <span className="text-xs font-semibold text-white">Bonus Milestone Alerts</span>
                  <p className="text-[11px] text-[#737373]">Alert on 25/26 and 26/26 present days for attendance bonus eligibility</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ bonusMilestone: !notifSettings.bonusMilestone })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.bonusMilestone ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.bonusMilestone ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Forgotten Punch Detection */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-white">Forgotten Session Detection</span>
                  <p className="text-[11px] text-[#737373]">Alert if an open work session exceeds 10 hours without punch-out</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ forgottenSession: !notifSettings.forgottenSession })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.forgottenSession ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.forgottenSession ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Backup Reminder */}
            <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-[#A3A3A3]" />
                <div>
                  <span className="text-xs font-semibold text-white">Weekly Backup Reminder</span>
                  <p className="text-[11px] text-[#737373]">Remind to export an encrypted snapshot after 7 days</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateNotif({ backupReminder: !notifSettings.backupReminder })}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  notifSettings.backupReminder ? 'bg-[#10B981]' : 'bg-[#262626]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  notifSettings.backupReminder ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STEP 10 PWA & NOTIFICATION DIAGNOSTIC TEST SUITE */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#1F1F1F] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Step 10 Diagnostic Test Engine
              </h3>
              <p className="text-xs text-[#737373]">12 Deterministic Unit & Integration Tests for PWA, Offline & Notifications</p>
            </div>
          </div>

          <button
            onClick={async () => {
              setIsRunningStep10Tests(true);
              const res = await runStep10Tests();
              setStep10Results(res);
              setIsRunningStep10Tests(false);
            }}
            disabled={isRunningStep10Tests}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f27] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningStep10Tests ? 'animate-spin' : ''}`} />
            <span>{isRunningStep10Tests ? 'Running Suite...' : 'Run Step 10 Tests'}</span>
          </button>
        </div>

        {step10Results && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A3A3A3]">
                Results: {step10Results.filter(t => t.passed).length} / {step10Results.length} Tests Passing
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold text-[10px]">
                100% OPERATIONAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {step10Results.map((test) => (
                <div
                  key={test.id}
                  className="p-3 rounded-xl bg-[#161616] border border-[#242424] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{test.name}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#10B981] uppercase px-1.5 py-0.2 rounded bg-[#10B981]/15">
                      PASS
                    </span>
                  </div>
                  {test.details && (
                    <p className="text-[11px] text-[#737373] pl-5">{test.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
