import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { createBookResponseNotification } from "../../components/notifications/util/notificationUtils";
import { BOOK_AUTO_DENIAL_NOTIFICATION_MESSAGE } from "../../constants/constants";
import {
  BookRequestNotificationStatus,
  ServerNotificationType,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import {
  type FullNotificationModel,
  type NotificationModel,
} from "../../types";

/**
 * Adds a notification to the notifications collection for the specified user.
 * The notification type determines the structure and fields included in the document.
 *
 * @param {NotificationModel} notif - The notification object containing details such as receiver, sender, and type.
 * Depending on the notification type, additional fields like postID, bookID, bookTitle, and custom_message may be included.
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the notification was successfully created, or false if the creation fails (e.g., duplicate like notifications).
 */
export async function createNotification(
  notif: NotificationModel,
): Promise<boolean> {
  if (notif.receiver == null) {
    console.log("User does not exist");
    return false;
  }

  const notificationsRef = collection(DB, "notifications");

  try {
    if (notif.type === ServerNotificationType.LIKE) {
      const q = query(
        notificationsRef,
        where("postID", "==", notif.postID),
        where("sender", "==", notif.sender),
        where("type", "==", ServerNotificationType.LIKE),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Like notification already exists
        return false;
      }
    }

    // Omit notifID from the full notification object because it's auto-generated
    const fullNotif: Omit<FullNotificationModel, "notifID"> = {
      receiver: notif.receiver,
      sender: notif.sender,
      sender_name: notif.sender_name,
      created: serverTimestamp() as Timestamp,
      // haven't implement read_at yet
      read_at: null,
      type: notif.type,
      /// ... used to conditionally add fields to an object
      ...(notif.type === ServerNotificationType.LIKE && {
        postID: notif.postID,
      }),
      ...(notif.type === ServerNotificationType.COMMENT && {
        postID: notif.postID,
        comment: notif.comment,
      }),
      ...(notif.type === ServerNotificationType.RECOMMENDATION && {
        bookID: notif.bookID,
        bookTitle: notif.bookTitle,
        custom_message: notif.custom_message ?? "",
      }),
      ...(notif.type === ServerNotificationType.BOOK_REQUEST && {
        bookID: notif.bookID,
        bookTitle: notif.bookTitle,
        custom_message: notif.custom_message ?? "",
        bookRequestStatus: notif.bookRequestStatus,
      }),
      ...(notif.type === ServerNotificationType.BOOK_REQUEST_RESPONSE && {
        bookID: notif.bookID,
        bookTitle: notif.bookTitle,
        custom_message: notif.custom_message ?? "",
        bookRequestStatus: notif.bookRequestStatus,
      }),
    };

    await addDoc(notificationsRef, fullNotif);

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Updates the status of a book request notification.
 *
 * @param {string} notifID - The ID of the notification to update.
 * @param {BookRequestNotificationStatus} newStatus - The new status to set for the notification.
 * @returns {Promise<boolean>} A promise that resolves to true if the notification was successfully updated.
 * @throws {Error} If there's an error updating the notification status.
 */
export async function updateBorrowNotificationStatus(
  notifID: string,
  newStatus: BookRequestNotificationStatus,
): Promise<boolean> {
  try {
    const notifDocRef = doc(DB, "notifications", notifID);
    await setDoc(
      notifDocRef,
      {
        bookRequestStatus: newStatus,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );
    return true;
  } catch (error) {
    throw new Error(
      `Error updating notification status: ${(error as Error).message}`,
    );
  }
}

/**
 * Returns all the notifications of all types for a user.
 * @param {string} userID - The unique identifier of the user for whom notifications are retrieved.
 * @returns {Promise<FullNotificationModel[]>} - A promise that resolves to a list of full notification objects for the specified user.
 *
 * @throws {Error} If there is an issue retrieving notifications from Firestore.
 */
export async function getAllFullNotifications(
  userID: string,
): Promise<FullNotificationModel[]> {
  try {
    const notifdata: FullNotificationModel[] = [];
    const q = query(
      collection(DB, "notifications"),
      where("receiver", "==", userID),
      orderBy("created", "desc"),
    );

    const querySnap = await getDocs(q);

    for (const notifDoc of querySnap.docs) {
      const notif: FullNotificationModel = {
        notifID: notifDoc.id,
        receiver: notifDoc.data().receiver,
        comment: notifDoc.data().comment,
        sender: notifDoc.data().sender,
        sender_name: notifDoc.data().sender_name,
        created: notifDoc.data().created as Timestamp,
        read_at: notifDoc.data().read_at,
        postID: notifDoc.data().postID,
        bookID: notifDoc.data().bookID,
        bookTitle: notifDoc.data().bookTitle,
        custom_message: notifDoc.data().custom_message,
        bookRequestStatus: notifDoc.data().bookRequestStatus,
        type: notifDoc.data().type,
      };
      notifdata.push(notif);
    }
    return notifdata;
  } catch (error) {
    throw new Error(
      `Error getting all notifications: ${(error as Error).message}`,
    );
  }
}

/**
 * Retrieves the book request status for specified books between two users.
 *
 * This function queries the notifications collection to find book request
 * notifications sent by the current user to a friend for specific books.
 * It returns an object mapping book IDs to their request statuses.
 *
 * @param {string} currentUserID - The ID of the user who sent the book requests.
 * @param {string} friendUserID - The ID of the user who received the book requests.
 * @param {string[]} bookIDs - An array of book IDs to check for request statuses.
 *
 * @returns {Promise<Record<string, BookRequestNotificationStatus>>} A promise that resolves
 * to an object where keys are book IDs and values are their request statuses.
 * Only books with existing requests will have entries in the returned object.
 *
 * @throws {Error} If there's an error querying the notifications collection.
 * The error message includes details about the specific error encountered.
 */
export async function getBookRequestStatusForBooks(
  currentUserID: string,
  friendUserID: string,
  bookIDs: string[],
): Promise<Record<string, BookRequestNotificationStatus>> {
  const bookRequestStatuses: Record<string, BookRequestNotificationStatus> = {};

  try {
    const notificationsRef = collection(DB, "notifications");
    const q = query(
      notificationsRef,
      where("receiver", "==", friendUserID),
      where("sender", "==", currentUserID),
      where("type", "==", ServerNotificationType.BOOK_REQUEST),
      where("bookID", "in", bookIDs),
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.bookID != null && data?.bookRequestStatus != null) {
        bookRequestStatuses[data.bookID] =
          data.bookRequestStatus as BookRequestNotificationStatus;
      }
    });
    return bookRequestStatuses;
  } catch (error) {
    throw new Error(
      `Error getting book request statuses: ${(error as Error).message}`,
    );
  }
}

/**
 * Denies all pending book requests for a specific book, except for the accepted borrower.
 *
 * @param {string} lenderUserID - The ID of the user lending the book.
 * @param {string} acceptedBorrowerUserID - The ID of the user whose request was accepted.
 * @param {string} bookID - The ID of the book being requested.
 * @returns {Promise<void>}
 * @throws {Error} If there's an error updating the notifications.
 */
export const denyOtherBorrowRequests = async (
  lenderUserID: string,
  acceptedBorrowerUserID: string,
  acceptedBorrowerUserName: string,
  bookID: string,
): Promise<void> => {
  try {
    const notificationsRef = collection(DB, "notifications");
    const q = query(
      notificationsRef,
      where("receiver", "==", lenderUserID),
      where("type", "==", ServerNotificationType.BOOK_REQUEST),
      where("bookID", "==", bookID),
      where("bookRequestStatus", "==", BookRequestNotificationStatus.PENDING),
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(DB);

    querySnapshot.forEach((docSnapshot) => {
      const notifData = docSnapshot.data() as FullNotificationModel;
      if (notifData.sender !== acceptedBorrowerUserID) {
        // update the status of the request to denied
        const notifRef = doc(DB, "notifications", docSnapshot.id);
        batch.update(notifRef, {
          bookRequestStatus: BookRequestNotificationStatus.DENIED,
        });

        // create a denial notification
        const denialNotification = createBookResponseNotification(
          notifData.sender,
          lenderUserID,
          acceptedBorrowerUserName,
          bookID,
          notifData?.bookTitle ?? "",
          BookRequestNotificationStatus.DENIED,
          BOOK_AUTO_DENIAL_NOTIFICATION_MESSAGE,
        );

        // add required fields to the denial notification
        const fullNotification: Omit<FullNotificationModel, "notifID"> = {
          ...denialNotification,
          created: serverTimestamp() as Timestamp,
          read_at: null,
        };

        const newDocRef = doc(collection(DB, "notifications"));
        batch.set(newDocRef, fullNotification);
      }
    });

    await batch.commit();
  } catch (error) {
    throw new Error(
      `Error denying other requests: ${(error as Error).message}`,
    );
  }
};
