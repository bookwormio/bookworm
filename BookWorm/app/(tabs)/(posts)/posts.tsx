import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { router } from "expo-router";
import {
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
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
import { fetchPostsForUserFeed } from "../../../services/firebase-services/PostQueries";
import { emptyQuery } from "../../../services/util/queryUtils";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchPosts = async ({
    pageParam = null, // Accepts an optional parameter for pagination
  }: {
    pageParam?: QueryDocumentSnapshot<DocumentData, DocumentData> | null;
  }) => {
    if (user != null) {
      // Fetch posts for the provided user ID with pagination support
      return await fetchPostsForUserFeed(user.uid, pageParam);
    } else {
      console.error("Error: User is null");
      return { posts: [], newLastVisible: null };
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
    getNextPageParam: (lastPage) =>
      lastPage !== null ? lastPage.newLastVisible : null, // Function to get the parameter for fetching the next page
    initialPageParam: null,
  });

  const currentDate = new Date();

  useEffect(() => {
    if (feedPostsData?.pages !== undefined) {
      const allPosts = feedPostsData.pages.reduce(
        (acc, page) => ({
          posts: [...acc.posts, ...page.posts], // Concatenate all posts from different pages
          newLastVisible: page.newLastVisible, // Update the new last visible document snapshot
        }),
        { posts: [], newLastVisible: null }, // Initial accumulator value
      );
      setPosts(allPosts.posts);
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
        data={posts}
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
            fetchNextPage().catch((error) => {
              console.error("Error fetching next page", error);
            });
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
