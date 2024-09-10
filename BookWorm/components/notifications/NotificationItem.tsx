import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NotificationTypeMap, ServerNotificationType } from "../../enums/Enums";
import { type FullNotificationModel } from "../../types";
import { calculateTimeSinceNotification } from "./util/notificationUtils";

interface NotifProp {
  notif: FullNotificationModel;
}

const NotificationItem = ({ notif }: NotifProp) => {
  const time = calculateTimeSinceNotification(notif.created.toDate());
  const notifDisplay =
    NotificationTypeMap[notif.type as ServerNotificationType];
  return (
    <TouchableOpacity
      style={styles.notif_container}
      onPress={() => {
        if (
          notif.type === ServerNotificationType.LIKE ||
          notif.type === ServerNotificationType.COMMENT
        ) {
          router.push({
            pathname: `/${notif.postID}`,
          });
        } else if (notif.type === ServerNotificationType.FRIEND_REQUEST) {
          router.push({
            pathname: `/user/${notif.sender}`,
          });
        } else if (notif.type === ServerNotificationType.RECOMMENDATION) {
          router.push({
            pathname: `/postsbook/${notif.bookID}`,
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
          <Text style={styles.notifTitle}>{notifDisplay}</Text>
          <Text style={styles.notifMessage}>
            <Text style={{ fontWeight: "bold" }}>{notif.sender_name}</Text>
            <Text>
              {" "}
              {notif.message}
              {notif.type === ServerNotificationType.COMMENT
                ? " " + notif.comment
                : ""}
              {notif.type === ServerNotificationType.RECOMMENDATION
                ? " " + notif.bookTitle
                : ""}
              {notif.custom_message !== "" ? " - " + notif.custom_message : ""}{" "}
            </Text>
            <Text style={{ color: "grey" }}>{time}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  notif_container: {
    flex: 1,
    flexDirection: "column",
    paddingBottom: 10,
    paddingTop: 5,
    paddingRight: 40,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
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
    fontSize: 15,
  },
});
