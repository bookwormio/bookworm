import { FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../components/auth/context";
import { NotificationType } from "../../../enums/Enums";
import { getAllFullNotifications } from "../../../services/firebase-services/NotificationQueries";

const NotificationsScreen = () => {
  const handlePress = () => {
    alert("Hello World! This is a notification.");
  };

  const { user } = useAuth();

  const { data: notifdata, isLoading: notifIsLoading } = useQuery({
    queryKey: user != null ? ["notifications", user.uid] : ["notifications"],
    queryFn: async () => {
      if (user != null) {
        return await getAllFullNotifications(user.uid);
      } else {
        return [];
      }
    },
  });

  if (notifIsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  } else {
    if (notifdata !== null && notifdata !== undefined) {
      return (
        <View style={styles.container}>
          <FlatList
            style={{ flex: 1, width: "100%" }}
            data={notifdata}
            renderItem={({ item }) => {
              const diffTime = Math.abs(
                new Date().getTime() - item.created.toDate().getTime(),
              );
              const seconds = diffTime / 1000;
              const minutes = diffTime / (1000 * 60);
              const hours = diffTime / (1000 * 60 * 60);
              const days = diffTime / (1000 * 60 * 60 * 24);
              const weeks = diffTime / (1000 * 60 * 60 * 24 * 7);
              let time = "";
              if (seconds <= 60) {
                time = Math.round(seconds).toString() + "s";
              } else if (minutes <= 60) {
                time = Math.round(minutes).toString() + "m";
              } else if (hours <= 24) {
                time = Math.round(hours).toString() + "h";
              } else if (days <= 7) {
                time = Math.round(days).toString() + "d";
              } else {
                time = Math.round(weeks).toString() + "w";
              }
              return (
                <TouchableOpacity
                  style={styles.notif_container}
                  onPress={() => {
                    if (
                      item.type === NotificationType.LIKE ||
                      item.type === NotificationType.COMMENT
                    ) {
                      router.push({
                        pathname: `/${item.postID}`,
                      });
                    } else if (item.type === NotificationType.FRIEND_REQUEST) {
                      router.push({
                        pathname: `/user/${item.sender}`,
                      });
                    }
                  }}
                >
                  <View style={styles.imageTextContainer}>
                    <View style={styles.defaultImageContainer}>
                      {item.sender_img !== "" ? (
                        <Image
                          style={styles.defaultImage}
                          source={{ uri: item.sender_img }}
                          resizeMode="cover"
                        />
                      ) : (
                        <FontAwesome5 name="user" size={40} color="black" />
                      )}
                    </View>
                    <View style={styles.notifTextContainer}>
                      <Text style={styles.notifTitle}>
                        {item.type === NotificationType.FRIEND_REQUEST
                          ? "NEW FOLLOWER"
                          : ""}
                        {item.type === NotificationType.COMMENT
                          ? "NEW COMMENT"
                          : ""}
                        {item.type === NotificationType.LIKE ? "NEW LIKE" : ""}
                      </Text>
                      <Text style={styles.notifMessage}>
                        <Text style={{ fontWeight: "bold" }}>
                          {item.sender_name}
                        </Text>
                        <Text>
                          {" "}
                          {item.message}
                          {item.type === NotificationType.COMMENT
                            ? item.comment
                            : ""}{" "}
                        </Text>
                        <Text style={{ color: "grey" }}>{time}</Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      );
    } else {
      alert("Something went wrong, return to home page");
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Notifications Page</Text>
          <Button title="Show Alert" onPress={handlePress} />
        </View>
      );
    }
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
