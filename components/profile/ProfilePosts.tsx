import { useQuery } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { fetchPostsByUserID } from "../../services/firebase-services/PostQueries";
import Post from "../post/post";
import { usePostsContext } from "../post/PostsContext";
import WormLoader from "../wormloader/WormLoader";
import { useNavigateToPost } from "./hooks/useRouteHooks";

interface ProfilePostsProps {
  userID: string;
}

const ProfilePosts = ({ userID }: ProfilePostsProps) => {
  const { setProfilePosts } = usePostsContext();

  const navigateToPost = useNavigateToPost();

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
        {userProfilePosts?.map((post) => (
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
        ))}
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
});
