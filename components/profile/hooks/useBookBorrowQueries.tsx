// useGetBookLendingStatus

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLendingLibraryBookStatuses,
  lendBookToUser,
  returnBookToUser,
} from "../../../services/firebase-services/BookBorrowQueries";

export const useGetLendingLibraryBookStatuses = (
  ownerID: string,
  currentUserID: string,
  bookIDs: string[],
) => {
  return useQuery({
    queryKey: ["lendingStatuses", ownerID, currentUserID, bookIDs],
    queryFn: async () =>
      await getLendingLibraryBookStatuses(ownerID, currentUserID, bookIDs),
    enabled: bookIDs.length > 0,
    staleTime: 60000,
  });
};

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
    // TODO:
    // on mutate: (optimistically)
    // go into the query cache and update the lending status to be lent out to that user.
    // lendingStatuses
    // if there is an error undo the optimistic update
  });
};

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
    // TODO:
    // on mutate: (optimistically)
    // go into the query cache and update the lending status to be returned to the owner.
    // lendingStatuses
    // if there is an error undo the optimistic update
  });
};
