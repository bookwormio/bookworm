import { useQuery } from "@tanstack/react-query";
import { getAllFullNotifications } from "../../../services/firebase-services/NotificationQueries";

/**
 * Custom hook to fetch the notificatioons for a given user.
 *
 * @param {string | undefined} userId - The ID of the user whose notifications are being fetched.
 * @returns {UseQueryResult<FullNotificationModel[] | null>} The result of the query, containing the notifications or null.
 */
export const useGetAllFullNotifications = (userID: string) => {
  return useQuery({
    queryKey: ["notifications", userID],
    queryFn: async () => {
      if (userID == null || userID === "") {
        throw new Error("User ID is required");
      }
      const userNotifs = await getAllFullNotifications(userID);
      if (userNotifs == null) {
        throw new Error("Error fetching user notification");
      }

      return userNotifs;
    },
  });
};
