import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import Post from "../../components/post/post";
import { usePostsContext } from "../../components/post/PostsContext";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { fetchPostByPostID } from "../../services/firebase-services/PostQueries";
import { useAuth } from "../auth/context";
import WormLoader from "../wormloader/WormLoader";

interface ViewPostProps {
  postID: string;
  fromProfile: boolean;
}

const ViewPost = ({ postID, fromProfile }: ViewPostProps) => {
  const { user } = useAuth();
  const { posts, profilePosts } = usePostsContext();

  const { data: post, isLoading } = useQuery({
    queryKey: ["viewPost", postID],
    queryFn: async () => {
      let findPost;
      if (fromProfile) {
        findPost = profilePosts.find((p) => p.id === postID);
      } else {
        findPost = posts.find((p) => p.id === postID);
      }
      if (findPost === undefined) {
        return await fetchPostByPostID(postID);
      } else {
        return findPost;
      }
    },
  });

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loading}>
          <WormLoader />
        </View>
      )}
      {post != null && !isLoading && (
        <View style={styles.postContainer}>
          <Post
            post={post}
            created={post.created}
            currentDate={new Date()}
            individualPage={true}
            presentComments={() => {}}
            showElipses={user?.uid === post.user.id}
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
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  postContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
});
