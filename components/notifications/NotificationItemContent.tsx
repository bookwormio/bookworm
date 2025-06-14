import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
  badgeDisplayTitleMap,
  BookRequestNotificationStatus,
  ServerNotificationType,
} from "../../enums/Enums";
import {
  type BookRequestNotification,
  type FullNotificationModel,
} from "../../types";
import { useAuth } from "../auth/context";
import { useCheckForLendingBadges } from "../badges/useBadgeQueries";
import { useLendBookToUser } from "../profile/hooks/useBookBorrowQueries";
import BookRequestNotificationActions from "./BookRequestNotificationActions";
import {
  useCreateNotification,
  useDenyOtherBorrowRequests,
  useUpdateBorrowNotificationStatus,
} from "./hooks/useNotificationQueries";
import {
  createBookResponseNotification,
  formatNotification,
  formatUserFullName,
} from "./util/notificationUtils";

interface NotificationItemContentProps {
  notification: FullNotificationModel;
  time: string;
}

const NotificationItemContent = ({
  notification,
  time,
}: NotificationItemContentProps) => {
  const notifyMutation = useCreateNotification();
  const updateBorrowNotificationStatus = useUpdateBorrowNotificationStatus();
  const lendBookToUser = useLendBookToUser();
  const denyOtherBorrowRequests = useDenyOtherBorrowRequests();
  const { mutateAsync: checkForLendingBadge } = useCheckForLendingBadges();

  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );

  const queryClient = useQueryClient();

  const handleSendBookResponseNotification = async ({
    bookID,
    message,
    requestStatus,
    senderName,
    notification,
  }: {
    bookID: string;
    message?: string;
    requestStatus: BookRequestNotificationStatus;
    senderName: string;
    notification: BookRequestNotification;
  }) => {
    const bookResponseNotification = createBookResponseNotification(
      notification.sender,
      notification.receiver,
      senderName,
      notification.bookID,
      notification.bookTitle,
      requestStatus,
      message,
    );

    notifyMutation.mutate({
      notification: bookResponseNotification,
    });
  };

  const handleLendBookToUser = async (
    lenderUserID: string,
    borrowerUserID: string,
    bookID: string,
  ) => {
    await lendBookToUser.mutateAsync({
      lenderUserID,
      borrowerUserID,
      bookID,
    });
    await Promise.all([
      checkForLendingBadge({ userID: lenderUserID }),
      checkForLendingBadge({ userID: borrowerUserID }),
    ]);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["badges", lenderUserID] }),
      queryClient.invalidateQueries({
        queryKey: ["badges", borrowerUserID],
      }),
    ]);
  };

  const handleRejectOtherRequests = async (
    lenderUserID: string,
    acceptedBorrowerUserID: string,
    acceptedBorrowerUserName: string,
    bookID: string,
  ) => {
    denyOtherBorrowRequests.mutate({
      lenderUserID,
      acceptedBorrowerUserID,
      acceptedBorrowerUserName,
      bookID,
    });
  };

  const handleUpdateBookRequestStatus = async (
    notifID: string,
    newStatus: BookRequestNotificationStatus,
    userID: string,
  ) => {
    updateBorrowNotificationStatus.mutate({
      notifID,
      newStatus,
      userID,
    });
  };

  const handleAcceptBookRequestClicked = () => {
    const acceptRequest = async () => {
      const notificationTyped = notification as BookRequestNotification & {
        notifID: string;
      };
      if (userData == null) {
        Toast.show({
          type: "error",
          text1: "Error accepting request",
          text2: "User data is missing",
        });
        return;
      }
      try {
        await Promise.all([
          handleLendBookToUser(
            notificationTyped.receiver,
            notificationTyped.sender,
            notificationTyped.bookID,
          ),
          handleSendBookResponseNotification({
            bookID: notificationTyped.bookID,
            message: "",
            requestStatus: BookRequestNotificationStatus.ACCEPTED,
            senderName: formatUserFullName(userData.first, userData.last),
            notification: notificationTyped,
          }),
          handleRejectOtherRequests(
            notificationTyped.receiver,
            notificationTyped.sender,
            formatUserFullName(userData.first, userData.last),
            notificationTyped.bookID,
          ),
          handleUpdateBookRequestStatus(
            notificationTyped.notifID,
            BookRequestNotificationStatus.ACCEPTED,
            notificationTyped.receiver,
          ),
          queryClient.invalidateQueries({
            queryKey: ["availableborrow", notificationTyped.bookID],
          }),
          queryClient.refetchQueries({
            queryKey: ["availableborrow", notificationTyped.bookID],
          }),
        ]);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error accepting request",
          text2: "Please try again later",
        });
      }
    };
    void acceptRequest();
  };

  const handleDenySent = async (message?: string) => {
    const notificationTyped = notification as BookRequestNotification & {
      notifID: string;
    };
    if (userData == null) {
      Toast.show({
        type: "error",
        text1: "Error accepting request",
        text2: "User data is missing",
      });
      return;
    }
    try {
      await Promise.all([
        handleSendBookResponseNotification({
          bookID: notificationTyped.bookID,
          message: message ?? "",
          requestStatus: BookRequestNotificationStatus.DENIED,
          senderName: formatUserFullName(userData.first, userData.last),
          notification: notificationTyped,
        }),
        handleUpdateBookRequestStatus(
          notification.notifID,
          BookRequestNotificationStatus.DENIED,
          notification.receiver,
        ),
      ]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error denying request",
        text2: "Please try again later",
      });
    }
  };

  const handleDenyBookRequestClicked = () => {
    Alert.prompt(
      "Deny Book Request",
      "Include a custom message (Optional)",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Deny",
          onPress: (message) => {
            void handleDenySent(message);
          },
        },
      ],
      "plain-text",
    );
  };

  const isBookRequest =
    notification.type === ServerNotificationType.BOOK_REQUEST;

  const { title: notificationTitle, message: notificationMessage } =
    formatNotification(notification.type, notification?.bookRequestStatus);

  return (
    <View style={styles.notifTextContainer}>
      <Text style={styles.notifTitle}>{notificationTitle}</Text>
      <Text style={styles.notifMessage}>
        {notification.type !== ServerNotificationType.BADGE && (
          <Text style={{ fontWeight: "bold" }}>
            {notification.sender_name}{" "}
          </Text>
        )}
        <Text>
          {notificationMessage}
          {notification.type === ServerNotificationType.COMMENT
            ? " " + notification.comment
            : ""}
          {notification.type === ServerNotificationType.RECOMMENDATION
            ? " " + notification.bookTitle
            : ""}
          {notification.type === ServerNotificationType.BOOK_REQUEST
            ? " " + notification.bookTitle
            : ""}
          {notification.type === ServerNotificationType.BOOK_REQUEST_RESPONSE
            ? " " + notification.bookTitle
            : ""}
          {notification.type === ServerNotificationType.BADGE &&
          notification.badgeID != null
            ? " " + badgeDisplayTitleMap[notification.badgeID]
            : ""}
          {notification.custom_message != null &&
          notification.custom_message !== ""
            ? " - " + notification.custom_message
            : ""}{" "}
        </Text>
        <Text style={{ color: "grey" }}>{time}</Text>
      </Text>
      {isBookRequest && !isUserDataLoading && (
        <View style={styles.bookRequestButtonContainer}>
          <BookRequestNotificationActions
            onAccept={handleAcceptBookRequestClicked}
            onDeny={handleDenyBookRequestClicked}
            requestStatus={notification.bookRequestStatus}
            mutationPending={
              notifyMutation.isPending ||
              updateBorrowNotificationStatus.isPending ||
              lendBookToUser.isPending ||
              denyOtherBorrowRequests.isPending
            }
          ></BookRequestNotificationActions>
        </View>
      )}
    </View>
  );
};

export default NotificationItemContent;
const styles = StyleSheet.create({
  notifTextContainer: {
    flexDirection: "column",
    flex: 1,
  },
  notifTitle: {
    fontWeight: "bold",
    fontSize: 18,
    paddingLeft: 20,
    paddingBottom: 5,
  },
  notifMessage: {
    paddingLeft: 20,
    flexWrap: "wrap",
    flex: 1,
    fontSize: 15,
  },
  bookRequestButtonContainer: {
    paddingLeft: 10,
    paddingTop: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
});
