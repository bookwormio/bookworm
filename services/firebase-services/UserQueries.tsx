import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  or,
  orderBy,
  query,
  type QuerySnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ServerBookShelfName, ServerFollowDetailType } from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";
import {
  type BookShelfBookModel,
  type BookshelfVolumeInfo,
  type UserBookShelvesModel,
  type UserDataModel,
  type UserModel,
  type UserSearchDisplayModel,
} from "../../types";

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

/**
 * Fetches user data from Firebase by an array of user IDs.
 *
 * This function handles the Firebase limitation of a maximum of 10 items in an 'in' clause by splitting
 * the input array into chunks of 10 and making separate requests for each chunk. It then combines
 * the results and returns an array of `UserModel` objects.
 *
 * @param {string[]} userIDs - An array of user IDs to fetch data for.
 * @returns {Promise<UserModel[]>} - A promise that resolves to an array of `UserModel` objects.
 * @throws Will throw an error if fetching the users fails.
 */
export async function fetchUsersByIDs(userIDs: string[]): Promise<UserModel[]> {
  try {
    if (userIDs.length === 0) {
      return [];
    }

    // Firebase has a limit of 10 items in an 'in' clause
    const chunkSize = 10;
    const userChunks = [];
    for (let i = 0; i < userIDs.length; i += chunkSize) {
      userChunks.push(userIDs.slice(i, i + chunkSize));
    }

    const querySnapshots: Array<QuerySnapshot<DocumentData>> =
      await Promise.all(
        userChunks.map(
          async (chunk) =>
            await getDocs(
              query(
                collection(DB, "user_collection"),
                where("__name__", "in", chunk),
              ),
            ),
        ),
      );

    const users: UserModel[] = querySnapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          email: userData.email,
          first: userData.first,
          isPublic: userData.isPublic,
          last: userData.last,
          number: userData.number,
        };
      }),
    );

    return users;
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
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
 * If the user document doesn't exist or if data is missing, it returns an empty user.
 */
export async function newFetchUserInfo(userID: string): Promise<UserDataModel> {
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
  } catch (error) {
    console.error("Error fetching user information:", error);
  }
  const emptyUser: UserDataModel = {
    id: "",
    username: "",
    email: "",
    first: "",
    last: "",
    number: "",
    isPublic: false,
    bio: "",
    city: "",
    state: "",
    profilepic: "",
  };
  return emptyUser;
}

/**
 * Fetches user information from the Firestore database.
 * @param {string} userID - The user to fetch information for.
 * @returns {Promise<UserData | undefined>} A Promise that resolves to the user data if found, otherwise undefined.
 * @throws {Error} If there is an error while fetching the user information.
 * @description
 * Retrieves user information from the Firestore database based on the provided user ID.
 * If the user document exists, it returns an object containing the user data.
 * If the user document doesn't exist or if data is missing, it returns undefined.
 */
