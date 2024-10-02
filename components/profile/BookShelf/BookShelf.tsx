import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { bookShelfDisplayMap, ServerBookShelfName } from "../../../enums/Enums";
import { type BookShelfBookModel } from "../../../types";
import { useAuth } from "../../auth/context";
import { useRemoveBookFromShelf } from "../hooks/useBookshelfQueries";
import { useBookRouteInfo } from "../hooks/useRouteHooks";
import BookBorrowButton from "./BookBorrowButton";
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
            {bookRouteType === "PROFILE" && userID === user?.uid && (
              <TouchableOpacity
                onPress={() => {
                  handleRemoveBook(item.id);
                }}
                disabled={removeBookPending}
                style={{ paddingTop: 2 }}
              >
                <Text style={{ color: "#FB6D0B" }}>Remove</Text>
              </TouchableOpacity>
            )}
            {shelfName === ServerBookShelfName.LENDING_LIBRARY &&
              // TODO ensure that this is correct
              userID !== user?.uid && (
                <BookBorrowButton
                  bookID={item.id}
                  bookTitle={item.volumeInfo?.title ?? ""}
                  bookOwnerID={userID}
                  bookBorrowInfo={item.borrowInfo}
                />
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
