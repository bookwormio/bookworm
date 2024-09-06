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

export enum NotificationType {
  FRIEND_REQUEST = "FRIEND_REQUEST",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
}
