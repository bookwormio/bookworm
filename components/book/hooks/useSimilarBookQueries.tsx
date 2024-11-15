// TODO: maybe rename / reorg this file

import { useMutation } from "@tanstack/react-query";
import { fetchBooksLikeThisAPI } from "../../../services/recommendation-services/RecommendationQueries";

// TODO ADD JSDOC
export const useFindBooksLikeThis = () => {
  return useMutation({
    mutationFn: async ({ bookID }: { bookID: string }) => {
      return await fetchBooksLikeThisAPI(bookID);
    },
  });
};
