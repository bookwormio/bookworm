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
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { BOOKS_API_KEY } from "../../constants/constants";
import { DB, STORAGE } from "../../firebase.config";

/**
 * Updates user information in the Firestore database.
 * @param {string} userID - The ID of the user to update.
 * @param {string} [newFirst] - The new first name of the user (optional).
 * @param {string} [newLast] - The new last name of the user (optional).
 * @param {string} [newPhone] - The new phone number of the user (optional).
 * @returns {Promise<boolean>} - A Promise that resolves to a boolean indicating whether the update succeeded.
 * @description
 * If all fields are empty, the function does nothing.
 * If any of the fields are empty, the function does not update the corresponding fields in Firestore.
 * Otherwise, it updates the Firestore document with the provided user information.
 */

export const updateUser = async (userdata: UserData): Promise<void> => {
  console.log(
    "in Update here: ",
    userdata.first,
    userdata.last,
    userdata.number,
    userdata.id,
    userdata.email,
  );
  try {
    if (
      userdata.first !== "" &&
      userdata.last !== "" &&
      userdata.number !== ""
    ) {
      // Check if any of the fields are empty
      const dataToUpdate: Record<string, string> = {};
      if (userdata.first !== "" && userdata.first !== undefined) {
        dataToUpdate.first = userdata.first;
      }
      if (userdata.last !== "" && userdata.last !== undefined) {
        dataToUpdate.last = userdata.last;
      }
      if (userdata.number !== "" && userdata.number !== undefined) {
        dataToUpdate.number = userdata.number;
      }
      console.log("in Update: ", dataToUpdate);
      await updateDoc(doc(DB, "user_collection", userdata.id), dataToUpdate);
    }
  } catch (error) {
    console.error("Error updating user", error);
  }
};

/**
 * Fetches user information from the Firestore database.
 * @param {string} userID - The ID of the user to fetch information for.
 * @returns {Promise<UserData | undefined>} A Promise that resolves to the user data if found, otherwise undefined.
 * @throws {Error} If there is an error while fetching the user information.
 * @description
 * Retrieves user information from the Firestore database based on the provided user ID.
 * If the user document exists, it returns an object containing the user data.
 * If the user document doesn't exist or if data is missing, it returns undefined.
 */
export async function newFetchUserInfo(
  userID: string,
): Promise<UserData | undefined> {
  try {
    console.log("fetching user info");
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      console.log("exists");
      const userData = userDocSnapshot.data();
      if (userData !== undefined) {
        console.log("returning this data");
        console.log(userData);
        return {
          id: userID,
          email: userData.email ?? "",
          first: userData.first ?? "",
          isPublic: userData.isPublic ?? false,
          last: userData.last ?? "",
          number: userData.number ?? "",
        };
      }
    }
    console.log("doesnt exist");

    return undefined; // User document doesn't exist or data is missing
  } catch (error) {
    console.error("Error fetching user information:", error);
    return undefined; // Return undefined on error
  }
}

export const fetchUserData = async (user: User): Promise<UserData> => {
  try {
    const userDocRef = doc(DB, "user_collection", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserData;
      return userData;
    } else {
      console.error("User document DNE");
      return {
        id: user.uid,
        first: "",
        last: "",
        number: "",
        isPublic: false,
        email: "",
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

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
          projection: "lite",
          key: BOOKS_API_KEY,
          limit: 10,
        },
      },
    );
    // TODO: remove
    // console.log(response.data.items);
    return response.data.items.map((item) => ({
      kind: item.kind,
      id: item.id,
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

// Query the Google Books API for book volume by id
// TODO: down the line this should get moved out of the firebase queries file
export async function fetchBookByVolumeID(
  volumeID: string,
): Promise<BookVolumeInfo | null> {
  if (volumeID === "") {
    return null; // Return null if there's no volumeID
  }
  try {
    const response = await axios.get<{
      volumeInfo: BookVolumeInfo;
    }>("https://www.googleapis.com/books/v1/volumes/" + volumeID, {
      params: {
        key: BOOKS_API_KEY,
        projection: "full",
      },
    });
    return response.data.volumeInfo;
  } catch (error) {
    console.error("Error fetching book by volume id", error);
    return null;
  }
}
