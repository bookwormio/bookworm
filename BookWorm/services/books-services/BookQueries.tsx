import axios from "axios";
import {
  type BookVolumeInfo,
  type BookVolumeItem,
  type BooksResponse,
} from "../../types";

/**
 * Fetch books from Google Books API by title search
 * @param {string} searchValue - the search phrase to query the API
 * @returns {Promise<BookVolumeItem[]>} - an array of book volume items
 * @throws {Error} If there's an error during the operation.
 */
export async function fetchBooksByTitleSearch(
  searchValue: string,
): Promise<BookVolumeItem[]> {
  if (searchValue === "") {
    return []; // Return empty array if there's no searchValue
  }
  try {
    const response = await axios.get<BooksResponse>(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: searchValue,
          key: process.env.GOOGLE_BOOKS_API_KEY,
          limit: 10,
        },
      },
    );
    if (response?.data?.totalItems === 0) {
      return [];
    }
    return response.data.items.map((item) => ({
      kind: item.kind,
      id: item.id,
      etag: item.etag,
      selfLink: item.selfLink,
      volumeInfo: item.volumeInfo,
    }));
  } catch (error) {
    console.error("Error fetching books by title search", error);
    return [];
  }
}

/**
 * Fetch a book from Google Books API by its volume ID
 * @param volumeID - the volume ID of the book
 * @returns {Promise<BookVolumeInfo | null>} - the book volume info or null if not found
 */
export async function fetchBookByVolumeID(
  volumeID: string,
): Promise<BookVolumeInfo | null> {
  if (volumeID === "") {
    return null; // Return null if there's no volumeID
  }
  try {
    const response = await axios.get<{
      volumeInfo: BookVolumeInfo;
    }>("https://www.googleapis.com/books/v1/volumes/" + volumeID, {
      params: {
        key: process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY,
        projection: "full",
      },
    });
    return response.data.volumeInfo;
  } catch (error) {
    console.error("Error fetching book by volume id", error);
    return null;
  }
}
