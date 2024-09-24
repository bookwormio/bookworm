import {
    type BookShelfBookModel,
    type UserBookShelvesModel,
} from "../../../types";

export const isBookInCurrentlyReading = (
  bookID: string,
  bookshelves: UserBookShelvesModel,
): boolean => {
  if (bookshelves == null) {
    return false;
  } else {
    return bookshelves.currently_reading.some(
      (book: BookShelfBookModel) => book.id === bookID,
    );
  }
};

export const isBookInWantToRead = (
  bookID: string,
  bookshelves: UserBookShelvesModel,
): boolean => {
  if (bookshelves == null) {
    return false;
  } else {
    return bookshelves.want_to_read.some(
      (book: BookShelfBookModel) => book.id === bookID,
    );
  }
};

export const isBookInFinished = (
  bookID: string,
  bookshelves: UserBookShelvesModel,
): boolean => {
  if (bookshelves == null) {
    return false;
  } else {
    return bookshelves.finished.some(
      (book: BookShelfBookModel) => book.id === bookID,
    );
  }
};
