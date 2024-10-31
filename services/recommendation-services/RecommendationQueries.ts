import { apiUrl } from "../../recommendation.config";
import { type BookVolumeInfo, type BookVolumeItem } from "../../types";
import { fetchBookByVolumeID } from "../books-services/BookQueries";

/**
 * Send a ping request to the API server
 * @returns {Promise<{ response: string } | null>} - the ping response or null if the request failed
 */
export async function sendPing() {
  try {
    const response = await fetch(`${apiUrl}/ping`);
    if (!response.ok) {
      const warningMessage =
        response.status >= 400 && response.status < 500
          ? "This may mean the API is not running. See the README for instructions on how to start the API."
          : "";
      throw new Error(
        `HTTP error! Status: ${response.status}. ${warningMessage}`.trim(),
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending ping", error);
    return null;
  }
}

/**
 * Fetches book recommendations for given user IDs
 * @param userIds - Array of user IDs to get recommendations for
 * @returns Promise resolving to an array of recommended volume IDs
 * @throws Error if the request fails or invalid input is provided
 */
export async function fetchRecommendationsFromAPI(
  userIds: string[],
): Promise<string[]> {
  if (userIds == null || userIds.length === 0) {
    throw new Error("User IDs must be provided as a non-empty array");
  }

  try {
    const response = await fetch(`${apiUrl}/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as RecommendationError;
      const errorMessage =
        errorData.error.trim() === ""
          ? `HTTP error! status: ${response.status}`
          : errorData.error;
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as RecommendationResponse;
    return data.volume_ids;
  } catch (error) {
    throw new Error(
      `Error fetching recommendations: ${(error as Error).message}`,
    );
  }
}

/**
 * Fetches and processes book recommendations for a given user.
 *
 * @param {string} userID - The ID of the user to fetch recommendations for.
 * @returns {Promise<BookVolumeItem[]>} A promise that resolves to an array of book recommendations.
 *
 * @example
 * const recommendations = await fetchUserBookRecommendations(userID);
 * // recommendations is of type BookVolumeItem[]
 */
export async function fetchUserBookRecommendations(
  userID: string,
): Promise<BookVolumeItem[]> {
  // Fetch recommendation IDs from API
  const recommendationIDs = await fetchRecommendationsFromAPI([userID]);

  // Fetch book info for each recommendation
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

  // map to BookVolumeItem type
  const recommendationVolumeItems = recommendationVolumeInfo.map((result) => ({
    id: result.id,
    volumeInfo: result.info,
  }));

  return recommendationVolumeItems;
}
