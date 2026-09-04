import { Holiday } from '../types';

export const HolidayEngine = {
  /**
   * Check if a given date is in holiday list
   */
  isHoliday(dateStr: string, holidays: Holiday[]): Holiday | undefined {
    return holidays.find(h => h.date === dateStr);
  },

  /**
   * Filter holidays falling within a specific month (YYYY-MM)
   */
  getHolidaysForMonth(monthKey: string, holidays: Holiday[]): Holiday[] {
    return holidays.filter(h => h.date.startsWith(monthKey));
  }
};
