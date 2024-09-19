import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  NotificationMessageMap,
  NotificationTypeMap,
  ServerNotificationType,
} from "../../enums/Enums";
import { type FullNotificationModel } from "../../types";
import { generateUserRoute } from "../../utilities/routeUtils";
import { useAuth } from "../auth/context";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { calculateTimeSinceNotification } from "./util/notificationUtils";

interface NotifProp {
  notif: FullNotificationModel;
}

const NotificationItem = ({ notif }: NotifProp) => {
  const { user } = useAuth();
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
          const userRoute = generateUserRoute(
            user?.uid,
            notif.sender,
            undefined,
          );
          if (userRoute != null) {
            router.push(userRoute);
          }
        } else if (notif.type === ServerNotificationType.RECOMMENDATION) {
          router.push({
            pathname: `/postsbook/${notif.bookID}`,
          });
        } else if (notif.type === ServerNotificationType.RECOMMENDATION) {
          router.push({
            pathname: `/postsbook/${notif.bookID}`,
          });
        }
      }}
    >
      <View style={styles.imageTextContainer}>
        <TouchableOpacity
         
          onPress={() => {
            const userRoute = generateUserRoute(
              user?.uid,
              notif.sender,
              undefined,
            );
            if (userRoute != null) {
              router.push(userRoute);
            }
          }}
        >
          <ProfilePicture userID={notif.sender} size={50} />
        </TouchableOpacity>
        <View style={styles.notifTextContainer}>
          <Text style={styles.notifTitle}>{notifDisplay}</Text>
          <Text style={styles.notifMessage}>
            <Text style={{ fontWeight: "bold" }}>{notif.sender_name}</Text>
            <Text>
              {" "}
              {NotificationMessageMap[notif.type]}
              {notif.type === ServerNotificationType.COMMENT
                ? " " + notif.comment
                : ""}
              {notif.type === ServerNotificationType.RECOMMENDATION
                ? " " + notif.bookTitle
                : ""}
              {notif.custom_message != null && notif.custom_message !== ""
                ? " - " + notif.custom_message
                : ""}{" "}
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
    paddingBottom: 15,
    paddingTop: 15,
    paddingRight: 40,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  imageTextContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically in the center
    marginLeft: 20, // Adjust as needed
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
