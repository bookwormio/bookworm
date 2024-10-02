import React from "react";
import { Alert } from "react-native";
import { useUserDataQuery } from "../../../app/(tabs)/(profile)/hooks/useProfileQueries";
import {
  BookRequestNotificationStatus,
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
}

// title can be
// "Request"
// "Return"
// "Lent out to someone else"

const BookBorrowButton = ({
  bookID,
  bookTitle,
  bookOwnerID,
  borrowInfo,
}: BookBorrowButtonProps) => {
  const { user } = useAuth();
  const { data: userData, isLoading: isUserDataLoading } = useUserDataQuery(
    user?.uid,
  );

  if (borrowInfo != null) {
    console.log("Book is borrowed by someone");
    // TODO FILL IN THIS CASE
    // available, borrowed by me, borrowed by someone else
    // title:
    // available: Request
    // borrowed by me: Return
    // borrowed by someone else: Unavailable
  } else {
    // get notification status
    // if available: try get notification status
    // get notification status
    // pending, accepted, denied
    // title:
    // pending: Requested
    // accepted: Return
    // denied: Denied
  }

  const notifyMutation = useCreateNotification();

  // TODO clean up these parameters
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
    // TODO handle all the type checks here better

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
      sender: user?.uid, // TODO make names less ambiguous
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
    // TODO update this FROM the book owner
    Alert.prompt(
      "Request " + bookTitle + " from " + bookOwnerID,
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

  // TODO: implement handleBookRequestClicked
  // TODO: implement handleBookReturnClicked

  // 3 cases:
  // this book is available for request,
  // it is borrowed by me,
  // or it is borrowed by someone else

  const title = bookRequestStatus === "AVAILABLE" ? "Request" : "Return";
  return (
    <BookWormButton
      title={title}
      onPress={() => {
        handleBookRequestClicked(bookID, bookTitle ?? "");
      }}
      disabled={isUserDataLoading || bookRequestStatus !== "AVAILABLE"}
    ></BookWormButton>
  );
};

export default BookBorrowButton;
