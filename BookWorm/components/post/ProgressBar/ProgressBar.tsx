/**
 * @fileoverview
 * SHOULD NOT NEED TO MODIFY THIS FILE
 *
 * This is based on the following code:
 * https://github.com/abaktiar/rn-multi-progress-bar/blob/master/src/ProgressBar/ProgressBar.js
 * But it is now a functional component that uses typescript
 */

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";

interface ProgressBarProps {
  data: Array<{ progress: number; color: string }>;
  barHeight?: number;
  shouldAnimate?: boolean;
  setShouldAnimate?: (shouldAnimate: boolean) => void;
  animateDuration?: number;
}

interface IPProps {
  progress: number;
  color: string;
}

const ProgressBar = ({
  data,
  barHeight = 8,
  shouldAnimate = false,
  setShouldAnimate,
  animateDuration = 1000,
}: ProgressBarProps) => {
  const [progressData, setProgressData] = useState<IPProps[]>([]);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
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

    if (shouldAnimate && !hasAnimated.current) {
      hasAnimated.current = true;
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animateDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        // Only animate once
        if (finished && setShouldAnimate != null) {
          setShouldAnimate(false);
        }
      });
    } else {
      animatedValue.setValue(1);
    }

    return () => {
      animatedValue.stopAnimation();
    };
  }, [data, animateDuration, shouldAnimate, setShouldAnimate, animatedValue]);

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
            width: animatedValues[i],
            backgroundColor: d.color,
            borderRadius: 5,
          }}
        />
      ))}
    </View>
  );
};

export default ProgressBar;
