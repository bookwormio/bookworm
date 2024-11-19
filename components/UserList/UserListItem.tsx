import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { closeKeyboardThen } from "../../app/util/keyboardHelpers";
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

  const navigateToUser = useNavigateToUser();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        closeKeyboardThen(() => {
          navigateToUser(user?.uid, userInfo.id);
        });
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
            <View style={styles.followButtonContainer}>
              <FollowButton
                friendUserID={userInfo.id}
                textStyle={{
                  fontSize: 12,
                }}
              />
            </View>
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
    flexGrow: 1,
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
    flex: 6,
    marginRight: 10,
  },
  followButtonContainer: {
    flex: 4,
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
