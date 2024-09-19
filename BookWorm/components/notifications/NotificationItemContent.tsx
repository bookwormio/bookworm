import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import {
  BookRequestNotificationStatus,
  NotificationMessageMap,
  NotificationTypeMap,
  ServerNotificationType,
} from "../../enums/Enums";
import { type FullNotificationModel } from "../../types";
import BookRequestActions from "./BookRequestActions";

interface NotificationItemContentProps {
  // TODO: rename notif to notification
  notif: FullNotificationModel;
  time: string;
}

const NotificationItemContent = ({
  notif,
  time,
}: NotificationItemContentProps) => {
  const handleSendDenial = ({
    bookID,
    message,
  }: {
    bookID: string;
    message?: string;
  }) => {
    // TODO: fill this in with sending denial notification
  };

  const handleAcceptClicked = () => {
    // TODO: fill this in with sending acceptance notification
    // also this needs to update the lending status of the book in the bookshelf
    // also send denial to all other requests for the same book
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
            handleSendDenial({
              bookID: "FAKE BOOK ID",
              message: message ?? "",
            });
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
      return notifStatus === BookRequestNotificationStatus.ACCEPTED
        ? "accepted your request to borrow"
        : "denied your request to borrow";
    } else {
      return NotificationMessageMap[notifType];
    }
  };

  // TODO - Replace with actual status
  const FAKE_NOTIF_STATUS = BookRequestNotificationStatus.PENDING;

  // TODO: change to notif.type === ServerNotificationType.BOOK_REQUEST
  const isBookRequest = true;

  return (
    <View style={styles.notifTextContainer}>
      <Text style={styles.notifTitle}>
        {notificationTitle(notif.type, FAKE_NOTIF_STATUS)}
      </Text>
      <Text style={styles.notifMessage}>
        <Text style={{ fontWeight: "bold" }}>{notif.sender_name}</Text>
        <Text>
          {" "}
          {notificationDisplay(notif.type, FAKE_NOTIF_STATUS)}
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
            requestStatus={FAKE_NOTIF_STATUS}
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
