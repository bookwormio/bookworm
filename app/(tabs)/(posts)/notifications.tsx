import * as Haptics from "expo-haptics";
import React from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useUserID } from "../../../components/auth/context";
import { useGetAllFullNotifications } from "../../../components/notifications/hooks/useNotificationQueries";
import NotificationItem from "../../../components/notifications/NotificationItem";
import WormLoader from "../../../components/wormloader/WormLoader";
import {
  MAX_PULLDOWN_DISTANCE,
  PULLDOWN_ANIMATION_DURATION,
  PULLDOWN_REFRESHING_MAX_HEIGHT,
  PULLDOWN_REFRESHING_MIN_HEIGHT,
} from "../../../constants/constants";

const NotificationsScreen = () => {
  const { userID } = useUserID();

  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: notifdata,
    isLoading: notifIsLoading,
    isError,
    error,
    refetch,
  } = useGetAllFullNotifications(userID);

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
  const refreshContainerStyles = useAnimatedStyle(() => {
    return {
      height: pullDownPosition.value,
      backgroundColor: "#FFFFFF",
    };
  });

  const onRefresh = (closeRefreshAnimation: () => void) => {
    setRefreshing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      (error) => {
        console.error("Error creating haptic", error);
      },
    );
    refetch()
      .then(() => {
        setRefreshing(false);
        closeRefreshAnimation();
      })
      .catch(() => {
        setRefreshing(false);
        closeRefreshAnimation();
        Toast.show({
          type: "error",
          text1: "Error Loading Notifications",
          text2: "Please return to the home page.",
        });
      });
  };

  if (notifIsLoading) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  if (notifdata !== null && notifdata !== undefined) {
    return (
      <View
        style={{
          flex: 1,
        }}
        pointerEvents={refreshing ? "none" : "auto"}
      >
        <Animated.View style={refreshContainerStyles}>
          {refreshing && (
            <View style={styles.topRefresh}>
              <WormLoader style={styles.wormLoader} />
            </View>
          )}
        </Animated.View>
        <Animated.View
          style={styles.container}
          {...panResponderRef.current.panHandlers}
        >
          <Animated.FlatList
            style={styles.scrollContainer}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            data={notifdata}
            renderItem={({ item: notif }) => (
              <NotificationItem key={notif.created.toString()} notif={notif} />
            )}
          ></Animated.FlatList>
        </Animated.View>
      </View>
    );
  } else {
    Toast.show({
      type: "error",
      text1: "Error Loading Notifications",
      text2: "Please return to the home page.",
    });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  notif_container: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: 10,
    paddingTop: 5,
    paddingRight: 40,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
    marginTop: 20,
    flexWrap: "wrap",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  topRefresh: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  wormLoader: {
    width: 50,
    height: 50,
  },
});

export default NotificationsScreen;
