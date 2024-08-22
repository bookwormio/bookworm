import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { DB } from "../../firebase.config";
import { type BasicNotification, type FRNotification } from "../../types";

export async function createFriendRequestNotification(
  notif: BasicNotification,
) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        created_at: serverTimestamp(),
        user: notif.user,
        message: notif.message,
        read_at: null,
        sender_id: notif.sender_id,
        type: "FRIEND_REQUEST",
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

export async function getAllFRNotifications(userID: string): Promise<{
  notifs: FRNotification[];
}> {
  try {
    const notifdata: FRNotification[] = [];
    const q = query(
      collection(DB, "notifications"),
      where("user", "==", userID),
      orderBy("created_at", "desc"),
    );

    const querySnap = await getDocs(q);

    for (const notDoc of querySnap.docs) {
      const notif: FRNotification = {
        created_at: notDoc.data().created_at,
        user: notDoc.data().user,
        message: notDoc.data().message,
        read_at: notDoc.data().read_at,
        sender_id: notDoc.data().sender_id,
        type: notDoc.data().created_at,
      };
      notifdata.push(notif);
    }
    return { notifs: notifdata };
  } catch (error) {
    console.error("Error getting all notifications: ", error);
    return { notifs: [] };
  }
}
