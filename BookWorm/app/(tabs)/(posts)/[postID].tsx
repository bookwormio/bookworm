import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import Post from "../../../components/post/post";
import { usePostsContext } from "../../../components/post/PostsContext";
import ViewPost from "../../../components/post/ViewPost";
import { fetchPostByPostID } from "../../../services/firebase-services/PostQueries";
import { type PostModel } from "../../../types";

const ViewPostFromFeed = () => {
  const { postID } = useLocalSearchParams();
  const [post, setPost] = useState<PostModel | null>(null);
  const [preLoad, setPreLoading] = useState(true);
  const { posts } = usePostsContext();

  const postMutation = useMutation({
    mutationFn: async () => {
      if (postID !== undefined && typeof postID === "string") {
        return await fetchPostByPostID(postID);
      } else {
        return null;
      }
    },
    onSuccess: (fetchedPost) => {
      setPost(fetchedPost);
      setPreLoading(false);
    },
  });

  useEffect(() => {
    const findPost = posts.find((p) => p.id === postID);
    if (findPost !== undefined) {
      setPost(findPost);
      setPreLoading(false);
    } else {
      postMutation.mutate();
    }
  }, [postID, posts, postMutation]);

  return (
    <View style={styles.container}>
      <Toast />
      {preLoad && (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      {post != null && !preLoad && (
        <View style={styles.postContainer}>
          <Post
            post={post}
            created={post.created}
            currentDate={new Date()}
            individualPage={true}
            presentComments={() => {}}
          />
        </View>
      )}
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
  postContainer: {
    flex: 1,
    width: "100%",
  },
});
