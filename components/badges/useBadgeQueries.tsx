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

export const useCheckForLendingBadges = () => {
  return useMutation({
    mutationFn: async ({ userID }: { userID: string }) => {
      await checkForLendingBadges(userID);
    },
  });
};

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
