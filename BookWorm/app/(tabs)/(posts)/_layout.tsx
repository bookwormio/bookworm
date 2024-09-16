import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const PostsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="posts"
        options={{
          headerTitle: "Posts",
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={styles.newPost}
              onPress={() => {
                router.push({ pathname: "notifications" });
              }}
              disabled={false}
            >
              <FontAwesome5 name="bell" size={20} color="#FB6D0B" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[postID]"
        options={{
          headerShown: true,
          headerTitle: "Post",
          headerLeft: () => (
            <View>
              {router.canGoBack() && (
                <TouchableOpacity
                  disabled={!router.canGoBack()}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="#FB6D0B" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="user/[friendUserID]"
        options={{ headerShown: true, headerTitle: "Friend Profile" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, headerTitle: "Notifications" }}
      />
      <Stack.Screen
        name="postsbook/[bookID]"
        options={{ headerShown: true, headerTitle: "Book" }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  newPost: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 2,
  },
});

export default PostsLayout;
