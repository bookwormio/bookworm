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
