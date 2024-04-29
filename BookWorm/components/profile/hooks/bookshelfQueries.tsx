import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ServerBookShelfName } from "../../../enums/Enums";
import {
  addBookToUserBookshelf,
  fetchBookByVolumeID,
  getBooksByBookIDs,
  getBooksFromUserBookShelves,
  getShelvesContainingBook,
  removeBookFromUserBookshelf,
} from "../../../services/firebase-services/queries";
import { type UserBookShelvesModel } from "../../../types";

export const useGetBooksForBookshelves = (userID: string) => {
  return useQuery({
    queryKey: ["bookshelves", userID],
    queryFn: async () => {
      if (userID === null || userID === "")
        throw new Error("User not logged in");

      const shelfTypes = Object.values(ServerBookShelfName);
      const userBooks = await getBooksFromUserBookShelves(userID, shelfTypes);
      if (userBooks == null) throw new Error("No books found on any shelves");

      const shelvesWithBooksArray = await Promise.all(
        Object.entries(userBooks).map(async ([shelf, books]) => {
          const bookIds = books.map((book) => book.id);
          const bookInfos = await getBooksByBookIDs(bookIds);
          return {
            [shelf]: books.map((book, index) => ({
              ...book,
              volumeInfo: bookInfos[index],
            })),
          };
        }),
      );

      return shelvesWithBooksArray.reduce(
        (acc, shelf) => ({ ...acc, ...shelf }),
        {},
      );
    },
  });
};

export const useAddBookToShelf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userID,
      bookID,
      shelfName,
    }: {
      userID: string;
      bookID: string;
      shelfName: ServerBookShelfName;
    }) => {
      if (userID === null || bookID === undefined) {
        throw new Error("User or book ID is not available");
      }
      return await addBookToUserBookshelf(userID, bookID, shelfName);
    },

    onSuccess: async (data, { userID, bookID, shelfName }) => {
      console.log("Book added successfully");

      // Access the returned book data
      const { success, book } = data;

      if (success && book != null) {
        const volumeInfo = await fetchBookByVolumeID(book.id);
        // Update the query data with the new book information
        if (volumeInfo != null) {
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
                  newData[shelfName] = [{ ...book, volumeInfo }, ...shelf]; // Push the new book to the top
                } else {
                  // If the book already exists, update its data with volume info
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
          queryClient.setQueryData<string[]>(
            ["shelvesContainingBook", userID, bookID],
            (old) => {
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
      shelfName: ServerBookShelfName;
    }) => {
      if (userID === null || bookID === undefined) {
        throw new Error("User or book ID is not available");
      }
      return await removeBookFromUserBookshelf(userID, bookID, shelfName);
    },
    onMutate: async ({ userID, bookID, shelfName }) => {
      // Cancel any outgoing refetches (so they don't overwrite the optimistic update)
      await queryClient.cancelQueries({ queryKey: ["bookshelves", userID] });

      // Snapshot the previous value
      const previousShelves = queryClient.getQueryData<UserBookShelvesModel>([
        "bookshelves",
        userID,
      ]);

      // Optimistically update to the new value
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

      const previousShelvesContainingBook = queryClient.getQueryData<string[]>([
        "shelvesContainingBook",
        userID,
        bookID,
      ]);
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
      if (context?.previousShelves != null) {
        queryClient.setQueryData(
          ["bookshelves", variables.userID],
          context.previousShelves,
        );
      }
    },
    onSuccess: (_, { userID, bookID, shelfName }) => {
      console.log("Book removed successfully");
    },
  });
};

/**
 * Custom hook to fetch the shelves that contain a specific book for a given user.
 * @param {string} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 */
export const useGetShelvesForBook = (userID: string, bookID: string) => {
  return useQuery({
    queryKey: ["shelvesContainingBook", userID, bookID], // Unique query key, including dependencies
    queryFn: async () => await getShelvesContainingBook(userID, bookID), // Query function
    enabled: !(userID === "") && !(bookID === ""), // Only run query if userID and bookID are not null or undefined
    staleTime: 60000, // refetch data, here set to 1 minute
  });
};
