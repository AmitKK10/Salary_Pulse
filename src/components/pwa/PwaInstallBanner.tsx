// ============================================================================
// SALARYPULSE — PWA INSTALL BANNER & PROMPT
// Subtle, non-intrusive prompt allowing one-tap installation on Android, iOS, and Desktop
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Zap, ShieldCheck, Check } from 'lucide-react';
import { PwaService } from '../../services/pwaService';
import { PwaState } from '../../types';

export const PwaInstallBanner: React.FC = () => {
  const [pwaState, setPwaState] = useState<PwaState>(PwaService.getState());
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    return PwaService.subscribe((state) => {
      setPwaState(state);
    });
  }, []);

  // Do not show if already installed or dismissed or install prompt not ready
  if (pwaState.isInstalled || pwaState.installPromptDismissed || !pwaState.isInstallPromptAvailable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await PwaService.promptInstall();
    setIsInstalling(false);
    if (!accepted) {
      // User declined prompt
    }
  };

  const handleDismiss = () => {
    PwaService.dismissInstallPrompt();
  };

  return (
    <div
      id="pwa-install-banner"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 shadow-2xl animate-fadeIn backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F1F1F] to-[#121212] border border-[#333333] flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
              <span>Install SalaryPulse</span>
              <span className="px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] text-[9px] font-bold">PWA</span>
            </h4>
            <p className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed">
              Install for instant home-screen launch, zero-lag background timers, and full offline payroll tracking.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition shrink-0"
          title="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-[#737373] font-mono">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#D4AF37]" /> Faster
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#10B981]" /> Offline
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#888888] hover:text-white uppercase tracking-wider transition"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-md disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalling ? 'Installing...' : 'Install'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
