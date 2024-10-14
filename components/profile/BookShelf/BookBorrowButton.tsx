import React from "react";
import { Alert } from "react-native";
import { useUserDataQuery } from "../../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
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

interface BookBorrowButtonProps {
  bookID: string;
  bookTitle: string;
  bookOwnerID: string;
  borrowInfo?: BookBorrowModel;
  requestStatus?: BookRequestNotificationStatus;
}

interface ButtonState {
  title: string;
  disabled: boolean;
  action: () => void;
}

const BookBorrowButton = ({
  bookID,
  bookTitle,
  bookOwnerID,
  borrowInfo,
  requestStatus,
}: BookBorrowButtonProps) => {
  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );
  const notifyMutation = useCreateNotification();

  const getButtonState = (): ButtonState => {
    if (isUserDataLoading) {
      return { title: "Loading...", disabled: true, action: () => {} };
    }

    if (borrowInfo?.borrowStatus === ServerBookBorrowStatus.BORROWING) {
      if (borrowInfo.borrowingUserID === user?.uid) {
        return {
          title: "Return",
          disabled: false,
          action: () => {
            handleBookReturnClicked(bookID, bookTitle);
          },
        };
      } else {
        return { title: "Unavailable", disabled: true, action: () => {} };
      }
    }

    switch (requestStatus) {
      case BookRequestNotificationStatus.PENDING:
        return { title: "Requested", disabled: true, action: () => {} };
      case BookRequestNotificationStatus.ACCEPTED:
        return {
          title: "Return",
          disabled: false,
          action: () => {
            handleBookReturnClicked(bookID, bookTitle);
          },
        };
      case BookRequestNotificationStatus.DENIED:
        return {
          title: "Request Again",
          disabled: false,
          action: () => {
            handleBookRequestClicked(bookID, bookTitle);
          },
        };
      default:
        return {
          title: "Request",
          disabled: false,
          action: () => {
            handleBookRequestClicked(bookID, bookTitle);
          },
        };
    }
  };

  // TODO Probably put this in a separate file
  const handleSendBookRequestNotification = ({
    bookID,
    bookTitle,
    message,
  }: {
    bookID: string;
    bookTitle: string;
    message?: string;
  }) => {
    if (user == null || bookOwnerID == null || userData == null) {
      console.error("User is null");
      return;
    }
    if (bookID == null || bookTitle == null) {
      console.error("Book ID or book title is null");
      return;
    }

    const userDataTyped = userData as UserDataModel;
    const senderName =
      `${userDataTyped?.first ?? ""} ${userDataTyped?.last ?? ""}`.trim();

    const bookRequestNotification: BookRequestNotification = {
      receiver: bookOwnerID,
      sender: user.uid,
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
            // TODO: set button to requested after sent
            handleSendBookRequestNotification({
              bookID,
              bookTitle,
              message: message ?? "",
            });
          },
        },
      ],
      "plain-text",
    );
  };

  // TODO: implement handleBookReturnClicked
  const handleBookReturnClicked = (bookID: string, bookTitle: string) => {
    // Implement the logic for returning a book
    console.log(`Returning book: ${bookTitle} (ID: ${bookID})`);
    // You might want to show a confirmation dialog and then call an API to update the book status
  };

  const buttonState = getButtonState();

  return (
    <BookWormButton
      title={buttonState.title}
      onPress={buttonState.action}
      disabled={buttonState.disabled}
    ></BookWormButton>
  );
};

export default BookBorrowButton;
