import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import Post from "../../../components/post/post";
import { fetchPostByPostID } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const ViewPost = () => {
  const { postID } = useLocalSearchParams();
  const [post, setPost] = useState<PostModel | null>(null);
  const [preLoad, setPreLoading] = useState(true);

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey:
      postID !== null && typeof postID === "string"
        ? ["postdata", postID]
        : ["postdata"],
    queryFn: async () => {
      if (postID !== undefined && typeof postID === "string") {
        return await fetchPostByPostID(postID);
      } else {
        // Return default value when user is null
        return null;
      }
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  useEffect(() => {
    setPreLoading(postLoading);
  }, [postLoading]);

  useEffect(() => {
    if (!preLoad) {
      try {
        if (postData == null) {
          Toast.show({
            type: "error",
            text1: "Error: Couldn't Find Post",
            onShow: () => {
              setTimeout(() => {
                router.back();
              }, 1500);
            },
          });
        } else {
          setPost(postData);
        }
      } catch (error) {
        console.error("Error fetching post", error);
      }
    }
  }, [preLoad]);

  return (
    <View style={styles.container}>
      <Toast />
      {postLoading && (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      {post != null && !postLoading && (
        <Post post={post} created={post.created} />
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
});
