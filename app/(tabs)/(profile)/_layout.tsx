import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BackButton from "../../../components/backbutton/BackButton";

const ProfileLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack>
        <Stack.Screen
          name="profile"
          options={{ headerShown: true, headerTitle: "Profile" }}
        />
        <Stack.Screen
          name="EditProfile"
          options={{
            presentation: "modal",
            headerTitle: "Edit Profile",
          }}
        />
        <Stack.Screen
          name="profilepost/[postID]"
          options={{
            headerShown: true,
            headerTitle: "Post",
            headerLeft: () => <BackButton waitForKeyBoardDismiss={true} />,
          }}
        />
        <Stack.Screen
          name="profilebook/[bookID]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilefollow/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Follow Details",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="user/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "User",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="GenerateRecommendationsPage"
          options={{
            headerShown: true,
            headerTitle: "Generate Recommendations",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="profilerecommendation/[friendUserID]"
          options={{
            presentation: "modal",
            headerTitle: "Leave a Recommendation",
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
};

export default ProfileLayout;
