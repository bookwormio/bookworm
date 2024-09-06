import { useQuery } from "@tanstack/react-query";
import { getAllFullNotifications } from "../../../services/firebase-services/NotificationQueries";

export const useGetAllFullNotifications = (userID: string) => {
  return useQuery({
    queryKey: ["notifications", userID],
    queryFn: async () => {
      if (userID === null || userID === "")
        throw new Error("User not logged in");
      const userNotifs = await getAllFullNotifications(userID);
      if (userNotifs == null) throw new Error("Error fetching user books");

      return userNotifs;
    },
  });
};
