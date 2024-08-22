import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { DB } from "../../firebase.config";
import { type FRNotification } from "../../types";

export async function createFriendRequestNotification(notif: FRNotification) {
  if (notif.id != null) {
    try {
      await addDoc(collection(DB, "notifications"), {
        created_at: serverTimestamp(),
        id: notif.id,
        message: notif.id,
        read_at: notif.read_at,
        sender_id: notif.sender_id,
        type: notif.type,
      });
    } catch (error) {
      console.error("Error creating friend request notification: ", error);
    }
  }
}
