import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";

interface UserListItemProps {
  user: UserSearchDisplayModel;
}

const UserListItem = ({ user }: UserListItemProps) => {
  const handleUserClick = ({ user }: { user: UserSearchDisplayModel }) => {
    router.push({
      pathname: "FriendProfile",
      params: {
        friendUserID: user.id,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        handleUserClick({ user });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          // TODO: Add user image here
          //   source={{ uri: volumeInfo?.imageLinks?.smallThumbnail }}
          defaultSource={require("../../assets/default_profile.png")}
          style={styles.image}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
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
    resizeMode: "contain",
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
});

export default UserListItem;
