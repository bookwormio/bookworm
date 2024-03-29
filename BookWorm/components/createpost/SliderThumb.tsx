import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SliderThumbProps {
  minutesRead: number;
}

const SliderThumb = ({ minutesRead }: SliderThumbProps) => {
  const hours = Math.floor(minutesRead / 60);
  const minutes = minutesRead % 60;

  return (
    <View style={styles.container}>
      <Text>
        {hours}hr{hours !== 1 ? "s" : ""} {minutes}min
        {minutes !== 1 ? "s" : ""} read
      </Text>
    </View>
  );
};

export default SliderThumb;

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "white",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: "grey",
  },
});
