import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BOOKWORM_ORANGE } from "../../constants/constants";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";
import Post from "../post/post";
import WormLoader from "../wormloader/WormLoader";
import { useNavigateToPost } from "./hooks/useRouteHooks";

interface FriendProfilePostsProps {
  userID: string;
}

const FriendProfilePosts = ({ userID }: FriendProfilePostsProps) => {
  const navigateToPost = useNavigateToPost();
  const { data: profilePosts, isLoading: isProfilePostsLoading } = useQuery({
    queryKey: userID != null ? ["friendPosts", userID] : ["friendPosts"],
    queryFn: async () => {
      return await fetchPostsByUserID(userID);
    },
  });
  const currentDate = new Date();

  if (isProfilePostsLoading) {
    return (
      <View style={styles.feedLoading}>
        <WormLoader style={{ width: 50, height: 50 }} />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {profilePosts != null && profilePosts.length > 0 ? (
          profilePosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() => {
                navigateToPost(post.id);
              }}
            >
              <Post
                key={post.id}
                post={post}
                created={post.created}
                currentDate={currentDate}
                individualPage={false}
                presentComments={() => {
                  navigateToPost(post.id);
                }}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>No posts to display.</Text>
          </View>
        )}
      </View>
    );
  }
};

export default FriendProfilePosts;

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
  noData: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
    paddingTop: 10,
  },
  makePost: {
    fontSize: 17,
    color: BOOKWORM_ORANGE,
    paddingTop: 10,
  },
  noDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
  },
});
