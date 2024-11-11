import React from "react";
import { View } from "react-native";
import { type BookVolumeInfo, type BookVolumeItem } from "../../types";
import BookListItem from "./BookListItem";

interface BookListProps {
  volumes: BookVolumeItem[];
  handleBookClickOverride?: (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => void;
  showRemoveButton?: boolean;
  userID?: string;
}

const BookList = ({
  volumes,
  handleBookClickOverride,
  showRemoveButton,
  userID,
}: BookListProps) => {
  return (
    <View>
      {/* TODO: potentially need to modify this key assignment */}
      {volumes.map((value, index) => (
        <BookListItem
          key={index}
          bookID={value.id}
          volumeInfo={value.volumeInfo}
          handleBookClickOverride={handleBookClickOverride}
          bookShelf={value.bookShelf}
          showRemoveButton={showRemoveButton}
          userID={userID}
        ></BookListItem>
      ))}
    </View>
  );
};

export default BookList;
