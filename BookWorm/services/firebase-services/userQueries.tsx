import axios from "axios";
import {
  and,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { BOOKS_API_KEY } from "../../constants/constants";
import { ServerBookShelfName } from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";
import {
  type BookShelfBookModel,
  type BookVolumeInfo,
  type UserBookShelvesModel,
  type UserDataModel,
  type UserModel,
  type UserSearchDisplayModel,
} from "../../types";

import { type User } from "firebase/auth";
import { caseFoldNormalize } from "../util/queryUtils";

/**
 * Updates user data in the database.
 * @param {UserData} userdata - The user data to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @description
 * If all fields are empty, the function does nothing.
 * If any of the fields are empty, the function does not update the corresponding fields in Firestore.
 * Otherwise, it updates the Firestore document with the provided user information.
 */

export const updateUser = async (userdata: UserDataModel): Promise<void> => {
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
        dataToUpdate.first_casefold = caseFoldNormalize(userdata.first);
      }
      if (userdata.last !== "" && userdata.last !== undefined) {
        dataToUpdate.last = userdata.last;
        dataToUpdate.last_casefold = caseFoldNormalize(userdata.last);
      }
      if (userdata.number !== "" && userdata.number !== undefined) {
        dataToUpdate.number = userdata.number;
      }
      if (userdata.bio !== "" && userdata.bio !== undefined) {
        dataToUpdate.bio = userdata.bio;
      }
      if (userdata.city !== "" && userdata.city !== undefined) {
        dataToUpdate.city = userdata.city;
      }
      if (userdata.state !== "" && userdata.state !== undefined) {
        dataToUpdate.state = userdata.state;
      }
      if (
        userdata.profilepic !== "" &&
        userdata.profilepic !== undefined &&
        userdata.profilepic !== "false"
      ) {
        dataToUpdate.profilepic = "true";
      } else {
        dataToUpdate.profilepic = "false";
      }
      const docRef = doc(DB, "user_collection", userdata.id);
      await updateDoc(docRef, dataToUpdate);
      if (
        userdata.profilepic.trim() !== "" &&
        userdata.profilepic !== undefined &&
        typeof userdata.profilepic === "string" &&
        userdata.profilepic !== "true" &&
        userdata.profilepic !== "false"
      ) {
        const profilePicUrl = new URL(userdata.profilepic);
        const response = await fetch(profilePicUrl);
        const blob = await response.blob();
        const storageRef = ref(STORAGE, "profilepics/" + docRef.id);
        await uploadBytesResumable(storageRef, blob);
      }
    }
  } catch (error) {
    console.error("Error updating user", error);
  }
};

/**
 * Fetches a user from the database based on the provided userID.
 * @param {string} userID - The ID of the user to fetch.
 * @returns {Promise<UserModel | null>} A Promise that resolves with the fetched user if it exists, or null if the user does not exist.
 * @throws {Error} Throws an error if there's an issue fetching the user.
 */
export async function fetchUser(userID: string): Promise<UserModel | null> {
  try {
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const user: UserModel = {
        id: userDocSnap.id,
        email: userDocSnap.data().email,
        first: userDocSnap.data().first,
        isPublic: userDocSnap.data().isPublic,
        last: userDocSnap.data().last,
        number: userDocSnap.data().number,
      };
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function getUserProfileURL(
  userID: string,
): Promise<string | null> {
  try {
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData.profilepic === "true") {
        const storageRef = ref(STORAGE, "profilepics/" + userDocRef.id);
        const url = await getDownloadURL(storageRef);
        return url;
      }
    }
  } catch (error) {
    console.error("Error fetching image ", error);
  }
  return null;
}

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
): Promise<UserDataModel | null> {
  try {
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData !== undefined) {
        return {
          id: userID,
          username: userData.username ?? "",
          email: userData.email ?? "",
          first: userData.first ?? "",
          isPublic: userData.isPublic ?? false,
          last: userData.last ?? "",
          number: userData.number ?? "",
          bio: userData.bio ?? "",
          city: userData.city ?? "",
          state: userData.state ?? "",
          profilepic: userData.profilepic ?? "",
        };
      }
    }
    console.error("doesnt exist");

    return null; // User document doesn't exist or data is missing
  } catch (error) {
    console.error("Error fetching user information:", error);
    return null; // Return undefined on error
  }
}

/**
 * Fetches user information from the Firestore database.
 * @param {User} user - The user to fetch information for.
 * @returns {Promise<UserData | undefined>} A Promise that resolves to the user data if found, otherwise undefined.
 * @throws {Error} If there is an error while fetching the user information.
 * @description
 * Retrieves user information from the Firestore database based on the provided user ID.
 * If the user document exists, it returns an object containing the user data.
 * If the user document doesn't exist or if data is missing, it returns undefined.
 */
