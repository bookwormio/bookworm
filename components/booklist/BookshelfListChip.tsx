import { Chip } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  REMAINING_PROGRESS_COLOR,
  SECOND_PROGRESS_COLOR,
} from "../../constants/constants";
import { BOOKSHELF_CHIP_DISPLAY, ServerBookShelfName } from "../../enums/Enums";

interface BookshelfListChipProps {
  bookShelf: ServerBookShelfName;
}

interface chipStyle {
  textColor: string;
  chipColor: string[];
}

const BookshelfListChip = ({ bookShelf }: BookshelfListChipProps) => {
  // TODO finalize these colors
  // TODO move these colors to constants
  const lightcolor = "#FFA669";
  const darkercolor = "#FF8D40";

  const READING_CHIP_COLORS = [SECOND_PROGRESS_COLOR, SECOND_PROGRESS_COLOR];
  const WANT_TO_READ_CHIP_COLORS = [
    REMAINING_PROGRESS_COLOR,
    REMAINING_PROGRESS_COLOR,
  ];
  const FINISHED_CHIP_COLORS = [lightcolor, darkercolor];
  const LENDING_CHIP_COLORS = ["#EE876B", "#EE876B"];
  const BORROWING_CHIP_COLORS = ["#455194", "#455194"];

  const getChipStyles = (bookShelf: ServerBookShelfName): chipStyle => {
    switch (bookShelf) {
      case ServerBookShelfName.CURRENTLY_READING:
        return { textColor: "white", chipColor: READING_CHIP_COLORS };
      case ServerBookShelfName.WANT_TO_READ:
        return { textColor: "black", chipColor: WANT_TO_READ_CHIP_COLORS };
      case ServerBookShelfName.FINISHED:
        return { textColor: "white", chipColor: FINISHED_CHIP_COLORS };
      case ServerBookShelfName.LENDING_LIBRARY:
        return { textColor: "white", chipColor: LENDING_CHIP_COLORS };
      default:
        return { textColor: "white", chipColor: BORROWING_CHIP_COLORS };
    }
  };

  const chipStyles = getChipStyles(bookShelf);

  return (
    <Chip
      title={BOOKSHELF_CHIP_DISPLAY[bookShelf]}
      type="outline"
      // TODO: move to stylesheet
      containerStyle={{ marginVertical: 15 }}
      ViewComponent={LinearGradient} // allows for gradient background
      linearGradientProps={{
        colors: chipStyles.chipColor,
        start: { x: 0, y: 0.5 },
        end: { x: 1, y: 0.5 },
      }}
      // TODO: move to stylesheet
      titleStyle={{
        paddingTop: 0,
        paddingBottom: 0,
        color: chipStyles.textColor,
        opacity: chipStyles.textColor === "white" ? 1 : 0.6,
        fontWeight: "bold",
        textAlign: "center",
        textAlignVertical: "top",
        fontSize: 12,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.3,
      }}
      // TODO: move to stylesheet
      buttonStyle={{ borderWidth: 0, height: 25, padding: 0 }}
    />
  );
};

export default BookshelfListChip;
