import React from "react";
import { Button, StyleSheet, View } from "react-native";
import { type ServerBookShelfName } from "../../enums/Enums";
import {
  useAddBookToShelf,
  useRemoveBookFromShelf,
} from "./hooks/bookshelfQueries";

interface AddBookButtonProps {
  serverShelfName: string;
  title: string;
  userID: string;
  bookID: string;
  isInShelf: boolean;
  isLoadingInBookshelves: boolean;
}

const AddBookButton = ({
  serverShelfName,
  title,
  userID,
  bookID,
  isInShelf,
  isLoadingInBookshelves,
}: AddBookButtonProps) => {
  const { mutate: addBook, isPending: isAdding } = useAddBookToShelf();
  const { mutate: removeBook, isPending: isRemoving } =
    useRemoveBookFromShelf();

  const handlePress = () => {
    if (userID !== "" && bookID !== "" && !(isAdding || isRemoving)) {
      if (isInShelf) {
        removeBook({
          userID,
          bookID,
          shelfName: serverShelfName as ServerBookShelfName,
        });
      } else {
        addBook({
          userID,
          bookID,
          shelfName: serverShelfName as ServerBookShelfName,
        });
      }
    }
  };

  return (
    // TODO: Make this pretty
    <View style={styles.buttonContainer}>
      <Button
        onPress={handlePress}
        title={
          isAdding || isRemoving || isLoadingInBookshelves
            ? "Loading..."
            : `${isInShelf ? "Remove from" : "Add to"} ${title}`
        }
        accessibilityLabel={`Press to ${isInShelf ? "remove from" : "add to"} ${title}`}
        disabled={isAdding || isRemoving || isLoadingInBookshelves}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 5,
  },
});

export default AddBookButton;
