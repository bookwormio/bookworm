import React from "react";
import { StyleSheet, View } from "react-native";
import { type FlatBookItemModel } from "../../types";
import BookShelf from "./BookShelf/BookShelf";

const myBookShelves = ["CurrentlyReading", "Up Next", "Physically Own"];

// TODO: add query to get books
const fakeBooks: FlatBookItemModel[] = [
  {
    id: "9781529301033",
    title: "Secrets of the Forgotten Forest",
    image: "https://example.com/forest.jpg",
    author: "JK Rownling",
  },
  {
    id: "9781789091374",
    title: "Echoes of Eternity",
    image: "https://example.com/eternity.jpg",
    author: "JK Rownling",
  },
  {
    id: "9780062945953",
    title: "The Midnight Mirage",
    image: "https://example.com/midnight.jpg",
    author: "JK Rownling",
  },
  {
    id: "9781974705667",
    title: "Whispers from the Abyss",
    image: "https://example.com/abyss.jpg",
    author: "JK Rownling",
  },
  {
    id: "9780062892615",
    title: "Chronicles of the Crystal Kingdom",
    image: "https://example.com/crystal.jpg",
    author: "JK Rownling",
  },
];

const ProfileBookShelves = () => {
  return (
    <View style={styles.scrollContent}>
      {myBookShelves.map((shelfName) => (
        <BookShelf key={shelfName} shelfName={shelfName} books={fakeBooks} />
      ))}
    </View>
  );
};

export default ProfileBookShelves;

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
});
