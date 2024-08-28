import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

const Posts = () => {
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

  const queryKey =
    user != null ? ["userfeedposts", user.uid] : ["userfeedposts"];

  const {
    data: feedPostsData,
    isLoading: isLoadingFeedPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) =>
      lastPage !== null ? lastPage.newLastVisible : null, // Function to get the parameter for fetching the next page
    initialPageParam: null,
  });

  const currentDate = new Date();

  const onRefresh = () => {
    setRefreshing(true);

    // Reset the query data to only the first page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryClient.setQueryData(queryKey, (data: any) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));

    refetch()
      .then(() => {
        setRefreshing(false);
      })
      .catch((error) => {
        console.error("Error refetching feed posts", error);
        setRefreshing(false);
      });
  };

  const [posts, setPosts] = useState(
    feedPostsData?.pages.flatMap((page) => page.posts) ?? [],
  );
  useEffect(() => {
    if (feedPostsData != null) {
      setPosts(feedPostsData.pages.flatMap((page) => page.posts));
    }
  }, [feedPostsData]);

  const likePost = (postID: string, userID: string) => {
    const post = posts.find((p) => p.id === postID);
    if (post !== undefined) {
      if (post.likes.includes(userID)) {
        post.likes.splice(post.likes.indexOf(userID), 1);
      } else {
        post.likes.push(userID);
      }
      setPosts([...posts]);
    }
  };

  const commentOnPost = (
    postID: string,
    userID: string,
    commentText: string,
  ) => {
    const post = posts.find((p) => p.id === postID);
    if (post !== undefined) {
      const newComment = {
        userID,
        first: "First Name",
        text: commentText,
      };
      post.comments.push(newComment);
    }
    setPosts([...posts]);
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
              showComments={false}
              likePost={likePost}
              commentOnPost={commentOnPost}
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
    paddingRight: 16,
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
    bottom: 20,
    width: "100%",
  },
});
