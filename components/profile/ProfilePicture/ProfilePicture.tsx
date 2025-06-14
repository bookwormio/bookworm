import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useProfilePicQuery } from "../../../app/(tabs)/(profile)/hooks/useProfileQueries";
interface ProfilePictureProps {
  userID: string;
  size: number;
  overrideProfilePic?: string;
}

const ProfilePicture = ({
  userID,
  size,
  overrideProfilePic,
}: ProfilePictureProps) => {
  const {
    data: profilePic,
    isPending: profilePicPending,
    isError: profilePicError,
  } = useProfilePicQuery(userID);

  const dynamicStyles = {
    container: {
      height: size,
      width: size,
    },
    image: {
      height: size,
      width: size,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {overrideProfilePic != null && overrideProfilePic !== "" ? (
        // Manually pass in newProfilePic
        <Image
          style={[styles.image, dynamicStyles.image]}
          source={{ uri: overrideProfilePic }}
        />
      ) : !profilePicPending && !profilePicError && profilePic !== null ? (
        // Stored user profile pic
        <Image
          style={[styles.image, dynamicStyles.image]}
          source={{ uri: profilePic }}
        />
      ) : (
        // Default user profile pic
        <Image
          style={[styles.image, dynamicStyles.image]}
          source={require("../../../assets/default_profile.png")}
        />
      )}
    </View>
  );
};

export default ProfilePicture;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d3d3d3",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  image: {
    resizeMode: "cover",
    borderRadius: 50,
  },
});
