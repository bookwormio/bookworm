import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BOOKSHELF_CHIP_COLORS } from "../../constants/constants";
import {
  BOOKSHELF_CHIP_DISPLAY,
  type ServerBookShelfName,
} from "../../enums/Enums";

interface BookshelfListChipProps {
  bookShelf: ServerBookShelfName;
}

const BookshelfListChip = ({ bookShelf }: BookshelfListChipProps) => {
  const backgroundColor = BOOKSHELF_CHIP_COLORS[bookShelf]; // Default to LIGHT_SALMON

  console.log("bookShelf", bookShelf);
  console.log("backgroundColor", backgroundColor);
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{BOOKSHELF_CHIP_DISPLAY[bookShelf]}</Text>
    </View>
  );
};

export default BookshelfListChip;

const styles = StyleSheet.create({
  container: {
    height: 25,
    paddingHorizontal: 12,
    borderRadius: 999, // Very large number for pill shape
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    marginLeft: 5,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
});
