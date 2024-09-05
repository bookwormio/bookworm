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
import { DB } from "../../firebase.config";
import { type BasicNotification, type FullNotification } from "../../types";

// needs friend ID
export async function createFriendRequestNotification(
  notif: BasicNotification,
) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: "followed you on",
        comment: null,
        sender: notif.sender,
        sender_name: notif.sender_name,
        sender_img: notif.sender_img,
        created: serverTimestamp(),
        read: null,
        postID: null,
        type: "FRIEND_REQUEST",
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

// needs post ID
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
          message: "liked your post",
          comment: null,
          sender: notif.sender,
          sender_name: notif.sender_name,
          sender_img: notif.sender_img,
          created: serverTimestamp(),
          read: null,
          postID: notif.postID,
          type: "LIKE",
        });
      } else {
        console.log("Like notification already exists.");
      }
    } catch (error) {
      console.error("Error creating like notification: ", error);
    }
  }
}

// needs post ID
export async function createCommentNotification(notif: BasicNotification) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: "commented on your post",
        comment: notif.comment,
        sender: notif.sender,
        sender_name: notif.sender_name,
        sender_img: notif.sender_img,
        created: serverTimestamp(),
        read: null,
        postID: notif.postID,
        type: "COMMENT",
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

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

    console.log("got inside AllFR");
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
        postID: notDoc.data().read,
        type: notDoc.data().type,
      };
      console.log(notif);
      notifdata.push(notif);
      console.log("nxT");
      console.log(notifdata);
    }
    return notifdata;
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return [];
  }
}
