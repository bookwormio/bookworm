import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type FlatBookItemModel } from "../../../types";
import BookShelfBook from "./BookShelfBook";

interface BookShelfProps {
  shelfName: string;
  books: FlatBookItemModel[];
}

const BookShelf = ({ shelfName, books }: BookShelfProps) => {
  return (
    <View style={styles.list}>
      <View style={styles.heading}>
        <Text style={styles.title}>{shelfName}</Text>
        <Text style={styles.length}>{books.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        data={books}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity>
            <BookShelfBook book={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default BookShelf;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  listContainer: {
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
  },
  length: {
    fontSize: 17,
  },
  list: {
    backgroundColor: "white",
    paddingTop: 0,
  },
  heading: {
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
