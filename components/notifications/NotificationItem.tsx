import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ServerNotificationType } from "../../enums/Enums";
import { type FullNotificationModel } from "../../types";
import { useAuth } from "../auth/context";
import BadgeIcon from "../badges/BadgeIcon";
import {
  useNavigateToBadgePage,
  useNavigateToBook,
  useNavigateToPost,
  useNavigateToUser,
} from "../profile/hooks/useRouteHooks";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { useMarkNotificationAsRead } from "./hooks/useNotificationQueries";
import NotificationItemContent from "./NotificationItemContent";
import { calculateTimeSinceNotification } from "./util/notificationUtils";

interface NotifProp {
  notif: FullNotificationModel;
}

const NotificationItem = ({ notif }: NotifProp) => {
  const { user } = useAuth();
  const time = calculateTimeSinceNotification(notif.created.toDate());

  const navigateToBook = useNavigateToBook(notif.bookID);

  const navigateToPost = useNavigateToPost();

  const navigateToUser = useNavigateToUser();

  const navigateToBadgePage = useNavigateToBadgePage(notif.receiver);

  const markNotificationRead = useMarkNotificationAsRead();

  return (
    <TouchableOpacity
      style={styles.notif_container}
      onPress={() => {
        if (notif.read_at == null) {
          markNotificationRead.mutate({ notificationID: notif.notifID });
        }
        if (
          notif.type === ServerNotificationType.LIKE ||
          notif.type === ServerNotificationType.COMMENT
        ) {
          navigateToPost(notif.postID);
        } else if (notif.type === ServerNotificationType.FRIEND_REQUEST) {
          navigateToUser(user?.uid, notif.sender);
        } else if (
          notif.type === ServerNotificationType.RECOMMENDATION ||
          notif.type === ServerNotificationType.BOOK_REQUEST ||
          notif.type === ServerNotificationType.BOOK_REQUEST_RESPONSE
        ) {
          navigateToBook();
        } else if (notif.type === ServerNotificationType.BADGE) {
          navigateToBadgePage();
        }
      }}
    >
      <View style={styles.imageTextContainer}>
        {notif.type !== ServerNotificationType.BADGE ? (
          <TouchableOpacity
            onPress={() => {
              navigateToUser(user?.uid, notif.sender);
            }}
          >
            <ProfilePicture userID={notif.sender} size={50} />
          </TouchableOpacity>
        ) : notif.badgeID != null ? (
          <TouchableOpacity
            onPress={() => {
              navigateToBadgePage();
            }}
          >
            <BadgeIcon
              badgeID={notif.badgeID}
              size={50}
              stylesOverride={styles.badgeStyleOverride}
              sizeAddOverride={15}
            />
          </TouchableOpacity>
        ) : null}
        <NotificationItemContent
          notification={notif}
          time={time}
        ></NotificationItemContent>
        {notif.read_at == null && (
          <View
            style={{
              backgroundColor: "#FB6D0B",
              height: 10,
              width: 10,
              borderRadius: 5,
            }}
          ></View>
        )}
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
    paddingRight: 20,
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
  badgeStyleOverride: {
    borderRadius: 50,
    alignSelf: "flex-start",
  },
});
