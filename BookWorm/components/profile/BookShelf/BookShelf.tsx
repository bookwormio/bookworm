import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  bookStatusDisplayMap,
  type ServerBookStatus,
} from "../../../enums/Enums";
import { removeBookFromUserBookshelf } from "../../../services/firebase-services/queries";
import { type BookShelfBookModel } from "../../../types";
import { useAuth } from "../../auth/context";
import BookShelfBook from "./BookShelfBook";

interface BookShelfProps {
  shelfName: ServerBookStatus;
  books: BookShelfBookModel[];
}

const BookShelf = ({ shelfName, books: initialBooks }: BookShelfProps) => {
  const { user } = useAuth();
  // TODO: clean this up
  // stateful var should be moved to the parent component
  const [books, setBooks] = useState<BookShelfBookModel[]>(initialBooks);

  const removeBookFromShelf = async (bookID: string) => {
    if (user !== null && bookID !== undefined) {
      try {
        const success = await removeBookFromUserBookshelf(
          user.uid,
          bookID,
          shelfName,
        );
        if (success) {
          // TODO: modify display to show that the book was added
          // TODO: remove console logs
          console.log("SUCCESS, removed from shelf", shelfName);
          // remove book from books with bookID
          setBooks((prevBooks) =>
            prevBooks.filter((book) => book.id !== bookID),
          );
        } else {
          console.log("Failed to add the book to the bookshelf");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    } else {
      console.log("User or book ID is not available");
    }
  };

  // TODO: clean this up: remove down the line
  // Use optimistic UI update
  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const shelfNameDisplay = bookStatusDisplayMap[shelfName as ServerBookStatus];
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
        style={styles.flatList} // Added style for the FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {/* Ensure volumeInfo is available before rendering the component */}
              {item.volumeInfo != null && (
                <BookShelfBook book={item.volumeInfo} />
              )}
            </TouchableOpacity>
            {/* TODO: make this look better with minus sign button */}
            <Button
              onPress={() => {
                void (async () => {
                  try {
                    await removeBookFromShelf(item.id);
                  } catch (error) {
                    console.error("Failed to process the request:", error);
                  }
                })();
              }}
              title="Remove from shelf"
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyShelfText}>No books available</Text> // Optional: Display when no books are available
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
