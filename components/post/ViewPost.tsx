import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";
import Post from "../../components/post/post";
import { usePostsContext } from "../../components/post/PostsContext";
import { fetchPostByPostID } from "../../services/firebase-services/PostQueries";
import WormLoader from "../wormloader/WormLoader";

interface ViewPostProps {
  postID: string;
  fromProfile: boolean;
}

const ViewPost = ({ postID, fromProfile }: ViewPostProps) => {
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
        <View style={styles.feedLoading}>
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
