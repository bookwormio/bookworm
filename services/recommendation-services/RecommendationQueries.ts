import { apiUrl } from "../../recommendation.config";

interface BookInfo {
  volume_id: string;
  categories: string[] | undefined;
  description: string | undefined;
}

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
 * @returns None
 */
export async function sendBookInfo(book_list: BookInfo[]) {
  try {
    const response = await fetch(`${apiUrl}/vectorize_book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book_list) // Convert the book_list object to a JSON string
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending book info", error);
    return null;
  }
}

