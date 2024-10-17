import { apiUrl } from "../../recommendation.config";
import type { FlatAPIBookModel } from "../../types/index.d.ts";

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

// TODO: can fill in other API functions here
/**
 * Sends book information to be stored in the database
 * @param {FlatAPIBookModel[]} bookList - list of book dictionaries to send to the API
 * @returns None
 */
export async function sendBookInfo(bookList: FlatAPIBookModel[]) {
  try {
    const response = await fetch(`${apiUrl}/vectorize_book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookList), // Convert the book_list object to a JSON string
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending book info", error);
    return null;
  }
}

/**
 * Vectorize user and store the user's vector in the database
 * @param {string} userId - user ID to vectorize
 * @returns {Promise<{ message: string } | null>} - the response message or null if the request failed
 */
export async function vectorizeUser(
  userId: string,
): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${apiUrl}/vectorize_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }), // Convert the userId to a JSON string
    });

    if (!response.ok) {
      const warningMessage =
        response.status >= 400 && response.status < 500
          ? "This may mean the API is not running. See the README for instructions on how to start the API."
          : "";
      throw new Error(
        `HTTP error! Status: ${response.status}. ${warningMessage}`.trim(),
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error vectorizing user", error);
    return null;
  }
}

/**
 * Get book recommendations for a list of user IDs
 * @param {string[]} userIds - list of user IDs to get recommendations for
 * @returns {Promise<string[] | null>} - list of recommended volume IDs or null if the request failed
 */
export async function getRecommendations(
  userIds: string[],
): Promise<string[] | null> {
  try {
    const response = await fetch(`${apiUrl}/recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_ids: userIds }), // Convert the userIds array to a JSON string
    });

    if (!response.ok) {
      const warningMessage =
        response.status >= 400 && response.status < 500
          ? "This may mean the API is not running. See the README for instructions on how to start the API."
          : "";
      throw new Error(
        `HTTP error! Status: ${response.status}. ${warningMessage}`.trim(),
      );
    }

    const data = await response.json();
    return data.volume_ids;
  } catch (error) {
    console.error("Error getting recommendations", error);
    return null;
  }
}

