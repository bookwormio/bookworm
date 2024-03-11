import { Stack } from "expo-router";
import React from "react";

export default function PostsLayout() {
  return (
    <Stack>
      <Stack.Screen name="posts" options={{ headerShown: false }} />
      <Stack.Screen
        name="NewPost"
        options={{
          presentation: "modal",
          headerTitle: "Create a New Post",
        }}
      />
      <Stack.Screen
        name="CameraView"
        options={{
          presentation: "modal",
          headerTitle: "Take a Photo",
        }}
      />
    </Stack>
  );
}
