import React from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  Calendar as CalendarIcon, 
  Receipt, 
  SlidersHorizontal, 
  TrendingUp, 
  ClipboardCheck, 
  Settings as SettingsIcon,
  CircleDot,
  FileCheck2,
  Scale,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { formatCurrency, formatSecondsToClock } from '../../utils/formatters';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    isCurrentlyWorking, 
    isOnBreak, 
    currentLiveSeconds,
    salaryCalculation,
    reconciliationReport,
    currentSalaryReconciliation
  } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'live-work', label: 'Live Work', icon: <Timer className="w-4 h-4" />, badge: isCurrentlyWorking ? 'LIVE' : undefined },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'salary', label: 'Salary Slip', icon: <Receipt className="w-4 h-4" /> },
    { id: 'simulator', label: 'Prediction', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'reconciliation', label: 'PDF Reconcile', icon: <FileCheck2 className="w-4 h-4" />, badge: reconciliationReport?.summary?.discrepanciesCount ? `${reconciliationReport.summary.discrepanciesCount} DIFF` : 'AI' },
    { id: 'salary-reconciliation', label: 'Salary Reconcile', icon: <Scale className="w-4 h-4" />, badge: currentSalaryReconciliation?.status === 'DISPUTE_RAISED' ? 'DISPUTE' : '3-WAY' },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'widget', label: 'Android Widget', icon: <Smartphone className="w-4 h-4" />, badge: 'PWA' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside
      id="sidebar-navigation"
      className="hidden md:flex flex-col w-[250px] bg-[#0E0E0E] border-r border-[#1F1F1F] shrink-0 h-screen sticky top-0 select-none z-30 font-sans"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1F1F1F] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center shadow-md">
            <div className="w-3.5 h-3.5 bg-[#0A0A0A] rounded-full"></div>
          </div>
          <div>
            <span className="text-xl font-semibold tracking-tight text-white uppercase italic font-serif-display">
              SalaryPulse
            </span>
            <div className="text-[9px] uppercase tracking-[0.25em] text-[#737373] font-medium">
              Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Widget Card */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${
                isOnBreak ? 'bg-[#D4AF37] animate-pulse' : isCurrentlyWorking ? 'bg-[#10B981] animate-pulse' : 'bg-[#555555]'
              }`} />
              <span className="text-[#A3A3A3] text-[11px] uppercase tracking-wider">
                {isOnBreak ? 'On Break' : isCurrentlyWorking ? 'Live Working' : 'Off Duty'}
              </span>
            </div>
            <span className="font-mono text-white text-[11px] font-semibold">
              {formatSecondsToClock(currentLiveSeconds)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1.5 border-t border-[#1F1F1F]">
            <span className="text-[9px] uppercase tracking-widest text-[#737373]">Today's Yield</span>
            <span className="font-serif-display text-sm font-bold text-[#D4AF37]">
              {formatCurrency((currentLiveSeconds * salaryCalculation.perSecondRate))}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#737373]">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A1A1A] text-white border border-[#2B2B2B] shadow-sm font-semibold'
                  : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#D4AF37]' : 'text-[#737373]'}>
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Mini Footer */}
      <div className="p-4 border-t border-[#1F1F1F] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center font-bold text-xs text-[#D4AF37]">
            {(user?.name || 'User').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Amit Kumar'}</p>
            <p className="text-[10px] text-[#737373] uppercase tracking-wider truncate">{user?.role || 'Senior Engineer'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
