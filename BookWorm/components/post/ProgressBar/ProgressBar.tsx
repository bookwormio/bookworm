/**
 * @fileoverview
 * SHOULD NOT NEED TO MODIFY THIS FILE
 *
 * This is based on the following code:
 * https://github.com/abaktiar/rn-multi-progress-bar/blob/master/src/ProgressBar/ProgressBar.js
 * But it is now a functional component that uses typescript
 */

import React, { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";

interface ProgressBarProps {
  data: Array<{ progress: number; color: string }>;
  barHeight?: number;
  shouldAnimate?: boolean;
  animateDuration?: number;
}

interface IPProps {
  progress: number;
  color: string;
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
      {progressData.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            height: barHeight,
            width: shouldAnimate ? animatedValues[i] : `${d.progress}%`,
            backgroundColor: d.color,
            borderRadius: 5,
          }}
        />
      ))}
    </View>
  );
};

export default ProgressBar;
