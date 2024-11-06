import {
    ServerBookshelfBadge,
    ServerCompletionBadge,
    ServerLendingBadge,
    ServerPostBadge,
    ServerStreakBadge,
    type ServerBadgeName,
} from "../../enums/Enums";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";

export const lendingBadges = [
  ServerLendingBadge.BORROWED_A_BOOK,
  ServerLendingBadge.LENT_A_BOOK,
];

export const postBadges = [ServerPostBadge.FIRST_POST];

export const completionBadges = [
  ServerCompletionBadge.COMPLETED_FIRST_BOOK,
  ServerCompletionBadge.COMPLETED_FIVE_BOOKS,
  ServerCompletionBadge.COMPLETED_TEN_BOOKS,
  ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS,
];

export const bookshelfBadges = [
  ServerBookshelfBadge.ADDED_TEN_BOOKS,
  ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS,
  ServerBookshelfBadge.ADDED_FIFTY_BOOKS,
];

export const streakBadges = [
  ServerStreakBadge.SEVEN_DAY_STREAK,
  ServerStreakBadge.THIRTY_DAY_STREAK,
];

/**
 *
 * @param badgesSet
 * @param badges
 * @returns
 */
export function areAllBadgesEarned(
  badgesSet: Set<ServerBadgeName>,
  badges: ServerBadgeName[],
) {
  return badges.every((badge) => badgesSet.has(badge));
}

/**
 * Gets the most recent post for user
 * @param userID - ID of user
 * @returns the post info of the latest post
 */
export async function useGetLatestPostInfo(userID: string) {
  try {
    const posts = await fetchPostsByUserID(userID);

    // Check if there are any posts
    if (posts.length === 0) {
      return null; // No posts found
    }

    return posts[0]; // Return the most recent post
  } catch (error) {
    console.error("Error fetching latest post by User IDs", error);
    return null; // Return null on error
  }
}
