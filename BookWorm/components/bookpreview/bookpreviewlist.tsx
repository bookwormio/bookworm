import React from "react";
import { View } from "react-native";
import BookPreview from "./bookpreview";

interface BookPreviewListProps {
  volumes: BookVolumeItem[];
}

const BookPreviewList = ({ volumes }: BookPreviewListProps) => {
  return (
    <View>
      {/* TODO: potentially need to modify this key assignment */}
      {volumes.map((value, index) => (
        <BookPreview key={index} volumeInfo={value.volumeInfo}></BookPreview>
      ))}
    </View>
  );
};

export default BookPreviewList;
