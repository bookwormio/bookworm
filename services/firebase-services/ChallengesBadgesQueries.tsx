import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import {
  ServerBookshelfBadge,
  ServerBookShelfName,
  ServerCompletionBadge,
  ServerLendingBadge,
  ServerPostBadge,
  ServerStreakBadge,
  type ServerBadgeName,
} from "../../enums/Enums";
import { DB } from "../../firebase.config";

/**
 * Adds a badge to a user in the Firestore database.
 *
 * @param {string} userID - The ID of the user to whom the badge will be added.
 * @param {ServerBadgeName} badgeID - The ID of the badge to be added.
 * @param {string} [postID] - Optional ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the badge has been added.
 */
export async function addBadgeToUser(
  userID: string,
  badgeID: ServerBadgeName,
  postID?: string,
): Promise<void> {
  const userBadgeCollectDocRef = doc(DB, "badge_collection", userID);
  const badgeDocRef = doc(
    collection(userBadgeCollectDocRef, "badges"),
    badgeID as string,
  );
  try {
    if (postID === null) {
      await setDoc(
        badgeDocRef,
        { received_at: serverTimestamp() },
        { merge: true },
      );
    } else {
      await setDoc(
        badgeDocRef,
        { received_at: serverTimestamp(), postID },
        { merge: true },
      );
    }
  } catch (error) {
    console.error("Error adding badge: ", error);
    throw new Error("Could not add badge to user");
  }
}

/**
 * Retrieves existing earned badges for a user.
 *
 * @param {string} userID - The ID of the user whose badges are to be retrieved.
 * @returns {Promise<ServerBadgeName[]>} - A promise that resolves to an array of earned badge IDs.
 */
