import { Stack } from "expo-router";
import React from "react";

const PostsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="NewPost" options={{ headerShown: false }} />
      <Stack.Screen
        name="CameraView"
        options={{
          presentation: "modal",
          headerTitle: "Take a Photo",
        }}
      />
    </Stack>
  );
};

export default PostsLayout;
