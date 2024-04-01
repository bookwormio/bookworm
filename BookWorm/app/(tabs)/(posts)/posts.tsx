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
import { fetchPostsForUserFeed } from "../../../services/firebase-services/queries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      if (user != null) {
        const fetchedPosts = await fetchPostsForUserFeed(user.uid);
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setFeedLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts()
      .then(() => {
        setRefreshing(false);
      })
      .catch((error) => {
        console.log("Error refreshing posts" + error);
      });
  };

  useEffect(() => {
    void fetchPosts(); // Initial fetch of posts when component mounts
  }, []);

  return (
    <View style={styles.container}>
      {feedLoading && !refreshing && (
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
