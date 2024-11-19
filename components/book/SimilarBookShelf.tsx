import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { type BookVolumeItem } from "../../types";
import BookShelfBook from "../profile/BookShelf/BookShelfBook";
import { sharedBookshelfStyles } from "../profile/BookShelf/styles/SharedBookshelfStyles";

interface SimilarBookShelfProps {
  books: BookVolumeItem[];
  userID: string;
  bookTitle?: string;
}

// TODO maybe abstract this into BookShelf
const SimilarBookShelf = ({
  books,
  userID,
  bookTitle,
}: SimilarBookShelfProps) => {
  const shelfNameDisplay = "Similar Books";

  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <TouchableOpacity
          onPress={() => {
            // navigateToBookList(shelfName);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
          </View>

          {bookTitle != null && (
            <Text style={sharedBookshelfStyles.subtitle}>
              {"Similar books to " + bookTitle}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={sharedBookshelfStyles.length}>{books.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sharedBookshelfStyles.listContainer}
        style={sharedBookshelfStyles.flatList}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {item.volumeInfo != null && (
                <BookShelfBook
                  book={item.volumeInfo}
                  bookID={item.id}
                  userID={userID}
                  thumbnailOverride={item.volumeInfo.imageLinks?.thumbnail}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={sharedBookshelfStyles.emptyShelfText}>
            No books available
          </Text>
        )}
      />
    </View>
  );
};

export default SimilarBookShelf;
