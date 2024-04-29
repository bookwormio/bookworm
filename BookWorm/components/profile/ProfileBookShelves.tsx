import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { type ServerBookShelfName } from "../../enums/Enums";
import { useAuth } from "../auth/context";
import BookShelf from "./BookShelf/BookShelf";
import { useGetBooksForBookshelves } from "./hooks/bookshelfQueries";

const ProfileBookShelves = () => {
  const { user } = useAuth();
  // Initialize the bookShelves state with all shelves empty

  // TODO FIX NULL USERID
  const {
    data: bookShelves,
    isLoading,
    isError,
    error,
  } = useGetBooksForBookshelves(user?.uid ?? "");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollContent}>
      {Object.entries(bookShelves ?? {}).map(([shelfName, books]) => (
        <BookShelf
          key={shelfName}
          shelfName={shelfName as ServerBookShelfName}
          books={books}
        />
      ))}
    </View>
  );
};

export default ProfileBookShelves;

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
