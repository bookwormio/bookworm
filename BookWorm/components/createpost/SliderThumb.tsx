import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SliderThumbProps {
  minutesRead: number;
}

const SliderThumb = ({ minutesRead }: SliderThumbProps) => {
  const hours = Math.floor(minutesRead / 60);
  const minutes = minutesRead % 60;
  // Unecessary bool but smooths slider rendering
  const noTime = hours === 0 && minutes === 0;

  return (
    <View style={styles.container}>
      {!noTime ? (
        <Text>
          {hours}hr{hours !== 1 ? "s" : ""} {minutes}min
          {minutes !== 1 ? "s" : ""} read
        </Text>
      ) : (
        // color matches default placeholder text color
        <Text style={{ color: "#C7C7CD" }}>Time Reading</Text>
      )}
    </View>
  );
};

export default SliderThumb;

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#F2F2F2", // color matches background of TextInput
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: "grey",
  },
});
