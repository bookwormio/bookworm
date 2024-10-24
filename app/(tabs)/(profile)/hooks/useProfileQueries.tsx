import { useQuery } from "@tanstack/react-query";
import { fetchBookByVolumeID } from "../../../../services/books-services/BookQueries";
import {
  fetchUserData,
  getUserProfileURL,
} from "../../../../services/firebase-services/UserQueries";
import { getRecommendations } from "../../../../services/recommendation-services/RecommendationQueries";
import { type BookVolumeInfo, type BookVolumeItem } from "../../../../types";

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

export const useGenerateRecommendationsQuery = (userID: string) => {
  return useQuery({
    queryKey: ["recommendations", userID],
    queryFn: async () => {
      return await temporaryRecommendationFunction(userID);
    },
    enabled: userID != null && userID !== "",
  });
};

// TODO: Remove this
async function temporaryRecommendationFunction(
  userID: string,
): Promise<BookVolumeItem[]> {
  const recommendationIDs = await getRecommendations([userID]);
  const volumeResults = await Promise.all(
    recommendationIDs.map(async (volumeID) => ({
      id: volumeID,
      info: await fetchBookByVolumeID(volumeID),
    })),
  );

  // Use type predicate to filter out nulls
  const recommendationVolumeInfo = volumeResults.filter(
    (result): result is { id: string; info: BookVolumeInfo } =>
      result.info !== null,
  );

  const recommendationVolumeItems = recommendationVolumeInfo.map((result) => ({
    id: result.id,
    volumeInfo: result.info,
  }));

  return recommendationVolumeItems;
}
