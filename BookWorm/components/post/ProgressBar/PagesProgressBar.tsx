import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BACKWARDS_PROGRESS_COLOR,
  FIRST_PROGRESS_COLOR,
  REMAINING_PROGRESS_COLOR,
  SECOND_PROGRESS_COLOR,
} from "../../../constants/constants";
import ProgressBar from "./ProgressBar";

interface PagesProgressBarProps {
  oldBookmark: number;
  newBookmark: number;
  totalPages: number;
  shouldAnimate: boolean;
  setShouldAnimate: (shouldAnimate: boolean) => void;
}

const PagesProgressBar = ({
  oldBookmark,
  newBookmark,
  totalPages,
  shouldAnimate = false,
  setShouldAnimate,
}: PagesProgressBarProps) => {
  const pagesRead = newBookmark - oldBookmark;
  const isBackwards = pagesRead < 0;

  const firstProgress = Math.min(oldBookmark, newBookmark) / totalPages;
  const secondProgress = Math.abs(pagesRead) / totalPages;
  const remainingProgress = 1 - firstProgress - secondProgress;

  return (
    <View style={styles.progressContainer}>
      <Text>
        {isBackwards ? "Moved back" : "Read"} {Math.abs(pagesRead)} pages
      </Text>
      <ProgressBar
        shouldAnimate={shouldAnimate}
        setShouldAnimate={setShouldAnimate}
        animateDuration={500}
        barHeight={15}
        data={[
          { progress: firstProgress, color: FIRST_PROGRESS_COLOR },
          {
            progress: secondProgress,
            color: isBackwards
              ? BACKWARDS_PROGRESS_COLOR
              : SECOND_PROGRESS_COLOR,
          },
          { progress: remainingProgress, color: REMAINING_PROGRESS_COLOR },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default PagesProgressBar;
