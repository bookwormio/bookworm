import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import Post from "../../../components/post/post";
import { fetchUsersFeed } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user != null) {
      fetchUsersFeed(user?.uid)
        .then((fetchedPosts) => {
          setPosts(fetchedPosts);
        })
        .catch((error) => {
          alert("Error fetching feed: " + error);
        });
    }
  }, []);

  return (
    <View style={styles.container}>
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
