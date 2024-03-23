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
          source={require("../../assets/favicon.png")}
          style={styles.image}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {volumeInfo.title}
        </Text>

        <Text style={styles.author}>
          Author: {volumeInfo.authors?.join(", ")}
        </Text>
        {/* Add more properties as needed */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Align items horizontally
    borderWidth: 1, // Add border
    borderColor: "#ccc", // Border color
    borderRadius: 8, // Border radius
    padding: 10, // Padding
    marginBottom: 10, // Margin bottom
  },
  imageContainer: {
    marginRight: 10, // Add some spacing between image and text
  },
  image: {
    width: 40,
    height: 40,
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
