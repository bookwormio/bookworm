import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BackButton from "../../../components/buttons/BackButton";

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
        <Stack.Screen
          name="BarcodeScanner"
          options={{
            presentation: "modal",
            title: "Scan a Book's Barcode",
          }}
        />
        <Stack.Screen
          name="searchbooklist/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Book List",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="searchimageblowup/[imageURL]"
          options={{
            presentation: "modal",
            headerShown: false,
            gestureEnabled: true,
            headerLeft: () => <BackButton />,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
};

export default SearchLayout;
