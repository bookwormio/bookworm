import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { type BookShelfBookModel } from "../../types";
import BookWormButton from "../button/BookWormButton";
import BookShelfBook from "../profile/BookShelf/BookShelfBook";
import { sharedBookshelfStyles } from "../profile/BookShelf/styles/SharedBookshelfStyles";

interface SimilarBookShelfProps {
  books: BookShelfBookModel[];
  userID: string;
}

// TODO maybe abstract this into BookShelf
const SimilarBookShelf = ({ books, userID }: SimilarBookShelfProps) => {
  const shelfNameDisplay = "Similar Books";
  const ORIGINAL_BOOK_TITLE = "FAKE TITLE";

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
            <FontAwesome5
              style={{ paddingLeft: 5 }}
              name="chevron-right"
              size={16}
              color="black"
            />
          </View>

          <Text style={sharedBookshelfStyles.subtitle}>
            {/* TODO make const */}
            {"Displaying similar books to " + ORIGINAL_BOOK_TITLE}
          </Text>
        </TouchableOpacity>
        TODO maybe remove
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
                />
              )}
            </TouchableOpacity>

            <View style={sharedBookshelfStyles.buttonContainer}>
              <BookWormButton
                title="add to shelf"
                onPress={() => {
                  // TODO fill in with modal logic
                }}
              />
            </View>
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
