import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ServerBookShelfName } from "../../enums/Enums";
import {
  getBooksByBookIDs,
  getBooksFromUserBookShelves,
} from "../../services/firebase-services/queries";
import { type UserBookShelvesModel } from "../../types";
import { useAuth } from "../auth/context";
import BookShelf from "./BookShelf/BookShelf";

const ProfileBookShelves = () => {
  const { user } = useAuth();
  // Initialize the bookShelves state with all shelves empty
  const initialShelves: UserBookShelvesModel = Object.values(
    ServerBookShelfName,
  ).reduce<UserBookShelvesModel>((acc, cur) => {
    acc[cur] = [];
    return acc;
  }, {});

  const [bookShelves, setBookShelves] =
    useState<UserBookShelvesModel>(initialShelves);

  // TODO: redo ths using react query
  // TODO: add loading state based on react query
  const getBooks = async () => {
    if (user !== null) {
      try {
        // Dynamically generate the list of shelf types
        const shelfTypes = Object.values(ServerBookShelfName);
        const userBooks = await getBooksFromUserBookShelves(
          user.uid,
          shelfTypes,
        );

        if (userBooks != null) {
          const allShelfPromises = Object.entries(userBooks).map(
            async ([shelf, books]) => {
              const bookIds = books.map((book) => book.id);
              // Fetch book info for each book in the shelf
              const bookInfos = await getBooksByBookIDs(bookIds);
              return {
                [shelf]: books.map((book, index) => ({
                  ...book,
                  volumeInfo: bookInfos[index],
                })),
              };
            },
          );
          // Concurrently fetch books for all shelves
          const shelvesWithBooksArray = await Promise.all(allShelfPromises);
          // Merge the shelves with books into a single object
          const newShelves = shelvesWithBooksArray.reduce(
            (acc, shelf) => ({
              ...acc,
              ...shelf,
            }),
            {},
          );

          setBookShelves(newShelves);
        } else {
          console.log("No books found on any shelves.");
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    } else {
      console.log("User not logged in.");
    }
  };

  console.log(bookShelves);
  // TODO: remove once react query is implemented
  useEffect(() => {
    // Optionally preload books when the component mounts
    void getBooks();
  }, []); // Re-run when user changes

  return (
    <View style={styles.scrollContent}>
      {Object.entries(bookShelves).map(([shelfName, books]) => (
        <BookShelf
          key={shelfName}
          shelfName={shelfName as ServerBookShelfName}
          books={books}
        />
      ))}
    </View>
  );
};

export default ProfileBookShelves;

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
});
