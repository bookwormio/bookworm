import React, { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import { useGetAllFullNotifications } from "../../../components/notifications/hooks/useNotificationQueries";
import NotificationItem from "../../../components/notifications/NotificationItem";

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

  if (notifIsLoading || notifdata === null || notifdata === undefined) {
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
  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifdata.map((notif) => {
          return (
            <NotificationItem key={notif.created.toString()} notif={notif} />
          );
        })}
      </ScrollView>
    </View>
  );
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
});

export default NotificationsScreen;
