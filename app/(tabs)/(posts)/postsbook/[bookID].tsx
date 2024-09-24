import { useLocalSearchParams } from "expo-router";
import React from "react";
import BookViewPage from "../../../../components/book/BookViewPage";

const BookPageWrapper = () => {
  const { bookID } = useLocalSearchParams<{ bookID: string }>();
  return <BookViewPage bookID={bookID ?? ""} />;
};
export default BookPageWrapper;
