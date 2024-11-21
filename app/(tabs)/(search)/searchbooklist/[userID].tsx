import { useLocalSearchParams } from "expo-router";
import React from "react";
import BookShelfListView from "../../../../components/profile/BookShelf/BookShelfListView";

const BookListWrapper = () => {
  const { userID } = useLocalSearchParams<{
    userID: string;
  }>();
  const { bookshelf } = useLocalSearchParams<{
    bookshelf: string;
  }>();
  return (
    <BookShelfListView
      viewingUserID={userID ?? ""}
      bookshelf={bookshelf ?? ""}
    />
  );
};
export default BookListWrapper;
