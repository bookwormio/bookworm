import { useQuery } from "@tanstack/react-query";
import { fetchPagesReadData } from "../../../services/firebase-services/DataQueries";

export const useGetPagesData = (userID: string) => {
  return useQuery({
    queryKey: ["pagesData", userID],
    queryFn: async () => {
      if (userID !== "") {
        return await fetchPagesReadData(userID);
      }
    },
  });
};
