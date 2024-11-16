import { Image } from "expo-image";
import { type StorageReference } from "firebase/storage";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FIRST_IMG_STYLE, IMG_STYLE } from "../../../constants/constants";
import { useNavigateToImageBlowup } from "../../profile/hooks/useRouteHooks";
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

  const navigateToImageBlowup = useNavigateToImageBlowup();

  if (isLoadingImageURL) {
    return (
      <TouchableOpacity>
        <View style={[isFirstImage ? FIRST_IMG_STYLE : IMG_STYLE]}>
          <View style={styles.loading}>
            <WormLoader />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Don't render the image if the download URL is null
  if (imageDownloadURL == null) {
    return null;
  }

  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        if (onPress != null) {
          onPress();
        } else {
          navigateToImageBlowup(encodeURIComponent(imageDownloadURL));
        }
      }}
      style={styles.imageContainer}
    >
      <Image
        key={storageRef.fullPath}
        source={{ uri: imageDownloadURL }}
        cachePolicy={"memory-disk"}
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
