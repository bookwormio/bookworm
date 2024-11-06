import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type ServerBookShelfName } from "../../../enums/Enums";
import { useAuth } from "../../auth/context";
import WormLoader from "../../wormloader/WormLoader";
import { useGetAllBorrowingBooksForUser } from "../hooks/useBookBorrowQueries";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";
import BookShelf from "./BookShelf";

interface BookShelvesProp {
  userID: string;
}

const ProfileBookShelves = ({ userID }: BookShelvesProp) => {
  const { user } = useAuth();
  // Initialize the bookShelves state with all shelves empty

  const {
    data: bookShelves,
    isLoading: isLoadingBooks,
    isError,
    error,
  } = useGetBooksForBookshelves(userID ?? "");

  const {
    data: borrowingBooks,
    isLoading: isLoadingBorrowingBooks,
    isError: isErrorBorrowingBooks,
    error: errorBorrowingBooks,
    isSuccess: isSuccessBorrowingBooks,
  } = useGetAllBorrowingBooksForUser(userID);

  if (isSuccessBorrowingBooks) {
    console.log(borrowingBooks);
  }

  if (isLoadingBooks) {
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
        />
      ))}
      {/* TODO clean this up */}
      {user?.uid === userID && (
        <BookShelf
          key={"borrowing"}
          shelfName={"borrowing" as ServerBookShelfName}
          books={borrowingBooks ?? []}
          userID={userID}
        />
      )}
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
