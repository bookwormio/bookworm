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
} from "firebase/firestore";
import {
  type BookRequestNotificationStatus,
  ServerNotificationType,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import {
  type FullNotificationModel,
  type NotificationModel,
} from "../../types";

/**
 * Adds a notification to the notifications collection for that user.
 * @param {BasicNotificationModel} notif - The basic info of the notification.
 * @returns {Promise<boolean>} A promise that resolves to true if the notification was successfully created, false otherwise.
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

    // TODO fix this type
    const fullNotif: FullNotificationModel = {
      receiver: notif.receiver,
      sender: notif.sender,
      sender_name: notif.sender_name,
      created: serverTimestamp() as Timestamp,
      // haven't implement read_at yet
      read_at: null,
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
      type: notif.type,
    };

    await addDoc(notificationsRef, fullNotif);

    console.log("ADDED DOC");
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
export async function updateNotificationStatus(
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
 * @param {string} userID - the userID of the user that helps us to retrieve their notifications.
 * @returns {Promise<FullNotification[]>} - returns a list of notifications.
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
      const notif = {
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
    console.log("Notifications: ", notifdata);
    return notifdata;
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return [];
  }
}
