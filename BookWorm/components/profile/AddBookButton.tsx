import React from "react";
import { Button } from "react-native";
import { type ServerBookShelfName } from "../../enums/Enums";
import { useAddBookToShelf } from "./hooks/bookshelfQueries";

interface AddBookButtonProps {
  status: string;
  title: string;
  userID: string;
  bookID: string;
}

const AddBookButton = ({
  status,
  title,
  userID,
  bookID,
}: AddBookButtonProps) => {
  const { mutate, isPending } = useAddBookToShelf();

  // TODO: display stateful button
  // depending on whether the book is already in the shelf
  const handlePress = () => {
    if (userID !== null && bookID !== undefined && !isPending) {
      mutate({
        userID,
        bookID,
        shelfName: status as ServerBookShelfName,
      });
    }
  };

  return (
    // TODO: Make this pretty
    <Button
      onPress={handlePress}
      title={`Add to ${title}`}
      disabled={isPending}
    />
  );
};

export default AddBookButton;