export const fetchUserData = async (
  user: User,
): Promise<UserDataModel | null> => {
  try {
    const userDocRef = doc(DB, "user_collection", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserDataModel;
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

/**
 * Fetches user information for friend view page from the Firestore database.
 * @param {string} userID - The ID of the friend to fetch information for.
 * @returns {Promise<UserData | undefined>} A Promise that resolves to the user data if found, otherwise undefined.
 * @throws {Error} If there is an error while fetching the user information.
 * @description
 * Retrieves friend information from the Firestore database based on the provided user ID.
 * If the friend user document exists, it returns an object containing the user data.
 * If the friend user document doesn't exist or if data is missing, it returns undefined.
 */
export async function fetchFriendData(
  userID: string,
): Promise<UserDataModel | undefined> {
  try {
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData !== undefined) {
        return {
          id: userID,
          username: userData.username ?? "",
          email: userData.email ?? "",
          first: userData.first ?? "",
          isPublic: userData.isPublic ?? false,
          last: userData.last ?? "",
          number: userData.number ?? "",
          bio: userData.bio ?? "",
          city: userData.city ?? "",
          state: userData.state ?? "",
          profilepic: userData.profilepic ?? "",
        };
      }
    }
    console.error("doesnt exist");

    return undefined; // User document doesn't exist or data is missing
  } catch (error) {
    console.error("Error fetching user information:", error);
    return undefined; // Return undefined on error
  }
}

// TODO: sort this with following users at the top
// Function to fetch users based on the search phrase
export async function fetchUsersBySearch(
  searchValue: string,
): Promise<UserSearchDisplayModel[]> {
  if (searchValue === "") {
    return []; // Return empty array if there's no searchValue
  }
  try {
    const normalizedSearchValue = caseFoldNormalize(searchValue);
    // search for users by their case-folded first or last names.
    const q = query(
      collection(DB, "user_collection"),
      // where("isPublic", "==", true),
      or(
        and(
          where("first_casefold", ">=", normalizedSearchValue),
          where("first_casefold", "<=", normalizedSearchValue + "\uf8ff"),
        ),
        and(
          where("last_casefold", ">=", normalizedSearchValue),
          where("last_casefold", "<=", normalizedSearchValue + "\uf8ff"),
        ),
      ),
    );
    const querySnapshot = await getDocs(q);
    const usersData: UserSearchDisplayModel[] = [];

    const promises = querySnapshot.docs.map(async (doc) => {
      const userData: UserSearchDisplayModel = {
        id: doc.id,
        firstName: doc.data().first,
        lastName: doc.data().last,
        profilePicURL: "",
      };

      const profilePicURL = await getUserProfileURL(doc.id);
      if (profilePicURL != null) {
        userData.profilePicURL = profilePicURL;
      }

      usersData.push(userData);
    });

    await Promise.all(promises);

    return usersData;
  } catch (error) {
    console.error("Error searching for users: ", error);
    return [];
  }
}

/**
 * Method to retrieve the number of followers a user has.
 * @param userID - The uid of the current user.
 * @returns {Promise<number>} - The number of followers a user has.
 */
export async function getNumberOfFollowersByUserID(
  userID: string,
): Promise<number> {
  const followersQuery = query(
    collection(DB, "relationships"),
    where("following", "==", userID),
    where("follow_status", "==", "following"),
  );
  const followersSnapshot = await getCountFromServer(followersQuery);
  return followersSnapshot.data().count;
}

/**
 * Method to retrieve the number of users the provided user is following.
 * @param userID - The uid of the current user.
 * @returns {Promise<number>} - The number of folowees a user has.
 */
export async function getNumberOfFollowingByUserID(
  userID: string,
): Promise<number> {
  const followingQuery = query(
    collection(DB, "relationships"),
    where("follower", "==", userID),
    where("follow_status", "==", "following"),
  );
  const followingSnapshot = await getCountFromServer(followingQuery);
  return followingSnapshot.data().count;
}

/**
 * Adds a book to the user's bookshelf.
 * @param {string} userID - The ID of the user.
 * @param {string} bookID - The ID of the book to be added.
 * @param {string} bookshelfName - The name of the bookshelf where the book will be added.
 * @returns {Promise<{ success: boolean; book?: BookShelfBookModel }>} A promise that resolves with an object containing the success status and, if successful, the book information.
 * @throws {Error} Throws an error if user ID is null or book ID is undefined.
 */
export async function addBookToUserBookshelf(
  userID: string,
  bookID: string,
  bookshelfName: string,
): Promise<{ success: boolean; book?: BookShelfBookModel }> {
  try {
    const userDocRef = doc(collection(DB, "bookshelf_collection"), userID);
    const bookshelfRef = doc(collection(userDocRef, bookshelfName), bookID);

    // Add the book document with the bookID as its ID and created timestamp field
    await setDoc(bookshelfRef, {
      created: serverTimestamp(),
    });

    // Fetch the book data after adding it to the user's bookshelf
    const bookSnapshot = await getDoc(bookshelfRef);
    if (bookSnapshot.exists()) {
      const bookData = bookSnapshot.data();
      const book: BookShelfBookModel = {
        id: bookSnapshot.id,
        created: bookData.created,
      };

      return { success: true, book };
    } else {
      console.error("Failed to fetch book data after adding to bookshelf.");
      return { success: false };
    }
  } catch (error) {
    console.error("Error adding book to user bookshelf:", error);
    return { success: false };
  }
}

/**
 * Removes a book from a specified bookshelf for a user.
 *
 * @param {string} userID The ID of the user.
 * @param {string} bookID The ID of the book to remove.
 * @param {string} bookshelfName The name of the bookshelf from which the book will be removed.
 * @returns {Promise<boolean>} A promise that resolves to true if the book was successfully removed, otherwise false.
 */
export async function removeBookFromUserBookshelf(
  userID: string,
  bookID: string,
  bookshelfName: string,
): Promise<boolean> {
  try {
    const bookshelfRef = doc(
      collection(DB, "bookshelf_collection", userID, bookshelfName),
      bookID,
    );
    await deleteDoc(bookshelfRef);
    return true;
  } catch (error) {
    console.error("Error removing book from user bookshelf:", error);
    return false;
  }
}

/**
 * Fetches books from specified bookshelves for a user and organizes them by shelf.
 *
 * @param {string} userID - The user's ID.
 * @param {string[]} shelves - List of shelf names to retrieve books from.
 * @returns {Promise<UserBookShelvesModel | null>} - A promise that resolves to a map of shelves with their corresponding books or null if an error occurs.
 */
export async function getBooksFromUserBookShelves(
  userID: string,
  shelves: string[],
): Promise<UserBookShelvesModel | null> {
  try {
    const userBookShelves: UserBookShelvesModel = {};

    for (const shelf of shelves) {
      const bookshelfQuery = query(
        collection(DB, "bookshelf_collection", userID, shelf),
        orderBy("created", "desc"),
      );

      const bookshelfSnapshot = await getDocs(bookshelfQuery);
      userBookShelves[shelf] = [];
      bookshelfSnapshot.forEach((doc) => {
        const bookData = doc.data();
        userBookShelves[shelf].push({
          id: doc.id,
          created: bookData.created,
        });
      });
    }

    return userBookShelves;
  } catch (error) {
    console.error("Error retrieving books from user bookshelves:", error);
    return null;
  }
}

/**
 * Retrieves the shelves containing a specific book for a given user.
 * @param {string} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 * @returns {Promise<ServerBookShelfName[]>} An array of shelf names containing the book.
 * @throws {Error} If an error occurs during the retrieval process.
 */
export async function getShelvesContainingBook(
  userID: string,
  bookID: string,
): Promise<ServerBookShelfName[]> {
  const shelves: ServerBookShelfName[] = [
    ServerBookShelfName.CURRENTLY_READING,
    ServerBookShelfName.WANT_TO_READ,
    ServerBookShelfName.FINISHED,
    ServerBookShelfName.LENDING_LIBRARY,
  ];
  const shelvesContainingBook: ServerBookShelfName[] = [];

  try {
    for (const shelf of shelves) {
      const bookRef = doc(DB, "bookshelf_collection", userID, shelf, bookID);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        shelvesContainingBook.push(shelf);
      }
    }

    return shelvesContainingBook;
  } catch (e) {
    console.error("Failed to check shelves for book:", e);
    return [];
  }
}

