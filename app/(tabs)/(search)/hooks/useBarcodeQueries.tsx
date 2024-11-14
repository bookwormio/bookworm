import { useMutation } from "@tanstack/react-query";
import { fetchBookVolumeIDByISBN } from "../../../../services/books-services/BookQueries";

/**
 * Custom hook to fetch a books volumeID from a provided ISBN string.
 *
 * @param {string} isbn - The isbn of the book whose volumeID is being fetched.
 * @returns {UseMutationResult<string | null>} The result of the query, containing the profile picture URL or null.
 *
 * @example
 * const { data: profilePicUrl, isLoading, isError, error } = useProfilePicQuery(userId);
 * // profilePicUrl is of type string | null
 */
export const useVolumeIDMutation = () => {
  return useMutation({
    mutationFn: async (isbn: string) => {
      return await fetchBookVolumeIDByISBN(isbn);
    },
  });
};
