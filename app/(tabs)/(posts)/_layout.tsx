import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BackButton from "../../../components/buttons/BackButton";
import NotificationBell from "../../../components/buttons/NotificationBell";

const PostsLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack>
        <Stack.Screen
          name="posts"
          options={{
            headerTitle: "Posts",
            headerShown: true,
            headerRight: () => <NotificationBell />,
          }}
        />
        <Stack.Screen
          name="user/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "Friend Profile",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            headerTitle: "Notifications",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsbook/[bookID]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsfollow/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "Follow Details",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="viewposts/[postID]"
          options={{
            headerShown: true,
            headerTitle: "Post",
            headerLeft: () => <BackButton waitForKeyBoardDismiss={true} />,
          }}
        />
        <Stack.Screen
          name="postsrecommendation/[friendUserID]"
          options={{
            presentation: "modal",
            headerTitle: "Leave a Recommendation",
          }}
        />
        <Stack.Screen
          name="postsbooklist/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Book List",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsbadge/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Badges",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsimageblowup/[imageURL]"
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

export default PostsLayout;
