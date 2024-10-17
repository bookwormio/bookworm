import { useQuery } from "@tanstack/react-query";
import {
  fetchUserData,
  getUserProfileURL,
} from "../../../../services/firebase-services/UserQueries";

/**
 * Custom hook to fetch the profile picture URL for a given user.
 *
 * @param {string | undefined} userId - The ID of the user whose profile picture URL is being fetched.
 * @returns {UseQueryResult<string | null>} The result of the query, containing the profile picture URL or null.
 *
 * @example
 * const { data: profilePicUrl, isLoading, isError, error } = useProfilePicQuery(userId);
 * // profilePicUrl is of type string | null
 */
export const useProfilePicQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: userId != null ? ["profilepic", userId] : ["profilepic"],
    queryFn: async () => {
      if (userId != null) {
        return await getUserProfileURL(userId);
      } else {
        return null;
      }
    },
  });
};

/**
 * Custom hook to fetch User Data for a given user ID.
 *
 * @param {string | undefined} userID - The ID of the user whose User Data is being fetched.
 * @returns {UseQueryResult<UserData>} The result of the query, containing the User Data or an error.
 *
 * @throws {Error} Throws an error if the userID is null, undefined, or an empty string.
 */
export const useUserDataQuery = (userID?: string) => {
  return useQuery({
    queryKey: userID != null ? ["userdata", userID] : ["userdata"],
    queryFn: async () => {
      if (userID == null || userID === "") {
        throw new Error("User ID is required");
      }
      const userdata = await fetchUserData(userID);
      return userdata;
    },
  });
};
