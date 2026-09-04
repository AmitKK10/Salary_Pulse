// ============================================================================
// SALARYPULSE — PWA UPDATE TOAST
// Notifies user when a new Service Worker update is ready without interrupting active sessions
// ============================================================================

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { PwaService } from '../../services/pwaService';
import { PwaState } from '../../types';

export const PwaUpdateToast: React.FC = () => {
  const [pwaState, setPwaState] = useState<PwaState>(PwaService.getState());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return PwaService.subscribe((state) => {
      setPwaState(state);
    });
  }, []);

  if (!pwaState.isUpdateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    PwaService.applyUpdate();
  };

  return (
    <div
      id="pwa-update-toast"
      className="fixed top-20 right-4 md:right-8 z-50 bg-[#161616] border border-[#D4AF37]/50 rounded-2xl p-4 shadow-2xl animate-fadeIn max-w-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
            <span>New Version Available</span>
          </h4>
          <p className="text-[11px] text-[#A3A3A3] mt-1 leading-relaxed">
            An updated version of SalaryPulse has been downloaded. Update now to apply performance improvements.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleUpdate}
              className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#c49f27] text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Now</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-[#888] hover:text-white text-[11px] font-semibold uppercase tracking-wider transition"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#737373] hover:text-white p-1"
          title="Dismiss update alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
