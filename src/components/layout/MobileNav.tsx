// ============================================================================
// SALARYPULSE — LUXURY MOBILE BOTTOM NAVIGATION
// Refined obsidian + metallic gold + emerald mobile navigation bar
// Fixed to bottom, safe-area-inset aware, 54px touch targets, zero clipping
// ============================================================================

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Menu, 
  X, 
  Receipt, 
  SlidersHorizontal, 
  FileCheck2, 
  Scale, 
  Settings as SettingsIcon,
  ChevronRight,
  ClipboardList,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, isCurrentlyWorking, isOnBreak } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'dashboard', 
      label: 'HOME', 
      icon: <LayoutDashboard className="w-[19px] h-[19px] transition-transform duration-200" /> 
    },
    { 
      id: 'live-work', 
      label: 'LIVE WORK', 
      icon: <Timer className="w-[19px] h-[19px] transition-transform duration-200" /> 
    },
    { 
      id: 'calendar', 
      label: 'CALENDAR', 
      icon: <CalendarIcon className="w-[19px] h-[19px] transition-transform duration-200" /> 
    },
    { 
      id: 'analytics', 
      label: 'ANALYTICS', 
      icon: <TrendingUp className="w-[19px] h-[19px] transition-transform duration-200" /> 
    },
  ];

  const moreItems: { id: NavigationTab; label: string; description: string; icon: React.ReactNode; badge?: string }[] = [
    { 
      id: 'simulator', 
      label: 'Salary Predictor', 
      description: 'Run what-if scenario forecasts & target income calculator', 
      icon: <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />,
      badge: 'PROJECTION'
    },
    { 
      id: 'salary', 
      label: 'Monthly Payslip', 
      description: 'Itemized salary slip with breakdown & export options', 
      icon: <Receipt className="w-4 h-4 text-[#10B981]" /> 
    },
    { 
      id: 'salary-reconciliation', 
      label: '3-Way Reconciliation', 
      description: 'Reconcile SalaryPulse, official payslip, & bank credits', 
      icon: <Scale className="w-4 h-4 text-amber-400" /> 
    },
    { 
      id: 'reconciliation', 
      label: 'Biometric PDF Sync', 
      description: 'Import company attendance logs and resolve variances', 
      icon: <FileCheck2 className="w-4 h-4 text-sky-400" /> 
    },
    { 
      id: 'attendance', 
      label: 'Attendance History', 
      description: 'Comprehensive day logs, punch sessions, and audit entries', 
      icon: <ClipboardList className="w-4 h-4 text-[#A3A3A3]" /> 
    },
    { 
      id: 'widget', 
      label: 'Android Home Widget', 
      description: 'Live widget metrics, progress rings, and PWA launcher shortcuts', 
      icon: <Smartphone className="w-4 h-4 text-[#D4AF37]" />,
      badge: 'WIDGET'
    },
    { 
      id: 'settings', 
      label: 'Settings & Payroll Rules', 
      description: 'Configure hourly rates, OT rules, backups, and PWA options', 
      icon: <SettingsIcon className="w-4 h-4 text-[#888888]" /> 
    },
  ];

  const isMoreActive = moreItems.some((item) => item.id === activeTab);

  const handleSelectMoreTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* 1. Primary Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-navigation"
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090C]/95 backdrop-blur-2xl border-t border-[#1C1C22] rounded-t-2xl px-1.5 pt-1.5 pb-[max(0.45rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.9)] select-none"
      >
        {primaryTabs.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMoreOpen(false);
              }}
              className="relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 rounded-xl transition-all duration-150 ease-out active:scale-[0.90] active:translate-y-0.5 active:bg-white/[0.06] active:duration-75 touch-manipulation group focus:outline-none cursor-pointer select-none"
            >
              {/* Subtle top indicator pip */}
              {isActive && (
                <div className="absolute top-0 w-5 h-0.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              )}

              {/* Icon Container with live indicator badge */}
              <div className="relative flex items-center justify-center mt-0.5">
                <div className={`transition-transform duration-150 ease-out group-active:scale-90 ${isActive ? 'text-[#D4AF37] scale-105' : 'text-[#6E6E78] group-hover:text-[#BBBBCC]'}`}>
                  {item.icon}
                </div>

                {/* Live Work Emerald Pulse Dot Indicator */}
                {item.id === 'live-work' && isCurrentlyWorking && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981] ring-2 ring-[#09090C]" />
                  </span>
                )}

                {/* Live Work Break Amber Dot Indicator */}
                {item.id === 'live-work' && !isCurrentlyWorking && isOnBreak && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 ring-2 ring-[#09090C]" />
                  </span>
                )}
              </div>

              {/* Uppercase Letter-Spaced Label */}
              <span 
                className={`text-[8px] sm:text-[8.5px] mt-1 tracking-[0.08em] uppercase font-mono transition-colors duration-200 truncate max-w-full text-center ${
                  isActive 
                    ? 'text-[#D4AF37] font-bold' 
                    : 'text-[#6E6E78] font-medium group-hover:text-[#AAAAAA]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th 'MORE' Tab */}
        <button
          id="mobile-nav-more"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[48px] py-1 px-0.5 rounded-xl transition-all duration-150 ease-out active:scale-[0.90] active:translate-y-0.5 active:bg-white/[0.06] active:duration-75 touch-manipulation group focus:outline-none cursor-pointer select-none"
        >
          {/* Subtle top indicator pip if More active or open */}
          {(isMoreActive || isMoreOpen) && (
            <div className="absolute top-0 w-5 h-0.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          )}

          <div className="relative flex items-center justify-center mt-0.5">
            <div className={`transition-transform duration-150 ease-out group-active:scale-90 ${isMoreActive || isMoreOpen ? 'text-[#D4AF37] scale-105' : 'text-[#6E6E78] group-hover:text-[#BBBBCC]'}`}>
              <Menu className="w-[19px] h-[19px] transition-transform duration-200" />
            </div>
          </div>

          <span 
            className={`text-[8px] sm:text-[8.5px] mt-1 tracking-[0.08em] uppercase font-mono transition-colors duration-200 truncate max-w-full text-center ${
              isMoreActive || isMoreOpen
                ? 'text-[#D4AF37] font-bold' 
                : 'text-[#6E6E78] font-medium group-hover:text-[#AAAAAA]'
            }`}
          >
            MORE
          </span>
        </button>
      </nav>

      {/* 2. 'More' Navigation Sheet / Drawer */}
      {isMoreOpen && (
        <div
          id="mobile-more-sheet"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md transition-opacity duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-[#101014] border-t border-[#222228] rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1E1E24]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8A8A94]">
                  SALARYPULSE NAVIGATION
                </span>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  More Features & Tools
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-[#8A8A94] hover:text-white hover:bg-[#1A1A20] transition-all duration-150 active:scale-90 active:duration-75 cursor-pointer"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of features */}
            <div className="space-y-2">
              {moreItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-sheet-${item.id}`}
                    onClick={() => handleSelectMoreTab(item.id)}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all duration-150 ease-out active:scale-[0.97] active:translate-y-0.5 active:brightness-95 active:duration-75 touch-manipulation border cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#18181E] border-[#D4AF37]/45 text-white shadow-lg'
                        : 'bg-[#131317] border-[#202026] text-[#A3A3A3] hover:bg-[#1A1A20] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2 rounded-xl bg-[#0B0B0E] border border-[#222228] shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-wide truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-mono font-bold shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#787882] truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#555560] shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

