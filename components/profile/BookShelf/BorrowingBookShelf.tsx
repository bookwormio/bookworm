import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { type BookBorrowModel } from "../../../types";
import BookShelfBook from "./BookShelfBook";

interface BorrowingBookShelfProps {
  bookBorrowModels: BookBorrowModel[];
}

const shelfNameDisplay = "Currently Borrowing"; // TODO: Use enums
const subtitle = "This is only visible to you"; // TODO: Use enums

// TODO: this can probably be refactored to use the BookShelf component
const BorrowingBookShelf = ({ bookBorrowModels }: BorrowingBookShelfProps) => {
  const fakebooks = [
    {
      id: "1",
      volumeInfo: {
        title: "Book Title",
        authors: ["Author Name"],
        imageLinks: {
          thumbnail: "https://via.placeholder.com/150",
        },
      },
    },
    {
      id: "2",
      volumeInfo: {
        title: "Book Title",
        authors: ["Author Name"],
        imageLinks: {
          thumbnail: "https://via.placeholder.com/150",
        },
      },
    },
    {
      id: "3",
      volumeInfo: {
        title: "Book Title",
        authors: ["Author Name"],
        imageLinks: {
          thumbnail: "https://via.placeholder.com/150",
        },
      },
    },
  ];

  return (
    <View style={styles.list}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>{shelfNameDisplay}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.length}>{fakebooks.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList}
        data={fakebooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {item.volumeInfo != null && (
                <BookShelfBook book={item.volumeInfo} bookID={item.id} />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyShelfText}>
            {"You aren't borrowing any books"}
          </Text>
        )}
      />
      <Toast />
    </View>
  );
};

export default BorrowingBookShelf;

// TODO share styles with BookShelf
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexGrow: 0,
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
  buttonContainer: {
    width: 120,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  subtitle: {
    paddingTop: 3,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
