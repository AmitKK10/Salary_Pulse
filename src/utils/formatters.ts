import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number, symbol = '₹'): string => {
  if (isNaN(amount)) return `${symbol}0`;
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
};

export const formatSecondsToDetailed = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

export const formatSecondsToClock = (seconds: number): string => {
  const isNegative = seconds < 0;
  const s = Math.max(0, Math.floor(Math.abs(seconds)));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  
  const sign = isNegative ? '-' : '';
  return `${sign}${[hrs, mins, secs].map(v => String(v).padStart(2, '0')).join(':')}`;
};

export const formatSecondsToHMS = formatSecondsToClock;
export const formatSecondsToHHMMSS = formatSecondsToClock;

export const formatDurationHM = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatDurationHoursMinutes = formatDurationHM;

export const formatTimeDisplay = (isoOrTimeStr?: string): string => {
  if (!isoOrTimeStr) return '--:--';
  try {
    if (isoOrTimeStr.includes('T')) {
      return format(parseISO(isoOrTimeStr), 'hh:mm a');
    }
    return isoOrTimeStr;
  } catch {
    return isoOrTimeStr;
  }
};
