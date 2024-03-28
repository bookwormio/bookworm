import { type Timestamp } from "@google-cloud/firestore";
import axios from "axios";
import { type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { BOOKS_API_KEY } from "../../constants/constants";
import { DB, STORAGE } from "../../firebase.config";

export async function addDataEntry(user: User, time: Date, pages: number) {
  try {
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", user.uid),
    );
    const dataCol = await getDocs(q);

    if (dataCol.empty) {
      // The collection doesn't exist for the user, so create it
      const userDataCollectionRef = collection(DB, "data_collection");
      const userDataDocRef = doc(userDataCollectionRef);
      await setDoc(userDataDocRef, { user_id: user.uid });
      const newDocRef = await getDoc(userDataDocRef);
      // console.log(newDocRef);
      const subColRef = collection(newDocRef.ref, "pages_read");
      await addDoc(subColRef, {
        added_at: time,
        pages,
      });
    } else {
      // console.log(dataCol.docs[0].ref);
      const subColRef = collection(dataCol.docs[0].ref, "pages_read");
      await addDoc(subColRef, {
        added_at: time,
        pages,
      });
    }
  } catch (error) {
    alert(error);
  }
}

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
      console.error("User document DNE");
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
      console.error("User document DNE");
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
  imageURI: string,
) {
  if (user != null) {
    addDoc(collection(DB, "posts"), {
      user: user.uid,
      created: serverTimestamp(),
      book,
      text,
    })
      .then(async (docRef) => {
        if (imageURI !== "") {
          const response = await fetch(imageURI);
          const blob = await response.blob();
          const storageRef = ref(
            STORAGE,
            "posts/" + user.uid + "/" + docRef.id,
          );
          await uploadBytesResumable(storageRef, blob);
        }
      })
      .catch((error) => {
        console.error("Error creating post", error);
      });
  }
}
// fetches user's data
export async function fetchPagesRead(user: User) {
  try {
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", user.uid),
    );
    const querySnapshot = await getDocs(q);
    const dataPoints: Array<{ x: Timestamp; y: number }> = [];
    // Add each user data to the array
    for (const doc of querySnapshot.docs) {
      const subcollectionRef = collection(doc.ref, "pages_read");
      const subcollectionSnapshot = await getDocs(subcollectionRef);

      // Iterate over each document in the subcollection
      subcollectionSnapshot.forEach((subDoc) => {
        dataPoints.push({
          x: doc.data().added_at,
          y: doc.data().pages,
        });
      });
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
// Function to fetch users based on the search phrase
export async function fetchUsersBySearch(
  searchValue: string,
): Promise<UserListItem[]> {
  if (searchValue === "") {
    return []; // Return empty array if there's no searchValue
  }
  // Firestore is weird:
  // This is like a Select * from users where name LIKE "userSearchValue%"
  // TODO: down the line potentially may have to implement a more search friendly db
  try {
    const lowerName = searchValue;
    const q = query(
      collection(DB, "user_collection"),
      // where("isPublic", "==", true),
      where("first", ">=", lowerName),
      where("first", "<=", lowerName + "\uf8ff"),
    );
    const querySnapshot = await getDocs(q);
    const usersData: UserListItem[] = [];
    // Add each user data to the array
    querySnapshot.forEach((doc) => {
      usersData.push({
        id: doc.id,
        firstName: doc.data().first,
        lastName: doc.data().last,
      });
    });
    return usersData;
  } catch (error) {
    console.error("Error searching for users: ", error);
    return [];
  }
}

// Query the Google Books API for book volumes based on the entered search phrase
// TODO: down the line this should get moved out of the firebase queries file
export async function fetchBooksByTitleSearch(
  searchValue: string,
): Promise<BookVolumeItem[]> {
  if (searchValue === "") {
    return []; // Return empty array if there's no searchValue
  }
  try {
    const response = await axios.get<BooksResponse>(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: searchValue,
          key: BOOKS_API_KEY,
          limit: 10,
        },
      },
    );
    // TODO: remove
    // console.log(response.data.items);
    return response.data.items.map((item) => ({
      kind: item.kind,
      id: item.kind,
      etag: item.etag,
      selfLink: item.selfLink,
      volumeInfo: item.volumeInfo,
    }));
  } catch (error) {
    // TODO: remove
    console.error("Error fetching books by title search", error);
    return [];
  }
}
