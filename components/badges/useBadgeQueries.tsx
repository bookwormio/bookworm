import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ServerBookshelfBadge,
    ServerCompletionBadge,
    ServerLendingBadge,
    ServerPostBadge,
    ServerStreakBadge,
} from "../../enums/Enums";
import {
    checkForBookShelfBadges,
    checkForCompletionBadges,
    checkForLendingBadges,
    checkForPostBadges,
    checkForStreakBadges,
    getExistingEarnedBadges,
} from "../../services/firebase-services/ChallengesBadgesQueries";

/**
 * Custom hook to retrieve existing earned badges for a user.
 *
 * @param {string} userID - The ID of the user whose badges are to be retrieved.
 * @returns {QueryResult<ServerBadgeName[]>} - The query result containing badges data and loading state.
 */
export const useGetExistingEarnedBadges = (userID: string) => {
  return useQuery({
    queryKey: ["badges", userID],
    queryFn: async () => {
      try {
        if (userID == null || userID === "") {
          throw new Error("User ID is required");
        }
        return await getExistingEarnedBadges(userID);
      } catch (error) {
        throw new Error(
          `Error fetching user badges: ${(error as Error).message}`,
        );
      }
    },
  });
};

/**
 * Checks and updates badge completion for a new post.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post.
 */
export const newPostBadgeChecks = (userID: string, postID: string) => {
  const { data: badges, isLoading: badgesLoading } =
    useGetExistingEarnedBadges(userID);
  const { mutate: completionBadgenMutation } = useCheckForCompletionBadges();
  const { mutate: postBadgeMutation } = useCheckForPostBadges();
  const { mutate: bookShelfBadgeMutation } = useCheckForBookShelfBadges();
  const { mutate: streakBadgeMutation } = useCheckForStreakBadges();
  if (!badgesLoading) {
    const badgesSet = new Set(badges);
    if (
      !(
        badgesSet.has(ServerCompletionBadge.COMPLETED_FIRST_BOOK) &&
        badgesSet.has(ServerCompletionBadge.COMPLETED_FIVE_BOOKS) &&
        badgesSet.has(ServerCompletionBadge.COMPLETED_TEN_BOOKS) &&
        badgesSet.has(ServerCompletionBadge.COMPLETED_TWENTYFIVE_BOOKS)
      )
    ) {
      completionBadgenMutation({ userID, postID });
    }
    if (!badgesSet.has(ServerPostBadge.FIRST_POST)) {
      postBadgeMutation({ userID, postID });
    }
    if (
      !(
        badgesSet.has(ServerBookshelfBadge.ADDED_TEN_TO_BOOKSHELVES) &&
        badgesSet.has(ServerBookshelfBadge.ADDED_TWENTYFIVE_TO_BOOKSHELVES) &&
        badgesSet.has(ServerBookshelfBadge.ADDED_FIFTY_TO_BOOKSHELVES)
      )
    ) {
      bookShelfBadgeMutation({ userID, postID });
    }
    if (
      !(
        badgesSet.has(ServerStreakBadge.SEVEN_DAY_STREAK) &&
        badgesSet.has(ServerStreakBadge.THIRTY_DAY_STREAK)
      )
    ) {
      streakBadgeMutation({ userID, postID });
    }
  }
};

/**
 * Checks for badges related to a new book request.
 *
 * @param {string} userID - The ID of the user.
 */
export const newBookRequestBadgeCheck = (userID: string) => {
  const { data: badges, isLoading: badgesLoading } =
    useGetExistingEarnedBadges(userID);
  const { mutate: lendingBadgeMutation } = useCheckForLendingBadges();
  if (!badgesLoading) {
    const badgesSet = new Set(badges);
    if (
      !(
        badgesSet.has(ServerLendingBadge.BORROWED_A_BOOK) &&
        badgesSet.has(ServerLendingBadge.LENT_A_BOOK)
      )
    ) {
      lendingBadgeMutation({ userID });
    }
  }
};

/**
 * Custom hook to check for completion badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string; postID: string }, unknown>} - The mutation result for checking completion badges.
 */
export const useCheckForCompletionBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID: string;
    }) => {
      await checkForCompletionBadges(userID, postID);
    },
  });
};

/**
 * Custom hook to check for post badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string; postID: string }, unknown>} - The mutation result for checking post badges.
 */
export const useCheckForPostBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID: string;
    }) => {
      await checkForPostBadges(userID, postID);
    },
  });
};

/**
 * Custom hook to check for bookshelf badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string; postID: string }, unknown>} - The mutation result for checking bookshelf badges.
 */
export const useCheckForBookShelfBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID: string;
    }) => {
      await checkForBookShelfBadges(userID, postID);
    },
  });
};

/**
 * Custom hook to check for lending badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string }, unknown>} - The mutation result for checking lending badges.
 */
export const useCheckForLendingBadges = () => {
  return useMutation({
    mutationFn: async ({ userID }: { userID: string }) => {
      await checkForLendingBadges(userID);
    },
  });
};

/**
 * Custom hook to check for streak badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string; postID: string }, unknown>} - The mutation result for checking streak badges.
 */
export const useCheckForStreakBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID: string;
    }) => {
      await checkForStreakBadges(userID, postID);
    },
  });
};
