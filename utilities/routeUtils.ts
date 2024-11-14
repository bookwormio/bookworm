import {
  NEW_POST_BOOK_FOLDER,
  NEW_POST_BOOK_SEARCH,
} from "../constants/constants";

/**
 * Generates a book route based on the book ID and prefix.
 * @param bookID - The ID of the book
 * @param prefix - The prefix for the route
 * @returns The generated book route
 */
export function generateBookRoute(bookID?: string, prefix?: string): string {
  if (bookID == null) {
    throw new Error("Book ID is null or undefined");
  }
  const pathName = `/${prefix}/${bookID}`;
  return pathName;
}

/**
 * Generates a user route based on the current user ID and the target user ID.
 * @param currentUserID - The ID of the current user
 * @param navigateToUserID - The ID of the user to navigate to
 * @param prefix - The prefix for the route (optional)
 * @returns The generated user route or undefined if navigating to the current user
 * @throws Error if navigateToUserID or currentUserID is null or undefined
 */
export function generateUserRoute(
  currentUserID?: string,
  navigateToUserID?: string,
  prefix?: string,
): string | undefined {
  if (navigateToUserID == null) {
    throw new Error("Navigate to User ID is null or undefined");
  }
  if (currentUserID == null) {
    throw new Error("Current User ID is null or undefined");
  }

  if (currentUserID !== navigateToUserID) {
    const pathName = `/${prefix ?? ""}/user/${navigateToUserID}`;
    return pathName;
  }

  return undefined;
}

/**
 * Generates a new post book search route.
 * @returns The generated new post book search route
 */
export function generateNewPostBookSearchRoute(): string {
  return `/${NEW_POST_BOOK_FOLDER}/${NEW_POST_BOOK_SEARCH}`;
}

export function generatePostRoute(postID?: string, prefix?: string): string {
  if (postID == null) {
    throw new Error("Book ID is null or undefined");
  }
  const pathName = `/${prefix}/${postID}`;
  return pathName;
}

/**
 * Generates a new follow list route.
 * @returns The generated new follow list route
 */
export function generateFollowListRoute(
  userID?: string,
  followersfirst?: boolean,
  prefix?: string,
): string {
  if (userID == null || followersfirst == null) {
    throw new Error("user ID or followersfirst is null or undefined");
  }
  const pathName = `${prefix}/${userID}?followersfirst=${followersfirst}`;
  return pathName;
}

/**
 * Generates a new recommendation page route.
 * @returns The generated new recommendation page route.
 */
export function generateRecommendationRoute(
  friendUserID: string,
  prefix?: string,
): string {
  if (friendUserID == null) {
    throw new Error("FriendUserID is null or undefined");
  }
  const pathName = `/${prefix}/${friendUserID}`;
  return pathName;
}

/**
 * Generates a new badge route.
 * @returns The generated new badge route
 */
export function generateBadgePageRoute(
  userID: string,
  prefix?: string,
): string {
  if (userID == null) {
    throw new Error("User ID is null or undefined");
  }
  const pathName = `/${prefix}/${userID}`;
  return pathName;
}

/**
 * Generates a new book list route.
 * @returns The generated new book list route.
 */
export function generateBookListRoute(
  userID: string,
  bookshelf: string,
  prefix?: string,
): string {
  if (userID == null || bookshelf == null) {
    throw new Error("user ID or bookshelf is null or undefined");
  }
  const pathName = `${prefix}/${userID}?bookshelf=${bookshelf}`;
  return pathName;
}