export async function getExistingEarnedBadges(
  userID: string,
): Promise<ServerBadgeName[]> {
  const userBadgeCollectDocRef = doc(DB, "badge_collection", userID);
  const badgesCollectionRef = collection(userBadgeCollectDocRef, "badges");
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

/**
 * Checks for completion badges based on the user's finished books.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 */
export async function checkForCompletionBadges(
  userID: string,
  postID: string,
): Promise<void> {
  const userBookShelfDocRef = doc(DB, "bookshelf_collection", userID);
  const finishedBooksCollectionRef = collection(
    userBookShelfDocRef,
    ServerBookShelfName.FINISHED,
  );
  let numberFinishedBooks = 0;
  try {
    const finishedBooks = await getDocs(finishedBooksCollectionRef);
    numberFinishedBooks = finishedBooks.size;
  } catch (error) {
    console.error("Error getting user's finished books", error);
  }
  if (numberFinishedBooks === 1) {
    await addBadgeToUser(
      userID,
      ServerCompletionBadge.COMPLETED_FIRST_BOOK,
      postID,
    );
  }
  if (numberFinishedBooks === 5) {
    await addBadgeToUser(
      userID,
      ServerCompletionBadge.COMPLETED_FIVE_BOOKS,
      postID,
    );
  }
  if (numberFinishedBooks === 5) {
    await addBadgeToUser(
      userID,
      ServerCompletionBadge.COMPLETED_FIVE_BOOKS,
      postID,
    );
  }
  if (numberFinishedBooks === 10) {
    await addBadgeToUser(
      userID,
      ServerCompletionBadge.COMPLETED_TEN_BOOKS,
      postID,
    );
  }
  if (numberFinishedBooks === 25) {
    await addBadgeToUser(
      userID,
      ServerCompletionBadge.COMPLETED_TWENTYFIVE_BOOKS,
      postID,
    );
  }
}

/**
 * Checks for post badges based on the user's posts.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 */
export async function checkForPostBadges(
  userID: string,
  postID: string,
): Promise<void> {
  const postsQuery = query(
    collection(DB, "posts"),
    where("user", "==", userID),
    orderBy("created", "desc"),
  );
  const postsSnapshot = await getDocs(postsQuery);
  const numberPosts = postsSnapshot.size;

  if (numberPosts === 1) {
    await addBadgeToUser(userID, ServerPostBadge.FIRST_POST, postID);
  }
}

/**
 * Checks for bookshelf badges based on the user's bookshelves.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 */
export async function checkForBookShelfBadges(
  userID: string,
  postID: string,
): Promise<void> {
  const userBookShelfDocRef = doc(DB, "bookshelf_collection", userID);
  const bookShelfNames = [
    ServerBookShelfName.FINISHED,
    ServerBookShelfName.CURRENTLY_READING,
    ServerBookShelfName.LENDING_LIBRARY,
    ServerBookShelfName.WANT_TO_READ,
  ];
  let numBooks = 0;
  try {
    const uniqueBooks = new Set<string>();
    for (const shelfName of bookShelfNames) {
      const bookShelfCollectionRef = collection(userBookShelfDocRef, shelfName);
      const bookShelfSnapshot = await getDocs(bookShelfCollectionRef);
      bookShelfSnapshot.forEach((doc) => {
        uniqueBooks.add(doc.id); // Add book ID to the Set
      });
    }
    numBooks = uniqueBooks.size;
  } catch (error) {
    console.error("Error counting unique books: ", error);
  }
  if (numBooks === 10) {
    await addBadgeToUser(
      userID,
      ServerBookshelfBadge.ADDED_TEN_TO_BOOKSHELVES,
      postID,
    );
  }
  if (numBooks === 25) {
    await addBadgeToUser(
      userID,
      ServerBookshelfBadge.ADDED_TWENTYFIVE_TO_BOOKSHELVES,
      postID,
    );
  }
  if (numBooks === 50) {
    await addBadgeToUser(
      userID,
      ServerBookshelfBadge.ADDED_FIFTY_TO_BOOKSHELVES,
      postID,
    );
  }
}

/**
 * Checks for lending badges based on the user's lending and borrowing activities.
 *
 * @param {string} userID - The ID of the user.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 */
export async function checkForLendingBadges(userID: string): Promise<void> {
  const lenderQuery = query(
    collection(DB, "borrowing_collection"),
    where("lending_user", "==", userID),
    where("borrow_status", "==", "borrowing"),
  );

  const borrowerQuery = query(
    collection(DB, "borrowing_collection"),
    where("borrowing_user", "==", userID),
    where("borrow_status", "==", "borrowing"),
  );
  const lenderSnapshot = await getDocs(lenderQuery);
  const borrowSnapshot = await getDocs(borrowerQuery);
  const lenderNumber = lenderSnapshot.size;
  const borrowerNumber = borrowSnapshot.size;

  if (lenderNumber === 1) {
    await addBadgeToUser(userID, ServerLendingBadge.LENT_A_BOOK);
  }
  if (borrowerNumber === 1) {
    await addBadgeToUser(userID, ServerLendingBadge.BORROWED_A_BOOK);
  }
}

/**
 * Checks for streak badges based on the user's posts.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 */
export async function checkForStreakBadges(userID: string, postID: string) {
  const postsQuery = query(
    collection(DB, "posts"),
    where("user", "==", userID),
    orderBy("created", "asc"),
  );
  let streakCount = 1;
  const postsSnapshot = await getDocs(postsQuery);
  for (let i = 1; i < postsSnapshot.size; i++) {
    const lastPostDate = postsSnapshot.docs[i - 1].data().created.toDate();
    const currentPostDate = postsSnapshot.docs[i].data().created.toDate();
    const differenceInMillis = Math.abs(
      lastPostDate.getTime() - currentPostDate.getTime(),
    );
    const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);
    if (differenceInDays === 1) {
      streakCount += 1;
    } else {
      streakCount = 1;
    }
    if (streakCount === 7) {
      await addBadgeToUser(userID, ServerStreakBadge.SEVEN_DAY_STREAK, postID);
    }
    if (streakCount === 30) {
      await addBadgeToUser(userID, ServerStreakBadge.THIRTY_DAY_STREAK, postID);
      return;
    }
  }
}
