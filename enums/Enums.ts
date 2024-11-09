export enum ServerFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  REQUESTED = "requested",
  DENIED = "denied",
  UNFOLLOWED = "unfollowed",
}

export enum FollowButtonDisplay {
  FOLLOW = "Follow",
  FOLLOWING = "Following",
  LOADING = "Loading...",
}

// Reflects the status of book in Firestore
export enum ServerBookShelfName {
  CURRENTLY_READING = "currently_reading",
  WANT_TO_READ = "want_to_read",
  FINISHED = "finished",
  LENDING_LIBRARY = "lending_library",
}

// Borrowing books are not stored in user's bookshelves
export const BORROWING_SHELF_NAME = "borrowing" as const;

type BookShelfName = ServerBookShelfName | typeof BORROWING_SHELF_NAME;

// Used to display the book status in the UI
type StringMap = Record<string, string>;

export const BOOKSHELF_DISPLAY_NAMES: Record<BookShelfName, string> = {
  [ServerBookShelfName.CURRENTLY_READING]: "Currently Reading",
  [ServerBookShelfName.WANT_TO_READ]: "Want to Read",
  [ServerBookShelfName.FINISHED]: "Finished",
  [ServerBookShelfName.LENDING_LIBRARY]: "Lending Library",
  [BORROWING_SHELF_NAME]: "Currently Borrowing",
};

export const BOOKSHELF_SUBTITLES: Partial<Record<BookShelfName, string>> = {
  [ServerBookShelfName.LENDING_LIBRARY]: "Books you are willing to lend",
  [BORROWING_SHELF_NAME]: "This is only visible to you",
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
  BADGE = "BADGE",
}

export const NotificationTitleMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "New Follower",
  [ServerNotificationType.LIKE]: "New Like",
  [ServerNotificationType.COMMENT]: "New Comment",
  [ServerNotificationType.RECOMMENDATION]: "New Recommendation",
  [ServerNotificationType.BOOK_REQUEST]: "New Book Request",
  [ServerNotificationType.BADGE]: "New Badge",
};

export const NotificationMessageMap: StringMap = {
  [ServerNotificationType.FRIEND_REQUEST]: "followed you",
  [ServerNotificationType.LIKE]: "liked your post",
  [ServerNotificationType.COMMENT]: "commented on your post:",
  [ServerNotificationType.RECOMMENDATION]: "thinks you should read",
  [ServerNotificationType.BOOK_REQUEST]: "requested to borrow",
  [ServerNotificationType.BADGE]: "You earned a badge: ",
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
  RETURN = "Return Book",
  REQUEST_AGAIN = "Request Again",
  REQUEST = "Request",
}

export enum ServerPostBadge {
  FIRST_POST = "first_post",
}

export enum ServerBookshelfBadge {
  ADDED_FIRST_BOOK = "added_1_book",
  ADDED_TEN_BOOKS = "added_10_books",
  ADDED_TWENTY_FIVE_BOOKS = "added_25_books",
  ADDED_FIFTY_BOOKS = "added_50_books",
}

export enum ServerCompletionBadge {
  COMPLETED_FIRST_BOOK = "completed_1_book",
  COMPLETED_FIVE_BOOKS = "completed_5_books",
  COMPLETED_TEN_BOOKS = "completed_10_books",
  COMPLETED_TWENTY_FIVE_BOOKS = "completed_25_books",
}

export enum ServerLendingBadge {
  LENT_A_BOOK = "lent_a_book",
  BORROWED_A_BOOK = "borrowed_a_book",
}

export enum ServerStreakBadge {
  SEVEN_DAY_STREAK = "seven_day_streak",
  THIRTY_DAY_STREAK = "thirty_day_streak",
}

type BadgeDisplayMap = {
  [K in ServerBadgeName]: string;
};

// Used to display the book status in the UI
export const badgeDisplayTitleMap: BadgeDisplayMap = {
  // post badges
  [ServerPostBadge.FIRST_POST]: "First Post",
  // bookshelf badges
  [ServerBookshelfBadge.ADDED_FIRST_BOOK]: "Added 1st Book",
  [ServerBookshelfBadge.ADDED_TEN_BOOKS]: "Added 10 Books",
  [ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS]: "Added 25 Books",
  [ServerBookshelfBadge.ADDED_FIFTY_BOOKS]: "Added 50 Books",
  // completion badges
  [ServerCompletionBadge.COMPLETED_FIRST_BOOK]: "Completed First Book",
  [ServerCompletionBadge.COMPLETED_FIVE_BOOKS]: "Completed 5 Books",
  [ServerCompletionBadge.COMPLETED_TEN_BOOKS]: "Completed 10 Books",
  [ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS]: "Completed 25 Books",
  // lending badges
  [ServerLendingBadge.LENT_A_BOOK]: "Lent a Book",
  [ServerLendingBadge.BORROWED_A_BOOK]: "Borrowed a Book",
  // streak badges
  [ServerStreakBadge.SEVEN_DAY_STREAK]: "Seven Day Reading Streak",
  [ServerStreakBadge.THIRTY_DAY_STREAK]: "Thirty Day Reading Streak",
};

export const LENDING_BADGES = [
  ServerLendingBadge.BORROWED_A_BOOK,
  ServerLendingBadge.LENT_A_BOOK,
];

export const POST_BADGES = [ServerPostBadge.FIRST_POST];

export const COMPLETION_BADGES = [
  ServerCompletionBadge.COMPLETED_FIRST_BOOK,
  ServerCompletionBadge.COMPLETED_FIVE_BOOKS,
  ServerCompletionBadge.COMPLETED_TEN_BOOKS,
  ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS,
];

export const BOOKSHELF_BADGES = [
  ServerBookshelfBadge.ADDED_FIRST_BOOK,
  ServerBookshelfBadge.ADDED_TEN_BOOKS,
  ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS,
  ServerBookshelfBadge.ADDED_FIFTY_BOOKS,
];

export const STREAK_BADGES = [
  ServerStreakBadge.SEVEN_DAY_STREAK,
  ServerStreakBadge.THIRTY_DAY_STREAK,
];

export type ServerBadgeName =
  | ServerPostBadge
  | ServerBookshelfBadge
  | ServerCompletionBadge
  | ServerLendingBadge
  | ServerStreakBadge;

export const BOOKSHELF_CHIP_DISPLAY: StringMap = {
  [ServerBookShelfName.CURRENTLY_READING]: "Reading",
  [ServerBookShelfName.WANT_TO_READ]: "Want to Read",
  [ServerBookShelfName.FINISHED]: "Finished",
  [ServerBookShelfName.LENDING_LIBRARY]: "Library",
};
