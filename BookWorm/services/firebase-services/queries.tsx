import axios from "axios";
import { Image } from "expo-image";
import { type User } from "firebase/auth";
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React from "react";
import { BLURHASH, BOOKS_API_KEY } from "../../constants/constants";
import { ServerFollowStatus } from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";
import {
  type BookShelfBookModel,
  type BookVolumeInfo,
  type BookVolumeItem,
  type BooksResponse,
  type ConnectionModel,
  type CreatePostModel,
  type CreateTrackingModel,
  type LineDataPointModel,
  type PostModel,
  type UserBookShelvesModel,
  type UserDataModel,
  type UserModel,
  type UserSearchDisplayModel,
} from "../../types";

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
 * Normalizes a string to Unicode Normalization Form KC (NFKC) and then converts it to lowercase.
 * This function ensures case-folding of the input string.
 *
 * @param {string} s - The string to be normalized and case-folded.
 * @returns {string} The case-folded string.
 */
function caseFoldNormalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().toUpperCase().toLowerCase();
}

/**
 * Represents an asynchronous function that represents an empty query.
 * @returns {Promise<void>} A Promise that resolves when the empty query is completed.
 */
export const emptyQuery = async (): Promise<void> => {};

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
 * Follows a user by updating the relationship document between the current user and the friend user.
 * If the document doesn't exist, it creates a new one; otherwise, it updates the existing document.
 * @param {User | null} user - The current user.
 * @param {string} book - The title of the book.
 * @param {string} text - Any text the user wants to add to the post
 * @param {string[]} imageURIs - A list of all image URIs of each image the user wants to upload (can be empty)
 * @returns {Promise<void>} A void promise if successful or an error if the document creation fails
 * @throws {Error} If there's an error during the operation.
 */
export async function createPost(post: CreatePostModel) {
  if (post.userid != null) {
    addDoc(collection(DB, "posts"), {
      user: post.userid,
      created: serverTimestamp(),
      bookid: post.bookid,
      booktitle: post.booktitle,
      text: post.text,
      image: post.images.length,
    })
      .then(async (docRef) => {
        if (post.images.length > 0) {
          await Promise.all(
            post.images.map(async (imageURI: string, index: number) => {
              const response = await fetch(imageURI);
              const blob = await response.blob();
              const storageRef = ref(
                STORAGE,
                "posts/" + docRef.id + "/" + index,
              );
              await uploadBytesResumable(storageRef, blob);
            }),
          );
        }
      })
      .catch((error) => {
        console.error("Error creating post", error);
      });
  }
}

/**
 * Follows a user by updating the relationship document between the current user and the friend user.
 * If the document doesn't exist, it creates a new one; otherwise, it updates the existing document.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} friendUserID - The ID of the user to follow.
 * @returns {Promise<boolean>} A promise that resolves to true if the follow operation succeeds, false otherwise.
 * @throws {Error} If there's an error during the operation.
 * @TODO Add private visibility down the line (follow request).
 */
export async function followUserByID(
  connection: ConnectionModel,
): Promise<boolean> {
  if (connection.currentUserID === "") {
    console.error("Current user ID is null");
    return false;
  }
  if (connection.friendUserID === "") {
    console.error("Attempting to follow null user");
    return false;
  }
  try {
    const docRef = doc(
      DB,
      "relationships",
      `${connection.currentUserID}_${connection.friendUserID}`,
    );

    // A transaction is used to ensure data consistency
    // and avoid race conditions by executing all operations on the server side.
    await runTransaction(DB, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      if (docSnap.exists()) {
        // Document already exists, update it with merge
        transaction.set(
          docRef,
          {
            updated_at: serverTimestamp(),
            follow_status: ServerFollowStatus.FOLLOWING,
          },
          { merge: true },
        );
      } else {
        // Document doesn't exist, set it with created_at
        transaction.set(docRef, {
          follower: connection.currentUserID,
          following: connection.friendUserID,
          created_at: serverTimestamp(),
          follow_status: ServerFollowStatus.FOLLOWING,
        });
      }
    });

    return true;
  } catch (error) {
    console.error("Error following user:", error);
    return false;
  }
}

