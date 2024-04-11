import { Stack } from "expo-router";
import React from "react";

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="EditProfile"
        options={{
          presentation: "modal",
          headerTitle: "Edit Profile",
        }}
      />
      <Stack.Screen name="AddData" />
    </Stack>
  );
};

export default ProfileLayout;
