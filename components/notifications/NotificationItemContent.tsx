import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
  BookRequestNotificationStatus,
  NotificationMessageMap,
  NotificationTypeMap,
  ServerNotificationType,
} from "../../enums/Enums";
import {
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

// This needs to be updated when other notificaitons that effect this one change
interface NotificationItemContentProps {
  notification: FullNotificationModel;
  time: string;
}

// TODO: Make this work
// export const NotificationConfig: Record<
//   ServerNotificationType,
//   {
//     title: string | ((notifStatus?: BookRequestNotificationStatus) => string);
//     message: string | ((notifStatus?: BookRequestNotificationStatus) => string);
//   }
// > = {
//   [ServerNotificationType.FRIEND_REQUEST]: {
//     title: "New Follower",
//     message: "followed you",
//   },
//   [ServerNotificationType.LIKE]: {
//     title: "New Like",
//     message: "liked your post",
//   },
//   [ServerNotificationType.COMMENT]: {
//     title: "New Comment",
//     message: "commented on your post:",
//   },
//   [ServerNotificationType.RECOMMENDATION]: {
//     title: "New Recommendation",
//     message: "thinks you should read",
//   },
//   [ServerNotificationType.BOOK_REQUEST]: {
//     title: "New Book Request",
//     message: "requested to borrow",
//   },
//   [ServerNotificationType.BOOK_REQUEST_RESPONSE]: {
//     title: (notifStatus) =>
//       notifStatus === BookRequestNotificationStatus.ACCEPTED
//         ? "Book Request Accepted"
//         : "Book Request Denied",
//     message: (notifStatus) =>
//       notifStatus === BookRequestNotificationStatus.ACCEPTED
//         ? "accepted your request to borrow"
//         : "denied your request to borrow",
//   },
// };

// // Generalized notification formatter
// const formatNotification = (
//   notifType: ServerNotificationType,
//   notifStatus?: BookRequestNotificationStatus,
// ) => {
//   const config = NotificationConfig[notifType];

//   const title =
//     typeof config.title === "function"
//       ? config.title(notifStatus)
//       : config.title;

//   const message =
//     typeof config.message === "function"
//       ? config.message(notifStatus)
//       : config.message;

//   return { title, message };
// };

// // Usage
// const { title, message } = formatNotification(
//   ServerNotificationType.BOOK_REQUEST_RESPONSE,
//   BookRequestNotificationStatus.ACCEPTED,
// );

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
  }: {
    bookID: string;
    message?: string;
    requestStatus: BookRequestNotificationStatus;
  }) => {
    const userDataTyped = userData as UserDataModel;
    const senderName =
      `${userDataTyped?.first ?? ""} ${userDataTyped?.last ?? ""}`.trim();

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
    // TODO: disable the button while this mutation is happening
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
    // TODO: handle failure
    // Update the request notification status from the original notification
    updateNotificationStatus.mutate({
      notifID,
      newStatus,
      userID,
    });
  };

  const handleAcceptClicked = async () => {
    await Promise.all([
      handleLendBookToUser(
        notification.receiver,
        notification.sender,
        notification.bookID,
      ),
      handleSendBookResponseNotification({
        bookID: notification.bookID,
        message: "",
        requestStatus: BookRequestNotificationStatus.ACCEPTED,
      }),
      handleRejectOtherRequests(
        notification.receiver,
        notification.sender,
        notification.bookID,
      ),
      handleUpdateBookRequestStatus(
        notification.notifID,
        BookRequestNotificationStatus.ACCEPTED,
        notification.receiver,
      ),
    ]);

    // TODO: remove this (should be handled by query cache)
    setBookRequestStatus(BookRequestNotificationStatus.ACCEPTED);
  };

  const handleDenySent = async (message?: string) => {
    await Promise.all([
      handleSendBookResponseNotification({
        bookID: notification.bookID,
        message: message ?? "",
        requestStatus: BookRequestNotificationStatus.DENIED,
      }),
      handleUpdateBookRequestStatus(
        notification.notifID,
        BookRequestNotificationStatus.DENIED,
        notification.receiver,
      ),
    ]);
    setBookRequestStatus(BookRequestNotificationStatus.DENIED);
  };

  const handleDenyClicked = () => {
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

  // TODO: move to utils file
  const formatNotificationTitle = (
    notifType: ServerNotificationType,
    notifStatus: BookRequestNotificationStatus,
  ) => {
    if (notifType === ServerNotificationType.BOOK_REQUEST_RESPONSE) {
      return notifStatus === BookRequestNotificationStatus.ACCEPTED
        ? "Book Request Accepted"
        : "Book Request Denied";
    } else {
      return NotificationTypeMap[notifType];
    }
  };

  // TODO: move to utils file
  const formatNotificationDisplay = (
    notifType: ServerNotificationType,
    notifStatus: BookRequestNotificationStatus,
  ) => {
    if (notifType === ServerNotificationType.BOOK_REQUEST_RESPONSE) {
      return notifStatus === BookRequestNotificationStatus.ACCEPTED
        ? "accepted your request to borrow"
        : "denied your request to borrow";
    } else {
      return NotificationMessageMap[notifType];
    }
  };

  const [bookRequestStatus, setBookRequestStatus] = useState(
    notification.bookRequestStatus,
  );

  const isBookRequest =
    notification.type === ServerNotificationType.BOOK_REQUEST;

  return (
    <View style={styles.notifTextContainer}>
      <Text style={styles.notifTitle}>
        {formatNotificationTitle(
          notification.type,
          notification.bookRequestStatus,
        )}
      </Text>
      <Text style={styles.notifMessage}>
        <Text style={{ fontWeight: "bold" }}>{notification.sender_name}</Text>
        <Text>
          {" "}
          {formatNotificationDisplay(
            notification.type,
            notification.bookRequestStatus,
          )}
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
            onAccept={handleAcceptClicked}
            onDeny={handleDenyClicked}
            requestStatus={bookRequestStatus}
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
