import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../../components/auth/context";
import BookWormButton from "../../../components/button/BookWormButton";
import Comment from "../../../components/comment/comment";
import Post from "../../../components/post/post";
import { usePostsContext } from "../../../components/post/PostsContext";
import WormLoader from "../../../components/wormloader/WormLoader";
import { fetchPostsForUserFeed } from "../../../services/firebase-services/PostQueries";
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
  const { posts, setPosts, commentOnPost } = usePostsContext();
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const scrollPosition = useSharedValue(0);
  const pullDownPosition = useSharedValue(0);
  const isReadyToRefresh = useSharedValue(false);
  const onPanRelease = () => {
    pullDownPosition.value = withTiming(isReadyToRefresh.value ? 75 : 0, {
      duration: 180,
    });
    if (isReadyToRefresh.value) {
      isReadyToRefresh.value = false;
      const onRefreshComplete = () => {
        pullDownPosition.value = withTiming(0, { duration: 180 });
      };
      onRefresh(onRefreshComplete);
    }
  };
  const panResponderRef = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (event, gestureState) =>
        scrollPosition.value <= 0 && gestureState.dy >= 0,
      onPanResponderMove: (event, gestureState) => {
        const maxDistance = 150;
        pullDownPosition.value = Math.max(
          Math.min(maxDistance, gestureState.dy),
          0,
        );
        if (
          pullDownPosition.value >= maxDistance / 2 &&
          !isReadyToRefresh.value
        ) {
          isReadyToRefresh.value = true;
        }
        if (
          pullDownPosition.value < maxDistance / 2 &&
          isReadyToRefresh.value
        ) {
          isReadyToRefresh.value = false;
        }
      },
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    }),
  );
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.y;
    },
  });
  const onRefresh = (done: () => void) => {
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
        done();
      })
      .catch((error) => {
        console.error("Error refetching feed posts", error);
        setRefreshing(false);
        done();
      });
  };
  const refreshContainerStyles = useAnimatedStyle(() => {
    return {
      height: pullDownPosition.value,
    };
  });

  useEffect(() => {
    if (feedPostsData != null) {
      const newPosts = feedPostsData.pages.flatMap((page) => page.posts);
      setPosts(newPosts);
    }
  }, [feedPostsData]);

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
      <View
        style={{
          flex: 1,
        }}
        pointerEvents={refreshing ? "none" : "auto"}
      >
        <Animated.View style={[refreshContainerStyles]}>
          {refreshing && (
            <View style={styles.topRefresh}>
              <WormLoader style={{ width: 50, height: 50 }} />
            </View>
          )}
        </Animated.View>
        <Animated.View
          style={[styles.container]}
          {...panResponderRef.current.panHandlers}
        >
          {isLoadingFeedPosts && !refreshing && (
            <View style={styles.feedLoading}>
              <WormLoader />
            </View>
          )}
          <Animated.FlatList
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            data={posts}
            renderItem={({ item: post }) => (
              <TouchableOpacity
                onPress={() => {
                  router.push({ pathname: `/${post.id}` });
                }}
              >
                <Post
                  post={post}
                  created={post.created}
                  currentDate={currentDate}
                  individualPage={false}
                  presentComments={onCommentsPress}
                />
              </TouchableOpacity>
            )}
            removeClippedSubviews={true}
            keyExtractor={(item) => item.id}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingMore}>
                  <WormLoader style={{ width: 50, height: 50 }} />
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
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          />
        </Animated.View>
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
          <BookWormButton
            title="Comment"
            onPress={() => {
              if (activePost != null) {
                setNewComment("");
                commentOnPost(activePost.id, newComment);
              }
            }}
            style={{ paddingHorizontal: 0, maxWidth: 100 }}
          />
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
    paddingLeft: 10,
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
    top: "40%",
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
  commentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  topRefresh: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
