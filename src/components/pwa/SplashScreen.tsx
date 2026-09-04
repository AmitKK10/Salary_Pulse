// ============================================================================
// SALARYPULSE — PWA LAUNCH & SPLASH SCREEN
// Sophisticated Dark entrance branding for standalone and first-launch experiences
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 700ms then smooth fade out
    const timer1 = setTimeout(() => {
      setFading(true);
    }, 700);

    const timer2 = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      id="pwa-splash-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0A0A0A] p-8 text-white transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer */}
      <div className="pt-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#737373] font-mono">
          SECURE PAYROLL & ATTENDANCE
        </span>
      </div>

      {/* Center Branding & Logo */}
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#121212] to-[#0A0A0A] border border-[#262626] shadow-2xl">
          {/* Subtle gold glow behind icon */}
          <div className="absolute inset-0 bg-[#D4AF37]/15 blur-xl rounded-3xl" />
          
          <svg className="w-12 h-12 text-[#D4AF37] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#D4AF37" />
            <path d="M3 12h3l3-6 4 12 3-6h5" stroke="#10B981" strokeWidth="1.75" />
          </svg>

          {/* Live pulse dot indicator */}
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight font-serif-display text-white">
            Salary<span className="text-[#D4AF37] font-normal">Pulse</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#A3A3A3] mt-2 font-mono">
            PRECISION EARNINGS ENGINE
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
          <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-[10px] uppercase font-mono tracking-wider text-[#D4AF37]">
            LIVE EARNINGS
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-[10px] uppercase font-mono tracking-wider text-[#10B981]">
            ATTENDANCE
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#141414] border border-[#262626] text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">
            OVERTIME
          </span>
        </div>
      </div>

      {/* Bottom Loading Indicator */}
      <div className="flex flex-col items-center space-y-3 pb-4">
        <div className="w-36 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] w-full animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Local Persistence Active · Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
