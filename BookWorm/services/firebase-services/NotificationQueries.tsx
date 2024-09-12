import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  where,
} from "firebase/firestore";
import {
  NotificationMessageMap,
  ServerNotificationType,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import {
  type BasicNotificationModel,
  type FullNotificationModel,
} from "../../types";

/**
 * Adds a notification to the notifications collection for that user.
 * @param {BasicNotificationModel} notif - The basic info of the notification.
 * @returns {Promise<boolean>} A promise that resolves to true if the notification was successfully created, false otherwise.
 */
export async function createNotification(
  notif: BasicNotificationModel,
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

    await addDoc(notificationsRef, {
      receiver: notif.receiver,
      message: NotificationMessageMap[notif.type],
      comment: notif.comment,
      sender: notif.sender,
      sender_name: notif.sender_name,
      sender_img: notif.sender_img,
      created: serverTimestamp(),
      read_at: null,
      postID:
        notif.type === ServerNotificationType.LIKE ||
        notif.type === ServerNotificationType.COMMENT
          ? notif.postID
          : null,
      bookID:
        notif.type === ServerNotificationType.RECOMMENDATION
          ? notif.bookID
          : null,
      bookTitle:
        notif.type === ServerNotificationType.RECOMMENDATION
          ? notif.bookTitle
          : null,
      custom_message: notif.custom_message,
      type: notif.type,
    });

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
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
        receiver: notifDoc.data().receiver,
        message: notifDoc.data().message,
        comment: notifDoc.data().comment,
        sender: notifDoc.data().sender,
        sender_name: notifDoc.data().sender_name,
        sender_img: notifDoc.data().sender_img,
        created: notifDoc.data().created as Timestamp,
        read_at: notifDoc.data().read_at,
        postID: notifDoc.data().postID,
        bookID: notifDoc.data().bookID,
        bookTitle: notifDoc.data().bookTitle,
        custom_message: notifDoc.data().custom_message,
        type: notifDoc.data().type,
      };
      notifdata.push(notif);
    }
    return notifdata;
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return [];
  }
}
