import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  useProfilePicQuery,
  useUserDataQuery,
} from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { ServerNotificationType } from "../../enums/Enums";
import { createNotification } from "../../services/firebase-services/NotificationQueries";
import {
  type BasicNotificationModel,
  type BookVolumeInfo,
  type UserDataModel,
} from "../../types";
import { useAuth } from "../auth/context";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // getting userdata
  const { data: userData } = useUserDataQuery(user ?? undefined);

  // getting user profile pic
  const { data: userIm } = useProfilePicQuery(user?.uid);

  const notifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });

  const handleClick = ({ bookID }: { bookID: string }) => {
    router.push({
      pathname: `/searchbook/${bookID}`,
    });
  };

  const handleRecommendation = ({
    bookID,
    friendUserID,
    message,
  }: {
    bookID: string;
    friendUserID: string;
    message?: string;
  }) => {
    // send book title and bookID
    if (user !== undefined && user !== null) {
      const uData = userData as UserDataModel;
      const FRnotify: BasicNotificationModel = {
        receiver: friendUserID,
        sender: user?.uid,
        sender_name: uData.first + " " + uData.last, // Use an empty string if user?.uid is undefined
        sender_img: userIm ?? "",
        comment: "",
        postID: "",
        bookID,
        bookTitle: volumeInfo.title,
        custom_message: message ?? "",
        type: ServerNotificationType.RECOMMENDATION,
      };
      notifyMutation.mutate(FRnotify);
    }
    router.back();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (friendUserID === null || friendUserID === undefined) {
          handleClick({ bookID });
        } else {
          Alert.prompt(
            "Send Book Recommendation",
            "Include a custom message (Optional)",
            [
              {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "Send",
                onPress: (message) => {
                  if (message === "") {
                    handleRecommendation({ bookID, friendUserID });
                  } else {
                    handleRecommendation({
                      bookID,
                      friendUserID,
                      message,
                    });
                  }
                },
              },
            ],
            "plain-text",
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
