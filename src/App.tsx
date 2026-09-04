import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/views/DashboardView';
import { LiveWorkView } from './components/views/LiveWorkView';
import { CalendarView } from './components/views/CalendarView';
import { SalaryView } from './components/views/SalaryView';
import { SimulatorView } from './components/views/SimulatorView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AttendanceView } from './components/views/AttendanceView';
import { ReconciliationView } from './components/views/ReconciliationView';
import { SalaryReconciliationView } from './components/views/SalaryReconciliationView';
import { WidgetView } from './components/views/WidgetView';
import { SettingsView } from './components/views/SettingsView';

import { SplashScreen } from './components/pwa/SplashScreen';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { PwaUpdateToast } from './components/pwa/PwaUpdateToast';
import { InAppNotificationCenter } from './components/pwa/InAppNotificationCenter';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { usePWAUrlActions } from './hooks/usePWAUrlActions';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, salaryConfig, appSettings } = useApp();

  // Listen and handle Android PWA Shortcuts & URL Launch Actions
  usePWAUrlActions();

  // Synchronize document theme attribute and light-theme class
  useEffect(() => {
    const theme = appSettings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    }
  }, [appSettings?.theme]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'live-work':
        return <LiveWorkView />;
      case 'calendar':
        return <CalendarView />;
      case 'salary':
        return <SalaryView />;
      case 'simulator':
        return <SimulatorView />;
      case 'reconciliation':
        return <ReconciliationView />;
      case 'salary-reconciliation':
        return <SalaryReconciliationView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'widget':
        return <WidgetView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const isLight = appSettings?.theme === 'light';

  return (
    <div
      id="salarypulse-app"
      className={`flex min-h-screen ${
        isLight ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0A0A0A] text-[#F5F5F5]'
      } font-sans antialiased selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]`}
    >
      {/* PWA Initial Splash Screen */}
      <SplashScreen />

      {/* In-App Milestone Notifications & Floating Alerts */}
      <InAppNotificationCenter />

      {/* PWA Update Ready Toast */}
      <PwaUpdateToast />

      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Arena */}
      <div
        className={`flex-1 flex flex-col min-w-0 pb-16 md:pb-0 ${
          isLight
            ? 'bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]'
            : 'bg-gradient-to-br from-[#0A0A0A] to-[#121212]'
        }`}
      >
        {/* Global Header */}
        <Header />

        {/* Dynamic Page Content with Error Boundary */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 max-w-7xl w-full mx-auto overflow-y-auto">
          <ErrorBoundary
            onResetToDashboard={() => setActiveTab('dashboard')}
            onOpenDataHealth={() => setActiveTab('settings')}
          >
            {renderActiveView()}
          </ErrorBoundary>
        </main>

        {/* Desktop System Status Ticker Footer */}
        <footer
          className={`hidden md:flex h-11 border-t items-center px-10 shrink-0 text-[10px] uppercase tracking-[0.2em] ${
            isLight
              ? 'border-[#E2E8F0] bg-white text-slate-600'
              : 'border-[#1A1A1A] bg-[#0A0A0A] text-[#555555]'
          }`}
        >
          <div className="flex gap-6 items-center">
            <span>Calculation Method: {salaryConfig.overtimeMethod === 'monthly_threshold' ? 'Monthly Threshold' : 'Daily Threshold'}</span>
            <span className={isLight ? 'text-amber-800 font-bold' : 'text-[#D4AF37]'}>Multiplier: {salaryConfig.overtimeMultiplier}x</span>
            <span>Precision: Seconds</span>
          </div>
          <div className="ml-auto text-[10px] uppercase tracking-[0.2em]">
            System Ready. Local Persistence Enabled.
          </div>
        </footer>
      </div>

      {/* PWA Install Banner Prompt */}
      <PwaInstallBanner />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
