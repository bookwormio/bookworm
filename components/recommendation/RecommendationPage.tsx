import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useUserDataQuery } from "../../app/(tabs)/(profile)/hooks/useProfileQueries";
import { ServerNotificationType } from "../../enums/Enums";
import { createNotification } from "../../services/firebase-services/NotificationQueries";
import {
  type BookVolumeInfo,
  type RecommendationNotification,
} from "../../types";
import { useUserID } from "../auth/context";
import BookSearch from "../searchbar/booksearch";

interface FriendIDProp {
  friendUserID: string;
}
const RecommendationPage = ({ friendUserID }: FriendIDProp) => {
  const [searchPhrase, setSearchPhrase] = useState("");
  const setParentSearchPhrase = (search: string) => {
    setSearchPhrase(search);
  };

  const { userID } = useUserID();
  const queryClient = useQueryClient();

  // getting userdata
  const { data: userData } = useUserDataQuery(userID);

  const notifyMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", friendUserID],
      });
    },
  });

  const handleRecommendation = ({
    bookID,
    volumeInfo,
    message,
  }: {
    bookID: string;
    volumeInfo: BookVolumeInfo;
    message?: string;
  }) => {
    if (userData == null) {
      throw new Error("userData is null");
    }
    // send book title and bookID
    const FRnotify: RecommendationNotification = {
      receiver: friendUserID,
      sender: userID,
      sender_name: userData.first + " " + userData.last, // Use an empty string if userID is undefined
      bookID,
      bookTitle: volumeInfo.title ?? "",
      custom_message: message ?? "",
      type: ServerNotificationType.RECOMMENDATION,
    };
    notifyMutation.mutate(FRnotify);
    router.back();
  };

  const handleBookClickOverride = (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => {
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
              handleRecommendation({ bookID, volumeInfo });
            } else {
              handleRecommendation({
                bookID,
                volumeInfo,
                message,
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
    >
      <ScrollView style={{ flex: 1 }}>
        <BookSearch
          searchPhrase={searchPhrase}
          setSearchPhrase={setParentSearchPhrase}
          handleBookClickOverride={handleBookClickOverride}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RecommendationPage;
