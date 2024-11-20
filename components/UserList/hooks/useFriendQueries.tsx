import { useQuery } from "@tanstack/react-query";
import { fetchFriendData } from "../../../services/firebase-services/UserQueries";

/**
 * Custom hook to fetch friend data for a given friend user ID.
 * @param friendUserID - The ID of the friend user whose data is being fetched.
 * @returns The result of the query, containing the friend data or an error.
 *
 */
export const useFetchFriendData = (friendUserID: string) => {
  return useQuery({
    queryKey: ["frienddata", friendUserID],
    enabled: friendUserID != null,
    queryFn: async () => {
      return await fetchFriendData(friendUserID);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
