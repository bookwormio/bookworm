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
 * Checks if all badges for a category are already earned, avoiding unneccesary calls
 * @param badgesSet - set of badges the user has
 * @param badges - list of badges for the different categories
 * @returns
 */
export function areAllBadgesEarned(
  badgesSet: Set<ServerBadgeName>,
  categoryBadges: ServerBadgeName[],
) {
  return categoryBadges.every((categoryBadges) =>
    badgesSet.has(categoryBadges),
  );
}

/**
 * Gets the most recent post for user
 * @param userID - ID of user
 * @returns the post info of the latest post
 */
export async function useGetLatestPostInfo(userID: string) {
  try {
    const posts = await fetchPostsByUserID(userID);

    if (posts.length === 0) {
      return null;
    }

    return posts[0];
  } catch (error) {
    console.error("Error fetching latest post by User IDs", error);
    return null;
  }
}
