import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type BookRequestNotificationStatus } from "../../../enums/Enums";
import {
  createNotification,
  denyOtherRequests,
  getAllFullNotifications,
  updateNotificationStatus,
} from "../../../services/firebase-services/NotificationQueries";
import { type NotificationModel } from "../../../types";

/**
 * Custom hook to fetch the notifications for a given user.
 *
 * @param {string} userID - The ID of the user whose notifications are being fetched.
 * @returns {UseQueryResult<FullNotificationModel[] | null>} The result of the query, containing the notifications or null.
 */
export const useGetAllFullNotifications = (userID: string) => {
  return useQuery({
    queryKey: ["notifications", userID],
    queryFn: async () => {
      try {
        if (userID == null || userID === "") {
          throw new Error("User ID is required");
        }
        const userNotifs = await getAllFullNotifications(userID);
        return userNotifs;
      } catch (error) {
        throw new Error(
          `Error fetching user notifications: ${(error as Error).message}`,
        );
      }
    },
  });
};

/**
 * Custom hook to create a new notification.
 *
 * @returns {UseMutationResult} The mutation result object.
 */
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

/**
 * Custom hook to update the status of a notification.
 *
 * @returns {UseMutationResult} The mutation result object.
 */
export const useUpdateNotificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notifID,
      newStatus,
      userID,
    }: {
      notifID: string;
      newStatus: BookRequestNotificationStatus;
      userID: string;
    }) => {
      return await updateNotificationStatus(notifID, newStatus);
    },
    onSuccess: async (data, { userID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", userID],
      });
    },
  });
};

/**
 * Custom hook to deny other requests for a book.
 *
 * @returns {UseMutationResult} The mutation result object.
 */
export const useDenyOtherRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lenderUserID,
      acceptedBorrowerUserID,
      bookID,
    }: {
      lenderUserID: string;
      acceptedBorrowerUserID: string;
      bookID: string;
    }) => {
      await denyOtherRequests(lenderUserID, acceptedBorrowerUserID, bookID);
      // TODO: this also needs to send notifications to the other users
    },
    onSuccess: async (data, { lenderUserID }) => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", lenderUserID],
      });
    },
  });
};
