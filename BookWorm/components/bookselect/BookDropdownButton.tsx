import { AntDesign, FontAwesome5 } from "@expo/vector-icons";

import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { type FlatBookItemModel } from "../../types";
import { generateNewPostBookSearchRoute } from "../../utilities/routeUtils";

interface BookDropdownButtonProps {
  selectedBook: FlatBookItemModel | null;
}

const BookDropdownButton = ({ selectedBook }: BookDropdownButtonProps) => {
  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        onPress={() => {
          const route = generateNewPostBookSearchRoute();
          if (route != null) {
            router.push({
              pathname: route,
            });
          }
        }}
      >
        <View style={styles.dropdown}>
          <View style={styles.leftSelector}>
            <AntDesign
              name="book"
              size={20}
              color="black"
              style={styles.icon}
            />
            <Text
              style={[
                styles.textItem,
                selectedBook != null && styles.selectedBookTitle,
              ]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {selectedBook != null ? selectedBook.title : "Select a book"}
            </Text>
          </View>
          <FontAwesome5
            name="caret-down"
            size={20}
            style={{ marginRight: 10 }}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BookDropdownButton;
const styles = StyleSheet.create({
  dropdownContainer: {
    paddingBottom: 20,
    backgroundColor: "white",
  },
  dropdown: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    paddingLeft: 6,
    paddingRight: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  leftSelector: {
    flexDirection: "row",
    padding: 5,
    alignItems: "center",
    flex: 1,
  },
  textItem: {
    fontSize: 16,
    paddingLeft: 10,
    flex: 1,
  },
  selectedBookTitle: {
    fontWeight: "bold",
  },
});
