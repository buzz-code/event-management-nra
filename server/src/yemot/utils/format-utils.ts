import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { Event } from "src/db/entities/Event.entity";

/**
 * Utility class for formatting operations
 * Centralizes formatting logic that was scattered throughout the codebase
 */
export class FormatUtils {
  /**
   * Formats a date as a Hebrew date string
   * @param date The date to format
   * @returns Formatted Hebrew date string
   */
  static formatHebrewDate(date: Date): string {
    const jewishDate = toJewishDate(date);
    return formatJewishDateInHebrew(jewishDate);
  }

  /**
   * Formats a list of items into a readable string
   * @param items Array of items to format
   * @param nameField The field name to use for item names (default: 'name')
   * @returns Comma-separated list of item names
   */
  static formatItemList(items: any[], nameField: string = 'name'): string {
    if (!items || items.length === 0) {
      return '';
    }
    
    return items
      .filter(item => item && item[nameField]) // Filter out null/undefined items
      .map(item => item[nameField])
      .join(', ');
  }

  /**
   * Formats an event name for selection prompts.
   * Example: "Event Type from Date"
   * @param event The event entity (should have eventType relation loaded for best results)
   * @returns Formatted event name string
   */
  static formatEventNameForSelection(event: Event): string {
    const eventDate = event.eventDate ? FormatUtils.formatHebrewDate(new Date(event.eventDate)) : 'תאריך לא ידוע';
    // Ensure event.eventType is loaded for event.eventType.name
    const typeName = event.eventType?.name || event.name || 'אירוע';
    return `${typeName} מתאריך ${eventDate}`;
  }
}