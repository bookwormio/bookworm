import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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

  const fetchPosts = async ({ pageParam = null }) => {
    if (user != null) {
      return await fetchPostsForUserFeed(user.uid, pageParam);
    } else {
      console.error("Error: User is null");
      return [];
    }
  };

  const {
    data: feedPostsData,
    isLoading: isLoadingFeedPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: user != null ? ["userfeedposts", user.uid] : ["userfeedposts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => (lastPage ? lastPage.newLastVisible : null),
    initialPageParam: null,
  });

  const currentDate = new Date();

  useEffect(() => {
    if (feedPostsData) {
      // Concatenate all pages of posts
      const allPosts = feedPostsData.pages.reduce(
        (acc, page) => [...acc, ...page.posts],
        [],
      );
      setPosts(allPosts);
    }
  }, [feedPostsData]);

  const refreshMutation = useMutation({
    mutationFn: emptyQuery,
    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            user != null ? ["userfeedposts", user.uid] : ["userfeedposts"],
        })
        .then(() => {
          setRefreshing(false);
        });
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refreshMutation.mutate();
    // setRefreshing(false); // Set refreshing to false after mutation
  };

  return (
    <View style={styles.container}>
      {isLoadingFeedPosts && !refreshing && (
        <View style={styles.feedLoading}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
      <FlatList
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        data={feedPostsData?.pages.flatMap((page) => page.posts) || []}
        renderItem={({ item: post }) => (
          <TouchableOpacity
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
            <Post
              post={post}
              created={post.created}
              currentDate={currentDate}
            />
          </TouchableOpacity>
        )}
        removeClippedSubviews={true}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="large" color="black" />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.1} // How close to the end to trigger
      />
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
  loadingMore: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20, // Position the loading indicator 20 units from the bottom
    width: "100%", // Ensure it stretches the full width
  },
});
