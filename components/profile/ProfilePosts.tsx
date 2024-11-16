import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";
import Post from "../post/post";
import { usePostsContext } from "../post/PostsContext";
import WormLoader from "../wormloader/WormLoader";
import { useNavigateToPost } from "./hooks/useRouteHooks";
import { useRouter } from "expo-router";
import { CREATE_ROUTE_PREFIX } from "../../constants/constants";

interface ProfilePostsProps {
  userID: string;
}

const ProfilePosts = ({ userID }: ProfilePostsProps) => {
  const { setProfilePosts } = usePostsContext();

  const navigateToPost = useNavigateToPost();
  const router = useRouter();
  const navigateToMakePostPage = () => {
    router.push({ pathname: CREATE_ROUTE_PREFIX });
  };

  const { data: userProfilePosts, isLoading: isUserProfilePostsLoading } =
    useQuery({
      queryKey: userID != null ? ["userPosts", userID] : ["userPosts"],
      queryFn: async () => {
        const posts = await fetchPostsByUserID(userID);
        setProfilePosts(posts);
        return posts;
      },
    });

  const currentDate = new Date();

  if (isUserProfilePostsLoading) {
    return (
      <View style={styles.feedLoading}>
        <WormLoader style={{ width: 50, height: 50 }} />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {userProfilePosts != null && userProfilePosts.length > 0 ? (
          userProfilePosts.map((post) => (
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
            <TouchableOpacity onPress={navigateToMakePostPage}>
              <Text style={styles.makePost}> Make a post</Text>
            </TouchableOpacity>
          </View>
        )}
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
  noData: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
    paddingTop: 10,
  },
  makePost: {
    fontSize: 17,
    color: "#FB6D0B",
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
