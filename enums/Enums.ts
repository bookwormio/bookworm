export enum ServerFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  REQUESTED = "requested",
  DENIED = "denied",
  UNFOLLOWED = "unfollowed",
}

// Reflects the status of book in Firestore
export enum ServerBookShelfName {
  CURRENTLY_READING = "currently_reading",
  WANT_TO_READ = "want_to_read",
  FINISHED = "finished",
  LENDING_LIBRARY = "lending_library",
}

// Used to display the book status in the UI
type StringMap = Record<string, string>;
export const bookShelfDisplayMap: StringMap = {
  [ServerBookShelfName.CURRENTLY_READING]: "Currently Reading",
  [ServerBookShelfName.WANT_TO_READ]: "Want to Read",
  [ServerBookShelfName.FINISHED]: "Finished",
  [ServerBookShelfName.LENDING_LIBRARY]: "Lending Library",
};

export const SEARCH_SHELF_PRIORITY = [
  ServerBookShelfName.CURRENTLY_READING, // Display first on search results
  ServerBookShelfName.WANT_TO_READ,
  ServerBookShelfName.FINISHED,
  ServerBookShelfName.LENDING_LIBRARY, // Display last on search results
];

export enum ServerNotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  RECOMMENDATION = "RECOMMENDATION",
}

export const NotificationTypeMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "New Follower",
  [ServerNotificationType.LIKE]: "New Like",
  [ServerNotificationType.COMMENT]: "New Comment",
  [ServerNotificationType.RECOMMENDATION]: "New Recommendation",
};

export const NotificationMessageMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "followed you",
  [ServerNotificationType.LIKE]: "liked your post",
  [ServerNotificationType.COMMENT]: "commented on your post:",
  [ServerNotificationType.RECOMMENDATION]: "thinks you should read",
};

export enum TabNames {
  BOOKSHELVES = "shelf",
  POSTS = "post",
  DATA = "data",
}

export const TabsTitleMap: StringMap = {
  [TabNames.BOOKSHELVES]: "Shelves",
  [TabNames.POSTS]: "Posts",
  [TabNames.DATA]: "Data",
};

export enum ServerBookBorrowStatus {
  BORROWING = "borrowing",
  RETURNED = "returned",
  NONE = "none",
}

export enum ServerBookBorrowRole {
  LENDER = "lending_user",
  BORROWER = "borrowing_user",
}
