import React from "react";
import BookWormButton from "../button/BookWormButton";
import { useFindBooksLikeThis } from "./hooks/useSimilarBookQueries";
import SimilarBookShelf from "./SimilarBookShelf";

interface SimilarBooksWrapperProps {
  bookID: string;
  userID: string;
  bookTitle?: string;
}

const SimilarBooksWrapper = ({
  bookID,
  userID,
  bookTitle,
}: SimilarBooksWrapperProps) => {
  const similarBooksMutation = useFindBooksLikeThis();

  const handleSimilarBooksPressed = (bookPressedID: string) => {
    similarBooksMutation.mutate({ bookID: bookPressedID });
  };

  const showSimilarBooks = similarBooksMutation.isSuccess;
  return (
    <>
      {!showSimilarBooks && (
        <BookWormButton
          title="Find Similar Books"
          onPress={() => {
            handleSimilarBooksPressed(bookID);
          }}
        ></BookWormButton>
      )}
      {showSimilarBooks && (
        <SimilarBookShelf
          bookTitle={bookTitle}
          userID={userID}
          books={similarBooksMutation.data}
        />
      )}
    </>
  );
};

export default SimilarBooksWrapper;
