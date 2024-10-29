import {
  BookRequestNotificationStatus,
  NotificationMessageMap,
  NotificationTitleMap,
  ServerNotificationType,
} from "../../../enums/Enums";
import { type BookRequestResponseNotification } from "../../../types";

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

interface NotificationConfig {
  title: string;
  message: string;
}

/**
 * Formats a notification by generating the appropriate title and message
 * based on the notification type and status (if applicable).
 *
 * @param {ServerNotificationType} notifType - The type of the notification.
 * @param {BookRequestNotificationStatus} [notifStatus] - The status of the book request (optional).
 * @returns {NotificationConfig} - An object containing the formatted title and message for the notification.
 *
 */
export const formatNotification = (
  notifType: ServerNotificationType,
  notifStatus?: BookRequestNotificationStatus,
): NotificationConfig => {
  let title: string;
  let message: string;

  if (notifType === ServerNotificationType.BOOK_REQUEST_RESPONSE) {
    const isAccepted = notifStatus === BookRequestNotificationStatus.ACCEPTED;

    title = isAccepted ? "Book Request Accepted" : "Book Request Denied";
    message = isAccepted
      ? "accepted your request to borrow"
      : "denied your request to borrow";
  } else {
    title = NotificationTitleMap[notifType];
    message = NotificationMessageMap[notifType];
  }

  return { title, message };
};

/**
 * Creates a new book request notification.
 */
export const createBookResponseNotification = (
  receiver: string,
  sender: string,
  senderName: string,
  bookID: string,
  bookTitle: string,
  bookRequestStatus: BookRequestNotificationStatus,
  customMessage?: string,
) => {
  const bookResponseNotification: BookRequestResponseNotification = {
    receiver,
    sender,
    sender_name: senderName,
    type: ServerNotificationType.BOOK_REQUEST_RESPONSE,
    bookID,
    bookTitle,
    custom_message: customMessage ?? "",
    bookRequestStatus,
  };
  return bookResponseNotification;
};
