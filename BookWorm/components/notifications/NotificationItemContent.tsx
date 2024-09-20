import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  BookRequestNotificationStatus,
  BookRequestResponseOptions,
  NotificationMessageMap,
  NotificationTypeMap,
  ServerNotificationType,
} from "../../enums/Enums";
import {
  type BookRequestResponseNotification,
  type FullNotificationModel,
} from "../../types";
import BookRequestActions from "./BookRequestActions";
import { useCreateNotification } from "./hooks/useNotificationQueries";

interface NotificationItemContentProps {
  // TODO: rename notif to notification
  notif: FullNotificationModel;
  time: string;
}

// TODO - Replace with actual name
const MY_FAKE_NAME = "Riles fake name";
const MY_FAKE_TITLE = "Fake Title";

const NotificationItemContent = ({
  notif,
  time,
}: NotificationItemContentProps) => {
  const notifyMutation = useCreateNotification();

  const handleSendBookResponseNotification = ({
    bookID,
    message,
    requestStatus,
  }: {
    bookID: string;
    message?: string;
    requestStatus: BookRequestResponseOptions;
  }) => {
    // TODO: fill this in with sending denial notification
    const bookResponseNotification: BookRequestResponseNotification = {
      receiver: notif.sender, // TODO ensure correct
      sender: notif.receiver, // TODO ensure correct
      sender_name: MY_FAKE_NAME, // TODO fill in with actual name
      type: ServerNotificationType.BOOK_REQUEST_RESPONSE,
      bookID,
      bookTitle: MY_FAKE_TITLE, // TODO fill in with actual book title
      custom_message: message ?? "",
      bookRequestStatus: requestStatus,
    };
    notifyMutation.mutate({
      friendUserID: notif.sender,
      notification: bookResponseNotification,
    });
  };

  const handleAcceptClicked = () => {
    // TODO: also this needs to update the lending status of the book in the bookshelf
    // also send denial to all other requests for the same book
    handleSendBookResponseNotification({
      bookID: notif.bookID,
      message: "",
      requestStatus: BookRequestResponseOptions.ACCEPTED,
    });
    setFakeBookRequestButtonStatus(BookRequestNotificationStatus.ACCEPTED);
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
            handleSendBookResponseNotification({
              bookID: "FAKE BOOK ID",
              message: message ?? "",
              requestStatus: BookRequestResponseOptions.DENIED,
            });
            setFakeBookRequestButtonStatus(
              BookRequestNotificationStatus.DENIED,
            );
          },
        },
      ],
      "plain-text",
    );
  };

  const notificationTitle = (
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

  const notificationDisplay = (
    notifType: ServerNotificationType,
    notifStatus: BookRequestNotificationStatus,
  ) => {
    if (notifType === ServerNotificationType.BOOK_REQUEST_RESPONSE) {
      console.log("notifStatus", notifStatus);
      return notifStatus === BookRequestNotificationStatus.ACCEPTED
        ? "accepted your request to borrow"
        : "denied your request to borrow";
    } else {
      return NotificationMessageMap[notifType];
    }
  };

  // TODO - Replace with actual status
  const [fakeBookRequestButtonStatus, setFakeBookRequestButtonStatus] =
    useState(BookRequestNotificationStatus.PENDING);

  const isBookRequest = notif.type === ServerNotificationType.BOOK_REQUEST;

  return (
    <View style={styles.notifTextContainer}>
      <Text style={styles.notifTitle}>
        {notificationTitle(notif.type, notif.bookRequestStatus)}
      </Text>
      <Text style={styles.notifMessage}>
        <Text style={{ fontWeight: "bold" }}>{notif.sender_name}</Text>
        <Text>
          {" "}
          {notificationDisplay(notif.type, notif.bookRequestStatus)}
          {notif.type === ServerNotificationType.COMMENT
            ? " " + notif.comment
            : ""}
          {notif.type === ServerNotificationType.RECOMMENDATION
            ? " " + notif.bookTitle
            : ""}
          {notif.type === ServerNotificationType.BOOK_REQUEST
            ? " " + notif.bookTitle
            : ""}
          {notif.type === ServerNotificationType.BOOK_REQUEST_RESPONSE
            ? " " + notif.bookTitle
            : ""}
          {notif.custom_message != null && notif.custom_message !== ""
            ? " - " + notif.custom_message
            : ""}{" "}
        </Text>
        <Text style={{ color: "grey" }}>{time}</Text>
      </Text>
      {isBookRequest && (
        <View style={styles.bookRequestButtonContainer}>
          <BookRequestActions
            onAccept={handleAcceptClicked}
            onDeny={handleDenyClicked}
            requestStatus={fakeBookRequestButtonStatus}
          ></BookRequestActions>
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
