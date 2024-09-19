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

  return Array.from(uniqueBooks.values()).map((book) => ({
    id: book.id,
    volumeInfo: book.volumeInfo,
  }));
}

export function filterBookShelfBooksByTitle(
  preSortedBookShelves: BookVolumeItem[],
  searchPhrase: string,
): BookVolumeItem[] {
  return preSortedBookShelves.filter((book) =>
    book.volumeInfo.title?.toLowerCase().startsWith(searchPhrase.toLowerCase()),
  );
}

export function removeDuplicateBooks(
  books: BookVolumeItem[],
): BookVolumeItem[] {
  const seenBookIDs: Record<string, boolean> = {};
  return books.filter((book) => {
    if (seenBookIDs[book.id]) {
      return false;
    } else {
      seenBookIDs[book.id] = true;
      return true;
    }
  });
}
