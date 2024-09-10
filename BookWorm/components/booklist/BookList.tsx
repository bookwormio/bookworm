import React from "react";
import { View } from "react-native";
import { type BookVolumeItem } from "../../types";
import BookListItem from "./BookListItem";

interface BookListProps {
  volumes: BookVolumeItem[];
  friendUserID?: string;
}

const BookList = ({ volumes, friendUserID }: BookListProps) => {
  return (
    <View>
      {/* TODO: potentially need to modify this key assignment */}
      {volumes.map((value, index) => (
        <BookListItem
          key={index}
          bookID={value.id}
          volumeInfo={value.volumeInfo}
          friendUserID={friendUserID}
        ></BookListItem>
      ))}
    </View>
  );
};

export default BookList;
