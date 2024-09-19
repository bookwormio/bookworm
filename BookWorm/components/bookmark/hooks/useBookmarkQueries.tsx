import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBookmarkForBook,
  setBookmarkForBook,
} from "../../../services/firebase-services/UserQueries";

/**
 * Custom hook to fetch the bookmark for a specific book for a user.
 * @param {string | undefined} userID - The user's ID.
 * @param {string} bookID - The book's ID.
 * @returns {UseQueryResult} - The result of the query.
 *
 * @example
 * const { data: bookmark, isLoading, isError, error } = useGetBookmarkForBook(userID, bookID);
 * // bookmark is of type number
 */
export const useGetBookmarkForBook = (
  userID: string | undefined,
  bookID: string | undefined,
) => {
  return useQuery({
    queryKey: ["bookmark", userID, bookID],
    queryFn: async () => {
      if (userID == null || bookID == null) {
        throw new Error("User ID or Book ID is missing");
      }
      return await getBookmarkForBook(userID, bookID);
    },
    enabled: userID != null && bookID != null, // Only run query if userID and bookID are not empty
    staleTime: 60000, // 1 minute
  });
};

/**
 * Custom hook to set or update a bookmark for a specific book for a user.
 * @returns {UseMutationResult} - The result of the mutation.
 *
 * @example
 * const { mutate: setBookmark, isPending } = useSetBookmarkForBook();
 * // Invoke the mutation:
 * setBookmark({ userID, bookID, bookmark: 42 });
 */
export const useSetBookmarkForBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userID,
      bookID,
      bookmark,
      oldBookmark,
    }: {
      userID: string | undefined;
      bookID: string | undefined;
      bookmark: number;
      oldBookmark: number | undefined;
    }) => {
      if (userID == null || bookID == null) {
        throw new Error("User ID or Book ID is missing");
      }
      return await setBookmarkForBook(
        userID,
        bookID,
        bookmark,
        oldBookmark ?? 0,
      );
    },
    onMutate: async ({ userID, bookID, bookmark }) => {
      // Cancel any outgoing refetches for this bookmark
      await queryClient.cancelQueries({
        queryKey: ["bookmark", userID, bookID],
      });

      // Snapshot the previous value
      const previousBookmark = queryClient.getQueryData<number>([
        "bookmark",
        userID,
        bookID,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["bookmark", userID, bookID], bookmark);

      // Return a context object with the snapshotted value
      return { previousBookmark };
    },
    onError: (err, variables, context) => {
      console.error("An error occurred while setting the bookmark:", err);
      // If there's an error, we rollback to the previous value
      if (context?.previousBookmark !== undefined) {
        queryClient.setQueryData(
          ["bookmark", variables.userID, variables.bookID],
          context.previousBookmark,
        );
      }
    },
    onSettled: (_, __, { userID, bookID }) => {
      // Always refetch after error or success to ensure our local data is correct
      void queryClient.invalidateQueries({
        queryKey: ["bookmark", userID, bookID],
      });
    },
  });
};
