import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followUserByID,
  getIsFollowing,
  unfollowUserByID,
} from "../../services/firebase-services/FriendQueries";
import {
  getFollowersByUserID,
  getFollowingByID,
  getNumberOfFollowersByUserID,
  getNumberOfFollowingByUserID,
} from "../../services/firebase-services/UserQueries";
import { type ConnectionModel } from "../../types";

/**
 * Gets neccessary data to display followers in a list
 * @param userID
 * @param maxUsers
 * @returns {UserSearchDisplayModel[]} - array of user data
 */
export const useGetFollowersByID = (userID: string, maxUsers?: number) => {
  return useQuery({
    queryKey: ["followers", userID],
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return await getFollowersByUserID(userID ?? "", maxUsers);
    },
  });
};

/**
 * Gets neccessary data to display following in a list
 * @param userID
 * @param maxUsers
 * @returns {UserSearchDisplayModel[]} - array of user data
 */
export const useGetFollowingByID = (userID: string, maxUsers?: number) => {
  return useQuery({
    queryKey: ["following", userID],
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return await getFollowingByID(userID ?? "", maxUsers);
    },
  });
};

/**
 * Gets number of followers for that user
 * @param userID
 * @returns {number} - number of followers
 */
export const useGetNumberOfFollowersByUserID = (userID: string) => {
  return useQuery({
    queryKey: ["numfollowers", userID],
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return (await getNumberOfFollowersByUserID(userID ?? "")) ?? 0;
    },
  });
};

/**
 * Gets number of following for that user
 * @param userID
 * @returns {number} - number of following
 */
export const useGetNumberOfFollowingByUserID = (userID: string) => {
  return useQuery({
    queryKey: ["numfollowing", userID],
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return (await getNumberOfFollowingByUserID(userID ?? "")) ?? 0;
    },
  });
};

/**
 * Gets whether or not current user is following friend user
 * @param userID
 * @param friendUserID
 * @returns {boolean} - true if is following false if not following
 */
export const useGetIsFollowing = (userID: string, friendUserID: string) => {
  return useQuery({
    queryKey: ["followingstatus", friendUserID, userID],
    enabled:
      friendUserID != null &&
      userID != null &&
      friendUserID !== "" &&
      userID !== "",
    queryFn: async () => {
      return await getIsFollowing(userID, friendUserID);
    },
  });
};

/**
 * Custom hook to invalidate all follow-related queries for a user pair.
 * @returns {(userID: string, friendUserID: string) => Promise<void>} Function to invalidate queries
 *
 * @example
 * const invalidateQueries = useInvalidateFollowQueries();
 * // Invalidate queries:
 * await invalidateQueries("currentUserID", "friendUserID");
 */
export const useInvalidateFollowQueries = () => {
  const queryClient = useQueryClient();

  return async (userID: string, friendUserID: string) => {
    const queryKeys = [
      ["numfollowers", friendUserID],
      ["numfollowing", userID],
      ["followers", friendUserID],
      ["following", userID],
      ["followingstatus", friendUserID, userID],
    ];

    await Promise.all(
      queryKeys.map(async (queryKey) => {
        await queryClient.invalidateQueries({ queryKey });
      }),
    );
  };
};

/**
 * Custom hook to follow another user.
 * @returns {UseMutationResult} Mutation result object containing mutate function and state
 *
 * @example
 * const { mutate: followUser, isPending: isFollowing } = useFollowMutation();
 * // Follow a user:
 * followUser({
 *   connection: {
 *     currentUserID: "user123",
 *     friendUserID: "friend456"
 *   }
 * });
 */
export const useFollowMutation = () => {
  const invalidateFollowQueries = useInvalidateFollowQueries();
  return useMutation({
    mutationFn: async ({ connection }: { connection: ConnectionModel }) => {
      await followUserByID(connection);
      return { connection };
    },
    onSuccess: async (data: { connection: ConnectionModel }) => {
      await invalidateFollowQueries(
        data.connection.currentUserID,
        data.connection.friendUserID,
      );
    },
    onError: (error) => {
      console.error("Error following user:", error);
    },
  });
};

/**
 * Custom hook to unfollow another user.
 * @returns {UseMutationResult} Mutation result object containing mutate function and state
 *
 * @example
 * const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowMutation();
 * // Unfollow a user:
 * unfollowUser({
 *   connection: {
 *     currentUserID: "user123",
 *     friendUserID: "friend456"
 *   }
 * });
 */
export const useUnfollowMutation = () => {
  const invalidateFollowQueries = useInvalidateFollowQueries();
  return useMutation({
    mutationFn: async ({ connection }: { connection: ConnectionModel }) => {
      await unfollowUserByID(connection);
      return { connection };
    },
    onSuccess: async (data: { connection: ConnectionModel }) => {
      await invalidateFollowQueries(
        data.connection.currentUserID,
        data.connection.friendUserID,
      );
    },
    onError: (error) => {
      console.error("Error unfollowing user:", error);
    },
  });
};
