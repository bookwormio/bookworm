// useGetBookLendingStatus

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBorrowedBookShelfBooksForUser,
  getBorrowingBookModelsForUser,
  getLendingLibraryBookStatuses,
  getUsersWithBookInLendingLibrary,
  lendBookToUser,
  returnBookToUser,
} from "../../../services/firebase-services/BookBorrowQueries";
import { combineBorrowingAndShelfData } from "../../../services/util/bookBorrowUtils";

/**
 * Custom hook to fetch lending statuses for multiple books.
 *
 * @param {string} ownerID - The ID of the book owner.
 * @param {string} currentUserID - The ID of the current user.
 * @param {string[]} bookIDs - An array of book IDs to fetch statuses for.
 * @returns {UseQueryResult<Record<string, BookStatusModel>>} The result of the query containing lending statuses.
 *
 * @example
 * const { data: lendingStatuses, isLoading, error } = useGetLendingLibraryBookStatuses(ownerID, currentUserID, bookIDs);
 */
export const useGetLendingLibraryBookStatuses = (
  ownerID: string,
  currentUserID: string,
  bookIDs: string[],
) => {
  return useQuery({
    queryKey: ["lendingStatuses", ownerID, currentUserID],
    queryFn: async () =>
      await getLendingLibraryBookStatuses(ownerID, currentUserID, bookIDs),
    enabled: bookIDs.length > 0 && ownerID != null && currentUserID != null,
    staleTime: 60000,
  });
};

/**
 * Custom hook to lend a book to a user.
 *
 * @returns {UseMutationResult} The result of the mutation.
 *
 * @example
 * const { mutate: lendBook, isLoading, error } = useLendBookToUser();
 * lendBook({ lenderUserID, borrowerUserID, bookID });
 */
export const useLendBookToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lenderUserID,
      borrowerUserID,
      bookID,
    }: {
      lenderUserID: string;
      borrowerUserID: string;
      bookID: string;
    }) => {
      return await lendBookToUser(lenderUserID, borrowerUserID, bookID);
    },
    onSuccess: async (data, { lenderUserID, bookID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["lendingStatuses"],
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availableborrow", bookID],
        }),
        queryClient.refetchQueries({
          queryKey: ["availableborrow", bookID],
        }),
      ]);
    },
  });
};

/**
 * Custom hook to return a borrowed book.
 *
 * @returns {UseMutationResult} The result of the mutation.
 *
 * @example
 * const { mutate: returnBook, isLoading, error } = useReturnBook();
 * returnBook({ lenderUserID, borrowerUserID, bookID });
 */
export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lenderUserID,
      borrowerUserID,
      bookID,
    }: {
      lenderUserID: string;
      borrowerUserID: string;
      bookID: string;
    }) => {
      return await returnBookToUser(borrowerUserID, lenderUserID, bookID);
    },
    onSuccess: async (data, { lenderUserID, bookID }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["lendingStatuses"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["borrowingBooks"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["availableborrow", bookID],
        }),
        queryClient.refetchQueries({
          queryKey: ["availableborrow", bookID],
        }),
      ]);
    },
  });
};

/**
 * Hook to fetch all books a user is currently borrowing.
 * Combines borrowing status and book details into a single data structure.
 *
 * @param userID - The ID of the user to fetch borrowed books for
 * @returns Query result containing combined borrowing and book information
 *
 * @example
 * const { data: borrowedBooks, isLoading } = useGetAllBorrowingBooksForUser(userID);
 */
export const useGetAllBorrowingBooksForUser = (userID: string) => {
  return useQuery({
    queryKey: ["borrowingBooks", userID],
    queryFn: async () => {
      const borrowModels = await getBorrowingBookModelsForUser(userID);
      const bookShelfModels = await getBorrowedBookShelfBooksForUser(
        userID,
        borrowModels,
      );

      return combineBorrowingAndShelfData(borrowModels, bookShelfModels);
    },
    enabled: userID != null && userID !== "",
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * use Query for available books to borrow
 * @param userID current userID
 * @param bookID book to check
 * @returns {UseQueryResult<string[]>} The result of the query with userIDs
 */
export const useGetUsersWithBookInLendingLibrary = (
  userID: string,
  bookID: string,
) => {
  return useQuery({
    queryKey: ["availableborrow", bookID],
    queryFn: async () => await getUsersWithBookInLendingLibrary(userID, bookID),
    enabled: bookID != null && bookID !== "" && userID != null && userID !== "",
  });
};
