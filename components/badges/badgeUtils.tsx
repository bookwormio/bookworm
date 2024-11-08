import { type ServerBadgeName } from "../../enums/Enums";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";

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
export async function getLatestPostInfo(userID: string) {
  try {
    const posts = await fetchPostsByUserID(userID, 1);

    if (posts.length === 0) {
      return null;
    }

    return posts[0];
  } catch (error) {
    console.error("Error fetching latest post by User IDs", error);
    return null;
  }
}
