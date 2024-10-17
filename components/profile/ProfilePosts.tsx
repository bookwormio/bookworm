import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";
import Post from "../post/post";
import { usePostsContext } from "../post/PostsContext";
import WormLoader from "../wormloader/WormLoader";

interface ProfilePostsProps {
  userID: string;
}

const ProfilePosts = ({ userID }: ProfilePostsProps) => {
  const { profilePosts, setProfilePosts } = usePostsContext();
  const [loading, setLoading] = useState(true);
  useQuery({
    queryKey: ["usersPosts"],
    queryFn: async () => {
      const profileFeed = await fetchPostsByUserID(userID);
      setProfilePosts(profileFeed);
      setLoading(false);
      return profileFeed;
    },
  });
  const currentDate = new Date();

  if (loading) {
    return (
      <View style={styles.feedLoading}>
        <WormLoader style={{ width: 50, height: 50 }} />
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
                router.push({
                  pathname: `posts/${post.id}`,
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
