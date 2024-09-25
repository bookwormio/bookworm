import React from "react";
import {
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
} from "react-native";

interface WormLoaderProps {
  style?: StyleProp<ImageStyle>;
}

const WormLoader = ({ style }: WormLoaderProps) => {
  return (
    <Image
      source={require("../../assets/loading_worm.gif")}
      style={StyleSheet.flatten([styles.gif, style])}
    />
  );
};

const styles = StyleSheet.create({
  gif: {
    width: 100,
    height: 100,
  },
});

export default WormLoader;
