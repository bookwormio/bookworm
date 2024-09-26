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
  BOOK_REQUEST = "BOOK_REQUEST",
  BOOK_REQUEST_RESPONSE = "BOOK_REQUEST_RESPONSE",
}

// TODO make this into a function instead of a map
// because book request response has different messages based on status
export const NotificationTypeMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "New Follower",
  [ServerNotificationType.LIKE]: "New Like",
  [ServerNotificationType.COMMENT]: "New Comment",
  [ServerNotificationType.RECOMMENDATION]: "New Recommendation",
  [ServerNotificationType.BOOK_REQUEST]: "New Book Request",
};

export const NotificationMessageMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "followed you",
  [ServerNotificationType.LIKE]: "liked your post",
  [ServerNotificationType.COMMENT]: "commented on your post:",
  [ServerNotificationType.RECOMMENDATION]: "thinks you should read",
  [ServerNotificationType.BOOK_REQUEST]: "requested to borrow",
};

// TODO: do i need this?
// export const SERVER_LENDING_STATUS = {
//   LENDING: "lending",
//   AVAILABLE: "available",
// };

// TODO consolidate all this
export enum BookRequestNotificationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DENIED = "denied",
}
// TODO: and this
export enum BookRequestResponseOptions {
  ACCEPTED = "accepted",
  DENIED = "denied",
}

// TODO: and this
export enum BookRequestActionDisplay {
  ACCEPT = "Accept",
  DENY = "Deny",
  ACCEPTED = "Accepted",
  DENIED = "Denied",
}

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
