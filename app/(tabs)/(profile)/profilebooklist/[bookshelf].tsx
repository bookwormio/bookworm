import { useLocalSearchParams } from "expo-router";
import React from "react";
import BookShelfListView from "../../../../components/profile/BookShelf/BookShelfListView";

const BookListWrapper = () => {
  const { bookshelf } = useLocalSearchParams<{
    bookshelf: string;
  }>();
  return <BookShelfListView bookshelf={bookshelf ?? ""} />;
};
export default BookListWrapper;
