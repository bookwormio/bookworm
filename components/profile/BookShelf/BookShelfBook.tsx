import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type BookshelfVolumeInfo } from "../../../types";
import { useNavigateToBook } from "../hooks/useRouteHooks";

interface BookShelfBookProps {
  book: BookshelfVolumeInfo;
  bookID: string;
}
const BookShelfBook = ({ book, bookID }: BookShelfBookProps) => {
  const navigateToBook = useNavigateToBook(bookID);

  return (
    <TouchableOpacity
      onPress={() => {
        navigateToBook();
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
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
  },
  bookImage: {
    width: 120,
    height: 150,
    borderRadius: 10,
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
