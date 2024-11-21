import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { SIMILAR_BOOKS_SHELF_NAME } from "../../enums/Enums";
import BookWormButton from "../buttons/BookWormButton";
import BookShelf from "../profile/BookShelf/BookShelf";
import WormLoader from "../wormloader/WormLoader";
import { useFetchSimilarBooks } from "./hooks/useSimilarBookQueries";

interface SimilarBooksWrapperProps {
  bookID: string;
  userID: string;
  bookTitle: string;
}

const SimilarBooksWrapper = ({
  bookID,
  userID,
  bookTitle,
}: SimilarBooksWrapperProps) => {
  const similarBooksMutation = useFetchSimilarBooks();

  const handleSimilarBooksPressed = (
    bookPressedID: string,
    bookTitle: string,
  ) => {
    similarBooksMutation.mutate({
      bookID: bookPressedID,
      bookTitle,
    });
  };

  if (similarBooksMutation.isError) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "An error occurred while fetching similar books",
    });
    return null;
  }

  const showSimilarBooks = similarBooksMutation.isSuccess;
  const showLoader = similarBooksMutation.isPending;

  return (
    <View style={styles.container}>
      {!showSimilarBooks && (
        <BookWormButton
          title="Find Similar Books"
          disabled={similarBooksMutation.isPending}
          onPress={() => {
            handleSimilarBooksPressed(bookID, bookTitle);
          }}
        ></BookWormButton>
      )}
      {showLoader && (
        <View style={styles.loading}>
          <WormLoader />
        </View>
      )}
      {showSimilarBooks && (
        <BookShelf
          userID={userID}
          books={similarBooksMutation.data}
          shelfName={SIMILAR_BOOKS_SHELF_NAME}
        />
      )}
    </View>
  );
};

export default SimilarBooksWrapper;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
