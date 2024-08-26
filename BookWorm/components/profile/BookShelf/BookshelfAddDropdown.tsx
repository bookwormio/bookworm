import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import {
  bookShelfDisplayMap,
  type ServerBookShelfName,
} from "../../../enums/Enums";
import {
  useAddBookToShelf,
  useGetShelvesForBook,
  useRemoveBookFromShelf,
} from "../hooks/bookshelfQueries";

interface BookshelfAddDropdownProps {
  userID: string;
  bookID: string;
}

interface ShelfItem {
  label: string;
  value: ServerBookShelfName;
}

const BookshelfAddDropdown = ({
  userID,
  bookID,
}: BookshelfAddDropdownProps) => {
  const [selectedShelves, setSelectedShelves] = useState<ServerBookShelfName[]>(
    [],
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { mutate: addBook, isPending: isAdding } = useAddBookToShelf();
  const { mutate: removeBook, isPending: isRemoving } =
    useRemoveBookFromShelf();
  const { data: inBookshelves, isLoading: isLoadingInBookshelves } =
    useGetShelvesForBook(userID, bookID);

  const shelfItems: ShelfItem[] = Object.entries(bookShelfDisplayMap).map(
    ([value, label]) => ({
      label,
      value: value as ServerBookShelfName,
    }),
  );

  useEffect(() => {
    if (inBookshelves != null && !isUpdating) {
      setSelectedShelves(inBookshelves);
    }
  }, [inBookshelves, isUpdating]);

  const handleChange = useCallback(
    async (items: string[]) => {
      // Check if all items are valid bookshelves
      const typedItems = items.filter((item): item is ServerBookShelfName =>
        Object.keys(bookShelfDisplayMap).includes(item),
      );

      if (typedItems.length !== items.length) {
        Toast.show({
          type: "error",
          text1: "Invalid Selection",
          text2: "Please select valid bookshelves only.",
        });
        return;
      }

      setIsUpdating(true);
      setSelectedShelves(typedItems);

      const added = typedItems.filter(
        (item) => !selectedShelves.includes(item),
      );
      const removed = selectedShelves.filter(
        (item) => !typedItems.includes(item),
      );

      const addPromises = added.map(async (shelfName) => {
        await new Promise<void>((resolve) => {
          if (userID !== "" && bookID !== "") {
            addBook(
              { userID, bookID, shelfName },
              {
                onError: (error) => {
                  Toast.show({
                    type: "error",
                    text1: "Error Adding Book",
                    text2: `Failed to add book to ${shelfName}: ${error.message}`,
                  });
                  resolve();
                },
                onSettled: () => {
                  resolve();
                },
              },
            );
          } else {
            resolve();
          }
        });
      });

      const removePromises = removed.map(async (shelfName) => {
        await new Promise<void>((resolve) => {
          if (userID !== "" && bookID !== "") {
            removeBook(
              { userID, bookID, shelfName },
              {
                onError: (error) => {
                  Toast.show({
                    type: "error",
                    text1: "Error Removing Book",
                    text2: `Failed to remove book from ${shelfName}: ${error.message}`,
                  });
                  resolve();
                },
                onSettled: () => {
                  resolve();
                },
              },
            );
          } else {
            resolve();
          }
        });
      });

      await Promise.all([...addPromises, ...removePromises]).then(() => {
        setIsUpdating(false);
      });
    },
    [selectedShelves, addBook, removeBook, userID, bookID],
  );

  const isDisabled =
    isAdding || isRemoving || isLoadingInBookshelves || isUpdating;

  return (
    <View style={styles.container}>
      <MultiSelect
        style={styles.dropdown}
        data={shelfItems}
        labelField="label"
        valueField="value"
        placeholder="Select bookshelves"
        value={selectedShelves}
        onChange={handleChange}
        disable={isDisabled}
        search={false}
        maxHeight={300}
      />
      <Toast />
    </View>
  );
};

export default BookshelfAddDropdown;

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
