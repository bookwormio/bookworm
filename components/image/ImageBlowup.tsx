import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";

interface ImageBlowupProps {
  imageURL: string;
}
const { width } = Dimensions.get("window");

const ImageBlowup = ({ imageURL }: ImageBlowupProps) => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{ uri: imageURL }} />
    </View>
  );
};

export default ImageBlowup;

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_BACKGROUND_COLOR,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: width,
    width,
  },
});
