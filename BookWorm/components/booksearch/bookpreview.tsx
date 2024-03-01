import React, { type FC } from "react";
import { Text, View } from "react-native";

interface BookPreviewProps {
  volumeInfo: BookVolumeInfo;
}

const BookPreview: FC<BookPreviewProps> = ({
  volumeInfo,
}: BookPreviewProps) => {
  return (
    <View>
      <Text>Title: {volumeInfo.title}</Text>
      {/* <Text>Subtitle: {volumeInfo.subtitle}</Text>
      <Text>Authors: {volumeInfo.authors?.join(", ") ?? "Unknown"}</Text>
      <Text>Publisher: {volumeInfo.publisher ?? "Unknown"}</Text>
      <Text>Published Date: {volumeInfo.publishedDate ?? "Unknown"}</Text>
      <Text>Description: {volumeInfo.description ?? "Unknown"}</Text>
      <Text>Page Count: {volumeInfo.pageCount ?? "Unknown"}</Text>
      <Text>Categories: {volumeInfo.categories?.join(", ") ?? "Unknown"}</Text>
      <Text>Maturity Rating: {volumeInfo.maturityRating ?? "Unknown"}</Text> */}
      {/* Add more properties as needed */}
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     padding: 40,
//     justifyContent: "center",
//   },
// });

export default BookPreview;
