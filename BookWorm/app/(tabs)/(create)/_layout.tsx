import { Stack } from "expo-router";
import React from "react";
import { NewPostProvider } from "./NewPostContext";

const PostsLayout = () => {
  return (
    <NewPostProvider>
      <Stack>
        <Stack.Screen name="NewPost" options={{ headerShown: false }} />
        <Stack.Screen
          name="CameraView"
          options={{
            presentation: "modal",
            headerTitle: "Take a Photo",
          }}
        />
        <Stack.Screen
          name="createbook/createbooksearch"
          options={{
            presentation: "modal",
            headerTitle: "Select a Book",
          }}
        />
      </Stack>
    </NewPostProvider>
  );
};

export default PostsLayout;
