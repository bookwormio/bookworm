import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../components/auth/context";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";
import Post from "../post/post";
import { usePostsContext } from "../post/PostsContext";

const ProfilePosts = () => {
  const { user } = useAuth();
  const { profilePosts, setProfilePosts } = usePostsContext();
  const [loading, setLoading] = useState(true);
  useQuery({
    queryKey: ["usersPosts"],
    queryFn: async () => {
      const profileFeed = await fetchPostsByUserID(user?.uid);
      setProfilePosts(profileFeed);
      setLoading(false);
      return profileFeed;
    },
  });
  const currentDate = new Date();

  if (loading) {
    return (
      <View style={styles.feedLoading}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {profilePosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            onPress={() => {
              router.push({
                pathname: `posts/${post.id}`,
              });
            }}
          >
            <Post
              key={post.id}
              post={post}
              created={post.created}
              currentDate={currentDate}
              individualPage={false}
              presentComments={() => {
                router.replace({
                  pathname: `/${post.id}`,
                });
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
};

export default ProfilePosts;

const styles = StyleSheet.create({
  container: {},
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  feedLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
