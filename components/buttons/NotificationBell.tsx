import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BOOKWORM_ORANGE } from "../../constants/constants";
import { useUserID } from "../auth/context";
import { useGetUnreadNotificationCount } from "../notifications/hooks/useNotificationQueries";
import { useNavigateToNotificationsPage } from "../profile/hooks/useRouteHooks";

const NotificationBell = () => {
  const { userID } = useUserID();
  const { data: unreadCount, isSuccess: isSuccessUnreadCount } =
    useGetUnreadNotificationCount(userID);

  const navigateToNotificationsPage = useNavigateToNotificationsPage();

  return (
    <TouchableOpacity
      onPress={() => {
        navigateToNotificationsPage();
      }}
      disabled={false}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="bell" size={20} color={BOOKWORM_ORANGE} />
        {isSuccessUnreadCount && unreadCount > 0 && (
          <Text style={styles.badge}>{unreadCount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationBell;

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    paddingRight: 10,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -4,
    color: BOOKWORM_ORANGE,
    fontSize: 12,
    minWidth: 20,
    height: 16,
    borderRadius: 8,
    textAlign: "left",
    overflow: "hidden",
    paddingLeft: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
