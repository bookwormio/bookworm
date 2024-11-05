import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type ServerBadgeName,
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

// post badge
// bookshelf badge
// completion badge
// lending badge
// streak badge

const lendingBadges = [
  ServerLendingBadge.BORROWED_A_BOOK,
  ServerLendingBadge.LENT_A_BOOK,
];

const postBadges = [ServerPostBadge.FIRST_POST];

const completionBadges = [
  ServerCompletionBadge.COMPLETED_FIRST_BOOK,
  ServerCompletionBadge.COMPLETED_FIVE_BOOKS,
  ServerCompletionBadge.COMPLETED_TEN_BOOKS,
  ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS,
];

const bookshelfBadges = [
  ServerBookshelfBadge.ADDED_TEN_BOOKS,
  ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS,
  ServerBookshelfBadge.ADDED_FIFTY_BOOKS,
];

const streakBadges = [
  ServerStreakBadge.SEVEN_DAY_STREAK,
  ServerStreakBadge.THIRTY_DAY_STREAK,
];

/**
 * Custom hook to retrieve existing earned badges for a user.
 *
 * @param {string} userID - The ID of the user whose badges are to be retrieved.
 * @returns {QueryResult<ServerBadgeName[]>} - The query result containing badges data and loading state.
 */
export const useGetExistingEarnedBadges = (userID: string) => {
  return useQuery({
    queryKey: ["badges", userID],
    enabled: userID != null,
    queryFn: async () => {
      return await getExistingEarnedBadges(userID);
    },
  });
};

/**
 * Checks and updates badge completion for a new post.
 *
 * @param {string} userID - The ID of the user.
 * @param {string} postID - The ID of the post. (optional)
 */
export const useBadgeChecking = (userID: string, postID?: string) => {
  const { data: badges, isLoading: badgesLoading } =
    useGetExistingEarnedBadges(userID);
  const { mutate: completionBadgeMutation } = useCheckForCompletionBadges();
  const { mutate: postBadgeMutation } = useCheckForPostBadges();
  const { mutate: bookShelfBadgeMutation } = useCheckForBookShelfBadges();
  const { mutate: streakBadgeMutation } = useCheckForStreakBadges();
  if (!badgesLoading) {
    const badgesSet = new Set(badges);
    if (!areAllBadgesEarned(badgesSet, completionBadges)) {
      completionBadgeMutation({ userID, postID });
    }
    // we have to have a postID for post badges
    if (!areAllBadgesEarned(badgesSet, postBadges) && postID != null) {
      postBadgeMutation({ userID, postID });
    }
    if (!areAllBadgesEarned(badgesSet, bookshelfBadges)) {
      bookShelfBadgeMutation({ userID, postID });
    }
    if (!areAllBadgesEarned(badgesSet, streakBadges) && postID != null) {
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
    if (!areAllBadgesEarned(badgesSet, lendingBadges)) {
      lendingBadgeMutation({ userID });
    }
  }
};

/**
 * Custom hook to check for completion badges.
 *
 * @returns {UseMutationResult<void, Error, { userID: string; postID?: string }, unknown>} - The mutation result for checking completion badges.
 */
export const useCheckForCompletionBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID?: string;
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
 * @returns {UseMutationResult<void, Error, { userID: string; postID?: string }, unknown>} - The mutation result for checking bookshelf badges.
 */
export const useCheckForBookShelfBadges = () => {
  return useMutation({
    mutationFn: async ({
      userID,
      postID,
    }: {
      userID: string;
      postID?: string;
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

const areAllBadgesEarned = (
  badgesSet: Set<ServerBadgeName>,
  badges: ServerBadgeName[],
) => {
  return badges.every((badge) => badgesSet.has(badge));
};
