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

// TODO: can fill in other API functions here
