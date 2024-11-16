import { useLocalSearchParams } from "expo-router";
import React from "react";
import ImageBlowup from "../../../../components/image/ImageBlowup";

const ImageBlowupWrapper = () => {
  const { imageURL } = useLocalSearchParams<{ imageURL: string }>();
  if (imageURL !== undefined) {
    return <ImageBlowup imageURL={imageURL} />;
  }
};
export default ImageBlowupWrapper;
