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
