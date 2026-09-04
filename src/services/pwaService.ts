// ============================================================================
// SALARYPULSE — PWA REGISTRATION & LIFECYCLE SERVICE
// Handles Service Worker registration, install prompts, offline state, and zero-loss update flows
// ============================================================================

import { PwaState } from '../types';

type PwaStateListener = (state: PwaState) => void;

const DISMISS_KEY = 'salarypulse_pwa_install_dismissed';

export class PwaService {
  private static deferredPrompt: any = null;
  private static waitingWorker: ServiceWorker | null = null;
  private static listeners: Set<PwaStateListener> = new Set();

  private static state: PwaState = {
    isInstalled: false,
    isInstallPromptAvailable: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false,
    swRegistered: false,
    installPromptDismissed: typeof localStorage !== 'undefined' ? !!localStorage.getItem(DISMISS_KEY) : false,
  };

  /**
   * Initialize PWA listeners and Service Worker registration
   */
  static init(): void {
    if (typeof window === 'undefined') return;

    // Check display mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    this.updateState({
      isInstalled: isStandalone,
      isOnline: navigator.onLine,
      installPromptDismissed: !!localStorage.getItem(DISMISS_KEY),
    });

    // Listen to network status
    window.addEventListener('online', () => {
      this.updateState({ isOnline: true });
    });
    window.addEventListener('offline', () => {
      this.updateState({ isOnline: false });
    });

    // Listen to display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.updateState({ isInstalled: e.matches });
    });

    // Capture beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.updateState({ isInstallPromptAvailable: true });
    });

    // Track app installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.updateState({ isInstalled: true, isInstallPromptAvailable: false });
    });

    // Register Service Worker in production and standard runtime
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            this.updateState({ swRegistered: true });

            // Check if there is an updated worker already waiting
            if (reg.waiting) {
              this.waitingWorker = reg.waiting;
              this.updateState({ isUpdateAvailable: true });
            }

            // Check for update found
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.waitingWorker = newWorker;
                    this.updateState({ isUpdateAvailable: true });
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('PwaService: Service Worker registration failed (normal in dev sandbox):', err);
          });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            // Only reload if user explicitly accepted update
          }
        });
      });
    }
  }

  /**
   * Subscribe to PWA state changes
   */
  static subscribe(listener: PwaStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get snapshot of current PWA state
   */
  static getState(): PwaState {
    return { ...this.state };
  }

  /**
   * Trigger native install prompt
   */
  static async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.updateState({ isInstallPromptAvailable: false });
      return choiceResult.outcome === 'accepted';
    } catch (e) {
      console.warn('PwaService: promptInstall failed', e);
      return false;
    }
  }

  /**
   * Dismiss install banner and remember choice locally
   */
  static dismissInstallPrompt(): void {
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch (e) {
      // ignore
    }
    this.updateState({ installPromptDismissed: true });
  }

  /**
   * Reset install prompt dismissal (e.g. from Settings)
   */
  static resetInstallDismissal(): void {
    try {
      localStorage.removeItem(DISMISS_KEY);
    } catch (e) {
      // ignore
    }
    this.updateState({ installPromptDismissed: false });
  }

  /**
   * Apply available Service Worker update safely without abrupt data loss
   */
  static applyUpdate(): void {
    if (this.waitingWorker) {
      this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Short delay before reload
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      window.location.reload();
    }
  }

  private static updateState(partial: Partial<PwaState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l({ ...this.state }));
  }
}
