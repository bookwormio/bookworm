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
import { FollowStatus } from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";

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

// Follow or request to follow a user by their ID
// Returns either "following", "not following" based on what happens
// TODO: add private visibility down the line (follow request)
export async function followUserByID(
  currentUserID: string,
  friendUserID: string,
): Promise<string> {
  if (currentUserID === "") {
    console.error("Current user ID is null");
    return FollowStatus.NOT_FOLLOWING;
  }
  if (friendUserID === "") {
    console.error("Attempting to follow null user");
    return FollowStatus.NOT_FOLLOWING;
  }
  try {
    const docData = {
      follower: currentUserID,
      following: friendUserID,
      created_at: serverTimestamp(),
      follow_status: FollowStatus.FOLLOWING,
    };
    // TODO: only set created_at if this document doesn't already exist
    // Otherwise set updated_at to the timestamp and keep created_at what it already is.
    // Doc ID = currentUserID_followedUserID
    await setDoc(
      doc(DB, "relationships", `${currentUserID}_${friendUserID}`),
      docData,
    );

    return FollowStatus.FOLLOWING;
  } catch (error) {
    console.error("Error following user:", error);
    return FollowStatus.NOT_FOLLOWING;
  }
}

/**
 * Unfollows a user by updating the follow status in the Firestore database.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string} friendUserID - The ID of the user to unfollow.
 * @returns {Promise<string>} A promise that resolves to the follow status after unfollowing.
 */
export async function unfollowUserByID(
  currentUserID: string,
  friendUserID: string,
): Promise<string> {
  if (currentUserID === "") {
    console.error("Current user ID is empty string");
    return FollowStatus.FOLLOWING; // Error: return still following
  }
  if (friendUserID === "") {
    console.error("Attempting to unfollow empty user string");
    return FollowStatus.FOLLOWING; // Error: return still following
  }
  try {
    const docRef = doc(DB, "relationships", `${currentUserID}_${friendUserID}`);
    await updateDoc(docRef, {
      follow_status: FollowStatus.UNFOLLOWED,
      updated_at: serverTimestamp(), // Update the timestamp
    });
    return FollowStatus.UNFOLLOWED;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return FollowStatus.FOLLOWING; // Error: return still following
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
      return followStatus === FollowStatus.FOLLOWING;
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

// TODO: implement
export async function getAllFollowing(userID: string): Promise<UserListItem[]> {
  // TODO: return all users this user is following
  return [];
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
