import {
  collection,
  doc,
  type DocumentData,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  type QuerySnapshot,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import {
  type ServerBadgeName,
  ServerBookshelfBadge,
  ServerBookShelfName,
  ServerCompletionBadge,
  ServerLendingBadge,
  ServerPostBadge,
  ServerStreakBadge,
} from "../../enums/Enums";
import { DB, STORAGE } from "../../firebase.config";

/**
 * Adds a badge to a user in the Firestore database.
 *
 * @param {string} userID - The ID of the user to whom the badge will be added.
 * @param {ServerBadgeName} badgeID - The ID of the badge to be added.
 * @param {string} [postID] - Optional ID of the post associated with the badge. (optional)
 * @returns {Promise<void>} - A promise that resolves when the badge has been added.
 * @throws {Error} If the badge cannot be added to the user.
 */
export async function addBadgeToUser(
  userID: string,
  badgeID: ServerBadgeName,
  postID?: string,
): Promise<void> {
  try {
    const userBadgeCollectDocRef = doc(DB, "badge_collection", userID);
    const badgesCollectionRef = collection(userBadgeCollectDocRef, "badges");
    const badgeDocs = await getDocs(badgesCollectionRef);
    const badges: ServerBadgeName[] = [];
    badgeDocs.forEach((doc) => {
      badges.push(doc.id as ServerBadgeName);
    });
    if (!badges.includes(badgeID)) {
      const badgeDocRef = doc(
        collection(userBadgeCollectDocRef, "badges"),
        badgeID as string,
      );
      const badgeData = {
        received_at: serverTimestamp(),
        ...(postID != null && { postID }), // Only add postID if it exists
      };
      await setDoc(badgeDocRef, badgeData, { merge: true });
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
 * @throws {Error} If the badges cannot be fetched.
 */
export async function getExistingEarnedBadges(
  userID: string,
): Promise<ServerBadgeName[]> {
  try {
    const userBadgeCollectDocRef = doc(DB, "badge_collection", userID);
    const badgesCollectionRef = collection(userBadgeCollectDocRef, "badges");

    const badgesQuery = query(
      badgesCollectionRef,
      orderBy("received_at", "asc"),
    );

    const badgeDocs = await getDocs(badgesQuery);
    const badges: ServerBadgeName[] = [];
    badgeDocs.forEach((doc) => {
      badges.push(doc.id as ServerBadgeName);
    });
    return badges;
  } catch (error) {
    throw new Error(
      `Failed to fetch badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Fetches the url for the image of the badge
 * @param badgeID ID of badge for image fetch
 * @returns {string} badge URL
 */
export async function getBadgeUrl(
  badgeID: ServerBadgeName,
): Promise<string | null> {
  try {
    const storageRef = ref(STORAGE, "badges/" + badgeID + ".png");
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error fetching badge image ", error);
  }
  return null;
}

/**
 * Checks for completion badges based on the user's finished books.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge. (optional)
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 * @throws {Error} If there is an issue checking the existence of the completion badge.
 */
export async function checkForCompletionBadges(
  userID: string,
  postID?: string,
): Promise<void> {
  try {
    const COMPLETION_THRESHOLDS = [
      { count: 1, badge: ServerCompletionBadge.COMPLETED_FIRST_BOOK },
      { count: 5, badge: ServerCompletionBadge.COMPLETED_FIVE_BOOKS },
      { count: 10, badge: ServerCompletionBadge.COMPLETED_TEN_BOOKS },
      { count: 25, badge: ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS },
    ] as const;
    const userBookShelfDocRef = doc(DB, "bookshelf_collection", userID);
    const finishedBooksCollectionRef = collection(
      userBookShelfDocRef,
      ServerBookShelfName.FINISHED,
    );
    let numberFinishedBooks = 0;
    const completionSnapshot = await getCountFromServer(
      finishedBooksCollectionRef,
    );
    numberFinishedBooks = completionSnapshot.data().count;
    const matchingThresholds = COMPLETION_THRESHOLDS.filter(
      ({ count }) => count <= numberFinishedBooks,
    );
    await Promise.all(
      matchingThresholds.map(async (threshold) => {
        await addBadgeToUser(userID, threshold.badge, postID);
      }),
    );
  } catch (error) {
    console.error("Error to check for completion badges", error);
    throw new Error(
      `Failed to check for completion badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Checks for post badges based on the user's posts.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 * @throws {Error} If there is an issue checking the existence of the post badges.
 */
export async function checkForPostBadges(
  userID: string,
  postID: string,
): Promise<void> {
  try {
    const POST_THRESHOLDS = [
      { count: 1, badge: ServerPostBadge.FIRST_POST },
    ] as const;
    const postsQuery = query(
      collection(DB, "posts"),
      where("user", "==", userID),
      orderBy("created", "desc"),
    );
    const postsSnapshot = await getCountFromServer(postsQuery);
    const numberPosts = postsSnapshot.data().count;
    const matchingThresholds = POST_THRESHOLDS.filter(
      ({ count }) => count <= numberPosts,
    );
    await Promise.all(
      matchingThresholds.map(async (threshold) => {
        await addBadgeToUser(userID, threshold.badge, postID);
      }),
    );
  } catch (error) {
    console.error("Error to check for post badges", error);
    throw new Error(
      `Failed to check for post badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Checks for bookshelf badges based on the user's bookshelves.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge. (optional)
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 * @throws {Error} If there is an issue checking the existence of the bookshelf badges.
 */
export async function checkForBookShelfBadges(
  userID: string,
  postID?: string,
): Promise<void> {
  try {
    const bookShelfNames = [
      ServerBookShelfName.FINISHED,
      ServerBookShelfName.CURRENTLY_READING,
      ServerBookShelfName.LENDING_LIBRARY,
      ServerBookShelfName.WANT_TO_READ,
    ];
    const BOOKSHELF_THRESHOLDS = [
      { count: 1, badge: ServerBookshelfBadge.ADDED_FIRST_BOOK },
      { count: 10, badge: ServerBookshelfBadge.ADDED_TEN_BOOKS },
      { count: 25, badge: ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS },
      { count: 50, badge: ServerBookshelfBadge.ADDED_FIFTY_BOOKS },
    ] as const;
    let numBooks = 0;
    const userBookShelfDocRef = doc(DB, "bookshelf_collection", userID);
    const uniqueBooks = new Set<string>();
    for (const shelfName of bookShelfNames) {
      const bookShelfCollectionRef = collection(userBookShelfDocRef, shelfName);
      const bookShelfSnapshot = await getDocs(bookShelfCollectionRef);
      bookShelfSnapshot.forEach((doc) => {
        uniqueBooks.add(doc.id); // Add book ID to the Set
      });
    }
    numBooks = uniqueBooks.size;
    const matchingThresholds = BOOKSHELF_THRESHOLDS.filter(
      ({ count }) => count <= numBooks,
    );
    await Promise.all(
      matchingThresholds.map(async (threshold) => {
        await addBadgeToUser(userID, threshold.badge, postID);
      }),
    );
  } catch (error) {
    console.error("Error checking for bookshelf badges: ", error);
    throw new Error(
      `Failed to check for bookshelf badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Checks for lending badges based on the user's lending and borrowing activities.
 *
 * @param {string} userID - The ID of the user.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 * @throws {Error} If there is an issue checking the existence of the lending badges.
 */
export async function checkForLendingBadges(userID: string): Promise<void> {
  try {
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

    // await getCountFromServer(postsQuery)
    const [lenderSnapshot, borrowSnapshot] = await Promise.all([
      getCountFromServer(lenderQuery),
      getCountFromServer(borrowerQuery),
    ]);
    const lenderNumber = lenderSnapshot.data().count;
    const borrowerNumber = borrowSnapshot.data().count;

    if (lenderNumber >= 1) {
      await addBadgeToUser(userID, ServerLendingBadge.LENT_A_BOOK);
    }
    if (borrowerNumber >= 1) {
      await addBadgeToUser(userID, ServerLendingBadge.BORROWED_A_BOOK);
    }
  } catch (error) {
    console.error("Error checking for lending badges: ", error);
    throw new Error(
      `Failed to check for lending badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Checks for streak badges based on the user's posts.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post associated with the badge.
 * @returns {Promise<void>} - A promise that resolves when the checks are complete.
 * @throws {Error} If there is an issue checking the existence of the streak badges.
 */
export async function checkForStreakBadges(userID: string, postID: string) {
  try {
    const STREAK_THRESHOLDS = [
      { count: 7, badge: ServerStreakBadge.SEVEN_DAY_STREAK },
      { count: 30, badge: ServerStreakBadge.THIRTY_DAY_STREAK },
    ] as const;
    const postsQuery = query(
      collection(DB, "posts"),
      where("user", "==", userID),
      orderBy("created", "asc"),
    );
    const postsSnapshot = await getDocs(postsQuery);
    const streakCount = await calculateMaxStreakCount(postsSnapshot);

    const matchingThresholds = STREAK_THRESHOLDS.filter(
      ({ count }) => count <= streakCount,
    );
    await Promise.all(
      matchingThresholds.map(async (threshold) => {
        await addBadgeToUser(userID, threshold.badge, postID);
      }),
    );
  } catch (error) {
    console.error("Error checking for streak badges: ", error);
    throw new Error(
      `Failed to check for streak badges for user ${userID}: ${(error as Error).message}`,
    );
  }
}

/**
 * Calculates the maximum amount of days the user posted everyday.
 * @param postsSnapshot - Snapshot of posts data
 * @returns - highest amount of daily consecutive posts (streak)
 */
export async function calculateMaxStreakCount(
  postsSnapshot: QuerySnapshot<DocumentData, DocumentData>,
) {
  let streakCount = 1;

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
  }

  return streakCount;
}
