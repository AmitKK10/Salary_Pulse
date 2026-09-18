import { useSyncExternalStore } from 'react';

// Authoritative timestamp-driven ticking engine (drift-free, single shared interval)
let currentTimestamp = Date.now();
const listeners = new Set<() => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function onTick() {
  currentTimestamp = Date.now();
  listeners.forEach(listener => listener());
}

function startTimer() {
  if (timerId === null) {
    currentTimestamp = Date.now();
    timerId = setInterval(onTick, 1000);
  }
}

function stopTimer() {
  if (listeners.size === 0 && timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

export function subscribeToSecondTick(listener: () => void): () => void {
  listeners.add(listener);
  startTimer();
  return () => {
    listeners.delete(listener);
    stopTimer();
  };
}

export function getAuthoritativeTimestamp(): number {
  return currentTimestamp;
}

/**
 * Lightweight React hook that triggers a re-render every 1 second
 * using the authoritative Date.now() timestamp.
 * 
 * - Drift-free: always queries Date.now()
 * - Background/sleep resilient: on tab resume, Date.now() is immediately accurate
 * - Resource friendly: only one setInterval shared across all subscribers
 */
export function useSecondTick(): number {
  return useSyncExternalStore(
    subscribeToSecondTick,
    getAuthoritativeTimestamp,
    getAuthoritativeTimestamp
  );
}

export function useLiveClock(): number {
  return useSecondTick();
}
