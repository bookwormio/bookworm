import React from "react";
import { StyleSheet, View } from "react-native";
import {
  BookRequestActionDisplay,
  BookRequestNotificationStatus,
} from "../../enums/Enums";
import BookWormButton from "../button/BookWormButton";

interface BookRequestActionsProps {
  onAccept: () => void;
  onDeny: () => void;
  requestStatus: BookRequestNotificationStatus;
}

// TODO: maybe rename to BookRequestResponseActions or BookRequestResponseButtons

// TODO this should display status of requested and be disabled once the request goes through
const BookRequestActions = ({
  onAccept,
  onDeny,
  requestStatus,
}: BookRequestActionsProps) => {
  return (
    <View style={styles.bookRequestActions}>
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

export default BookRequestActions;

const styles = StyleSheet.create({
  bookRequestActions: {
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
