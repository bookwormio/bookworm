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

// TODO: implement
// Follow or request to follow a user by their ID
// Returns either "following", "not following", or "requested" based on what happens
export async function followUserByID(
  currentUserID: string,
  followedUserID: string,
): Promise<string> {
  if (currentUserID === "") {
    console.error("Current user ID is null");
    return FollowStatus.NOT_FOLLOWING;
  }
  if (followedUserID === null) {
    console.error("Attempting to follow null user");
    return FollowStatus.NOT_FOLLOWING;
  }
  try {
    // TODO: Implement the logic to follow or request to follow the user
    // ...
    // if visibility = public:
    // follow the user, set firestore status to following
    // send new follower notification to followed user
    // return following

    // else if visibility = private
    // request to follow user, set firestore status to requested
    // send new follower request notification to followed user
    // return requested
    return FollowStatus.FOLLOWING; // Return "following" if the user is successfully followed
  } catch (error) {
    console.error("Error following user:", error);
    return FollowStatus.NOT_FOLLOWING;
  }
}

// TODO: implement
export async function unfollowUserByID(
  currentUserID: string,
  followedUserID: string,
): Promise<string> {
  try {
    // TODO: remove follower relationship
    return FollowStatus.NOT_FOLLOWING;
  } catch (error) {
    console.error("Error unfollowing following user:", error);
    return FollowStatus.FOLLOWING;
  }
}

// TODO: implement
export async function getAllFollowers(userID: string) {
  // TODO: return all followers of this user
}

// TODO: implement
export async function getAllFollowing(userID: string) {
  // TODO: return all users this user is following
}

// TODO: implement
export async function respondToFollowRequest(
  accepted: boolean,
  fromUserID: string,
  currentUserID: string,
): Promise<void> {
  // Function implementation
  if (accepted) {
    // change following status for fromUserID to following
    // increment
    // send notification to fromUserID
  } else {
    // change following status for
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
