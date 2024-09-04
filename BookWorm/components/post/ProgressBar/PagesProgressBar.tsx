import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ProgressBar from "./ProgressBar";

interface PagesProgressBarProps {
  oldBookmark: number;
  newBookmark: number;
  totalPages: number;
}

// TODO PASS IN PROGRESS LENGTH
const TOTAL_PROGRESS_LENGTH = 25;

const PagesProgressBar = ({
  oldBookmark,
  newBookmark,
  totalPages,
}: PagesProgressBarProps) => {
  const pagesRead = newBookmark - oldBookmark;

  // TODO: make these calculations safe
  const firstProgress = (oldBookmark / totalPages) * TOTAL_PROGRESS_LENGTH;
  const secondProgress = (pagesRead / totalPages) * TOTAL_PROGRESS_LENGTH;
  const thirdProgress =
    TOTAL_PROGRESS_LENGTH - firstProgress - secondProgress - 1;

  return (
    <View style={styles.progressContainer}>
      <Text>Read {newBookmark - oldBookmark} pages</Text>
      <ProgressBar
        // add useNativeDriver: true to animated.timing in ProgressBar.js
        shouldAnimate={true} // to enable animation, default false
        animateDuration={1000} // if animation enabled TODO make this shorter
        barHeight={15} // height of the progress bar
        data={[
          { progress: firstProgress, color: "#FB6D0B" },
          { progress: secondProgress, color: "rgb(236, 178, 138)" },
          { progress: thirdProgress, color: "rgb(229, 232, 249)" },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    marginVertical: 10,
  },
});

export default PagesProgressBar;
