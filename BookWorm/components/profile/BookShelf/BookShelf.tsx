import React from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  bookShelfDisplayMap,
  ServerBookShelfName,
  ServerNotificationType,
} from "../../../enums/Enums";
import {
  type BookRequestNotification,
  type BookShelfBookModel,
} from "../../../types";
import { useAuth } from "../../auth/context";
import BookWormButton from "../../button/BookWormButton";
import { useCreateNotification } from "../../notifications/hooks/useNotificationQueries";
import { useRemoveBookFromShelf } from "../hooks/useBookshelfQueries";
import { useBookRouteInfo } from "../hooks/useRouteHooks";
import BookShelfBook from "./BookShelfBook";

interface BookShelfProps {
  shelfName: ServerBookShelfName;
  books: BookShelfBookModel[];
  userID: string;
  userFirstName: string;
  userLastName: string;
}

const BookShelf = ({
  shelfName,
  books,
  userID,
  userFirstName,
  userLastName,
}: BookShelfProps) => {
  const { user } = useAuth();

  const { mutate: removeBook, isPending: removeBookPending } =
    useRemoveBookFromShelf();

  const notifyMutation = useCreateNotification();

  const { type: bookRouteType } = useBookRouteInfo();

  // Function to call the mutation
  const handleRemoveBook = (bookID: string) => {
    if (user != null && bookID != null) {
      // Trigger the mutation with error handling
      removeBook(
        { userID: user.uid, bookID, shelfName },
        {
          onError: (error) => {
            console.error("Failed to remove book:", error);
            // Here you might want to trigger some user notification or logging
          },
        },
      );
    } else {
      console.log("User or book ID is not available");
    }
  };

  const handleBookRequestClicked = (bookID: string, bookTitle: string) => {
    Alert.prompt(
      "Request " + bookTitle + " from " + userID,
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
            });
          },
        },
      ],
      "plain-text",
    );
  };

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
    if (
      user == null ||
      userID == null ||
      userFirstName == null ||
      userLastName == null
    ) {
      console.error("User is null");
    }
    if (bookID == null || bookTitle == null) {
      console.error("Book ID or book title is null");
    }
    if (user != null) {
      const bookRequestNotification: BookRequestNotification = {
        receiver: userID,
        sender: user?.uid, // TODO make names less ambiguous
        sender_name: userFirstName + " " + userLastName, // Use an empty string if user?.uid is undefined
        bookID,
        bookTitle,
        custom_message: message ?? "",
        type: ServerNotificationType.BOOK_REQUEST,
      };
      notifyMutation.mutate({
        friendUserID: userID,
        notification: bookRequestNotification,
      });
    }
  };

  const shelfNameDisplay = bookShelfDisplayMap[shelfName];

  return (
    <View style={styles.list}>
      <View style={styles.heading}>
        <Text style={styles.title}>{shelfNameDisplay}</Text>
        <Text style={styles.length}>{books.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {item.volumeInfo != null && (
                <BookShelfBook book={item.volumeInfo} bookID={item.id} />
              )}
            </TouchableOpacity>
            {/* TODO: make this look better with minus sign button */}
            {bookRouteType === "PROFILE" && (
              <Button
                onPress={() => {
                  handleRemoveBook(item.id);
                }}
                title="Remove from shelf"
                disabled={removeBookPending}
              />
            )}
            {shelfName === ServerBookShelfName.LENDING_LIBRARY &&
              bookRouteType === "SEARCH" && (
                <BookWormButton
                  title="Request"
                  onPress={() => {
                    handleBookRequestClicked(
                      item.id,
                      item.volumeInfo?.title ?? "",
                    );
                  }}
                ></BookWormButton>
              )}
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyShelfText}>No books available</Text>
        )}
      />
    </View>
  );
};

export default BookShelf;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  listContainer: {
    padding: 20,
    minHeight: 200, // Ensure the container has a minimum height
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  length: {
    fontSize: 17,
  },
  list: {
    paddingTop: 0,
  },
  heading: {
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flatList: {
    flexGrow: 0, // Prevent FlatList from stretching
    minHeight: 150, // Minimum height to maintain the layout even when empty
  },
  emptyShelfText: {
    // Styling for the empty shelf text
    color: "#666",
    fontStyle: "italic",
  },
});
