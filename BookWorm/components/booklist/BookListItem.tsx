import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookListItemProps {
  bookID: string;
  volumeInfo: BookVolumeInfo;
}

const BookListItem = ({ bookID, volumeInfo }: BookListItemProps) => {
  const handleClick = ({ bookID }: { bookID: string }) => {
    router.push({
      pathname: "bookviewpage",
      params: {
        bookID,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        handleClick({ bookID });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: volumeInfo?.imageLinks?.smallThumbnail }}
          defaultSource={require("../../assets/default_book.png")}
          style={styles.image}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {volumeInfo?.title}
        </Text>

        <Text style={styles.author}>
          Author: {volumeInfo?.authors?.join(", ")}
        </Text>
        {/* TODO: Add more properties as needed */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Align items horizontally
    padding: 10, // Padding
    borderBottomWidth: 1, // Add bottom border
    borderBottomColor: "rgba(0, 0, 0, 0.1)", // Border color
  },
  imageContainer: {
    marginRight: 10, // Add some spacing between image and text
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1, // Take up remaining space
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
  },
});

export default BookListItem;
