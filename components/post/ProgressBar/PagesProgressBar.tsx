import React from "react";
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
  pagesRead: number;
  isBackwards: boolean;
}

const PagesProgressBar = ({
  oldBookmark,
  newBookmark,
  totalPages,
  pagesRead,
  isBackwards,
}: PagesProgressBarProps) => {
  const firstProgress = Math.min(oldBookmark, newBookmark) / totalPages;
  const secondProgress = Math.abs(pagesRead) / totalPages;
  const remainingProgress = 1 - firstProgress - secondProgress;

  return (
    <ProgressBar
      shouldAnimate={true}
      animateDuration={500}
      barHeight={15}
      data={[
        { progress: firstProgress, color: FIRST_PROGRESS_COLOR },
        {
          progress: secondProgress,
          color: isBackwards ? BACKWARDS_PROGRESS_COLOR : SECOND_PROGRESS_COLOR,
        },
        { progress: remainingProgress, color: REMAINING_PROGRESS_COLOR },
      ]}
    />
  );
};

export default PagesProgressBar;
