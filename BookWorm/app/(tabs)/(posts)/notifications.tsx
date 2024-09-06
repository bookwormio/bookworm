import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import { useGetAllFullNotifications } from "../../../components/notifications/hooks/useNotificationQueries";
import { calculateTimeSinceNotification } from "../../../components/notifications/util/notificationUtils";
import { NotificationType } from "../../../enums/Enums";

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    data: notifdata,
    isLoading: notifIsLoading,
    isError,
    error,
    refetch,
  } = useGetAllFullNotifications(user?.uid ?? "");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
        Toast.show({
          type: "error",
          text1: "Error Loading Notifications",
          text2: "Please return to the home page.",
        });
      });
  }, [refetch]);

  if (notifIsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
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
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1, width: "100%" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifdata.map((notif) => {
            const time = calculateTimeSinceNotification(notif.created.toDate());
            return (
              <TouchableOpacity
                key={notif.created.toString()}
                style={styles.notif_container}
                onPress={() => {
                  if (
                    notif.type === NotificationType.LIKE ||
                    notif.type === NotificationType.COMMENT
                  ) {
                    router.push({
                      pathname: `/${notif.postID}`,
                    });
                  } else if (notif.type === NotificationType.FRIEND_REQUEST) {
                    router.push({
                      pathname: `/user/${notif.sender}`,
                    });
                  }
                }}
              >
                <View style={styles.imageTextContainer}>
                  <View style={styles.defaultImageContainer}>
                    {notif.sender_img !== "" ? (
                      <Image
                        style={styles.defaultImage}
                        source={{ uri: notif.sender_img }}
                        resizeMode="cover"
                      />
                    ) : (
                      <FontAwesome5 name="user" size={40} color="black" />
                    )}
                  </View>
                  <View style={styles.notifTextContainer}>
                    <Text style={styles.notifTitle}>
                      {notif.type === NotificationType.FRIEND_REQUEST
                        ? "NEW FOLLOWER"
                        : ""}
                      {notif.type === NotificationType.COMMENT
                        ? "NEW COMMENT"
                        : ""}
                      {notif.type === NotificationType.LIKE ? "NEW LIKE" : ""}
                    </Text>
                    <Text style={styles.notifMessage}>
                      <Text style={{ fontWeight: "bold" }}>
                        {notif.sender_name}
                      </Text>
                      <Text>
                        {" "}
                        {notif.message}
                        {notif.type === NotificationType.COMMENT
                          ? notif.comment
                          : ""}{" "}
                      </Text>
                      <Text style={{ color: "grey" }}>{time}</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  } else {
    alert("Something went wrong, return to home page");
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
  defaultImageContainer: {
    backgroundColor: "#d3d3d3",
    height: 55,
    width: 55,
    borderColor: "black",
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  defaultImage: {
    height: "100%", // Adjust the size of the image as needed
    width: "100%", // Adjust the size of the image as needed
    borderRadius: 30, // Make the image circular
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
  notifTextContainer: {
    flexDirection: "column",
    flex: 1,
  },
  notifTitle: {
    fontWeight: "bold",
    fontSize: 18,
    paddingLeft: 20,
    paddingBottom: 5,
  },
  notifMessage: {
    paddingLeft: 20,
    flexWrap: "wrap",
    flex: 1,
    fontSize: 16,
  },
});

export default NotificationsScreen;
