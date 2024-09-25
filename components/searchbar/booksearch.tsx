import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { fetchBooksByTitleSearch } from "../../services/books-services/BookQueries";
import { type BookVolumeInfo, type BookVolumeItem } from "../../types";
import { useAuth } from "../auth/context";
import BookList from "../booklist/BookList";
import { useGetBooksForBookshelves } from "../profile/hooks/useBookshelfQueries";
import SearchBar from "./searchbar";
import {
  filterBookShelfBooksByTitle,
  mapAndSortPreloadedBooks,
  removeDuplicateBooks,
} from "./util/searchBarUtils";

const BOOK_SEARCH_PLACEHOLDER = "Search for books";

interface BookSearchProps {
  searchPhrase: string;
  setSearchPhrase: (searchString: string) => void;
  handleBookClickOverride?: (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => void;
}

const BookSearch = ({
  searchPhrase,
  setSearchPhrase,
  handleBookClickOverride,
}: BookSearchProps) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookVolumeItem[]>([]);
  const [flattenedShelfBooks, setFlattenedShelfBooks] = useState<
    BookVolumeItem[]
  >([]);

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

  const { data: preloadedShelfBooks } = useGetBooksForBookshelves(
    user?.uid ?? "",
  );

  useEffect(() => {
    // This useEffect should run ONCE on component mount

    // If there are no preloaded books, then we don't need to do anything
    if (preloadedShelfBooks == null) {
      return;
    }

    const sortedBooks = mapAndSortPreloadedBooks(preloadedShelfBooks);
    setFlattenedShelfBooks(sortedBooks);

    if (searchPhrase === "") {
      setBooks(sortedBooks);
    }
  }, [preloadedShelfBooks]);

  useEffect(() => {
    // Filter the pre-sorted book shelves by the search phrase
    const filteredBookShelfBooks = filterBookShelfBooksByTitle(
      flattenedShelfBooks,
      searchPhrase,
    );

    // Filter preloaded books by search phrase if books have not been fetched
    if (fetchBookData == null) {
      setBooks(filteredBookShelfBooks);
      return;
    }

    // If there are no book shelf books, then we don't need to filter the books
    if (flattenedShelfBooks == null || flattenedShelfBooks.length === 0) {
      setBooks(fetchBookData);
      return;
    }

    // Remove duplicates and coalesce the fetched books with the filtered book shelf books
    setBooks(
      removeDuplicateBooks([...filteredBookShelfBooks, ...fetchBookData]),
    );
  }, [fetchBookData, searchPhrase]);

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
            <BookList
              volumes={[book]}
              handleBookClickOverride={handleBookClickOverride}
            />
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
    backgroundColor: APP_BACKGROUND_COLOR,
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
