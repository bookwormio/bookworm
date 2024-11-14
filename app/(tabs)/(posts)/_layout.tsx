import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import BackButton from "../../../components/backbutton/BackButton";

const PostsLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          name="user/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "Friend Profile",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            headerTitle: "Notifications",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsbook/[bookID]"
          options={{
            headerShown: true,
            headerTitle: "Book",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsfollow/[friendUserID]"
          options={{
            headerShown: true,
            headerTitle: "Follow Details",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="viewposts/[postID]"
          options={{
            headerShown: true,
            headerTitle: "Post",
            headerLeft: () => <BackButton waitForKeyBoardDismiss={true} />,
          }}
        />
        <Stack.Screen
          name="postsrecommendation/[friendUserID]"
          options={{
            presentation: "modal",
            headerTitle: "Leave a Recommendation",
          }}
        />
        <Stack.Screen
          name="postsbooklist/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Book List",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="postsbadge/[userID]"
          options={{
            headerShown: true,
            headerTitle: "Badges",
            headerLeft: () => <BackButton />,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
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
