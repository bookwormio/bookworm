import React from "react";
import { View } from "react-native";
import { ServerBookShelfName } from "../../enums/Enums";
import {
  type BookVolumeInfo,
  type BookVolumeItem,
  type BorrowingBookshelfModel,
} from "../../types";
import { useUserID } from "../auth/context";
import { useGetLendingLibraryBookStatuses } from "../profile/hooks/useBookBorrowQueries";
import BookListItem from "./BookListItem";

interface BookListProps {
  volumes?: BookVolumeItem[];
  handleBookClickOverride?: (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => void;
  showRemoveButton?: boolean;
  viewingUserID?: string;
  bookShelf?: string;
  borrowingBookShelf?: boolean;
  borrwingBooks?: BorrowingBookshelfModel[];
}

const BookList = ({
  volumes,
  handleBookClickOverride,
  showRemoveButton,
  viewingUserID,
  bookShelf,
  borrowingBookShelf,
  borrwingBooks,
}: BookListProps) => {
  const { userID } = useUserID();
  const bookIds = volumes?.map((book) => book.id) ?? [];
  const { data: lendingStatuses, isLoading: isLoadingLendingStatus } =
    useGetLendingLibraryBookStatuses(
      bookShelf === ServerBookShelfName.LENDING_LIBRARY
        ? viewingUserID ?? ""
        : "",
      bookShelf === ServerBookShelfName.LENDING_LIBRARY ? userID : "",
      bookShelf === ServerBookShelfName.LENDING_LIBRARY ? bookIds : [],
    );
  return (
    <View>
      {borrowingBookShelf != null &&
        borrowingBookShelf &&
        borrwingBooks?.map((value, index) => (
          <BookListItem
            key={index}
            bookID={value.bookShelfInfo.id}
            volumeInfo={value.bookShelfInfo.volumeInfo}
            handleBookClickOverride={handleBookClickOverride}
            showRemoveButton={false}
            viewingUserID={viewingUserID}
            borrowingBookShelf={true}
            borrwingBook={value}
          ></BookListItem>
        ))}
      {bookShelf != null && bookShelf === ServerBookShelfName.LENDING_LIBRARY
        ? volumes?.map((value, index) => (
            <BookListItem
              key={index}
              bookID={value.id}
              volumeInfo={value.volumeInfo}
              handleBookClickOverride={handleBookClickOverride}
              bookShelf={value.bookShelf}
              showRemoveButton={showRemoveButton}
              viewingUserID={viewingUserID}
              lendingStatus={lendingStatuses?.[value.id]}
              isLoadingLendingStatus={isLoadingLendingStatus}
            ></BookListItem>
          ))
        : volumes?.map((value, index) => (
            <BookListItem
              key={index}
              bookID={value.id}
              volumeInfo={value.volumeInfo}
              handleBookClickOverride={handleBookClickOverride}
              bookShelf={value.bookShelf}
              showRemoveButton={showRemoveButton}
              viewingUserID={viewingUserID}
            ></BookListItem>
          ))}
    </View>
  );
};

export default BookList;
