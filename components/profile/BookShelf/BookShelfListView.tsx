import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { type BookShelfBookModel, type BookVolumeItem } from "../../../types";
import BookList from "../../booklist/BookList";
import WormLoader from "../../wormloader/WormLoader";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";

interface BookShelfListViewProps {
  userID: string;
  bookshelf: string;
}

const BookShelfListView = ({ userID, bookshelf }: BookShelfListViewProps) => {
  const { data: bookShelves, isLoading: isLoadingBooks } =
    useGetBooksForBookshelves(userID ?? "");

  /**
   * Converting BookShelfBookModel[] into BookVolumeItem[] using BookshelfVolumeInfo from books so we can use BookList component
   * @param books contains info needed to map books and convert to BookVolumeItem
   * @returns {BookVolumeItem} Correctly formatted books for BookList Component
   */
  function convertToBookVolumeItems(
    books: BookShelfBookModel[],
  ): BookVolumeItem[] {
    return books.map((book) => ({
      id: book.id,
      volumeInfo: {
        ...book.volumeInfo,
        imageLinks: {
          smallThumbnail: book.volumeInfo.thumbnail,
        },
      },
      kind: undefined,
      etag: undefined,
      selfLink: undefined,
      bookShelf: bookshelf,
    }));
  }

  if (isLoadingBooks) {
    return (
      <View style={styles.loading}>
        <WormLoader />
      </View>
    );
  }

  const selectedShelf = bookShelves?.[bookshelf];
  if (selectedShelf == null) {
    return (
      <View>
        <Text>{bookshelf} shelf is empty, please add some books!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BookList
        volumes={convertToBookVolumeItems(selectedShelf)}
        showRemoveButton={true}
        userID={userID}
      />
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
