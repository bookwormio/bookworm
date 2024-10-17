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
  requestStatus?: BookRequestNotificationStatus;
  mutationPending: boolean;
}

interface ButtonConfig {
  title: BookRequestActionDisplay;
  onPress: () => void;
  disabled?: boolean;
  isNegativeOption?: boolean;
}

const BookRequestNotificationActions = ({
  onAccept,
  onDeny,
  requestStatus,
  mutationPending,
}: BookRequestNotificationActionsProps) => {
  const getActionButtons = (): ButtonConfig[] => {
    if (requestStatus == null) {
      return [];
    }
    switch (requestStatus) {
      case BookRequestNotificationStatus.PENDING:
        // Case: Request is pending: show accept and deny buttons
        return [
          {
            title: BookRequestActionDisplay.ACCEPT,
            onPress: onAccept,
            disabled: mutationPending,
          },
          {
            title: BookRequestActionDisplay.DENY,
            onPress: onDeny,
            disabled: mutationPending,
            isNegativeOption: true,
          },
        ];
      case BookRequestNotificationStatus.ACCEPTED:
        // Case: Request is accepted: show accepted button disabled
        return [
          {
            title: BookRequestActionDisplay.ACCEPTED,
            onPress: () => {},
            disabled: true,
          },
        ];
      case BookRequestNotificationStatus.DENIED:
        // Case: Request is denied: show denied button disabled
        return [
          {
            title: BookRequestActionDisplay.DENIED,
            onPress: () => {},
            disabled: true,
            isNegativeOption: true,
          },
        ];
      default:
        return [];
    }
  };

  const actionButtons = getActionButtons();

  return (
    <View style={styles.container}>
      {actionButtons.map((button, index) => (
        <BookWormButton
          key={index}
          title={button.title}
          onPress={button.onPress}
          disabled={button.disabled}
          isNegativeOption={button.isNegativeOption}
        />
      ))}
    </View>
  );
};

export default BookRequestNotificationActions;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
