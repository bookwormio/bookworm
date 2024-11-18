/**
 * @fileoverview
 * SHOULD NOT NEED TO MODIFY THIS FILE
 *
 * This is based on the following code:
 * https://github.com/abaktiar/rn-multi-progress-bar/blob/master/src/ProgressBar/ProgressBar.js
 * But it is now a functional component that uses typescript
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { type ProgressBarData } from "../../../types";

interface ProgressBarProps {
  data: ProgressBarData[];
  barHeight?: number;
  shouldAnimate?: boolean;
  animateDuration?: number;
}

interface IPProps {
  progress: number;
  color: string;
  page: number;
}

const ProgressBar = ({
  data,
  barHeight = 8,
  shouldAnimate = true,
  animateDuration = 1000,
}: ProgressBarProps) => {
  const [progressData, setProgressData] = useState<IPProps[]>([]);
  const [animatedValue] = useState(new Animated.Value(0));

  // this is like componentDidMount
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: animateDuration,
      easing: Easing.linear,
      useNativeDriver: false, // This is the only functional change
    }).start();

    const totalProgress = data.reduce((acc, d) => acc + d.progress, 0);
    let value = 0;
    const newProgressData = data
      .map((d) => {
        value += (d.progress / totalProgress) * 100;
        return {
          progress: value,
          color: d.color,
          page: d.page,
        };
      })
      .reverse();

    setProgressData(newProgressData);
  }, [data, animateDuration, animatedValue]);

  const animatedValues = progressData.map((d) =>
    animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", `${d.progress}%`],
    }),
  );

  return (
    <View
      style={{
        position: "relative",
        marginTop: 16,
        marginBottom: 16 + barHeight,
        width: "100%",
      }}
    >
      <View
        style={{
          borderRadius: 5, // Adjust radius to match the bar height for a rounded effect
          overflow: "hidden", // Ensures child elements respect the radius
          height: barHeight, // Set the height explicitly for the container
          backgroundColor: "#e0e0e0", // Optional: Add a background color for the track
        }}
      >
        {progressData.map((d, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              height: barHeight,
              width: shouldAnimate ? animatedValues[i] : `${d.progress}%`,
              backgroundColor: d.color,
              borderRadius: 3,
            }}
          />
        ))}
      </View>
      {/* Text below progress bar */}
      <View
        style={{
          position: "absolute",
          top: barHeight + 5, // Place the text slightly below the progress bar
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          paddingRight: 7,
        }}
      >
        {progressData.map((d, i) => (
          <Text
            key={`text-${i}`}
            style={{
              position: "absolute",
              left: `${d.progress}%`,
              transform: [{ translateX: -17 }], // Adjust to center text slightly
              fontSize: 12,
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            {d.page !== 0 ? d.page : ""}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default ProgressBar;
