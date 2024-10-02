import React from "react";
import { StyleSheet, View } from "react-native";
import {
  BookRequestActionDisplay,
  BookRequestNotificationStatus,
} from "../../enums/Enums";
import BookWormButton from "../button/BookWormButton";

interface BookRequestNotificationActionsProps {
  onAccept: () => void;
  onDeny: () => void;
  requestStatus: BookRequestNotificationStatus;
}

const BookRequestNotificationActions = ({
  onAccept,
  onDeny,
  requestStatus,
}: BookRequestNotificationActionsProps) => {
  console.log("requestStatus in BookRequestNotificationActions", requestStatus);
  return (
    <View style={styles.BookRequestNotificationActions}>
      {requestStatus === BookRequestNotificationStatus.PENDING && (
        <>
          <BookWormButton
            title={BookRequestActionDisplay.ACCEPT}
            onPress={onAccept}
          />
          <BookWormButton
            title={BookRequestActionDisplay.DENY}
            onPress={onDeny}
            isNegativeOption={true}
          />
        </>
      )}
      {requestStatus === BookRequestNotificationStatus.ACCEPTED && (
        <BookWormButton title={BookRequestActionDisplay.ACCEPTED} disabled />
      )}
      {requestStatus === BookRequestNotificationStatus.DENIED && (
        <BookWormButton
          title={BookRequestActionDisplay.DENIED}
          disabled
          isNegativeOption
        />
      )}
    </View>
  );
};

export default BookRequestNotificationActions;

const styles = StyleSheet.create({
  BookRequestNotificationActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
