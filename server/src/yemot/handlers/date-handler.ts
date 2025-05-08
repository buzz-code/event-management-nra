import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { getIndexByJewishMonth, getJewishMonthByIndex, getJewishMonthInHebrew, getJewishMonthsInOrder, JewishMonthType, toGregorianDate, toJewishDate } from "jewish-date";
import { formatHebrewDate } from "@shared/utils/formatting/formatter.util";

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
 * Handler for Hebrew date selection and conversion
 */
export class DateHandler extends BaseYemotHandler {
  private selectedDay: number | null = null;
  private selectedMonth: number | null = null;
  private fullHebrewDate: string | null = null;
  private gregorianDate: Date | null = null;
  private currentJewishYear: number;

  /**
   * Constructor for the DateHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  constructor(logger: Logger, call: Call) {
    super(logger, call);

    // Initialize with the current Jewish year
    const today = toJewishDate(new Date());
    this.currentJewishYear = today.year;
  }

  /**
   * Handles the complete date selection process
   * @returns The selected date information
   */
  async handleDateSelection(): Promise<DateSelectionResult> {
    this.logStart('handleDateSelection');
    
    let dateConfirmed = false;
    
    try {
      await this.withRetry(
        async () => {
          // Collect day and month information
          this.selectedDay = await this.collectDay();
          this.selectedMonth = await this.collectMonth();
          
          // Convert to Gregorian
          this.gregorianDate = this.convertToGregorian();
          
          // Format the date in Hebrew
          this.fullHebrewDate = formatHebrewDate(this.gregorianDate);
          
          // Confirm the date with the user
          dateConfirmed = await this.confirmDate();
          
          if (!dateConfirmed) {
            throw new Error('Date not confirmed');
          }
          
          return true;
        },
        'מספר נסיונות הזנת התאריך הגיע למקסימום',
        'אנא הזן את התאריך מחדש'
      );
      
      if (!this.gregorianDate) {
        throw new Error('No valid date was selected');
      }
      
      await this.playMessage(`תודה, תאריך השמחה ${this.fullHebrewDate} נשמר בהצלחה.`);
      
      const result: DateSelectionResult = {
        day: this.selectedDay!,
        month: this.selectedMonth!,
        hebrewDate: this.fullHebrewDate!,
        gregorianDate: this.gregorianDate
      };
      
      this.logComplete('handleDateSelection', { date: this.fullHebrewDate });
      return result;
    } catch (error) {
      this.logger.error(`Date selection failed: ${error.message}`);
      await this.hangupWithMessage('אירעה שגיאה בבחירת תאריך האירוע. אנא נסה להתקשר שנית מאוחר יותר.');
      throw error;
    }
  }

  /**
   * Collects the day of the month from the user
   * @returns The selected day number
   */
  private async collectDay(): Promise<number> {
    this.logStart('collectDay');
    
    const day = await this.readDigits(
      'אנא הקש את היום בחודש. לדוגמה, עבור כ״ז הקש 27', 
      {
        max_digits: 2,
        min_digits: 1,
      }
    );

    const dayNumber = parseInt(day);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
      throw new Error('היום שהוקש אינו תקין');
    }

    this.logger.log(`User entered day: ${dayNumber}`);
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
    
    const monthMessage = 'אנא הקש את מספר החודש העברי, ' + monthNames.join(', ') + '.';

    const month = await this.readDigits(monthMessage, {
      max_digits: 2,
      min_digits: 1,
    });

    const monthNumber = parseInt(month);
    const selectedMonth = months[monthNumber - 1];

    if (!selectedMonth) {
      throw new Error(`החודש שהוקש אינו תקין. אנא הקש מספר בין 1 ל-${months.length}.`);
    }

    this.logger.log(`User entered month: ${monthNumber}, Hebrew name: ${selectedMonth.hebrewName}, monthIndex: ${selectedMonth.index}`);
    this.logComplete('collectMonth', { month: selectedMonth.index });
    return selectedMonth.index;
  }

  /**
   * Gets a list of Hebrew months with their indices and names
   */
  private getHebrewMonthsList(): Array<{ month: JewishMonthType; index: number; hebrewName: string }> {
    return getJewishMonthsInOrder(this.currentJewishYear)
      .map(month => month as JewishMonthType)
      .map(month => ({ month, index: getIndexByJewishMonth(month) }))
      .filter(({ index }) => index !== 0)
      .map(({ month, index }) => ({ month, index, hebrewName: getJewishMonthInHebrew(month) }));
  }

  /**
   * Converts the selected Hebrew date to a Gregorian date
   * @returns The equivalent Gregorian date
   */
  private convertToGregorian(): Date {
    if (!this.selectedDay || !this.selectedMonth) {
      throw new Error('Cannot convert to Gregorian: day or month is missing');
    }
    
    return toGregorianDate({
      year: this.currentJewishYear,
      monthName: getJewishMonthByIndex(this.selectedMonth, this.currentJewishYear),
      day: this.selectedDay,
    });
  }

  /**
   * Confirms the selected date with the user
   * @returns Whether the user confirmed the date
   */
  private async confirmDate(): Promise<boolean> {
    if (!this.fullHebrewDate) {
      throw new Error('Hebrew date is missing');
    }
    
    return await this.getConfirmation(
      `תאריך השמחה שנבחר הוא ${this.fullHebrewDate}`,
      'אם זה נכון, הקש 1',
      'אם ברצונך לשנות, הקש 2'
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