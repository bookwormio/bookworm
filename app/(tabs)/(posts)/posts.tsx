import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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
  Keyboard,
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
import DataSnapShot from "../../../components/datasnapshot/DataSnapShot";
import Post from "../../../components/post/post";
import { usePostsContext } from "../../../components/post/PostsContext";
import { useNavigateToPost } from "../../../components/profile/hooks/useRouteHooks";
import WormLoader from "../../../components/wormloader/WormLoader";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { fetchPostsForUserFeed } from "../../../services/firebase-services/PostQueries";
import { type PostModel } from "../../../types";

// limits the height when refreshing
const MAX_PULLDOWN_DISTANCE = 150;
// duration when decreasing the height from the users pull down distance to the refresh container height and closure
const PULLDOWN_ANIMATION_DURATION = 180;
// height of the pull down container when refreshing
const PULLDOWN_REFRESHING_MAX_HEIGHT = 75;
// height of the pull down container when closed
const PULLDOWN_REFRESHING_MIN_HEIGHT = 0;

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
  // current scroll position throughout the feed
  const scrollPosition = useSharedValue(0);
  // position of the pull down container above the feed
  const pullDownPosition = useSharedValue(0);
  // whether the user has pulled down far enough to refresh
  const isReadyToRefresh = useSharedValue(false);
  // handler when the user releases the refresh gesture
  const onPanRelease = () => {
    // decreases the height of the pull down container over 180ms to either fit the animation or close the container
    pullDownPosition.value = withTiming(
      isReadyToRefresh.value
        ? PULLDOWN_REFRESHING_MAX_HEIGHT
        : PULLDOWN_REFRESHING_MIN_HEIGHT,
      {
        duration: PULLDOWN_ANIMATION_DURATION,
      },
    );
    // triggers the refresh and closes the container afterwards
    if (isReadyToRefresh.value) {
      isReadyToRefresh.value = false;
      const onRefreshComplete = () => {
        pullDownPosition.value = withTiming(0, {
          duration: PULLDOWN_ANIMATION_DURATION,
        });
      };
      onRefresh(onRefreshComplete);
    }
  };
  // pan responder monitors user gestures on the feed
  const panResponderRef = React.useRef(
    PanResponder.create({
      // decides if the pan responder should react to the gesture (user scrolls above the feed)
      onMoveShouldSetPanResponder: (event, gestureState) =>
        scrollPosition.value <= 0 && gestureState.dy >= 0,
      // if the criteria for the gesture is met, trigger a refresh if applicable
      onPanResponderMove: (event, gestureState) => {
        // sets the height of the pull down container during the gesture
        pullDownPosition.value = Math.max(
          Math.min(MAX_PULLDOWN_DISTANCE, gestureState.dy),
          PULLDOWN_REFRESHING_MIN_HEIGHT,
        );
        // if the user has pulled down enough and the page isn't already refreshing, refresh the feed
        if (
          pullDownPosition.value >= MAX_PULLDOWN_DISTANCE / 2 &&
          !isReadyToRefresh.value
        ) {
          isReadyToRefresh.value = true;
        }
        // if the user hasn't pulled down enough but the page is already refreshing, stop refreshing
        if (
          pullDownPosition.value < MAX_PULLDOWN_DISTANCE / 2 &&
          isReadyToRefresh.value
        ) {
          isReadyToRefresh.value = false;
        }
      },
      // triggers refresh after the gesture is released
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    }),
  );
  // monitors the users current scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.y;
    },
  });
  // refreshes posts feed and triggers refresh container closure
  const onRefresh = (closeRefreshAnimation: () => void) => {
    setRefreshing(true);
    // Reset the query data to only the first page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryClient
      .invalidateQueries({ queryKey: ["bookshelves", user?.uid] })
      .catch((error) => {
        console.error("Error invalidating queries:", error);
      });
    queryClient
      .invalidateQueries({ queryKey: ["pagesData", user?.uid] })
      .catch((error) => {
        console.error("Error invalidating queries:", error);
      });
    queryClient.setQueryData(queryKey, (data: any) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch()
      .then(() => {
        setRefreshing(false);
        closeRefreshAnimation();
      })
      .catch((error) => {
        console.error("Error refetching feed posts", error);
        setRefreshing(false);
        closeRefreshAnimation();
      });
  };
  // style for the pull down container
  const refreshContainerStyles = useAnimatedStyle(() => {
    return {
      height: pullDownPosition.value,
      backgroundColor: "#FFFFFF",
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

  Keyboard.dismiss();

  const navigateToPost = useNavigateToPost();

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
            data={posts}
            renderItem={({ item: post }) => (
              <TouchableOpacity
                onPress={() => {
                  navigateToPost(post.id);
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
            ListHeaderComponent={
              !(user == null) ? (
                <DataSnapShot
                  userID={user?.uid ?? ""}
                  isLoadingOther={isLoadingFeedPosts}
                />
              ) : null
            }
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
    justifyContent: "center",
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
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
    backgroundColor: "#FFFFFF",
  },
});
