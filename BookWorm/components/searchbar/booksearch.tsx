import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { fetchBooksByTitleSearch } from "../../services/firebase-services/queries";
import BookList from "../booklist/BookList";
import SearchBar from "./searchbar";

const BOOK_SEARCH_PLACEHOLDER = "Search for books";

const BookSearch = () => {
  const [books, setBooks] = useState<BookVolumeItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  useEffect(() => {
    const bookSearchValue = searchPhrase;
    if (bookSearchValue.trim() !== "") {
      fetchBooksByTitleSearch(bookSearchValue)
        .then((fetchedBooks) => {
          setBooks(fetchedBooks);
        })
        .catch((error) => {
          alert("Error fetching books: " + error);
        });
    } else {
      // Clear books when search phrase is empty
      setBooks([]);
    }
  }, [searchPhrase]);

  return (
    <View style={styles.container}>
      <SearchBar
        clicked={searchClicked}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setSearchClicked}
        placeholderText={BOOK_SEARCH_PLACEHOLDER}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {books.map((book, index) => (
          <View style={styles.bookContainer} key={index}>
            <BookList volumes={[book]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default BookSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  bookContainer: {
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  authors: {
    fontSize: 16,
  },
  otherInfo: {
    fontSize: 14,
    fontStyle: "italic",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
});
