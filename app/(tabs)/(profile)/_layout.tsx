import { Stack } from "expo-router";
import React from "react";
import BackButton from "../../../components/backbutton/BackButton";

const ProfileLayout = () => {
  return (
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
    </Stack>
  );
};

export default ProfileLayout;
