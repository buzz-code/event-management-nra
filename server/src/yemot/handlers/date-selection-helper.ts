import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { BaseYemotHandler } from '../core/base-yemot-handler';
import {
  getIndexByJewishMonth,
  getJewishMonthByIndex,
  getJewishMonthInHebrew,
  getJewishMonthsInOrder,
  JewishMonthType,
  toGregorianDate,
  toJewishDate,
} from 'jewish-date';
import { FormatUtils } from '../utils/format-utils';

/**
 * Interface for date selection results
 */
export interface DateSelectionResult {
  day: number;
  month: number;
  hebrewDate: string;
  gregorianDate: Date;
}

/**
 * Helper for Hebrew date selection and conversion
 * Follows the new patterns and uses the utility classes
 */
export class DateSelectionHelper extends BaseYemotHandler {
  private selectedDay: number | null = null;
  private selectedMonth: number | null = null;
  private fullHebrewDate: string | null = null;
  private gregorianDate: Date | null = null;
  private currentJewishYear: number;
  private nextJewishYear: number;

  /**
   * Constructor for the DateSelectionHelper
   * @param call The enhanced Yemot call object with data access capabilities
   */
  constructor(call: Call) {
    super(call);

    // Initialize with the current Jewish year and next year
    const today = toJewishDate(new Date());
    this.currentJewishYear = today.year;
    this.nextJewishYear = today.year + 1;
  }

  /**
   * Handles the complete date selection process
   * @returns The selected date information or null if selection failed
   */
  async handleDateSelection(): Promise<DateSelectionResult | null> {
    this.logStart('handleDateSelection');

    let dateConfirmed = false;

    try {
      const success = await this.withRetry(
        async () => {
          // Collect day and month information
          this.selectedDay = await this.collectDay();
          this.selectedMonth = await this.collectMonth();

          // Convert to Gregorian
          this.gregorianDate = this.convertToGregorian();

          // Format the date in Hebrew
          this.fullHebrewDate = FormatUtils.formatHebrewDate(this.gregorianDate);

          // Confirm the date with the user
          dateConfirmed = await this.confirmDate();

          if (!dateConfirmed) {
            throw new Error('Date not confirmed');
          }

          return true;
        },
        '',
        this.call.getText('GENERAL.MAX_ATTEMPTS_REACHED'),
      );

      if (!success || !this.gregorianDate) {
        this.call.logError('Date selection failed: No valid date was selected');
        return null;
      }

      const result: DateSelectionResult = {
        day: this.selectedDay!,
        month: this.selectedMonth!,
        hebrewDate: this.fullHebrewDate!,
        gregorianDate: this.gregorianDate,
      };

      this.logComplete('handleDateSelection', { date: this.fullHebrewDate });
      return result;
    } catch (error) {
      this.logError('handleDateSelection', error as Error);
      await this.call.hangupWithMessage(this.call.getText('GENERAL.ERROR'));
      return null;
    }
  }

  /**
   * Collects the day of the month from the user
   * @returns The selected day number
   */
  private async collectDay(): Promise<number> {
    this.logStart('collectDay');

    const day = await this.call.readDigits(this.call.getText('DATE.DAY_PROMPT'), {
      max_digits: 2,
      min_digits: 1,
    });

    const dayNumber = parseInt(day);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
      throw new Error(this.call.getText('DATE.INVALID_DAY'));
    }

    this.call.logInfo(`User entered day: ${dayNumber}`);
    this.logComplete('collectDay', { day: dayNumber });
    return dayNumber;
  }

  /**
   * Collects the Hebrew month from the user
   * @returns The selected month number
   */
  private async collectMonth(): Promise<number> {
    this.logStart('collectMonth');

    const months = this.getHebrewMonthsList();
    const monthNames = months.map(({ hebrewName }, index) => `${index + 1} - ${hebrewName}`);

    const monthMessage = this.call.getText('DATE.MONTH_PROMPT', { options: monthNames.join(', ') });

    const month = await this.call.readDigits(monthMessage, {
      max_digits: 2,
      min_digits: 1,
    });

    const monthNumber = parseInt(month);
    const selectedMonth = months[monthNumber - 1];

    if (!selectedMonth) {
      throw new Error(this.call.getText('DATE.INVALID_MONTH', { maxMonth: months.length.toString() }));
    }

    this.call.logInfo(
      `User entered month: ${monthNumber}, Hebrew name: ${selectedMonth.hebrewName}, monthIndex: ${selectedMonth.index}`,
    );
    this.logComplete('collectMonth', { month: selectedMonth.index });
    return selectedMonth.index;
  }

  /**
   * Gets a list of Hebrew months with their indices and names
   */
  private getHebrewMonthsList(): Array<{
    month: JewishMonthType;
    index: number;
    hebrewName: string;
  }> {
    return getJewishMonthsInOrder(this.currentJewishYear)
      .map((month) => month as JewishMonthType)
      .map((month) => ({ month, index: getIndexByJewishMonth(month) }))
      .filter(({ index }) => index !== 0)
      .map(({ month, index }) => ({
        month,
        index,
        hebrewName: getJewishMonthInHebrew(month),
      }));
  }

  /**
   * Converts the selected Hebrew date to a Gregorian date
   * @returns The equivalent Gregorian date
   */
  private convertToGregorian(): Date {
    if (!this.selectedDay || !this.selectedMonth) {
      throw new Error('Cannot convert to Gregorian: day or month is missing');
    }

    // First convert using the current year
    const dateWithCurrentYear = toGregorianDate({
      year: this.currentJewishYear,
      monthName: getJewishMonthByIndex(this.selectedMonth, this.currentJewishYear),
      day: this.selectedDay,
    });

    // Check if the converted date is more than 6 months in the past
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    if (dateWithCurrentYear < sixMonthsAgo) {
      this.call.logInfo(
        `Selected date is more than 6 months in the past. Using next Jewish year (${this.nextJewishYear}) instead.`,
      );

      // Convert again using the next year
      return toGregorianDate({
        year: this.nextJewishYear,
        monthName: getJewishMonthByIndex(this.selectedMonth, this.nextJewishYear),
        day: this.selectedDay,
      });
    }

    return dateWithCurrentYear;
  }

  /**
   * Confirms the selected date with the user
   * @returns Whether the user confirmed the date
   */
  private async confirmDate(): Promise<boolean> {
    if (!this.fullHebrewDate) {
      throw new Error('Hebrew date is missing');
    }

    return await this.call.getConfirmation(
      this.call.getText('DATE.CONFIRM_DATE', { date: this.fullHebrewDate }),
      this.call.getText('DATE.CONFIRM_YES'),
      this.call.getText('DATE.CONFIRM_NO'),
    );
  }

  /**
   * Gets the selected date information
   * @returns Object containing the selected date details
   */
  getSelectedDate(): DateSelectionResult | null {
    if (!this.selectedDay || !this.selectedMonth || !this.fullHebrewDate || !this.gregorianDate) {
      return null;
    }

    return {
      day: this.selectedDay,
      month: this.selectedMonth,
      hebrewDate: this.fullHebrewDate,
      gregorianDate: this.gregorianDate,
    };
  }
}
