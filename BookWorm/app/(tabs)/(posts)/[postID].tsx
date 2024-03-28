import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Post from "../../../components/post/post";
import { fetchPostByPostID } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const ViewPost = () => {
  const { postID } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<PostModel | null>(null);

  const fetchPost = async () => {
    setLoading(true);
    try {
      if (postID !== undefined && typeof postID === "string") {
        const fetchedPost = await fetchPostByPostID(postID);
        setPost(fetchedPost);
      }
    } catch (error) {
      console.error("Error fetching post", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPost();
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      {post != null && !loading && <Post post={post} created={post.created} />}
      {post == null && !loading && <Text>Post Not Found.</Text>}
    </View>
  );
};

export default ViewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  feedLoading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
});
