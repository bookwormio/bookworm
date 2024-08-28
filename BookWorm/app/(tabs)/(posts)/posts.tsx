import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import Comment from "../../../components/comment/comment";
import Post from "../../../components/post/post";
import {
  addCommentToPost,
  fetchPostsForUserFeed,
} from "../../../services/firebase-services/PostQueries";
import { type PostModel } from "../../../types";

const Posts = () => {
  const { user } = useAuth();
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
  const commentsModalRef = useRef<BottomSheetModal>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [activePost, setActivePost] = useState<PostModel | null>(null);
  const [posts, setPosts] = useState(
    feedPostsData?.pages.flatMap((page) => page.posts) ?? [],
  );
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const queryClient = useQueryClient();
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

  useEffect(() => {
    if (feedPostsData != null) {
      const newPosts = feedPostsData.pages.flatMap((page) => page.posts);
      setPosts(newPosts);
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
    if (post !== undefined && user != null) {
      const addNewComment = {
        userID,
        first: "Sam",
        text: commentText,
      };
      post.comments.push(addNewComment);
    }
    setPosts([...posts]);
  };

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (user != null && activePost != null) {
        return await addCommentToPost(user.uid, activePost.id, newComment);
      }
    },
    onSuccess: (updatedComments) => {
      if (updatedComments != null) {
        setNewComment("");
        const updatedPost = activePost;
        if (updatedPost != null && activePost != null) {
          updatedPost.comments = updatedComments;
          setActivePost(updatedPost);
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === activePost.id
                ? { ...post, comments: updatedComments }
                : post,
            ),
          );
        }
      }
    },
    onError: () => {
      console.error("Error commenting on post");
    },
  });

  const renderBackdrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const onCommentsPress = (postID: string) => {
    const post = posts.find((p) => p.id === postID);
    if (post !== undefined) {
      setActivePost(post);
      handlePresentModalPress();
    }
  };

  const handlePresentModalPress = useCallback(() => {
    commentsModalRef.current?.present();
  }, []);

  return (
    <BottomSheetModalProvider>
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
                presentComments={onCommentsPress}
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
      <BottomSheetModal
        ref={commentsModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={() => {
          setNewComment("");
        }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.modalBackground}
      >
        <Text style={styles.commentTitle}>Comments</Text>
        <FlatList
          data={activePost?.comments}
          renderItem={({ item: comment }) => <Comment comment={comment} />}
          keyExtractor={(item, index) => item.userID + index}
        />
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            placeholder={`Add a comment to ${activePost?.user.first}'s post`}
            autoCapitalize="none"
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => {
              commentMutation.mutate();
            }}
          >
            <Text style={styles.buttonText}>Comment</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
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
  handleIndicator: {
    backgroundColor: "#DDDDDD",
    width: 50,
  },
  modalBackground: {
    backgroundColor: "white",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  commentInput: {
    flex: 1,
    paddingVertical: 8,
  },
  button: {
    marginLeft: 10,
    backgroundColor: "#FB6D0B",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#fb6d0b80",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
