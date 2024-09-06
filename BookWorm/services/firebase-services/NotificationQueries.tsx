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
  notificationMessageMap,
  ServerNotificationType,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";
import {
  type BasicNotificationModel,
  type FullNotificationModel,
} from "../../types";

/**
 * Adds a notification to the notifications collection for that user.
 * @param {BasicNotification} notif - The basic info of the notification.
 */
export async function createNotification(notif: BasicNotificationModel) {
  if (notif.user != null) {
    const notificationsRef = collection(DB, "notifications");
    if (notif.type === ServerNotificationType.LIKE) {
      try {
        const q = query(
          notificationsRef,
          where("postID", "==", notif.postID),
          where("sender", "==", notif.sender),
          where("type", "==", ServerNotificationType.LIKE),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Like notification already exists");
          return;
        }
      } catch (error) {
        console.log("Firebase error");
      }
    }
    await addDoc(notificationsRef, {
      user: notif.user,
      message: notificationMessageMap[notif.type],
      comment: notif.comment,
      sender: notif.sender,
      sender_name: notif.sender_name,
      sender_img: notif.sender_img,
      created: serverTimestamp(),
      read: null,
      postID:
        notif.type === ServerNotificationType.FRIEND_REQUEST
          ? null
          : notif.postID,
      type: notif.type,
    });
  } else {
    console.log("user DNE");
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
      where("user", "==", userID),
      orderBy("created", "desc"),
    );

    const querySnap = await getDocs(q);

    for (const notDoc of querySnap.docs) {
      const notif = {
        user: notDoc.data().user,
        message: notDoc.data().message,
        comment: notDoc.data().comment,
        sender: notDoc.data().sender,
        sender_name: notDoc.data().sender_name,
        sender_img: notDoc.data().sender_img,
        created: notDoc.data().created as Timestamp,
        read: notDoc.data().read,
        postID: notDoc.data().postID,
        type: notDoc.data().type,
      };
      notifdata.push(notif);
    }
    return notifdata;
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return [];
  }
}
