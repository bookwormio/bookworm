import { type BookVolumeInfo, type BookVolumeItem } from "../../types";
import { fetchBookByVolumeID } from "../books-services/BookQueries";

const recomendationAPIUrl = process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL;
/**
 * Send a ping request to the API server
 * @returns {Promise<{ response: string } | null>} - the ping response or null if the request failed
 */
export async function sendPing() {
  try {
    const response = await fetch(`${recomendationAPIUrl}/ping`);

    if (!response.ok) {
      await handleErrorAPI(response);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending ping", error);
    return null;
  }
}

// TODO ensure correct maybe check other handle error
async function handleErrorAPI(response: Response) {
  const errorData = (await response.json()) as RecommendationError;
  const errorMessage =
    errorData.error.trim() === ""
      ? `HTTP error! status: ${response.status}`
      : errorData.error;
  throw new Error(errorMessage);
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
    const response = await fetch(`${recomendationAPIUrl}/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    });

    if (!response.ok) {
      await handleErrorAPI(response);
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
  const recommendationIDs = await fetchRecommendationsFromAPI([userID]);

  return await getVolumeItemsByBookIDs(recommendationIDs);
}

// TODO move to helper maybe?
async function getVolumeItemsByBookIDs(
  bookIDs: string[],
): Promise<BookVolumeItem[]> {
  // Fetch book info for each book ID
  const volumeResults = await Promise.all(
    bookIDs.map(async (bookID) => ({
      id: bookID,
      info: await fetchBookByVolumeID(bookID),
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

// TODO rename
export async function fetchBooksLikeThisAPI(bookID: string): Promise<string[]> {
  if (bookID == null || bookID === "") {
    throw new Error("Invalid Book ID");
  }

  try {
    const response = await fetch(`${recomendationAPIUrl}/similar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id: bookID,
        // TODO: add limit (of 5) to body
      }),
    });

    if (!response.ok) {
      await handleErrorAPI(response);
    }

    const data = (await response.json()) as SimilarBooksResponse;
    return data.book_ids;
  } catch (error) {
    throw new Error(
      `Error fetching similar books: ${(error as Error).message}`,
    );
  }
}
