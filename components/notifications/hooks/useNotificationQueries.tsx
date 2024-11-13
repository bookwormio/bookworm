import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNotification,
  denyOtherBorrowRequests,
  getAllFullNotifications,
  getUnreadNotificationCount,
  updateBorrowNotificationStatus,
} from "../../../services/firebase-services/NotificationQueries";
import {
  type DenyOtherBorrowRequestsParams,
  type NotificationModel,
  type UpdateBorrowNotificationParams,
} from "../../../types";

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
        return await getAllFullNotifications(userID);
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
      notification,
    }: {
      notification: NotificationModel;
    }) => {
      return await createNotification(notification);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

/**
 * Custom hook to update the status of a notification.
 *
 * @returns {UseMutationResult} The mutation result object.
 */
export const useUpdateBorrowNotificationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notifID,
      newStatus,
      userID,
    }: UpdateBorrowNotificationParams) => {
      return await updateBorrowNotificationStatus(notifID, newStatus);
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
export const useDenyOtherBorrowRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lenderUserID,
      acceptedBorrowerUserID,
      acceptedBorrowerUserName,
      bookID,
    }: DenyOtherBorrowRequestsParams) => {
      await denyOtherBorrowRequests(
        lenderUserID,
        acceptedBorrowerUserID,
        acceptedBorrowerUserName,
        bookID,
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

/**
 * Hook to fetch unread notification count for a user.
 * @param userID - User's ID
 * @returns React Query result containing unread notification count
 * @example
 * const { data: unreadCount } = useGetUnreadNotificationCount(userID);
 */
export const useGetUnreadNotificationCount = (userID: string) => {
  return useQuery({
    queryKey: ["unreadNotifications", userID],
    queryFn: async () => {
      return await getUnreadNotificationCount(userID);
    },
    enabled: userID != null && userID !== "",
  });
};
