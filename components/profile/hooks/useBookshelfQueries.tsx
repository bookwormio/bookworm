import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type BookShelfName, ServerBookShelfName } from "../../../enums/Enums";
import {
  addBookToUserBookshelf,
  getBooksFromUserBookShelves,
  getShelvesContainingBook,
  removeBookFromUserBookshelf,
} from "../../../services/firebase-services/UserQueries";
import {
  type BookshelfVolumeInfo,
  type UserBookShelvesModel,
} from "../../../types";

/**
 * Custom hook to fetch books for the user's bookshelves.
 *
 * @param {string} userID - The ID of the user whose bookshelves are being fetched.
 * @returns {UseQueryResult<UserBookShelvesModel>} The result of the query.
 *
 * @example
 * const { data: bookShelves, isLoading, isError, error } = useGetBooksForBookshelves(userID);
 * // bookShelves is of type UserBookShelvesModel
 */
export const useGetBooksForBookshelves = (userID: string) => {
  return useQuery({
    queryKey: ["bookshelves", userID],
    queryFn: async () => await fetchBookshelves(userID),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Prefetch the books for the user's bookshelves.
 *
 * @param {string} userID - The ID of the user whose bookshelves are being prefetched.
 * @returns {Promise<void>} A promise that resolves when the prefetching is complete.
 */
export const prefetchBooksForBookshelves = async (
  userID: string,
): Promise<void> => {
  const queryClient = useQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["bookshelves", userID],
    queryFn: async () => await fetchBookshelves(userID),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Helper Query Function to fetch the books for the user's bookshelves.
 *
 * @param {string} userID - The ID of the user whose bookshelves are being fetched.
 * @returns {Promise<UserBookShelvesModel>} A promise that resolves to the user's bookshelves data.
 * @throws {Error} If the user ID is invalid or there's an error fetching the books.
 */
async function fetchBookshelves(userID: string): Promise<UserBookShelvesModel> {
  if (userID == null || userID === "") throw new Error("User null");

  const shelfTypes = Object.values(ServerBookShelfName);
  const userBooks = await getBooksFromUserBookShelves(userID, shelfTypes);
  if (userBooks == null) throw new Error("Error fetching user books");

  return userBooks;
}

/**
 * Custom hook to add a book to a user's bookshelf.
 * @returns {UseMutationResult} - The result of the mutation.
 *
 * @example
 * const { mutate: addBook, isPending: isAdding } = useAddBookToShelf();
 * // Invoke the mutation:
 * addBook({
 *  userID,
 *  bookID,
 *  shelfName: shelfName as ServerBookShelfName,
 * });
 */
export const useAddBookToShelf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userID,
      bookID,
      volumeInfo,
      shelfName,
    }: {
      userID: string;
      bookID: string;
      volumeInfo: BookshelfVolumeInfo;
      shelfName: ServerBookShelfName;
    }) => {
      if (userID === null || bookID === undefined) {
        throw new Error("User or book ID is not available");
      }
      return await addBookToUserBookshelf(
        userID,
        bookID,
        volumeInfo,
        shelfName,
      );
    },

    // Only update cache once addBookToUserBookshelf is successful
    onSuccess: async (data, { userID, bookID, shelfName, volumeInfo }) => {
      // Access the returned book data
      const book = data;

      if (book != null) {
        if (volumeInfo != null) {
          // Update the bookshelves with the new book and volume info
          queryClient.setQueryData<UserBookShelvesModel>(
            userID != null ? ["bookshelves", userID] : ["bookshelves"],
            (prevData) => {
              if (prevData == null) return prevData;

              // Deep copy the previous data to avoid mutating it directly
              const newData = { ...prevData };

              // Find the shelf where the book should be added
              const shelf = newData[shelfName];
              if (shelf != null) {
                // Check if the book already exists in the shelf
                const existingBookIndex = shelf.findIndex(
                  (item) => item.id === book.id,
                );
                if (existingBookIndex === -1) {
                  // If the book doesn't exist, add it to the shelf with volume info
                  newData[shelfName] = [{ ...book, volumeInfo }, ...shelf]; // Push the new book to the TOP of the shelf
                } else {
                  // If the book already exists, update its data with new volume info
                  newData[shelfName][existingBookIndex] = {
                    ...book,
                    volumeInfo,
                  };
                }
              } else {
                // If the shelf doesn't exist, create it with the new book and volume info
                newData[shelfName] = [{ ...book, volumeInfo }];
              }

              return newData;
            },
          );

          // Update the list of shelves containing the book
          queryClient.setQueryData<string[]>(
            ["shelvesContainingBook", userID, bookID],
            (old) => {
              // Add the shelf to the list of shelves containing the book
              const newShelves = new Set<string>(old ?? []);
              newShelves.add(shelfName);
              return Array.from(newShelves);
            },
          );
        }
      }
    },
    onError: (error) => {
      console.error("An error occurred:", error);
    },
  });
};

