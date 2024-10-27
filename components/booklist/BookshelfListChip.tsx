import { Chip } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import {
  BORROWING_CHIP_COLORS,
  CHIP_GRADIENT_COLORS,
} from "../../constants/constants";
import { BOOKSHELF_CHIP_DISPLAY, ServerBookShelfName } from "../../enums/Enums";

interface BookshelfListChipProps {
  bookShelf: ServerBookShelfName;
}

interface ChipStyle {
  chipColor: string[];
}

const BookshelfListChip = ({ bookShelf }: BookshelfListChipProps) => {
  const getChipStyles = (bookShelf: ServerBookShelfName): ChipStyle => {
    // TODO: Remove switch once we have borrowing library
    switch (bookShelf) {
      case ServerBookShelfName.CURRENTLY_READING:
        return { chipColor: CHIP_GRADIENT_COLORS[bookShelf] };
      case ServerBookShelfName.WANT_TO_READ:
        return { chipColor: CHIP_GRADIENT_COLORS[bookShelf] };
      case ServerBookShelfName.FINISHED:
        return { chipColor: CHIP_GRADIENT_COLORS[bookShelf] };
      case ServerBookShelfName.LENDING_LIBRARY:
        return { chipColor: CHIP_GRADIENT_COLORS[bookShelf] };
      default:
        return { chipColor: BORROWING_CHIP_COLORS };
    }
  };

  const chipStyles = getChipStyles(bookShelf);

  return (
    <Chip
      title={BOOKSHELF_CHIP_DISPLAY[bookShelf]}
      type="outline"
      containerStyle={styles.containerStyle}
      ViewComponent={LinearGradient} // allows for gradient background
      linearGradientProps={{
        colors: chipStyles.chipColor,
        start: { x: 0, y: 0.5 },
        end: { x: 1, y: 0.5 },
      }}
      titleStyle={[styles.titleStyle]}
      buttonStyle={styles.buttonStyle}
    />
  );
};

export default BookshelfListChip;

const styles = StyleSheet.create({
  containerStyle: {
    marginVertical: 15,
  },
  titleStyle: {
    paddingTop: 0,
    paddingBottom: 0,
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "top",
    fontSize: 12,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    color: "white",
  },
  buttonStyle: {
    borderWidth: 0,
    height: 25,
    padding: 0,
  },
});
