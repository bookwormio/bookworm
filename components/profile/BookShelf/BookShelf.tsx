import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  BOOKSHELF_DISPLAY_NAMES,
  BOOKSHELF_SUBTITLES,
  ServerBookShelfName,
} from "../../../enums/Enums";
import { type BookShelfBookModel } from "../../../types";
import { useAuth } from "../../auth/context";
import { useGetLendingLibraryBookStatuses } from "../hooks/useBookBorrowQueries";
import { useRemoveBookFromShelf } from "../hooks/useBookshelfQueries";
import {
  useBookRouteInfo,
  useNavigateToBookList,
} from "../hooks/useRouteHooks";
import BookBorrowButton from "./BookBorrowButton";
import BookShelfBook from "./BookShelfBook";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BookShelfProps {
  shelfName: ServerBookShelfName;
  books: BookShelfBookModel[];
  userID: string;
}

const BookShelf = ({ shelfName, books, userID }: BookShelfProps) => {
  const { user } = useAuth();

  const { mutate: removeBook, isPending: removeBookPending } =
    useRemoveBookFromShelf();

  const { type: bookRouteType } = useBookRouteInfo();
  const navigateToBookList = useNavigateToBookList(userID);

  const bookIds = books.map((book) => book.id);

  // Cannot conditionally call hooks, so we need to call it regardless of the shelf
  // Pass in empty data if the shelf is not lending library
  const {
    data: lendingStatuses,
    isLoading: isLoadingLendingStatus,
    isError: isLendingStatusError,
  } = useGetLendingLibraryBookStatuses(
    shelfName === ServerBookShelfName.LENDING_LIBRARY ? userID : "",
    shelfName === ServerBookShelfName.LENDING_LIBRARY ? user?.uid ?? "" : "",
    shelfName === ServerBookShelfName.LENDING_LIBRARY ? bookIds : [],
  );

  // Function to call the mutation
  const handleRemoveBook = (bookID: string) => {
    if (user != null && bookID != null) {
      // Trigger the mutation with error handling
      removeBook(
        { userID: user.uid, bookID, shelfName },
        {
          onError: (error) => {
            console.error("Failed to remove book:", error);
            // Here you might want to trigger some user notification or logging
          },
        },
      );
    } else {
      console.log("User or book ID is not available");
    }
  };

  if (isLendingStatusError) {
    Toast.show({
      type: "error",
      text1: "Error loading lending statuses",
      text2: "Please try again later",
    });
  }

  const shelfNameDisplay = BOOKSHELF_DISPLAY_NAMES[shelfName];

  // TODO: Touchable Opacity Here
  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <TouchableOpacity
          onPress={() => {
            navigateToBookList(shelfName);
          }}
        >
          <View>
            <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
            {shelfName === ServerBookShelfName.LENDING_LIBRARY &&
              userID === user?.uid && (
                <Text style={sharedBookshelfStyles.subtitle}>
                  {BOOKSHELF_SUBTITLES[shelfName]}
                </Text>
              )}
          </View>
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
                <BookShelfBook book={item.volumeInfo} bookID={item.id} />
              )}
            </TouchableOpacity>
            {/* TODO: make this look better with minus sign button */}
            {bookRouteType === "PROFILE" && userID === user?.uid && (
              <TouchableOpacity
                onPress={() => {
                  handleRemoveBook(item.id);
                }}
                disabled={removeBookPending}
                style={{ paddingTop: 2 }}
              >
                <Text style={{ color: "#FB6D0B" }}>Remove</Text>
              </TouchableOpacity>
            )}
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
