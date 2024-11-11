import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { BORROWING_SHELF_NAME } from "../../../enums/Enums";
import { type BorrowingBookshelfModel } from "../../../types";
import BookList from "../../booklist/BookList";
import { mapAndSortPreloadedBooksWithDuplicates } from "../../searchbar/util/searchBarUtils";
import WormLoader from "../../wormloader/WormLoader";
import { useGetAllBorrowingBooksForUser } from "../hooks/useBookBorrowQueries";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";

interface BookShelfListViewProps {
  userID: string;
  bookshelf: string;
}

const BookShelfListView = ({ userID, bookshelf }: BookShelfListViewProps) => {
  const { data: bookShelves, isLoading: isLoadingBooks } =
    useGetBooksForBookshelves(userID ?? "");

  const { data: borrowingBooks } = useGetAllBorrowingBooksForUser(userID) as {
    data: BorrowingBookshelfModel[] | null;
    isLoading: boolean;
    isError: boolean;
  };

  if (isLoadingBooks) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  let selectedShelf;
  if (bookShelves != null && bookshelf !== BORROWING_SHELF_NAME) {
    const sortedBooks = mapAndSortPreloadedBooksWithDuplicates(bookShelves);
    selectedShelf = sortedBooks.filter((book) => book.bookShelf === bookshelf);
  }

  if (selectedShelf == null && bookshelf !== BORROWING_SHELF_NAME) {
    return (
      <View style={styles.container}>
        <Text>{bookshelf} shelf is empty, please add some books!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {selectedShelf != null ? (
        <BookList
          volumes={selectedShelf}
          showRemoveButton={true}
          userID={userID}
          bookShelf={bookshelf}
        />
      ) : bookshelf === BORROWING_SHELF_NAME && borrowingBooks != null ? (
        <BookList
          userID={userID}
          showRemoveButton={false}
          borrowingBookShelf={true}
          borrwingBooks={borrowingBooks}
        />
      ) : (
        <View>
          <Text>{bookshelf} shelf is empty, please add some books!</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default BookShelfListView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