export const fetchUserData = async (
  userID: string,
): Promise<UserDataModel | null> => {
  try {
    if (userID == null || userID === "") {
      return null;
    }

    const userDocRef = doc(DB, "user_collection", userID);
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

/**
 * Searches for users based on their first and/or last names while excluding the current user.
 * Supports partial, case-insensitive matching at the beginning of names.
 *
 * @param {string} searchValue - String to search for. Can be single name or space-separated first/last names.
 * @param {string} currentUserID - ID of the current user to exclude from results.
 * @returns {Promise<UserSearchDisplayModel[]>} A Promise that resolves to an array of matching users with their details.
 * @throws {Error} If there is an error while searching the users collection.
 */
export async function fetchUsersBySearch(
  searchValue: string,
  currentUserID: string,
): Promise<UserSearchDisplayModel[]> {
  if (searchValue === "") {
    return []; // Return empty array if there's no searchValue
  }
  try {
    const normalizedSearchValue = caseFoldNormalize(searchValue);
    const [first, last] = searchValue.split(" ").map(caseFoldNormalize);
    const normalizedFirst = first ?? "";
    const normalizedLast = last ?? "";
    // search for users by their case-folded first or last names.
    const q = query(
      collection(DB, "user_collection"),
      and(
        // filter out the current user
        where(documentId(), "!=", currentUserID),
        or(
          and(
            // Match users whose first name starts with the full search value
            where("first_casefold", ">=", normalizedSearchValue),
            where("first_casefold", "<=", normalizedSearchValue + "\uf8ff"),
          ),
          and(
            // OR match users whose last name starts with the full search value
            where("last_casefold", ">=", normalizedSearchValue),
            where("last_casefold", "<=", normalizedSearchValue + "\uf8ff"),
          ),
          and(
            // OR Match users whose first and last names start with the respective parts of the search value
            where("first_casefold", ">=", normalizedFirst),
            where("first_casefold", "<=", normalizedFirst + "\uf8ff"),
            where("last_casefold", ">=", normalizedLast),
            where("last_casefold", "<=", normalizedLast + "\uf8ff"),
          ),
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
    throw new Error(`Error searching for users: ${(error as Error).message}`);
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
 * Method to retrieve the followers' detailed data for a user.
 * @param userID - The uid of the current user.
 * @returns {Promise<UserSearchDisplayModel[]>} - An array of followers' detailed data.
 */
export async function getFollowersByUserID(
  userID: string,
): Promise<UserSearchDisplayModel[]> {
  return await getFollowDetailByID(userID, ServerFollowDetailType.FOLLOWING);
}

/**
 * Method to retrieve the following detailed data for a user.
 * @param userID - The uid of the current user.
 * @returns {Promise<UserSearchDisplayModel[]>} - An array of following detailed data.
 */
export async function getFollowingByID(
  userID: string,
): Promise<UserSearchDisplayModel[]> {
  return await getFollowDetailByID(userID, ServerFollowDetailType.FOLLOWER);
}

/**
 * Method to retrieve the followers' detailed data for a user.
 * @param userID - The uid of the current user.
 * @returns {Promise<UserSearchDisplayModel[]>} - An array of followers' detailed data.
 */
export async function getFollowDetailByID(
  userID: string,
  type: ServerFollowDetailType,
): Promise<UserSearchDisplayModel[]> {
  const followDetailQuery = query(
    collection(DB, "relationships"),
    where(type, "==", userID),
    where("follow_status", "==", "following"),
  );

  const followDetailSnapshot = await getDocs(followDetailQuery);

  let followDetailIDs;
  if (type === ServerFollowDetailType.FOLLOWING) {
    followDetailIDs = Array.from(
      new Set(
        followDetailSnapshot.docs.map((doc) => String(doc.data().follower)),
      ),
    );
  } else {
    followDetailIDs = Array.from(
      new Set(
        followDetailSnapshot.docs.map((doc) => String(doc.data().following)),
      ),
    );
  }

  const followDetailData = await Promise.all(
    followDetailIDs.map(async (followerID) => {
      const followDetailDocRef = doc(DB, "user_collection", followerID);
      const followDetailDoc = await getDoc(followDetailDocRef);

      if (followDetailDoc.exists()) {
        const data = followDetailDoc.data();

        const profilePicURL = await getUserProfileURL(followDetailDoc.id);
        let profilePic = "";
        if (profilePicURL != null) {
          profilePic = profilePicURL;
        }
        return {
          id: followDetailDoc.id,
          firstName: data.first ?? "",
          lastName: data.last ?? "",
          profilePicURL: profilePic ?? "",
        } satisfies UserSearchDisplayModel;
      }
      return null;
    }),
  );

  return followDetailData.filter(
    (data) => data !== null,
  ) as UserSearchDisplayModel[];
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
 * @param {BookshelfVolumeInfo} bookVolumeInfo - The book's volume information.
 * @param {string} bookshelfName - The name of the bookshelf where the book will be added.
 * @returns {Promise<{ success: boolean; book?: BookShelfBookModel }>} A promise that resolves with an object containing the success status and, if successful, the book information.
 * @throws {Error} Throws an error if user ID is null or book ID is undefined.
 */
export async function addBookToUserBookshelf(
  userID: string,
  bookID: string,
  bookVolumeInfo: BookshelfVolumeInfo,
  bookshelfName: string,
): Promise<{ success: boolean; book?: BookShelfBookModel }> {
  try {
    const userDocRef = doc(collection(DB, "bookshelf_collection"), userID);
    const bookshelfRef = doc(collection(userDocRef, bookshelfName), bookID);

    // Create a new book document with the book data
    const bookData: Record<string, unknown> = {
      created: serverTimestamp(),
    };

    // Add fields to bookData only if they are defined in bookVolumeInfo
    (Object.keys(bookVolumeInfo) as Array<keyof BookshelfVolumeInfo>).forEach(
      (key) => {
        if (bookVolumeInfo[key] !== undefined) {
          bookData[key] = bookVolumeInfo[key];
        }
      },
    );

    // Add the book document with the bookID as its ID
    await setDoc(bookshelfRef, {
      ...bookData,
    });

    // Fetch the book data after adding it to the user's bookshelf
    const bookSnapshot = await getDoc(bookshelfRef);
    if (bookSnapshot.exists()) {
      const bookData = bookSnapshot.data();
      const book: BookShelfBookModel = {
        id: bookSnapshot.id,
        created: bookData.created,
        volumeInfo: {
          title: bookData?.title,
          subtitle: bookData?.subtitle,
          authors: bookData?.authors,
          publisher: bookData?.publisher,
          publishedDate: bookData?.publishedDate,
          description: bookData?.description,
          pageCount: bookData?.pageCount,
          categories: bookData?.categories,
          maturityRating: bookData?.maturityRating,
          previewLink: bookData?.previewLink,
          averageRating: bookData?.averageRating,
          ratingsCount: bookData?.ratingsCount,
          language: bookData?.language,
          mainCategory: bookData?.mainCategory,
          thumbnail: bookData?.thumbnail,
        },
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
          volumeInfo: {
            title: bookData?.title,
            subtitle: bookData?.subtitle,
            authors: bookData?.authors,
            publisher: bookData?.publisher,
            publishedDate: bookData?.publishedDate,
            description: bookData?.description,
            pageCount: bookData?.pageCount,
            categories: bookData?.categories,
            maturityRating: bookData?.maturityRating,
            previewLink: bookData?.previewLink,
            averageRating: bookData?.averageRating,
            ratingsCount: bookData?.ratingsCount,
            language: bookData?.language,
            mainCategory: bookData?.mainCategory,
            thumbnail: bookData?.thumbnail,
          },
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
 * Get the bookmark for a certain book for a user.
 * @param {string} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 * @returns {Promise<number>} - The bookmark for the book.
 */
export async function getBookmarkForBook(
  userID: string,
  bookID: string,
): Promise<number> {
  try {
    const bookRef = doc(DB, "bookmark_collection", userID, "bookmarks", bookID);
    const bookSnap = await getDoc(bookRef);
    if (bookSnap.exists()) {
      const data = bookSnap.data();
      return typeof data.bookmark === "number" ? data.bookmark : 0;
    }
    return 0;
  } catch (e) {
    console.error("Error getting bookmark for book", e);
    throw e; // Re-throw the error to allow the caller to handle it
  }
}

/**
 * Set or update the bookmark for a certain book for a user.
 * @param {string} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 * @param {number} bookmark - The bookmark for the book.
 * @returns {Promise<boolean>} - A promise that resolves to true if the bookmark was successfully set, otherwise false.
 */
export async function setBookmarkForBook(
  userID: string,
  bookID: string,
  newBookmark: number,
  oldBookmark: number,
): Promise<boolean> {
  try {
    // no history if the book hasn't been started
    if (oldBookmark > 0) {
      const pageProgress = newBookmark - oldBookmark;
      // add new page progress to history
      await addDoc(
        collection(DB, `user_collection/${userID}/reading_history`),
        {
          bookID,
          pages: pageProgress,
          added_at: serverTimestamp(),
        },
      );
    }
    const bookmarkRef = doc(
      DB,
      `bookmark_collection/${userID}/bookmarks/${bookID}`,
    );
    if (!(await getDoc(bookmarkRef)).exists()) {
      await setDoc(bookmarkRef, {
        bookmark: newBookmark,
        created: serverTimestamp(),
        updated: serverTimestamp(),
      });
    } else {
      await setDoc(
        bookmarkRef,
        {
          bookmark: newBookmark,
          updated: serverTimestamp(),
        },
        { merge: true },
      );
    }
    return true;
  } catch (error) {
    console.error("Error adding new bookmark", error);
    return false;
  }
}
