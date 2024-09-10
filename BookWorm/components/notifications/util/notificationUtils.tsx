/**
 * Calculates the time elapsed since a notification was created and returns it in a human-readable format.
 *
 * @param {Date} createdDate - The date when the notification was created.
 * @returns {string} A string representing the time elapsed in the most appropriate unit:
 *                   - Seconds (s) if less than a minute
 *                   - Minutes (m) if less than an hour
 *                   - Hours (h) if less than a day
 *                   - Days (d) if less than a week
 *                   - Weeks (w) if a week or more
 *
 */
export function calculateTimeSinceNotification(createdDate: Date) {
  const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
  const seconds = diffTime / 1000;
  const minutes = diffTime / (1000 * 60);
  const hours = diffTime / (1000 * 60 * 60);
  const days = diffTime / (1000 * 60 * 60 * 24);
  const weeks = diffTime / (1000 * 60 * 60 * 24 * 7);
  if (seconds <= 60) {
    return Math.round(seconds).toString() + "s";
  } else if (minutes <= 60) {
    return Math.round(minutes).toString() + "m";
  } else if (hours <= 24) {
    return Math.round(hours).toString() + "h";
  } else if (days <= 7) {
    return Math.round(days).toString() + "d";
  } else {
    return Math.round(weeks).toString() + "w";
  }
}
