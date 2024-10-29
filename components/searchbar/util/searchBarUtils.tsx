import {
  SEARCH_SHELF_PRIORITY,
  type ServerBookShelfName,
} from "../../../enums/Enums";
import { type BookVolumeItem, type UserBookShelvesModel } from "../../../types";

/**
 * Maps and sorts preloaded books from various shelves into a single, prioritized list.
 *
 * @param {UserBookShelvesModel} preloadedShelfBooks - An object containing books organized by shelf.
 * @returns {BookVolumeItem[]} A sorted array of unique books, prioritized by shelf order.
 */
export function mapAndSortPreloadedBooks(
  preloadedShelfBooks: UserBookShelvesModel,
): BookVolumeItem[] {
  const uniqueBooks = new Map<
    string,
    BookVolumeItem & { shelf: ServerBookShelfName }
  >();

  // Iterate through shelves in priority order
  for (const shelf of SEARCH_SHELF_PRIORITY) {
    if (shelf in preloadedShelfBooks) {
      const booksInShelf = preloadedShelfBooks[shelf];

      for (const book of booksInShelf) {
        // Only add the book if it's not already present
        if (!uniqueBooks.has(book.id)) {
          uniqueBooks.set(book.id, {
            id: book.id,
            shelf,
            volumeInfo: {
              ...book.volumeInfo,
              imageLinks: {
                smallThumbnail: book?.volumeInfo?.thumbnail ?? "",
              },
            },
          });
        }
      }
    }
  }

  return Array.from(uniqueBooks.values()).map((book) => {
    const myBook: BookVolumeItem = {
      id: book.id,
      bookShelf: book.shelf,
      volumeInfo: book.volumeInfo,
    };
    return myBook;
  });
}

/**
 * Filters an array of BookVolumeItems based on a search phrase in the book title.
 *
 * @param {BookVolumeItem[]} preSortedBookShelves - The array of books to filter.
 * @param {string} searchPhrase - The phrase to search for in book titles.
 * @returns {BookVolumeItem[]} A new array containing only the books whose titles include the search phrase (case-insensitive).
 */
export function filterBookShelfBooksByTitle(
  preSortedBookShelves: BookVolumeItem[],
  searchPhrase: string,
): BookVolumeItem[] {
  const lowerSearchPhrase = searchPhrase.toLowerCase();

  return preSortedBookShelves.filter((book) => {
    const title = book.volumeInfo.title?.toLowerCase();
    return title?.includes(lowerSearchPhrase);
  });
}

/**
 * Removes duplicate books from an array of BookVolumeItems based on their IDs.
 *
 * @param {BookVolumeItem[]} books - The array of books that may contain duplicates.
 * @returns {BookVolumeItem[]} A new array containing only unique books (first occurrence is kept).
 */
export function removeDuplicateBooks(
  books: BookVolumeItem[],
): BookVolumeItem[] {
  const uniqueBooks = new Map<string, BookVolumeItem>();

  books.forEach((book) => {
    if (!uniqueBooks.has(book.id)) {
      uniqueBooks.set(book.id, book);
    }
  });

  return Array.from(uniqueBooks.values());
}
