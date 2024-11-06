// useGetBookLendingStatus

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllBorrowingBooksForUser,
  getFullBorrowedBooksForUser,
  getLendingLibraryBookStatuses,
  lendBookToUser,
  returnBookToUser,
} from "../../../services/firebase-services/BookBorrowQueries";

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
    onSuccess: async (data, { lenderUserID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["lendingStatuses"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
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
    onSuccess: async (data, { lenderUserID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["lendingStatuses"],
      });
    },
  });
};

// TODO: maybe this should get bookIDS and then fetch the books from those user's bookshelves
export const useGetAllBorrowingBooksForUser = (userID: string) => {
  return useQuery({
    queryKey: ["borrowingBooks", userID],
    queryFn: async () => {
      // TODO: maybe delegate responsibility to the caller (borrowing bookshelf) to fetch the books
      const borrowModels = await getAllBorrowingBooksForUser(userID);
      const fullModels = await getFullBorrowedBooksForUser(
        userID,
        borrowModels,
      );
      return fullModels;
    },
    enabled: userID != null && userID !== "",
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
