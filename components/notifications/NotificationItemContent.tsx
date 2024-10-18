import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
  BookRequestNotificationStatus,
  ServerNotificationType,
} from "../../enums/Enums";
import {
  type BookRequestNotification,
  type BookRequestResponseNotification,
  type FullNotificationModel,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";
import { useLendBookToUser } from "../profile/hooks/useBookBorrowQueries";
import BookRequestNotificationActions from "./BookRequestNotificationActions";
import {
  useCreateNotification,
  useDenyOtherRequests,
  useUpdateNotificationStatus,
} from "./hooks/useNotificationQueries";
import { formatNotification } from "./util/notificationUtils";

interface NotificationItemContentProps {
  notification: FullNotificationModel;
  time: string;
}

const NotificationItemContent = ({
  notification,
  time,
}: NotificationItemContentProps) => {
  const notifyMutation = useCreateNotification();
  const updateNotificationStatus = useUpdateNotificationStatus();
  const lendBookToUser = useLendBookToUser();
  const denyOtherRequests = useDenyOtherRequests();

  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );

  const handleSendBookResponseNotification = async ({
    bookID,
    message,
    requestStatus,
    userData,
    notification,
  }: {
    bookID: string;
    message?: string;
    requestStatus: BookRequestNotificationStatus;
    userData: UserDataModel;
    notification: BookRequestNotification;
  }) => {
    const senderName =
      `${userData?.first ?? ""} ${userData?.last ?? ""}`.trim();

    const bookResponseNotification: BookRequestResponseNotification = {
      receiver: notification.sender,
      sender: notification.receiver,
      sender_name: senderName,
      type: ServerNotificationType.BOOK_REQUEST_RESPONSE,
      bookID,
      bookTitle: notification.bookTitle,
      custom_message: message ?? "",
      bookRequestStatus: requestStatus,
    };
    notifyMutation.mutate({
      friendUserID: notification.sender,
      notification: bookResponseNotification,
    });
  };

  const handleLendBookToUser = async (
    lenderUserID: string,
    borrowerUserID: string,
    bookID: string,
  ) => {
    lendBookToUser.mutate({
      lenderUserID,
      borrowerUserID,
      bookID,
    });
  };

  const handleRejectOtherRequests = async (
    lenderUserID: string,
    acceptedBorrowerUserID: string,
    bookID: string,
  ) => {
    denyOtherRequests.mutate({
      lenderUserID,
      acceptedBorrowerUserID,
      bookID,
    });
  };

  const handleUpdateBookRequestStatus = async (
    notifID: string,
    newStatus: BookRequestNotificationStatus,
    userID: string,
  ) => {
    updateNotificationStatus.mutate({
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
            userData,
            notification: notificationTyped,
          }),
          handleRejectOtherRequests(
            notificationTyped.receiver,
            notificationTyped.sender,
            notificationTyped.bookID,
          ),
          handleUpdateBookRequestStatus(
            notificationTyped.notifID,
            BookRequestNotificationStatus.ACCEPTED,
            notificationTyped.receiver,
          ),
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
          userData,
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
        <Text style={{ fontWeight: "bold" }}>{notification.sender_name}</Text>
        <Text>
          {" "}
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
              updateNotificationStatus.isPending ||
              lendBookToUser.isPending ||
              denyOtherRequests.isPending
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
  },
});
