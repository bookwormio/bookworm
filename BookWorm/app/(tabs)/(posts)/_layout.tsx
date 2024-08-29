import { Stack } from "expo-router";
import React from "react";
import { PostsProvider } from "../../../components/post/PostsContext";

const PostsLayout = () => {
  return (
    <PostsProvider>
      <Stack>
        <Stack.Screen name="posts" options={{ headerShown: false }} />
        <Stack.Screen name="[postID]" options={{ headerShown: false }} />
        <Stack.Screen
          name="user/[friendUserID]"
          options={{ headerShown: false }}
        />
      </Stack>
    </PostsProvider>
  );
};

export default PostsLayout;
