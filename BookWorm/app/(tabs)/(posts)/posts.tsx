import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import Post from "../../../components/post/post";
import {
  emptyQuery,
  fetchPostsForUserFeed,
} from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: feedPostsData, isLoading: isLoadingFeedPosts } = useQuery({
    queryKey: user != null ? ["userfeedposts", user.uid] : ["userfeedposts"],
    queryFn: async () => {
      if (user != null) {
        const posts = await fetchPostsForUserFeed(user.uid);
        setRefreshing(false);
        return posts;
      } else {
        return [];
      }
    },
  });

  useEffect(() => {
    if (feedPostsData !== undefined) {
      setPosts(feedPostsData);
    }
  }, [feedPostsData]);

  const refreshMutation = useMutation({
    mutationFn: emptyQuery,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          user != null ? ["userfeedposts", user.uid] : ["userfeedposts"],
      });
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refreshMutation.mutate();
  };

  return (
    <View style={styles.container}>
      {isLoadingFeedPosts && !refreshing && (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((post: PostModel, index: number) => (
          <View key={index}>
            <TouchableOpacity
              key={index}
              onPress={() => {
                router.push({
                  pathname: `/${post.id}`,
                  params: {
                    post,
                    created: post.created,
                  },
                });
              }}
            >
              <Post post={post} created={post.created} />
            </TouchableOpacity>
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
  feedLoading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "50%",
  },
});
