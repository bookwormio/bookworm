import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { type ServerBadgeName } from "../../enums/Enums";
import { useBadgePicQuery } from "./useBadgeQueries";
interface BadgePictureProps {
  badgeID: ServerBadgeName;
  size: number;
}

const BadgePicture = ({ badgeID, size }: BadgePictureProps) => {
  const {
    data: badgePic,
    isPending: badgePicPending,
    isError: badgePicError,
  } = useBadgePicQuery(badgeID);

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
      {!badgePicPending && !badgePicError && badgePic !== null && (
        <Image
          style={[styles.image, dynamicStyles.image]}
          source={{ uri: badgePic }}
        />
      )}
    </View>
  );
};

export default BadgePicture;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    resizeMode: "cover",
  },
});
