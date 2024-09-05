import { type Timestamp } from "firebase/firestore";
import { DAYS_OF_WEEK, MONTHS_OF_YEAR } from "../../../constants/constants";

/**
 * Formats a given Timestamp into a readable date string.
 * @param {Timestamp} created - The Timestamp to format.
 * @param {Date} currentDate - The current date for comparison.
 * @returns {string} A formatted date string.
 */
export function formatDate(created: Timestamp, currentDate: Date) {
  const date = created.toDate();
  const day = DAYS_OF_WEEK[date.getDay()];
  const month = MONTHS_OF_YEAR[date.getMonth()];
  const dayNumber = date.getDate();
  const isToday =
    date.getFullYear() === currentDate.getFullYear() &&
    date.getMonth() === currentDate.getMonth() &&
    date.getDate() === currentDate.getDate();

  return isToday
    ? `Today at ${date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`
    : `${day}, ${month} ${dayNumber} at ${date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`;
}

/**
 * Checks if all provided values are valid page numbers.
 * @param {...unknown} values - The values to check.
 * @returns {boolean} True if all values are valid page numbers, false otherwise.
 */
export function areValidPageNumbers(...values: unknown[]): boolean {
  return values.every(isValidPageNumber);
}

/**
 * Type guard to check if a value is a valid page number.
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a valid page number, false otherwise.
 */
function isValidPageNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    value >= 0 &&
    Number.isFinite(value)
  );
}
