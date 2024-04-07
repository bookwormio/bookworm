import axios from "axios";
import { type User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { BOOKS_API_KEY } from "../../constants/constants";
import { ServerFollowStatus } from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";
import {
  type BookVolumeInfo,
  type BookVolumeItem,
  type BooksResponse,
  type ConnectionModel,
  type CreatePostModel,
  type CreateTrackingModel,
  type PostModel,
  type UserDataModel,
  type UserListItem,
  type UserModel,
} from "../../types";

/**
 * Updates user data in the database.
 * @param {UserDataModel} userdata - The user data to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @description
 * If all fields are empty, the function does nothing.
 * If any of the fields are empty, the function does not update the corresponding fields in Firestore.
 * Otherwise, it updates the Firestore document with the provided user information.
 */

export const updateUser = async (userdata: UserDataModel): Promise<void> => {
  console.log(userdata);
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
      if (userdata.bio !== "" && userdata.bio !== undefined) {
        dataToUpdate.bio = userdata.bio;
      }
      if (userdata.profilepic !== "" && userdata.bio !== undefined) {
        dataToUpdate.profilepic = userdata.profilepic;
      }
      const docRef = doc(DB, "user_collection", userdata.id);
      await updateDoc(docRef, dataToUpdate);
      if (
        userdata.profilepic.trim() !== "" &&
        userdata.profilepic !== undefined &&
        typeof userdata.profilepic === "string"
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
 * @returns {Promise<UserDataModel | undefined>} A Promise that resolves to the user data if found, otherwise undefined.
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
      book: post.book,
      text: post.text,
      image: post.images?.length,
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
export async function getAllFollowers(userID: string): Promise<UserListItem[]> {
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
 * Retrieves all posts for a user from their userID
 * @param {string} userIDs - The list of  userIDs who's posts are to be retrieved.
 * @returns {Promise<PostModel[]>} A promise that resolves to a list of PostModels,
 * a typed entity for storing Firebase post documents.
 */
export async function fetchPostsByUserIDs(
  userIDs: string[],
): Promise<PostModel[]> {
  if (userIDs.length > 0) {
    try {
      const postsQuery = query(
        collection(DB, "posts"),
        where("user", "in", userIDs),
        // TODO: unlock limit once we get insanely breaded and not worry about firebase fees
        limit(10),
      );
      const postsData: PostModel[] = [];
      const postsSnapshot = await getDocs(postsQuery);

      // Uses Promise.all to wait for all fetchUser promises to resolve
      await Promise.all(
        postsSnapshot.docs.map(async (postDoc) => {
          const userID: string = postDoc.data().user;
          try {
            const user = await fetchUser(userID);
            if (user != null) {
              const post = {
                id: postDoc.id,
                book: postDoc.data().book,
                created: postDoc.data().created,
                text: postDoc.data().text,
                user,
                images:
                  postDoc.data().image === true
                    ? ["posts/" + userID + "/" + postDoc.id]
                    : [],
              };
              postsData.push(post);
            }
          } catch (error) {
            console.error("Error fetching user", error);
          }
        }),
      );
      return postsData;
    } catch (error) {
      console.error("Error fetching posts by User ID", error);
    }
  }
  return [];
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
          post = {
            id: postSnap.id,
            book: postSnap.data().book,
            created: postSnap.data().created,
            text: postSnap.data().text,
            user,
            images: null,
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
 * Retrieves posts for every user the provided user is following.
 * Combines getAllFollowing(), fetchPostsByUserID(), and sortPostsByDate() functions.
 * @param {string} userID - The ID of the user who's followees' posts are to be retrieved.
 * @returns {Promise<PostModel[]>} A promise that resolves to a list of PostModels,
 * a typed entity for storing Firebase post documents.
 */
export async function fetchPostsForUserFeed(
  userID: string,
): Promise<PostModel[]> {
  try {
    const following = await getAllFollowing(userID);
    const posts = await fetchPostsByUserIDs(following);
    sortPostsByDate(posts);
    return posts;
  } catch (error) {
    console.error("Error fetching users feed", error);
    return [];
  }
}

/**
 * Sorts a list of PostModels by their dates descending.
 * The sort() function mutates the posts list without needing to return a new list.
 * @param {PostModel[]} posts - The list of posts to be sorted.
 */
function sortPostsByDate(posts: PostModel[]) {
  posts.sort((postA, postB) => {
    const dateA = postA.created.toDate();
    const dateB = postB.created.toDate();
    return dateB.getTime() - dateA.getTime();
  });
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
