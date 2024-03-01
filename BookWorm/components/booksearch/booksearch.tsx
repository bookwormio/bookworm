import axios from "axios";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import SearchBar from "../searchbar/searchbar";
import BookPreviewList from "./bookpreviewlist";

// TODO: put api key elsewhere
const BOOKS_API_KEY = "AIzaSyDdLpV4nXjFf-Z62gCpNC9hqK6km6UB58s";

// TODO: put this function elsewhere
async function fetchBooksByQuery(
  searchValue: string
): Promise<BookVolumeItem[]> {
  try {
    const response = await axios.get<BooksResponse>(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: searchValue,
          key: BOOKS_API_KEY,
          limit: 10,
        },
      }
    );
    // TODO: remove
    console.log(response.data.items);
    return response.data.items.map((item) => ({
      kind: item.kind,
      id: item.kind,
      etag: item.etag,
      selfLink: item.selfLink,
      volumeInfo: item.volumeInfo,
    }));
  } catch (error) {
    // TODO: remove
    console.error("Error fetching books", error);
    throw error;
  }
}

const BookSearch: React.FC = () => {
  const [books, setBooks] = useState<BookVolumeItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  useEffect(() => {
    const bookSearchValue = searchPhrase;
    if (bookSearchValue.trim() !== "") {
      fetchBooksByQuery(bookSearchValue)
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
      />
      <View>
        <BookPreviewList volumes={books}></BookPreviewList>
      </View>
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
    marginBottom: 20,
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
});
