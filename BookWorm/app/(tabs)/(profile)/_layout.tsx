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
      <Stack.Screen name="AddData" options={{ headerShown: false }} />
      <Stack.Screen name="posts/[postID]" options={{ headerShown: false }} />
      <Stack.Screen
        name="profilebook/[bookID]"
        options={{
          headerShown: true,
          headerTitle: "Book",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
