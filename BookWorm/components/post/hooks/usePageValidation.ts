import { useCallback } from "react";
import { areValidPageNumbers } from "../util/postUtils";

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
        areValidPageNumbers(oldBookmark, newBookmark, totalPages)
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
