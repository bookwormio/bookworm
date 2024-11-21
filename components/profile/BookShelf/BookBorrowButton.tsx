import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUserDataQuery } from "../../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
  BookBorrowButtonDisplay,
  BookRequestNotificationStatus,
  ServerBookBorrowStatus,
  ServerNotificationType,
} from "../../../enums/Enums";
import {
  type BookBorrowModel,
  type BookRequestNotification,
  type UserDataModel,
} from "../../../types";
import { useAuth } from "../../auth/context";
import BookWormButton from "../../buttons/BookWormButton";
import {
  useCreateNotification,
  useUpdateBorrowNotificationStatus,
} from "../../notifications/hooks/useNotificationQueries";
import { formatUserFullName } from "../../notifications/util/notificationUtils";
import { useReturnBook } from "../hooks/useBookBorrowQueries";

interface BookBorrowButtonProps {
  bookID: string;
  bookTitle: string;
  bookOwnerID: string;
  isLoading: boolean;
  borrowInfo?: BookBorrowModel;
  requestStatus?: BookRequestNotificationStatus;
  notifID?: string;
}

interface ButtonState {
  title: BookBorrowButtonDisplay;
  disabled: boolean;
  action: () => void;
  isNegativeOption?: boolean;
}

const BookBorrowButton = ({
  bookID,
  bookTitle,
  bookOwnerID,
  borrowInfo,
  requestStatus,
  isLoading,
  notifID,
}: BookBorrowButtonProps) => {
  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );
  const { data: bookOwnerData, isLoading: isBookOwnerDataLoading } =
    useUserDataQuery(bookOwnerID);

  const notifyMutation = useCreateNotification();
  const updateBorrowNotificationStatus = useUpdateBorrowNotificationStatus();
  const returnMutation = useReturnBook();
  const queryClient = useQueryClient();

  const isCurrentUserBorrowing = borrowInfo?.borrowingUserID === user?.uid;
  const isBookBorrowed =
    borrowInfo?.borrowStatus === ServerBookBorrowStatus.BORROWING;
  const isBookReturned =
    borrowInfo?.borrowStatus === ServerBookBorrowStatus.RETURNED ||
    requestStatus === BookRequestNotificationStatus.RETURNED;

  const getButtonState = (): ButtonState => {
    if (isLoading || isUserDataLoading || isBookOwnerDataLoading) {
      // Case: Loading state while fetching data
      return {
        title: BookBorrowButtonDisplay.LOADING,
        disabled: true,
        action: () => {},
      };
    }

    if (borrowInfo == null && requestStatus == null) {
      // Case: Book is available for borrowing (no existing borrow info or request)
      return {
        title: BookBorrowButtonDisplay.REQUEST,
        disabled: false,
        action: () => {
          handleBookRequestClicked(bookID, bookTitle);
        },
      };
    }

    if (isBookBorrowed) {
      if (isCurrentUserBorrowing)
        return {
          // Case: Current user is borrowing the book
          title: BookBorrowButtonDisplay.RETURN,
          disabled: false,
          action: () => {
            handleBookReturnClicked(bookID);
          },
          isNegativeOption: true,
        };
      else {
        // Case: Book is borrowed by someone else
        return {
          title: BookBorrowButtonDisplay.UNAVAILABLE,
          disabled: true,
          action: () => {},
        };
      }
    }

    switch (requestStatus) {
      case BookRequestNotificationStatus.PENDING:
        // Case: User has a pending request for this book
        return {
          title: BookBorrowButtonDisplay.REQUESTED,
          disabled: true,
          action: () => {},
        };
      case BookRequestNotificationStatus.ACCEPTED:
      case BookRequestNotificationStatus.RETURNED:
        if (isBookReturned && isCurrentUserBorrowing)
          // Case: Book has been returned, user can request again
          return {
            title: BookBorrowButtonDisplay.REQUEST_AGAIN,
            disabled: false,
            action: () => {
              handleBookRequestClicked(bookID, bookTitle);
            },
          };
        else {
          // Case: User is currently borrowing the accepted book
          return {
            title: BookBorrowButtonDisplay.RETURN,
            disabled: false,
            action: () => {
              handleBookReturnClicked(bookID);
            },
            isNegativeOption: true,
          };
        }
      case BookRequestNotificationStatus.DENIED:
        // Case: User's request was denied, but they can request again
        return {
          title: BookBorrowButtonDisplay.REQUEST_AGAIN,
          disabled: false,
          action: () => {
            handleBookRequestClicked(bookID, bookTitle);
          },
        };
      default:
        // Default case: No specific request status, allow user to request
        return {
          title: BookBorrowButtonDisplay.REQUEST,
          disabled: false,
          action: () => {
            handleBookRequestClicked(bookID, bookTitle);
          },
        };
    }
  };

  const handleSendBookRequestNotification = ({
    bookID,
    bookTitle,
    message,
    userData,
    bookOwnerID,
    userID,
  }: {
    bookID: string;
    bookTitle: string;
    message?: string;
    userData: UserDataModel | null | undefined;
    bookOwnerID: string;
    userID: string | null | undefined;
  }) => {
    if (userID == null || bookOwnerID == null || userData == null) {
      Toast.show({
        type: "error",
        text1: "Error sending request",
        text2: "User data is missing",
      });
      return;
    }
    if (bookID == null || bookTitle == null) {
      Toast.show({
        type: "error",
        text1: "Error sending request",
        text2: "Book data is missing",
      });
      return;
    }

    const senderName =
      `${userData?.first ?? ""} ${userData?.last ?? ""}`.trim();

    const bookRequestNotification: BookRequestNotification = {
      receiver: bookOwnerID,
      sender: userID,
      sender_name: senderName,
      bookID,
      bookTitle,
      custom_message: message ?? "",
      type: ServerNotificationType.BOOK_REQUEST,
      bookRequestStatus: BookRequestNotificationStatus.PENDING,
    };
    notifyMutation.mutate({
      notification: bookRequestNotification,
    });

    // invalidate the query of lending statuses
    void queryClient.invalidateQueries({
      queryKey: ["lendingStatuses"],
    });
  };

  const handleBookRequestClicked = (bookID: string, bookTitle: string) => {
    Alert.prompt(
      `Request ${bookTitle}`,
      "Include a custom message (Optional)",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Request",
          onPress: (message) => {
            handleSendBookRequestNotification({
              bookID,
              bookTitle,
              message: message ?? "",
              userData,
              bookOwnerID,
              userID: user?.uid,
            });
          },
        },
      ],
      "plain-text",
    );
  };

  const handleBookReturnClicked = (bookID: string) => {
    if (user == null || bookOwnerData == null) {
      Toast.show({
        type: "error",
        text1: "Error returning book",
        text2: "User data is missing",
      });
      return;
    }
    Alert.alert(
      `Return ${bookTitle} to ${formatUserFullName(bookOwnerData.first, bookOwnerData.last)}`,
      "You will have to manually return the book to the owner",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Return",
          onPress: () => {
            returnMutation.mutate({
              borrowerUserID: user.uid,
              lenderUserID: bookOwnerID,
              bookID,
            });
            // update notification status to returned if notifID exists
            if (notifID != null) {
              updateBorrowNotificationStatus.mutate({
                notifID,
                newStatus: BookRequestNotificationStatus.RETURNED,
                userID: user.uid,
              });
            }
          },
        },
      ],
    );
  };

  const buttonState = getButtonState();

  return (
    <View style={styles.container}>
      <BookWormButton
        title={buttonState.title}
        onPress={buttonState.action}
        disabled={
          buttonState.disabled ||
          returnMutation.isPending ||
          notifyMutation.isPending
        }
        isNegativeOption={buttonState.isNegativeOption}
        style={styles.button}
        textStyle={{
          fontSize: 12,
        }}
      ></BookWormButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minWidth: 120, // Adjust this value to match the width of your "Remove" button
    minHeight: 35,
  },
});

export default BookBorrowButton;
