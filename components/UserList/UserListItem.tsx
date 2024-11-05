import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";
import { useAuth } from "../auth/context";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";
import FollowButton from "./FollowButton";

interface UserListItemProps {
  userToDisplay: UserSearchDisplayModel;
  showFollowStatus?: boolean;
}

const UserListItem = ({
  userToDisplay: userInfo,
  showFollowStatus = false,
}: UserListItemProps) => {
  const { user } = useAuth();

  const navigateToUser = useNavigateToUser(user?.uid, userInfo.id);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigateToUser();
      }}
    >
      <View style={styles.imageContainer}>
        <ProfilePicture userID={userInfo.id} size={40} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.userInfoRow}>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {userInfo.firstName} {userInfo.lastName}
          </Text>
          {showFollowStatus && (
            <FollowButton
              friendUserID={userInfo.id}
              textStyle={{
                fontSize: 12,
              }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 100,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1, // Allow text to shrink if needed
    marginRight: 10, // Space between name and button
  },
  placeholderImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    resizeMode: "cover",
    borderRadius: 100,
  },
});

export default UserListItem;
