import { useCallback } from "react";
import { isValidPageNumber } from "../util/postUtils";

/**
 * A custom hook that provides a memoized function for validating page numbers in a book reading context.
 *
 * @returns A memoized function that validates page numbers.
 *
 * @example
 * const validatePageNumbers = usePageValidation();
 * const result = validatePageNumbers(10, 20, 100);
 */
export const usePageValidation = () => {
  const validatePageNumbers = useCallback(
    (
      oldBookmark: number | undefined | null,
      newBookmark: number | undefined | null,
      totalPages: number | undefined | null,
    ) => {
      if (
        oldBookmark != null &&
        newBookmark != null &&
        totalPages != null &&
        isValidPageNumber(oldBookmark) &&
        isValidPageNumber(newBookmark) &&
        isValidPageNumber(totalPages)
      ) {
        return {
          oldBookmark,
          newBookmark,
          totalPages,
        };
      } else {
        return null;
      }
    },
    [],
  );

  return validatePageNumbers;
};
