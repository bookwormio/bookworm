import { Stack } from "expo-router";
import React from "react";

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
        name="profilebook/[bookID]"
        options={{ headerShown: true, headerTitle: "Book" }}
      />
    </Stack>
  );
};

export default ProfileLayout;
