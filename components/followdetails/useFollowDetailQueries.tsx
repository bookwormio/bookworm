import { useQuery } from "@tanstack/react-query";
import { getIsFollowing } from "../../services/firebase-services/FriendQueries";
import {
  getFollowersByUserID,
  getFollowingByID,
  getNumberOfFollowersByUserID,
  getNumberOfFollowingByUserID,
} from "../../services/firebase-services/UserQueries";

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
 * @returns {UserSearchDisplayModel[]} - array of user data
 */
export const useGetFollowingByID = (userID: string) => {
  return useQuery({
    queryKey: ["following", userID],
    enabled: userID != null && userID !== "",
    queryFn: async () => {
      return await getFollowingByID(userID ?? "");
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
