import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BOOKWORM_ORANGE } from "../../../constants/constants";
import {
  BOOKSHELF_DISPLAY_NAMES,
  ServerBookShelfName,
} from "../../../enums/Enums";
import WormLoader from "../../wormloader/WormLoader";

interface BookshelfAddButtonsProps {
  selectedShelves: ServerBookShelfName[];
  onToggleShelf: (shelfName: ServerBookShelfName) => void;
  isDisabled: boolean;
}

const BookshelfAddButtons = ({
  selectedShelves,
  onToggleShelf,
  isDisabled,
}: BookshelfAddButtonsProps) => {
  const shelfItems = Object.values(ServerBookShelfName).map((value) => ({
    label: BOOKSHELF_DISPLAY_NAMES[value],
    value,
  }));

  return (
    <View style={styles.container}>
      {shelfItems.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={[styles.button, isDisabled && styles.disabledButton]}
          onPress={() => {
            onToggleShelf(item.value);
          }}
          disabled={isDisabled}
        >
          <Text style={[styles.buttonText]}>{item.label}</Text>
          <View style={styles.spacer} />
          {isDisabled ? (
            <WormLoader style={{ width: 50, height: 50 }} />
          ) : (
            <AntDesign
              name={
                selectedShelves.includes(item.value)
                  ? "checkcircleo"
                  : "pluscircleo"
              }
              size={20}
              color={
                selectedShelves.includes(item.value) ? BOOKWORM_ORANGE : "black"
              }
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 15,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
  },
  spacer: {
    flexGrow: 1,
  },
});

export default BookshelfAddButtons;
