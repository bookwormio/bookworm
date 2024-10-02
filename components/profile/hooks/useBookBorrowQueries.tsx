// useGetBookLendingStatus

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lendBookToUser } from "../../../services/firebase-services/BookBorrowQueries";

// export const useGetBookLendingStatus = (userID: string) => {

// useLendBookToUser

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
        queryKey: ["bookBorrow", lenderUserID],
      });
    },
  });
};
