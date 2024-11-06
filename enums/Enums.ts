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

export const NotificationTitleMap: StringMap = {
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

export enum BookRequestNotificationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DENIED = "denied",
}

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
  FOLLOWERS = "followers",
  FOLLOWING = "following",
}

export const TabsTitleMap: StringMap = {
  [TabNames.BOOKSHELVES]: "Shelves",
  [TabNames.POSTS]: "Posts",
  [TabNames.DATA]: "Data",
  [TabNames.FOLLOWERS]: "Followers",
  [TabNames.FOLLOWING]: "Following",
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

export enum ServerFollowDetailType {
  FOLLOWING = "following",
  FOLLOWER = "follower",
}

export enum BookBorrowButtonDisplay {
  LOADING = "Loading...",
  UNAVAILABLE = "Unavailable",
  REQUESTED = "Requested",
  RETURN = "Return",
  REQUEST_AGAIN = "Request Again",
  REQUEST = "Request",
}
