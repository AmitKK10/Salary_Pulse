// ============================================================================
// SALARYPULSE — DATE & CALENDAR ENGINE
// Month-aware working day calculations, scheduled dates, and holiday mapping
// ============================================================================

import { Holiday, WorkSchedule } from '../types';

export class DateEngine {
  /**
   * Returns the number of calendar days in a given year-month (e.g. "2026-08" -> 31)
   */
  static getDaysInMonth(yearMonth: string): number {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }

  /**
   * Generates all YYYY-MM-DD date strings in the given month
   */
  static getMonthDates(yearMonth: string): string[] {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates: string[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      dates.push(`${year}-${monthStr}-${dayStr}`);
    }
    return dates;
  }

  /**
   * Returns day of week number: 0 = Sun, 1 = Mon, ..., 6 = Sat
   */
  static getDayOfWeek(dateStr: string): number {
    return new Date(`${dateStr}T12:00:00`).getDay();
  }

  /**
   * Checks if a date falls on a configured working weekday (e.g. Mon-Sat)
   */
  static isWorkingWeekday(dateStr: string, workingDays: number[]): boolean {
    const dayOfWeek = this.getDayOfWeek(dateStr);
    return workingDays.includes(dayOfWeek);
  }

  /**
   * Checks if a date is a weekly-off (e.g. Sunday)
   */
  static isWeeklyOff(dateStr: string, schedule: WorkSchedule): boolean {
    const workingDays = schedule.workingDays || [1, 2, 3, 4, 5, 6];
    return !this.isWorkingWeekday(dateStr, workingDays);
  }

  /**
   * Finds if a given date is registered as a holiday
   */
  static getHolidayForDate(dateStr: string, holidays: Holiday[] = []): Holiday | undefined {
    return (holidays || []).find(h => h.date === dateStr);
  }

  /**
   * Calculates dynamic scheduled working days for a specific month.
   */
  static getScheduledWorkingDaysCount(
    yearMonth: string,
    schedule: WorkSchedule,
    holidays: Holiday[] = []
  ): number {
    const dates = this.getMonthDates(yearMonth);
    const workingDays = schedule.workingDays || [1, 2, 3, 4, 5, 6];

    let count = 0;
    for (const dateStr of dates) {
      const isWorkDay = workingDays.includes(this.getDayOfWeek(dateStr));
      const holiday = this.getHolidayForDate(dateStr, holidays);
      
      if (isWorkDay && !holiday) {
        count++;
      }
    }
    return count;
  }

  /**
   * Returns all scheduled working date strings for a given month
   */
  static getScheduledWorkingDates(
    yearMonth: string,
    schedule: WorkSchedule,
    holidays: Holiday[]
  ): string[] {
    const dates = this.getMonthDates(yearMonth);
    const workingDays = schedule.workingDays || [1, 2, 3, 4, 5, 6];

    return dates.filter(dateStr => {
      const isWorkDay = workingDays.includes(this.getDayOfWeek(dateStr));
      const holiday = this.getHolidayForDate(dateStr, holidays);
      return isWorkDay && !holiday;
    });
  }

  /**
   * Returns list of holidays occurring within the specified month
   */
  static getHolidaysInMonth(yearMonth: string, holidays: Holiday[]): Holiday[] {
    return holidays.filter(h => h.date.startsWith(yearMonth));
  }

  /**
   * Returns list of paid holidays occurring within the specified month
   */
  static getPaidHolidaysInMonth(yearMonth: string, holidays: Holiday[]): Holiday[] {
    return holidays.filter(h => h.date.startsWith(yearMonth) && h.type === 'paid');
  }

  /**
   * Formats YYYY-MM into a friendly string like "August 2026"
   */
  static formatMonthYear(yearMonth: string): string {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Returns short or full month name (e.g. "Aug" or "August")
   */
  static getMonthName(yearMonth: string, full = false): string {
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: full ? 'long' : 'short' });
  }

  /**
   * Returns weekday name for a date (e.g. "Mon" or "Monday")
   */
  static getDayName(dateStr: string, full = false): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: full ? 'long' : 'short' });
  }

  /**
   * Shifts month string by delta (e.g., "2026-08", +1 -> "2026-09")
   */
  static offsetMonth(yearMonth: string, delta: number): string {
    const [year, month] = yearMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + delta, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${m < 10 ? '0' : ''}${m}`;
  }
}
