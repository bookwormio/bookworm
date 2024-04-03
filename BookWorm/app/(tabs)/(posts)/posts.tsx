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
import { fetchPostsForUserFeed } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingMorePosts, setFetchingMorePosts] = useState(false);
  const [lastVisiblePost, setLastVisiblePost] = useState<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);
  const { user } = useAuth();

  const initialFetchPosts = async () => {
    setFeedLoading(true);
    try {
      if (user != null) {
        const { posts: fetchedPosts, newLastVisible: lastVisible } =
          await fetchPostsForUserFeed(user.uid, null);
        if (fetchedPosts.length > 0 && lastVisible != null) {
          setLastVisiblePost(lastVisible); // Update last visible post
          setPosts(fetchedPosts);
        }
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setFeedLoading(false);
    }
  };

  const loadMorePosts = async () => {
    setFetchingMorePosts(true);
    try {
      if (user != null) {
        const { posts: fetchedPosts, newLastVisible: lastVisible } =
          await fetchPostsForUserFeed(user.uid, lastVisiblePost);
        if (fetchedPosts.length > 0 && lastVisible != null) {
          setLastVisiblePost(lastVisible); // Update last visible post
          setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]); // Append new posts to existing posts
        }
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setFetchingMorePosts(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    initialFetchPosts()
      .then(() => {
        setRefreshing(false);
      })
      .catch((error) => {
        console.log("Error refreshing posts" + error);
      });
  };

  useEffect(() => {
    void initialFetchPosts(); // Initial fetch of posts when component mounts
  }, []);

  return (
    <View style={styles.container}>
      {feedLoading && !refreshing && (
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
            <Post post={post} created={post.created} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          fetchingMorePosts && !refreshing ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="large" color="black" />
            </View>
          ) : null
        }
        onEndReached={loadMorePosts} // Fetch more data when end is reached
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
    alignItems: "center",
    justifyContent: "center",
    bottom: 20, // Position the loading indicator 20 units from the bottom
    width: "100%", // Ensure it stretches the full width
  },
});
