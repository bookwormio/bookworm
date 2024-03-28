import { Stack } from "expo-router";
import React from "react";

const PostsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="posts" options={{ headerShown: false }} />
      <Stack.Screen name="[postID]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PostsLayout;
