import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BackButton from "../../../components/backbutton/BackButton";

const SearchLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack>
        <Stack.Screen
          name="search"
          options={{ headerShown: true, headerTitle: "Search" }}
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
          name="searchrecommendation/[friendUserID]"
          options={{
            presentation: "modal",
            headerTitle: "Leave a Recommendation",
          }}
        />
        <Stack.Screen
          name="searchbook/[bookID]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="searchfollow/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "Follow Details",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="posts/[postID]"
          options={{
            headerShown: true,
            headerTitle: "Post",
            headerLeft: () => <BackButton waitForKeyBoardDismiss={true} />,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
};

export default SearchLayout;
