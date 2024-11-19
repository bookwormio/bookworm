import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ServerFollowStatus } from "../../enums/Enums";
import { DB } from "../../firebase.config";
import { type ConnectionModel, type UserSearchDisplayModel } from "../../types";

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
    const filteredRelations = relationsData.filter((id) => id !== userID);
    return filteredRelations;
  } catch (error) {
    console.error("Error searching for users you follow: ", error);
    return [];
  }
}
