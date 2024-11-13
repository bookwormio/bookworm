import { useMutation, useQuery } from "@tanstack/react-query";
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
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return await getExistingEarnedBadges(userID);
    },
  });
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