/**
 * Fetches book information for a list of book volume IDs using Google Books API.
 *
 * @param {string[]} volumeIDs An array of volume IDs for which to retrieve book information.
 * @returns {Promise<BookVolumeInfo[]>} A promise that resolves to an array of book volume information, or an empty array if no valid IDs are provided or an error occurs.
 */
export async function getBooksByBookIDs(
  volumeIDs: string[],
): Promise<BookVolumeInfo[]> {
  // Filter out empty volume IDs
  const validVolumeIDs = volumeIDs.filter((id) => id.trim() !== "");

  // If there are no valid volume IDs, return an empty array
  if (validVolumeIDs.length === 0) {
    return [];
  }

  try {
    // Create an array to store promises for each request
    const requests = validVolumeIDs.map(
      async (volumeID: string) =>
        await axios.get<{
          volumeInfo: BookVolumeInfo;
        }>("https://www.googleapis.com/books/v1/volumes/" + volumeID, {
          params: {
            key: BOOKS_API_KEY,
            projection: "lite",
          },
        }),
    );

    // Use Promise.all to execute all requests in parallel
    const responses = await Promise.all(requests);

    // Extract volume info from each response
    const volumeInfos = responses.map((response) => response.data.volumeInfo);

    return volumeInfos;
  } catch (error) {
    console.error("Error fetching books by volume IDs", error);
    return [];
  }
}
