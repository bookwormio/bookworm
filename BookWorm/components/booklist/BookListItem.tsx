import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type BookVolumeInfo } from "../../types";

interface BookListItemProps {
  bookID: string;
  volumeInfo: BookVolumeInfo;
  friendUserID?: string;
}

const BookListItem = ({
  bookID,
  volumeInfo,
  friendUserID,
}: BookListItemProps) => {
  const handleClick = ({ bookID }: { bookID: string }) => {
    router.push({
      pathname: "bookviewpage",
      params: {
        bookID,
      },
    });
  };

  const handleRecommendation = ({
    bookID,
    friendUserID,
  }: {
    bookID: string;
    friendUserID: string;
  }) => {
    console.log("yo", bookID, friendUserID);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (friendUserID === null || friendUserID === undefined) {
          handleClick({ bookID });
        } else {
          Alert.alert(
            "Confirm",
            `Send Recommendation to read ${volumeInfo.title}`,
            [
              {
                text: "No",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "Yes",
                onPress: () => {
                  handleRecommendation({ bookID, friendUserID });
                },
              },
            ],
            { cancelable: true }, // user can click outside of box and it will close
          );
        }
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: volumeInfo?.imageLinks?.smallThumbnail }}
          placeholder={require("../../assets/default_book.png")}
          cachePolicy={"memory-disk"}
          contentFit={"contain"}
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
