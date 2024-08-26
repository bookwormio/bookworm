import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import Post from "../../../components/post/post";
import { POSTS_ROUTE_PREFIX } from "../../../constants/constants";
import { fetchPostByPostID } from "../../../services/firebase-services/PostQueries";
import { type PostModel } from "../../../types";

const ViewPost = () => {
  const { user } = useAuth();
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
      {/* TODO: Down the user's name should just be clickable instead of a button */}
      {post != null && !postLoading && (
        <View style={styles.postContainer}>
          <Post
            post={post}
            created={post.created}
            currentDate={new Date()}
            showComments={true}
          />
          {post?.user.id !== user?.uid && (
            <View style={styles.outerButtonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (user != null) {
                    router.push({
                      pathname: `/${POSTS_ROUTE_PREFIX}/user/${post?.user.id}`,
                    });
                  } else {
                    console.error("User DNE");
                  }
                }}
              >
                <Text style={styles.buttonText}>{"View Profile"}</Text>
              </TouchableOpacity>
            </View>
          )}
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
  button: {
    backgroundColor: "#FB6D0B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  outerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
});
