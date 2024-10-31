import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";
import { useAuth } from "../auth/context";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";

interface UserListItemProps {
  user: UserSearchDisplayModel;
  routePrefix: string;
}

const UserListItem = ({ user: userInfo, routePrefix }: UserListItemProps) => {
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
        <ProfilePicture
          userID={userInfo.id}
          size={40}
          overrideProfilePic={userInfo.profilePicURL}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          <Text style={styles.userName}>
            {userInfo.firstName} {userInfo.lastName}
          </Text>
        </Text>
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
  title: {
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
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
