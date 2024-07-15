import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { fetchBooksByTitleSearch } from "../../services/books-services/BookQueries";
import { type BookVolumeItem } from "../../types";
import BookList from "../booklist/BookList";
import SearchBar from "./searchbar";

const BOOK_SEARCH_PLACEHOLDER = "Search for books";

interface BookSearchProps {
  searchPhrase: string;
  setSearchPhrase: (searchString: string) => void;
}

const BookSearch = ({ searchPhrase, setSearchPhrase }: BookSearchProps) => {
  const [books, setBooks] = useState<BookVolumeItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(
    searchPhrase !== "",
  );

  const { data: fetchBookData } = useQuery({
    queryKey: ["searchbooks", searchPhrase],
    queryFn: async () => {
      if (searchPhrase.trim() === "") {
        setBooks([]);
      }
      if (
        searchPhrase != null &&
        searchPhrase !== "" &&
        searchPhrase.trim() !== ""
      ) {
        return await fetchBooksByTitleSearch(searchPhrase);
      } else {
        return null;
      }
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  useEffect(() => {
    if (fetchBookData !== undefined && fetchBookData !== null) {
      setBooks(fetchBookData);
    }
  }, [fetchBookData]);

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
    padding: 10,
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
