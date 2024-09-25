import {
  type BookShelfBookModel,
  type BookshelfVolumeInfo,
  type FlatBookItemModel,
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

export const convertFlatBookToBookShelfBook = (
  book: FlatBookItemModel,
): BookshelfVolumeInfo => {
  return {
    title: book?.title,
    subtitle: book?.subtitle,
    authors: book?.authors,
    publisher: book?.publisher,
    publishedDate: book?.publishedDate,
    description: book?.description,
    pageCount: book?.pageCount,
    categories: book?.categories,
    maturityRating: book?.maturityRating,
    previewLink: book?.previewLink,
    averageRating: book?.averageRating,
    ratingsCount: book?.ratingsCount,
    language: book?.language,
    mainCategory: book?.mainCategory,
    thumbnail: book?.image,
  };
};
