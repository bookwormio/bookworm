export enum ServerFollowStatus {
  FOLLOWING = "following",
  NOT_FOLLOWING = "not following",
  REQUESTED = "requested",
  DENIED = "denied",
  UNFOLLOWED = "unfollowed",
}

// Reflects the status of book in Firestore
export enum ServerBookStatus {
  CURRENTLY_READING = "currently_reading",
  WANT_TO_READ = "want_to_read",
  FINISHED = "finished",
  LENDING_LIBRARY = "lending_library",
}

// Used to display the book status in the UI
type StringMap = Record<string, string>;
export const bookStatusDisplayMap: StringMap = {
  [ServerBookStatus.CURRENTLY_READING]: "Currently Reading",
  [ServerBookStatus.WANT_TO_READ]: "Want to Read",
  [ServerBookStatus.FINISHED]: "Finished",
  [ServerBookStatus.LENDING_LIBRARY]: "Lending Library",
};
