import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import Post from "../../../components/post/post";
import { fetchPostsForUserFeed } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      if (user != null) {
        const fetchedPosts = await fetchPostsForUserFeed(user.uid);
        console.log(fetchedPosts);
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const handleRefresh = () => {
    void fetchPosts(); // Call fetchPosts to refresh posts
  };

  useEffect(() => {
    void fetchPosts(); // Initial fetch of posts when component mounts
  }, []);

  return (
    <View style={styles.container}>
      {/* TODO: Make this a swipe up to refresh */}
      <Button title="Refresh" onPress={handleRefresh} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {posts.map((post: PostModel, index: number) => (
          <View key={index}>
            <Post post={post} created={post.created} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Posts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
});