/**
 * Custom hook to remove a book from a user's bookshelf.
 * @returns {UseMutationResult} - The result of the mutation.
 *
 * @example
 * const { mutate: removeBook, isPending: isRemoving } = useRemoveBookFromShelf();
 * // Invoke the mutation:
 * removeBook({
 * userID,
 * bookID,
 * shelfName: shelfName as ServerBookShelfName,
 * });
 */
export const useRemoveBookFromShelf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userID,
      bookID,
      shelfName,
    }: {
      userID: string;
      bookID: string;
      shelfName: BookShelfName;
    }) => {
      if (userID === null || bookID === undefined) {
        throw new Error("User or book ID is not available");
      }
      return await removeBookFromUserBookshelf(userID, bookID, shelfName);
    },
    // This happens before the mutation is sent to the server
    onMutate: async ({ userID, bookID, shelfName }) => {
      // Cancel any outgoing refetches for bookshelves (so they don't overwrite the optimistic update)
      await queryClient.cancelQueries({ queryKey: ["bookshelves", userID] });

      // Snapshot the previous bookshelves
      const previousShelves = queryClient.getQueryData<UserBookShelvesModel>([
        "bookshelves",
        userID,
      ]);

      // Optimistically remove the book from the shelf
      if (previousShelves?.[shelfName] != null) {
        queryClient.setQueryData<UserBookShelvesModel>(
          ["bookshelves", userID],
          {
            ...previousShelves,
            [shelfName]: previousShelves[shelfName].filter(
              (book) => book.id !== bookID,
            ),
          },
        );
      }

      // Cancel any outgoing refetches for shelves containing the book
      await queryClient.cancelQueries({
        queryKey: ["shelvesContainingBook", userID, bookID],
      });

      // Snapshot the previous shelves containing the book
      const previousShelvesContainingBook = queryClient.getQueryData<string[]>([
        "shelvesContainingBook",
        userID,
        bookID,
      ]);
      // Remove the book from the list of shelves containing the book
      if (previousShelvesContainingBook != null) {
        queryClient.setQueryData<string[]>(
          ["shelvesContainingBook", userID, bookID],
          previousShelvesContainingBook.filter((shelf) => shelf !== shelfName),
        );
      }

      return { previousShelves, previousShelvesContainingBook };
    },
    onError: (error, variables, context) => {
      console.error("An error occurred:", error);
      // Revert the changes if the mutation fails
      // Revert the bookshelves
      if (context?.previousShelves != null) {
        queryClient.setQueryData(
          ["bookshelves", variables.userID],
          context.previousShelves,
        );
      }
      // Revert the shelves containing the book
      if (context?.previousShelvesContainingBook != null) {
        queryClient.setQueryData(
          ["shelvesContainingBook", variables.userID, variables.bookID],
          context.previousShelvesContainingBook,
        );
      }
    },
  });
};

/**
 * Custom hook to fetch the shelves that contain a specific book for a given user.
 * @param {string} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 * @returns {UseQueryResult} - The result of the query.
 *
 * @example
 * const { data: inBookshelves, isLoading: isLoadingInBookshelves } = useGetShelvesForBook(userID, bookID);
 *  // inBookshelves is of type ServerBookShelfName[]
 */
export const useGetShelvesForBook = (userID: string, bookID: string) => {
  return useQuery({
    queryKey: ["shelvesContainingBook", userID, bookID], // Unique query key, including dependencies
    queryFn: async () => await getShelvesContainingBook(userID, bookID), // Query function
    enabled: !(userID === "") && !(bookID === ""), // Only run query if userID and bookID are not null or undefined
    staleTime: 60000, // refetch data, here set to 1 minute
  });
};
