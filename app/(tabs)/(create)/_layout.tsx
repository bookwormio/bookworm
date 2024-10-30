import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { NewPostProvider } from "./NewPostContext";

const PostsLayout = () => {
  return (
    <NewPostProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 79 : 0}
      >
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
      </KeyboardAvoidingView>
    </NewPostProvider>
  );
};

export default PostsLayout;
