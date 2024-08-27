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
import { type BasicNotification, type FRNotification } from "../../types";

export async function createFriendRequestNotification(
  notif: BasicNotification,
) {
  if (notif.user != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        user: notif.user,
        message: notif.message,
        sender: notif.sender,
        sender_name: notif.sender_name,
        sender_img: notif.sender_img,
        created: serverTimestamp(),
        read: null,
        type: "FRIEND_REQUEST",
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}

export async function getAllFRNotifications(
  userID: string,
): Promise<FRNotification[]> {
  try {
    const notifdata: FRNotification[] = [];
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
        sender: notDoc.data().sender,
        sender_name: notDoc.data().sender_name,
        sender_img: notDoc.data().sender_img,
        created: notDoc.data().created as Timestamp,
        read: notDoc.data().read,
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
