import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Alert, View } from "react-native";
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
import BookWormButton from "../../button/BookWormButton";
import { useCreateNotification } from "../../notifications/hooks/useNotificationQueries";
import { useReturnBook } from "../hooks/useBookBorrowQueries";

interface BookBorrowButtonProps {
  bookID: string;
  bookTitle: string;
  bookOwnerID: string;
  isLoading: boolean;
  borrowInfo?: BookBorrowModel;
  requestStatus?: BookRequestNotificationStatus;
}

interface ButtonState {
  title: BookBorrowButtonDisplay;
  disabled: boolean;
  action: () => void;
}

const BookBorrowButton = ({
  bookID,
  bookTitle,
  bookOwnerID,
  borrowInfo,
  requestStatus,
  isLoading,
}: BookBorrowButtonProps) => {
  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );
  const notifyMutation = useCreateNotification();
  const returnMutation = useReturnBook();
  const queryClient = useQueryClient();

  const getButtonState = (): ButtonState => {
    if (isLoading || isUserDataLoading) {
      // Case: Loading
      return {
        title: BookBorrowButtonDisplay.LOADING,
        disabled: true,
        action: () => {},
      };
    }

    if (borrowInfo == null || requestStatus == null) {
      // This should not happen but just in case
      return {
        title: BookBorrowButtonDisplay.UNAVAILABLE,
        disabled: true,
        action: () => {},
      };
    }

    if (borrowInfo?.borrowStatus === ServerBookBorrowStatus.BORROWING) {
      if (borrowInfo.borrowingUserID === user?.uid) {
        // Case: Current user is borrowing the book
        return {
          title: BookBorrowButtonDisplay.RETURN,
          disabled: false,
          action: () => {
            handleBookReturnClicked(bookID);
          },
        };
      } else {
        return {
          // Case: Book is already borrowed by someone else
          title: BookBorrowButtonDisplay.UNAVAILABLE,
          disabled: true,
          action: () => {},
        };
      }
    }

    switch (requestStatus) {
      case BookRequestNotificationStatus.PENDING:
        // Case: Current user has already requested the book
        return {
          title: BookBorrowButtonDisplay.REQUESTED,
          disabled: true,
          action: () => {},
        };
      case BookRequestNotificationStatus.ACCEPTED:
        // Case: Current user is borrowing the book
        // (it should not reach here, but just in case)
        return {
          title: BookBorrowButtonDisplay.RETURN,
          disabled: false,
          action: () => {
            handleBookReturnClicked(bookID);
          },
        };
      case BookRequestNotificationStatus.DENIED:
        // Case: Current user's request was denied
        return {
          title: BookBorrowButtonDisplay.REQUEST_AGAIN,
          disabled: false,
          action: () => {
            handleBookRequestClicked(bookID, bookTitle);
          },
        };
      default:
        return {
          // Default case: Current user has not requested the book
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
      friendUserID: bookOwnerID,
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
            // TODO: set button to requested after sent !!!!
            // this is where i do the mutation to update the notification
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
    if (user == null) {
      Toast.show({
        type: "error",
        text1: "Error returning book",
        text2: "User is not logged in",
      });
      return;
    }
    returnMutation.mutate({
      borrowerUserID: user.uid,
      lenderUserID: bookOwnerID,
      bookID,
    });
  };

  const buttonState = getButtonState();

  return (
    <View>
      <BookWormButton
        title={buttonState.title}
        onPress={buttonState.action}
        disabled={buttonState.disabled}
      ></BookWormButton>
      <Toast />
    </View>
  );
};

export default BookBorrowButton;
