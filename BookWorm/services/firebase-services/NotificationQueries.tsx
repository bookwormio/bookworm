import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { DB } from "../../firebase.config";
import { type BasicNotification } from "../../types";

export async function createFriendRequestNotification(
  notif: BasicNotification,
) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: notif.message,
        sender_id: notif.sender_id,
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

export async function getAllFRNotifications(
  userID: string,
): Promise<BasicNotification[]> {
  try {
    const notifdata: BasicNotification[] = [];
    const q = query(
      collection(DB, "notifications"),
      where("user", "==", userID),
    );

    console.log("got inside AllFR");
    const querySnap = await getDocs(q);

    for (const notDoc of querySnap.docs) {
      const notif = {
        user: notDoc.data().user,
        message: notDoc.data().message,
        sender_id: notDoc.data().sender_id,
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
