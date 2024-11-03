import {
  SEARCH_SHELF_PRIORITY,
  type ServerBookShelfName,
} from "../../../enums/Enums";
import { caseFoldNormalize } from "../../../services/util/queryUtils";
import {
  type BookVolumeItem,
  type UserBookShelvesModel,
  type UserSearchDisplayModel,
} from "../../../types";

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

interface HasID {
  id: string;
}
/**
 * Removes duplicate objects from an array based on their IDs.
 * Works with any type that extends HasID interface.
 *
 * @template T - Type that extends HasID (must have an 'id' property of type string)
 * @param {T[]} objects - The array of objects that may contain duplicates
 * @returns {T[]} A new array containing only unique objects, keeping the first occurrence of each ID
 *
 * @example
 * // With books
 * const uniqueBooks = removeDuplicates<BookVolumeItem>(books);
 */
export function removeDuplicates<T extends HasID>(objects: T[]): T[] {
  const uniqueObjects = new Map<string, T>();

  objects.forEach((object) => {
    if (!uniqueObjects.has(object.id)) {
      uniqueObjects.set(object.id, object);
    }
  });

  return Array.from(uniqueObjects.values());
}

/**
 * Filters an array of users based on whether their full name (firstName + lastName)
 * includes the search phrase.
 * The search is case-insensitive.
 *
 * @param {UserSearchDisplayModel[]} followingUsers - Array of users to filter
 * @param {string} searchPhrase - The search phrase to filter by
 * @returns {UserSearchDisplayModel[]} Filtered array of users whose names include the search phrase
 */
export function filterFollowingUsersBySearchPhrase(
  followingUsers: UserSearchDisplayModel[],
  searchPhrase: string,
): UserSearchDisplayModel[] {
  const lowerSearchPhrase = caseFoldNormalize(searchPhrase);

  return followingUsers.filter((user) => {
    const fullName = caseFoldNormalize(
      user.firstName.concat(" ", user.lastName),
    );
    return fullName.includes(lowerSearchPhrase);
  });
}
