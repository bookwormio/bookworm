import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PROFILE_BOOK_PREFIX } from "../../../constants/constants";
import { type BookshelfVolumeInfo } from "../../../types";
import { generateBookRoute } from "../../../utilities/routeUtils";

interface BookShelfBookProps {
  book: BookshelfVolumeInfo;
  bookID: string;
}
const BookShelfBook = ({ book, bookID }: BookShelfBookProps) => {
  return (
    <TouchableOpacity
      onPress={() => {
        const bookRoute = generateBookRoute(bookID, PROFILE_BOOK_PREFIX);
        if (bookRoute != null) {
          router.push(bookRoute);
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
        <Text numberOfLines={1} style={styles.titleText}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={styles.bookText}>
          {book.authors?.join(", ")}
        </Text>
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
    marginTop: 20 / 2,
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    width: 120,
    marginRight: 20,
    marginTop: 20 / 2,
    justifyContent: "center",
  },
});

export default BookShelfBook;
