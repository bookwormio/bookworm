import { Image } from "expo-image";
import { type StorageReference } from "firebase/storage";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  BLURHASH,
  FIRST_IMG_STYLE,
  IMG_STYLE,
} from "../../../constants/constants";
import WormLoader from "../../wormloader/WormLoader";
import { useGetDownloadURL } from "./hooks/usePostImageQueries";

interface PostImageProps {
  storageRef: StorageReference;
  index: number;
  onPress?: () => void;
}

const PostImage = ({ storageRef, index, onPress }: PostImageProps) => {
  const { data: imageDownloadURL, isLoading: isLoadingImageURL } =
    useGetDownloadURL(storageRef);

  const isFirstImage = index === 0;

  if (isLoadingImageURL) {
    <View style={[isFirstImage ? FIRST_IMG_STYLE : IMG_STYLE]}>
      <WormLoader />
    </View>;
  }

  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        if (onPress != null) {
          onPress();
        }
      }}
      style={styles.imageContainer}
    >
      <Image
        key={storageRef.fullPath}
        source={{ uri: imageDownloadURL }}
        cachePolicy={"memory-disk"}
        placeholder={BLURHASH}
        style={isFirstImage ? FIRST_IMG_STYLE : IMG_STYLE}
      />
    </TouchableOpacity>
  );
};

export default PostImage;

const styles = StyleSheet.create({
  imageContainer: {
    marginRight: 10,
  },
});
