import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PostsProvider } from "../../../components/post/PostsContext";

const PostsLayout = () => {
  return (
    <PostsProvider>
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
            headerLeft: () => (
              <View>
                {router.canGoBack() && (
                  <TouchableOpacity
                    style={{ paddingLeft: 20 }}
                    disabled={!router.canGoBack()}
                    onPress={() => {
                      router.back();
                    }}
                  >
                    <FontAwesome5 name="arrow-left" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="[postID]"
          options={{ headerShown: true, headerTitle: "Post" }}
        />
        <Stack.Screen
          name="user/[friendUserID]"
          options={{ headerShown: true, headerTitle: "Friend Profile" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ headerShown: true, headerTitle: "Notifications" }}
        />
      </Stack>
    </PostsProvider>
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
