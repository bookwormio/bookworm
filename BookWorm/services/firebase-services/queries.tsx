import { type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { DB } from "../../firebase.config";

export async function updateUserInfo(
  user: User,
  firstName: string,
  lastName: string,
  phoneNumber: string,
) {
  try {
    await updateDoc(doc(DB, "user_collection", user.uid), {
      email: user.email,
      first: firstName,
      last: lastName,
      number: phoneNumber,
    });
  } catch (error) {
    alert(error);
  }
}

// fetches user's first name
export async function fetchFirstName(user: User) {
  try {
    const userDocRef = doc(DB, "user_collection", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.first;
    } else {
      console.log("User document DNE");
      return "";
    }
  } catch (error) {
    console.error("Error fetching first name:", error);
    throw error;
  }
}

// fetches user's last name
export async function fetchLastName(user: User) {
  try {
    const userDocRef = doc(DB, "user_collection", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.last;
    } else {
      console.log("User document DNE");
      return "";
    }
  } catch (error) {
    console.error("Error fetching last name:", error);
    throw error;
  }
}

// fetches user's phone number
export async function fetchPhoneNumber(user: User) {
  try {
    const userDocRef = doc(DB, "user_collection", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.number;
    } else {
      console.log("User document DNE");
      return "";
    }
  } catch (error) {
    console.error("Error fetching phone number:", error);
    throw error;
  }
}

export async function createPost(
  user: User | null,
  book: string,
  text: string,
) {
  if (user != null) {
    addDoc(collection(DB, "posts"), {
      user: user.uid,
      created: serverTimestamp(),
      book,
      text,
    }).catch((error) => {
      console.error("Error creating post", error);
    });
  }
}
