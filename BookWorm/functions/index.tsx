import { type User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { DB } from "../firebase.config";

export async function addUserToCollection(user: User) {
  try {
    await setDoc(doc(DB, "user_collection", user.uid), {
      email: user.email,
    });
  } catch (error) {
    alert(error);
  }
}
