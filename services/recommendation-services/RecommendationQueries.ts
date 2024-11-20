import {
  type BookShelfBookModel,
  type BookVolumeInfo,
  type BookVolumeItem,
} from "../../types";
import { fetchBookByVolumeID } from "../books-services/BookQueries";
import { convertToBookshelfVolumeInfo } from "../util/bookQueryUtils";

const recommendationAPIUrl = process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL;

/**
 * Handles API error responses
 * @param {Response} response - The fetch Response object
 * @throws {Error} Formatted error message from the API response
 */
async function handleErrorAPI(response: Response) {
  const errorData = (await response.json()) as RecommendationError;
  const errorMessage =
    errorData.error.trim() === ""
      ? `HTTP error! status: ${response.status}`
      : errorData.error;
  throw new Error(errorMessage);
}

/**
 * Send a ping request to the API server
 * @returns {Promise<{ response: string } | null>} - the ping response or null if the request failed
 */
export async function sendPing() {
  try {
    const response = await fetch(`${recommendationAPIUrl}/ping`);

    if (!response.ok) {
      await handleErrorAPI(response);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending ping", error);
    return null;
  }
}

/**
 * Fetches book recommendations for given user IDs from the API
 * @param {string[]} userIds - Array of user IDs to get recommendations for
 * @returns {Promise<string[]>} Array of recommended book IDs
 * @throws {Error} If userIds is invalid or request fails
 */
export async function fetchRecommendationsFromAPI(
  userIds: string[],
): Promise<string[]> {
  if (userIds == null || userIds.length === 0) {
    throw new Error("User IDs must be provided as a non-empty array");
  }

  try {
    const response = await fetch(`${recommendationAPIUrl}/recommendation`, {
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
 * Fetches and formats volume items for a list of book IDs
 * @param {string[]} bookIDs - Array of book IDs to fetch
 * @param {boolean} [forBookshelf] - Whether to format as BookShelfBookModel
 * @returns {Promise<BookVolumeItem[] | BookShelfBookModel[]>} Array of formatted book items
 */
async function getVolumeItemsByBookIDs(
  bookIDs: string[],
  forBookshelf: true,
): Promise<BookShelfBookModel[]>;
async function getVolumeItemsByBookIDs(
  bookIDs: string[],
  forBookshelf?: false,
): Promise<BookVolumeItem[]>;
async function getVolumeItemsByBookIDs(
  bookIDs: string[],
  forBookshelf = false,
): Promise<BookVolumeItem[] | BookShelfBookModel[]> {
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

  if (forBookshelf) {
    // Convert to BookShelfBookModel[]
    return recommendationVolumeInfo.map((result) => ({
      id: result.id,
      volumeInfo: convertToBookshelfVolumeInfo(result.info),
    }));
  } else {
    // Return BookVolumeItem[]
    return recommendationVolumeInfo.map((result) => ({
      id: result.id,
      volumeInfo: result.info,
    }));
  }
}

/**
 * Fetches similar book IDs from the recommendation API
 * @param {string} bookID - ID of the book to find similar books for
 * @param {number} [limit=5] - Maximum number of similar books to return
 * @returns {Promise<string[]>} Array of similar book IDs
 * @throws {Error} If bookID is invalid or request fails
 */
export async function fetchSimilarBooksIDs(
  bookID: string,
  limit = 5,
): Promise<string[]> {
  if (bookID == null || bookID === "") {
    throw new Error("Invalid Book ID");
  }

  try {
    const response = await fetch(`${recommendationAPIUrl}/similar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id: bookID,
        count: limit,
      }),
    });

    if (!response.ok) {
      await handleErrorAPI(response);
    }

    const data = (await response.json()) as RecommendationResponse;
    return data.volume_ids;
  } catch (error) {
    throw new Error(
      `Error fetching similar books: ${(error as Error).message}`,
    );
  }
}

/**
 * Fetches and formats book recommendations for a user
 * @param {string} userID - The ID of the user to fetch recommendations for
 * @returns {Promise<BookVolumeItem[]>} Array of recommended books
 */
export async function fetchUserBookRecommendations(
  userID: string,
): Promise<BookVolumeItem[]> {
  const recommendationIDs = await fetchRecommendationsFromAPI([userID]);

  return await getVolumeItemsByBookIDs(recommendationIDs);
}

/**
 * Fetches and formats similar books for a given book
 * @param {string} bookID - ID of the book to find similar books for
 * @returns {Promise<BookShelfBookModel[]>} Array of similar books formatted as bookshelf models
 */
export async function fetchSimilarBooks(
  bookID: string,
): Promise<BookShelfBookModel[]> {
  const bookIDs = await fetchSimilarBooksIDs(bookID);
  return await getVolumeItemsByBookIDs(bookIDs, true);
}
