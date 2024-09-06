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
import { type BasicNotification, type FullNotification } from "../../types";

/**
 * Adds a Friend Request Notification to the notifications collection for that user.
 * @param {BasicNotification} notif - The basic info of the notification.
 */
export async function createFriendRequestNotification(
  notif: BasicNotification,
) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: notificationMessageMap[ServerNotificationType.FRIEND_REQUEST],
        comment: null,
        sender: notif.sender,
        sender_name: notif.sender_name,
        sender_img: notif.sender_img,
        created: serverTimestamp(),
        read: null,
        postID: null,
        type: ServerNotificationType.FRIEND_REQUEST,
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

/**
 * Adds a Like Notification to the notifications collection for that user.
 * @param {BasicNotification} notif - The basic info of the notification.
 */
export async function createLikeNotification(notif: BasicNotification) {
  if (notif.user != null) {
    try {
      const notificationsRef = collection(DB, "notifications");
      const q = query(
        notificationsRef,
        where("postID", "==", notif.postID),
        where("sender", "==", notif.sender),
        where("type", "==", "LIKE"),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No existing like notification, so create a new one
        await addDoc(notificationsRef, {
          user: notif.user,
          message: notificationMessageMap[ServerNotificationType.LIKE],
          comment: null,
          sender: notif.sender,
          sender_name: notif.sender_name,
          sender_img: notif.sender_img,
          created: serverTimestamp(),
          read: null,
          postID: notif.postID,
          type: ServerNotificationType.LIKE,
        });
      } else {
        console.log("Like notification already exists.");
      }
    } catch (error) {
      console.error("Error creating like notification: ", error);
    }
  }
}

/**
 * Adds a Comment Notification to the notifications collection for that user.
 * @param {BasicNotification} notif - The basic info of the notification.
 */
export async function createCommentNotification(notif: BasicNotification) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: notificationMessageMap[ServerNotificationType.COMMENT],
        comment: notif.comment,
        sender: notif.sender,
        sender_name: notif.sender_name,
        sender_img: notif.sender_img,
        created: serverTimestamp(),
        read: null,
        postID: notif.postID,
        type: ServerNotificationType.COMMENT,
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

/**
 * Returns all the notifications of all types for a user.
 * @param {string} userID - the userID of the user that helps us to retrieve their notifications.
 * @returns {Promise<FullNotification[]>} - returns a list of notifications.
 */
export async function getAllFullNotifications(
  userID: string,
): Promise<FullNotification[]> {
  try {
    const notifdata: FullNotification[] = [];
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
