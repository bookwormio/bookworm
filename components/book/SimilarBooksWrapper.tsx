import React from "react";
import { SIMILAR_BOOKS_SHELF_NAME } from "../../enums/Enums";
import BookWormButton from "../button/BookWormButton";
import BookShelf from "../profile/BookShelf/BookShelf";
import { useFetchSimilarBooks } from "./hooks/useSimilarBookQueries";

interface SimilarBooksWrapperProps {
  bookID: string;
  userID: string;
}

const SimilarBooksWrapper = ({ bookID, userID }: SimilarBooksWrapperProps) => {
  const similarBooksMutation = useFetchSimilarBooks();

  const handleSimilarBooksPressed = (bookPressedID: string) => {
    similarBooksMutation.mutate({ bookID: bookPressedID });
  };

  const showSimilarBooks = similarBooksMutation.isSuccess;
  return (
    <>
      {!showSimilarBooks && (
        <BookWormButton
          title="Find Similar Books"
          disabled={similarBooksMutation.isPending}
          onPress={() => {
            handleSimilarBooksPressed(bookID);
          }}
        ></BookWormButton>
      )}
      {showSimilarBooks && (
        <BookShelf
          userID={userID}
          books={similarBooksMutation.data}
          shelfName={SIMILAR_BOOKS_SHELF_NAME}
        />
      )}
    </>
  );
};

export default SimilarBooksWrapper;
