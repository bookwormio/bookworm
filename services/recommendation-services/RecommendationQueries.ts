import { apiUrl } from "../../recommendation.config";

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
export async function getRecommendations(userIds: string[]): Promise<string[]> {
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
