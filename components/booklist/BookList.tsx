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
}

const BookList = ({ volumes, handleBookClickOverride }: BookListProps) => {
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
        ></BookListItem>
      ))}
    </View>
  );
};

export default BookList;
