import { Image } from "expo-image";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BOOKSHELF_DISPLAY_NAMES,
  type ServerBookShelfName,
} from "../../../enums/Enums";
import { type BookshelfVolumeInfo } from "../../../types";
import { useAuth } from "../../auth/context";
import { useRemoveBookFromShelf } from "../hooks/useBookshelfQueries";
import { useBookRouteInfo, useNavigateToBook } from "../hooks/useRouteHooks";

interface BookShelfBookProps {
  book: BookshelfVolumeInfo;
  bookID: string;
  shelfName?: ServerBookShelfName;
  userID?: string;
}
const BookShelfBook = ({
  book,
  bookID,
  shelfName,
  userID,
}: BookShelfBookProps) => {
  const { user } = useAuth();
  const navigateToBook = useNavigateToBook(bookID);
  const { type: bookRouteType } = useBookRouteInfo();
  const { mutate: removeBook } = useRemoveBookFromShelf();

  // Function to call the mutation
  const handleRemoveBook = (bookID: string) => {
    if (user != null && bookID != null && shelfName != null) {
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

  const handleRemoveClick = (
    bookID: string,
    bookShelf: ServerBookShelfName,
    volumeInfo: BookshelfVolumeInfo,
  ) => {
    Alert.alert(
      "Confirmation",
      `Do you want to remove ${volumeInfo.title} from ${BOOKSHELF_DISPLAY_NAMES[bookShelf]}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            handleRemoveBook(bookID);
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigateToBook();
      }}
      onLongPress={() => {
        if (
          bookRouteType === "PROFILE" &&
          userID === user?.uid &&
          shelfName != null
        ) {
          handleRemoveClick(bookID, shelfName, book);
        }
      }}
    >
      <View>
        <View style={styles.imageBox}>
          <Image
            // Using thumbnail here because the other image links (small / medium) may be different
            source={{ uri: book?.thumbnail }}
            cachePolicy={"memory-disk"}
            style={styles.bookImage}
          />
        </View>
        {/* TODO center the text */}
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.titleText}>
            {book.title}
          </Text>
          <Text numberOfLines={1} style={styles.bookText}>
            {book.authors?.join(", ")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageBox: {
    marginRight: 20,
    borderRadius: 10,
    elevation: 6,
    shadowRadius: 6,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
  },
  bookImage: {
    width: 120,
    height: 190,
    borderRadius: 2,
  },
  bookText: {
    width: 120,
    marginRight: 20,
    marginTop: 5,
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    width: 120,
    marginRight: 20,
    marginTop: 20 / 2,
    justifyContent: "center",
  },
  textContainer: {
    height: 40,
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

export default BookShelfBook;
