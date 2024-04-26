import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type FlatBookItemModel } from "../../../types";

interface BookShelfBookProps {
  book: FlatBookItemModel;
}

const FAKE_IMAGE_PLACEHOLDER =
  "http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70E0RCBnKtA6EfZAa0-wXgtUtfXjaYAARBNvitnpjRmV9u6N4g9sX87R_GQHkrqkq9qb03NulHqxkwWYYQvNUwOiIcl0Nolkn2_H-IMw_TO71Pbjw_uOmJDaMkw7ZZR1CdSmr8g&source=gbs_api";

const BookShelfBook = ({ book }: BookShelfBookProps) => {
  return (
    <TouchableOpacity>
      <View>
        <View style={styles.imageBox}>
          <Image
            style={styles.bookImage}
            source={{
              uri: FAKE_IMAGE_PLACEHOLDER,
            }}
          />
        </View>

        <Text numberOfLines={1} style={styles.bookText}>
          {book.author}
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
});

export default BookShelfBook;
