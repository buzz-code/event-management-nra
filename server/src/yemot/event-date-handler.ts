import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { getIndexByJewishMonth, getJewishMonthByIndex, getJewishMonthInHebrew, getJewishMonthsInOrder, JewishMonthType, toGregorianDate, toJewishDate } from "jewish-date";
import { formatHebrewDate } from "@shared/utils/formatting/formatter.util";

/**
 * Class to handle event date selection through the Yemot system
 * Collects the Hebrew date of an event
 */
export class EventDateHandler {
  private logger: Logger;
  private call: Call;
  private selectedDay: number | null = null;
  private selectedMonth: number | null = null;
  private fullHebrewDate: string | null = null;
  private gregorianDate: Date | null = null;

  // Current Jewish year
  private currentJewishYear: number;

  /**
   * Constructor for the EventDateHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  constructor(logger: Logger, call: Call) {
    this.logger = logger;
    this.call = call;

    // Initialize with the current Jewish year
    const today = toJewishDate(new Date());
    this.currentJewishYear = today.year;
  }

  /**
   * Prompts the user to enter the day of the month
   * @returns The selected day number
   * @private Internal method used by handleEventDateSelection
   */
  private async collectEventDay(): Promise<number> {
    const day = await this.call.read([
      { type: 'text', data: 'אנא הקש את היום בחודש. לדוגמה, עבור כ״ז הקש 27' }
    ], 'tap', {
      max_digits: 2,
      min_digits: 1,
    });

    const dayNumber = parseInt(day);

    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 30) {
      id_list_message(this.call, 'היום שהוקש אינו תקין. אנא הקש מספר בין 1 ל-30.');
      return this.collectEventDay(); // Recursive call to try again
    }

    this.logger.log(`User entered day: ${dayNumber}`);
    return dayNumber;
  }

  /**
   * Prompts the user to enter the Hebrew month
   * @returns The selected month number in the format expected by JewishDate
   * @private Internal method used by handleEventDateSelection
   */
  private async collectEventMonth(): Promise<number> {
    const monthMessage = 'אנא הקש את מספר החודש העברי, ';
    const months = getJewishMonthsInOrder(this.currentJewishYear)
      .map(month => month as JewishMonthType)
      .map(month => ({ month, index: getIndexByJewishMonth(month) }))
      .filter(({ index }) => index !== 0)
      .map(({ month, index }) => ({ month, index, hebrewName: getJewishMonthInHebrew(month) }));
    const monthNames = months.map(({ hebrewName }, index) => `${index + 1} - ${hebrewName}`);

    const month = await this.call.read([
      { type: 'text', data: monthMessage + monthNames.join(', ') + '.' }
    ], 'tap', {
      max_digits: 2,
      min_digits: 1,
    });

    const monthNumber = parseInt(month);
    const selectedMonth = months[monthNumber - 1];

    if (!selectedMonth) {
      id_list_message(this.call, 'החודש שהוקש אינו תקין. אנא הקש מספר בין 1 ל-' + months.length + '.');
      return this.collectEventMonth(); // Recursive call to try again
    }

    this.logger.log(`User entered month: ${monthNumber}, Hebrew name: ${selectedMonth.hebrewName}, monthIndex: ${selectedMonth.index}`);
    return selectedMonth.index;
  }

  /**
   * Confirms the selected date with the user
   * @returns Whether the user confirmed the date
   * @private Internal method used by handleEventDateSelection
   */
  private async confirmEventDate(): Promise<boolean> {
    if (!this.selectedDay || !this.selectedMonth || !this.fullHebrewDate) {
      throw new Error('Date information is missing');
    }

    const confirmMessage = `תאריך השמחה שנבחר הוא ${this.fullHebrewDate}. ` +
      'אם זה נכון, הקש 1. אם ברצונך לשנות, הקש 2.';

    const confirmation = await this.call.read([
      { type: 'text', data: confirmMessage }
    ], 'tap', {
      max_digits: 1,
      min_digits: 1,
      digits_allowed: ['1', '2']
    });

    return confirmation === '1';
  }

  /**
   * Handles the complete event date selection process
   * Collects the day and month, formats the date, and confirms with the user
   */
  async handleEventDateSelection(): Promise<void> {
    let dateConfirmed = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!dateConfirmed && attempts < maxAttempts) {
      // Collect day and month information
      this.selectedDay = await this.collectEventDay();
      this.selectedMonth = await this.collectEventMonth();

      this.gregorianDate = toGregorianDate({
        year: this.currentJewishYear,
        monthName: getJewishMonthByIndex(this.selectedMonth, this.currentJewishYear),
        day: this.selectedDay,
      });
      this.logger.log(`Gregorian date: ${this.gregorianDate}`);
      // Format the date in Hebrew
      this.fullHebrewDate = formatHebrewDate(this.gregorianDate);

      // Confirm the date with the user
      dateConfirmed = await this.confirmEventDate();

      if (!dateConfirmed) {
        id_list_message(this.call, 'אנא הזן את התאריך מחדש.');
        attempts++;
      }
    }

    if (!dateConfirmed) {
      return id_list_message_with_hangup(
        this.call,
        'מספר נסיונות הזנת התאריך הגיע למקסימום. אנא נסה להתקשר שנית מאוחר יותר.'
      );
    }

    id_list_message(this.call, `תודה, תאריך השמחה ${this.fullHebrewDate} נשמר בהצלחה.`);
    this.logger.log(`Event date confirmed: ${this.fullHebrewDate}`);
  }

  /**
   * Gets the selected date information
   * @returns Object containing the selected day, month, and full Hebrew date
   */
  getSelectedDate(): { day: number | null; month: number | null; hebrewDate: string | null, gregorianDate: Date | null } {
    return {
      day: this.selectedDay,
      month: this.selectedMonth,
      hebrewDate: this.fullHebrewDate,
      gregorianDate: this.gregorianDate,
    };
  }
}