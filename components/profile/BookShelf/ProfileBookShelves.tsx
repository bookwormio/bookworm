import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type ServerBookShelfName } from "../../../enums/Enums";
import { useAuth } from "../../auth/context";
import WormLoader from "../../wormloader/WormLoader";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";
import BookShelf from "./BookShelf";

interface BookShelvesProp {
  userID: string;
  userFirstName: string; // TODO clean this up / make optional
  userLastName: string;
}

const ProfileBookShelves = ({
  userID,
  userFirstName,
  userLastName,
}: BookShelvesProp) => {
  // Initialize the bookShelves state with all shelves empty
  const { user } = useAuth();

  // TODO FIX NULL USERID
  const {
    data: bookShelves,
    isLoading,
    isError,
    error,
  } = useGetBooksForBookshelves(userID ?? "", user?.uid ?? "");

  if (isLoading) {
    return (
      <View style={styles.container}>
        <WormLoader style={{ width: 50, height: 50 }} />
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
          userID={userID}
          userFirstName={userFirstName}
          userLastName={userLastName}
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
