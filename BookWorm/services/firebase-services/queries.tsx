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
  type PostModel,
  type UserData,
  type UserListItem,
  type UserModel,
} from "../../types";

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
    const userDocRef = doc(DB, "user_collection", userID);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData !== undefined) {
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
    console.error("doesnt exist");

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

// fetches all user traits
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
      console.error("User document DNE");
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
      image: imageURI !== "",
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
  currentUserID: string,
  friendUserID: string,
): Promise<boolean> {
  if (currentUserID === "") {
    console.error("Current user ID is null");
    return false;
  }
  if (friendUserID === "") {
    console.error("Attempting to follow null user");
    return false;
  }
  try {
    const docRef = doc(DB, "relationships", `${currentUserID}_${friendUserID}`);

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
          follower: currentUserID,
          following: friendUserID,
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
  currentUserID: string,
  friendUserID: string,
): Promise<boolean> {
  if (currentUserID === "") {
    console.error("Current user ID is empty string");
    return false;
  }
  if (friendUserID === "") {
    console.error("Attempting to unfollow empty user string");
    return false;
  }
  try {
    const docRef = doc(DB, "relationships", `${currentUserID}_${friendUserID}`);
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
    return [];
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
