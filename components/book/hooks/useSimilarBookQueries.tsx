import { useMutation } from "@tanstack/react-query";
import { fetchSimilarBooks } from "../../../services/recommendation-services/RecommendationQueries";

/**
 * Custom hook to fetch books similar to a given book.
 * @returns {UseMutationResult<BookShelfBookModel[], Error, { bookID: string, bookTitle: string }, unknown>} The mutation result for fetching similar books.
 * @example
 * const { mutate: findBooksLikeThis } = useFetchSimilarBooks();
 * // Invoke the mutation:
 * findBooksLikeThis({ bookID, bookTitle });
 */
export const useFetchSimilarBooks = () => {
  return useMutation({
    mutationFn: async ({
      bookID,
      bookTitle,
    }: {
      bookID: string;
      bookTitle: string;
    }) => {
      return await fetchSimilarBooks(bookID, bookTitle);
    },
  });
};
