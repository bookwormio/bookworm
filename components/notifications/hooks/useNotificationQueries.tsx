import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type BookRequestNotificationStatus } from "../../../enums/Enums";
import {
  createNotification,
  getAllFullNotifications,
  updateNotificationStatus,
} from "../../../services/firebase-services/NotificationQueries";
import { type NotificationModel } from "../../../types";

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

// TODO add jsdoc
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      friendUserID,
      notification,
    }: {
      friendUserID: string;
      notification: NotificationModel;
    }) => {
      return await createNotification(notification);
    },
    onSuccess: async (data, { friendUserID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });
};

// TODO pass in user id for query key
export const useUpdateNotificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notifID,
      newStatus,
    }: {
      notifID: string;
      newStatus: BookRequestNotificationStatus;
    }) => {
      return await updateNotificationStatus(notifID, newStatus);
    },
    onSuccess: async (data, { notifID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", notifID],
      });
    },
  });
};
