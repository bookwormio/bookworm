import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import {
  BOOKSHELF_DISPLAY_NAMES,
  BOOKSHELF_SUBTITLES,
  ServerBookShelfName,
  SIMILAR_BOOKS_SHELF_NAME,
  type BookShelfName,
} from "../../../enums/Enums";
import { type BookShelfBookModel } from "../../../types";
import { useAuth } from "../../auth/context";
import { useGetLendingLibraryBookStatuses } from "../hooks/useBookBorrowQueries";
import { useNavigateToBookList } from "../hooks/useRouteHooks";
import BookBorrowButton from "./BookBorrowButton";
import BookShelfBook from "./BookShelfBook";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BookShelfProps {
  shelfName: BookShelfName;
  books: BookShelfBookModel[];
  userID: string;
}

const BookShelf = ({ shelfName, books, userID }: BookShelfProps) => {
  const { user } = useAuth();
  const navigateToBookList = useNavigateToBookList(userID);

  const bookIds = books.map((book) => book.id);

  // Cannot conditionally call hooks, so we need to call it regardless of the shelf
  // Pass in empty data if the shelf is not lending library
  const { data: lendingStatuses, isLoading: isLoadingLendingStatus } =
    useGetLendingLibraryBookStatuses(
      shelfName === ServerBookShelfName.LENDING_LIBRARY ? userID : "",
      shelfName === ServerBookShelfName.LENDING_LIBRARY ? user?.uid ?? "" : "",
      shelfName === ServerBookShelfName.LENDING_LIBRARY ? bookIds : [],
    );

  const shelfNameDisplay = BOOKSHELF_DISPLAY_NAMES[shelfName];
  const isShelfClickable = shelfName !== SIMILAR_BOOKS_SHELF_NAME;

  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <TouchableOpacity
          onPress={() => {
            navigateToBookList(shelfName);
          }}
          disabled={!isShelfClickable}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
            {isShelfClickable && (
              <FontAwesome5
                style={{ paddingLeft: 5 }}
                name="chevron-right"
                size={16}
                color="black"
              />
            )}
          </View>
          {shelfName === ServerBookShelfName.LENDING_LIBRARY ||
            (shelfName === SIMILAR_BOOKS_SHELF_NAME && userID === user?.uid && (
              <Text style={sharedBookshelfStyles.subtitle}>
                {BOOKSHELF_SUBTITLES[shelfName]}
              </Text>
            ))}
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
                  shelfName={shelfName}
                  userID={userID}
                />
              )}
            </TouchableOpacity>

            {shelfName === ServerBookShelfName.LENDING_LIBRARY &&
              userID !== user?.uid && (
                <View style={sharedBookshelfStyles.buttonContainer}>
                  <BookBorrowButton
                    bookID={item.id}
                    bookTitle={item.volumeInfo?.title ?? ""}
                    bookOwnerID={userID}
                    borrowInfo={lendingStatuses?.[item.id]?.borrowInfo}
                    requestStatus={lendingStatuses?.[item.id]?.requestStatus}
                    isLoading={isLoadingLendingStatus}
                    notifID={lendingStatuses?.[item.id]?.notifID}
                  />
                </View>
              )}
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

export default BookShelf;
