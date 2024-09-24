import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  bookShelfDisplayMap,
  type ServerBookShelfName,
} from "../../../enums/Enums";

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
  const shelfItems = Object.entries(bookShelfDisplayMap).map(
    ([value, label]) => ({
      label,
      value: value as ServerBookShelfName,
    }),
  );

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
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <AntDesign
              name={
                selectedShelves.includes(item.value)
                  ? "checkcircleo"
                  : "pluscircleo"
              }
              size={20}
              color={selectedShelves.includes(item.value) ? "#FB6D0B" : "black"}
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