/**
 * Unfollows a user by updating the follow status in the Firestore database.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} friendUserID - The ID of the user to unfollow.
 * @returns {Promise<boolean>} A promise that resolves to true if the unfollow operation succeeds, false otherwise.
 */
export async function unfollowUserByID(
  connection: ConnectionModel,
): Promise<boolean> {
  if (connection.currentUserID === "") {
    console.error("Current user ID is empty string");
    return false;
  }
  if (connection.friendUserID === "") {
    console.error("Attempting to unfollow empty user string");
    return false;
  }
  try {
    const docRef = doc(
      DB,
      "relationships",
      `${connection.currentUserID}_${connection.friendUserID}`,
    );
    await updateDoc(docRef, {
      follow_status: ServerFollowStatus.UNFOLLOWED,
      updated_at: serverTimestamp(), // Update the timestamp
    });
    return true;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return false;
  }
}

/**
 * Checks if the current user is following a specific friend user.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} friendUserID - The ID of the friend user.
 * @returns {Promise<boolean>} A promise that resolves to true if the current user is following the friend user, false otherwise.
 */
export async function getIsFollowing(
  currentUserID: string,
  friendUserID: string,
): Promise<boolean> {
  try {
    const docRef = doc(DB, "relationships", `${currentUserID}_${friendUserID}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const followStatus = docSnap.data()?.follow_status;
      return followStatus === ServerFollowStatus.FOLLOWING;
    } else {
      return false; // Relationship document doesn't exist, not following
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false; // Assume not following in case of an error
  }
}

// TODO: implement
export async function getAllFollowers(
  userID: string,
): Promise<UserSearchDisplayModel[]> {
  // TODO: return all followers of this user
  return [];
}

/**
 * Retrieves a list of userIDs the current user is following.
 * @param {string} userID - The ID of the user who's folowees are to be retrieved.
 * @returns {Promise<string[]>} A promise that resolves to a list of strings storing the userID of each followee.
 */
export async function getAllFollowing(userID: string): Promise<string[]> {
  try {
    const relationshipQuery = query(
      collection(DB, "relationships"),
      where("follower", "==", userID),
      where("follow_status", "==", "following"),
    );
    const relationsData: string[] = [];
    const relationshipSnapshot = await getDocs(relationshipQuery);
    relationshipSnapshot.forEach((relationshipDoc) => {
      const followingUserID: string = relationshipDoc.data().following;
      relationsData.push(followingUserID);
    });
    relationsData.push(userID); // Feed should show the users own posts
    return relationsData;
  } catch (error) {
    console.error("Error searching for users you follow: ", error);
    return [];
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
    if (response?.data?.totalItems === 0) {
      return [];
    }
    return response.data.items.map((item) => ({
      kind: item.kind,
      id: item.id,
      etag: item.etag,
      selfLink: item.selfLink,
      volumeInfo: item.volumeInfo,
    }));
  } catch (error) {
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

/**
 * Fetches posts for the specified user IDs with pagination support.
 * If a last visible document snapshot is provided, it fetches the next page of posts.
 * @param {string[]} userIDs - The user IDs for which to fetch posts.
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData> | null} [lastVisible=null] - The last visible document snapshot.
 * @returns {Promise<{
 *   posts: PostModel[]; // The array of fetched posts.
 *   newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null; // The new last visible document snapshot.
 * }>} A promise that resolves to an object containing the fetched posts and the new last visible document snapshot.
 */
export async function fetchPostsByUserIDs(
  userIDs: string[],
  lastVisible?: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
): Promise<{
  posts: PostModel[];
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}> {
  try {
    let postsQuery = query(
      collection(DB, "posts"),
      where("user", "in", userIDs),
      orderBy("created", "desc"),
      limit(10),
    );
    // if there is a last visible document, fetch the next visible
    if (lastVisible != null) {
      postsQuery = query(
        collection(DB, "posts"),
        where("user", "in", userIDs),
        orderBy("created", "desc"),
        startAfter(lastVisible),
        limit(10),
      );
    }
    const postsSnapshot = await getDocs(postsQuery);
    const postsData: PostModel[] = [];
    for (const postDoc of postsSnapshot.docs) {
      const userID: string = postDoc.data().user;
      try {
        const user = await fetchUser(userID);
        if (user != null) {
          const downloadPromises: Array<Promise<void>> = [];
          const images: JSX.Element[] = [];
          for (let index = 0; index < postDoc.data().image; index++) {
            const storageRef = ref(STORAGE, `posts/${postDoc.id}/${index}`);
            const promise = getDownloadURL(storageRef)
              .then((url) => {
                images[index] = (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    cachePolicy={"memory-disk"}
                    placeholder={BLURHASH}
                    style={{
                      height: 100,
                      width: 100,
                      borderColor: "black",
                      borderRadius: 10,
                      borderWidth: 1,
                      marginRight: 10,
                    }}
                  />
                );
              })
              .catch((error) => {
                console.error("Error fetching image ", error);
              });
            downloadPromises.push(promise);
          }
          await Promise.all(downloadPromises);
          const post = {
            id: postDoc.id,
            bookid: postDoc.data().bookid,
            booktitle: postDoc.data().booktitle,
            created: postDoc.data().created,
            text: postDoc.data().text,
            user,
            images,
          };
          postsData.push(post);
        }
      } catch (error) {
        console.error("Error fetching user", error);
      }
    }
    const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
    return { posts: postsData, newLastVisible: lastVisibleDoc };
  } catch (error) {
    console.error("Error fetching posts by User ID", error);
    return { posts: [], newLastVisible: null };
  }
}

/**
 * Retrieves a post by it's postID.
 * @param {string} postID - The ID of the post to be retrieved.
 * @returns {Promise<PostModel | null>} A promise that resolves to the PostModel if found.
 */
export async function fetchPostByPostID(
  postID: string,
): Promise<PostModel | null> {
  try {
    let post: PostModel | null = null;
    const postRef = doc(DB, "posts", postID);
    await runTransaction(DB, async (transaction) => {
      const postSnap = await transaction.get(postRef);
      if (postSnap.exists()) {
        const userID: string = postSnap.data().user;
        const userRef = doc(DB, "user_collection", userID);
        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const user: UserModel = {
            id: userSnap.id,
            email: userSnap.data().email,
            first: userSnap.data().first,
            isPublic: userSnap.data().isPublic,
            last: userSnap.data().last,
            number: userSnap.data().number,
          };
          const downloadPromises: Array<Promise<void>> = [];
          const images: JSX.Element[] = [];
          for (let index = 0; index < postSnap.data().image; index++) {
            const storageRef = ref(STORAGE, `posts/${postSnap.id}/${index}`);
            const promise = getDownloadURL(storageRef)
              .then((url) => {
                images[index] = (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    cachePolicy={"memory-disk"}
                    placeholder={BLURHASH}
                    style={{
                      height: 100,
                      width: 100,
                      borderColor: "black",
                      borderRadius: 10,
                      borderWidth: 1,
                      marginRight: 10,
                    }}
                  />
                );
              })
              .catch((error) => {
                console.error("Error fetching image ", error);
              });
            downloadPromises.push(promise);
          }
          await Promise.all(downloadPromises);
          post = {
            id: postSnap.id,
            bookid: postSnap.data().bookid,
            booktitle: postSnap.data().booktitle,
            created: postSnap.data().created,
            text: postSnap.data().text,
            user,
            images,
          };
        }
      }
    });
    return post;
  } catch (error) {
    console.error("Error fetching users feed", error);
    return null;
  }
}

/**
 * Retrieves posts for every user the provided user is following,
 * including pagination support.
 * Combines getAllFollowing(), fetchPostsByUserID(), and sortPostsByDate() functions.
 * @param {string} userID - The ID of the user for whom to retrieve posts.
 * @param {QueryDocumentSnapshot<DocumentData, DocumentData> | null} [lastVisible=null] - The last visible document snapshot.
 * @returns {Promise<{
 *   posts: PostModel[]; // A list of fetched posts.
 *   newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null; // The new last visible document snapshot.
 * }>} A promise that resolves to an object containing the fetched posts and the new last visible document snapshot.
 */
export async function fetchPostsForUserFeed(
  userID: string,
  lastVisible?: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
): Promise<{
  posts: PostModel[];
  newLastVisible: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
}> {
  try {
    const following = await getAllFollowing(userID);
    if (following.length === 0) {
      return { posts: [], newLastVisible: null };
    } else {
      const { posts, newLastVisible } = await fetchPostsByUserIDs(
        following,
        lastVisible,
      );
      return { posts, newLastVisible };
    }
  } catch (error) {
    console.error("Error fetching users feed", error);
    return { posts: [], newLastVisible: null };
  }
}

/**
 * Adds a data entry for a users time reading and number of pages
 * Combines getAllFollowing(), fetchPostsByUserID(), and sortPostsByDate() functions.
 * @param {CreateTrackingModel} tracking - A tracking object storing the userID, minutesRead, and pagesRead.
 * @returns {Promise<boolean>} A boolean promise, true if successful, false if not.
 */
export async function addDataEntry(
  tracking: CreateTrackingModel,
): Promise<boolean> {
  try {
    if (tracking.userid !== null) {
      const q = query(
        collection(DB, "data_collection"),
        where("user_id", "==", tracking.userid),
      );
      const dataCol = await getDocs(q);
      if (dataCol.empty) {
        // The collection doesn't exist for the user, so create it
        const userDataCollectionRef = collection(DB, "data_collection");
        const userDataDocRef = doc(userDataCollectionRef);
        await setDoc(userDataDocRef, { user_id: tracking.userid });
        const newDocRef = await getDoc(userDataDocRef);
        // console.log(newDocRef);
        const subColPageRef = collection(newDocRef.ref, "pages_read");
        await addDoc(subColPageRef, {
          added_at: serverTimestamp(),
          pages: tracking.pagesRead,
        });
        const subColTimeRef = collection(newDocRef.ref, "time_read");
        await addDoc(subColTimeRef, {
          added_at: serverTimestamp(),
          minutes: tracking.minutesRead,
        });
      } else {
        // console.log(dataCol.docs[0].ref);
        const subColPageRef = collection(dataCol.docs[0].ref, "pages_read");
        await addDoc(subColPageRef, {
          added_at: serverTimestamp(),
          pages: tracking.pagesRead,
        });
        const subColTimeRef = collection(dataCol.docs[0].ref, "time_read");
        await addDoc(subColTimeRef, {
          added_at: serverTimestamp(),
          minutes: tracking.minutesRead,
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Method to retrieve the time read data from database and put it into a graphable format
 * @param userID - uid of whoever is logged in
 * @returns {Promise<LineDataPointModel[]>} - x: timestamp, y: pages read
 */
export async function fetchPagesReadData(
  userID: string,
): Promise<LineDataPointModel[]> {
  const dataPoints: LineDataPointModel[] = [];
  try {
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", userID),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Add each user data to the array
        const subcollectionRef = collection(docRef, "pages_read");
        const subcollectionSnapshot = await getDocs(subcollectionRef);
        // Iterate over each document in the subcollection
        subcollectionSnapshot.forEach((subDoc) => {
          // console.log("Subdocument:", subDoc.id, subDoc.data());
          dataPoints.push({
            x: subDoc.data().added_at.seconds,
            y: subDoc.data().pages,
          });
        });
      }
      // console.log(dataPoints);
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching pages data:", error);
    throw error;
  }
}

/**
 * Method to retrieve the time read data from database and put it into a graphable format
 * @param userID - uid of whoever is logged in
 * @returns {Promise<LineDataPointModel[]>} - x: timestamp, y: time read
 */
export async function fetchTimeReadData(
  userID: string,
): Promise<LineDataPointModel[]> {
  const dataPoints: LineDataPointModel[] = [];
  try {
    const q = query(
      collection(DB, "data_collection"),
      where("user_id", "==", userID),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // Add each user data to the array
        const subcollectionRef = collection(docRef, "time_read");
        const subcollectionSnapshot = await getDocs(subcollectionRef);
        // Iterate over each document in the subcollection
        subcollectionSnapshot.forEach((subDoc) => {
          // Construct LineDataPoint objects and push them into the dataPoints array
          dataPoints.push({
            x: subDoc.data().added_at.seconds,
            y: subDoc.data().minutes,
          });
        });
      }
      // console.log(dataPoints);
    }
    return dataPoints;
  } catch (error) {
    console.error("Error fetching time data:", error);
    throw error;
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
