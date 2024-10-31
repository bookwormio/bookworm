import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { type ServerBadgeName } from "../../enums/Enums";
import { DB } from "../../firebase.config";

export async function addBadgeToUser(
  userID: string,
  badgeID: ServerBadgeName,
  postID: string,
): Promise<void> {
  const userDocRef = doc(DB, "badge_collection", userID);
  const badgeDocRef = doc(collection(userDocRef, "badges"), badgeID);

  try {
    await setDoc(
      badgeDocRef,
      { received_at: serverTimestamp(), postID },
      { merge: true },
    );
  } catch (error) {
    console.error("Error adding badge: ", error);
    throw new Error("Could not add badge to user");
  }
}

export async function getExistingEarnedBadges(
  userID: string,
): Promise<ServerBadgeName[]> {
  const userDocRef = doc(DB, "badge_collection", userID);
  const badgesCollectionRef = collection(userDocRef, "badges");
  try {
    const badgeDocs = await getDocs(badgesCollectionRef);
    const badges: ServerBadgeName[] = [];
    badgeDocs.forEach((doc) => {
      badges.push(doc.id as ServerBadgeName);
    });
    console.log(badges);
    return badges;
  } catch (error) {
    console.error("Error getting user's badges", error);
    return [];
  }
}
