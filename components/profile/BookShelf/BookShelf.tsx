import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import {
  BOOKSHELF_DISPLAY_NAMES,
  BOOKSHELF_SUBTITLES,
  ServerBookBorrowStatus,
  ServerBookShelfName,
  SIMILAR_BOOKS_SHELF_NAME,
  type BookShelfName,
} from "../../../enums/Enums";
import { type BookShelfBookModel } from "../../../types";
import { useUserID } from "../../auth/context";
import { useGetLendingLibraryBookStatuses } from "../hooks/useBookBorrowQueries";
import { useNavigateToBookList } from "../hooks/useRouteHooks";
import BookBorrowButton from "./BookBorrowButton";
import BookShelfBook from "./BookShelfBook";
import BookShelfLendingStatus from "./BookShelfLendingStatus";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BookShelfProps {
  shelfName: BookShelfName;
  books: BookShelfBookModel[];
  viewingUserID: string;
}

const BookShelf = ({ shelfName, books, viewingUserID }: BookShelfProps) => {
  const { userID } = useUserID();
  const navigateToBookList = useNavigateToBookList(viewingUserID);

  const isCurrentUser = userID === viewingUserID;
  const bookIds = books.map((book) => book.id);

  // Cannot conditionally call hooks, so we need to call it regardless of the shelf
  // Pass in empty data if the shelf is not lending library
  const { data: lendingStatuses, isLoading: isLoadingLendingStatus } =
    useGetLendingLibraryBookStatuses(
      shelfName === ServerBookShelfName.LENDING_LIBRARY ? viewingUserID : "",
      shelfName === ServerBookShelfName.LENDING_LIBRARY ? userID ?? "" : "",
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
            (shelfName === SIMILAR_BOOKS_SHELF_NAME &&
              viewingUserID === userID && (
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
                  viewingUserID={viewingUserID}
                />
              )}
            </TouchableOpacity>

            {shelfName === ServerBookShelfName.LENDING_LIBRARY &&
              // Showing book borrow button for other users
              (!isCurrentUser ? (
                <View style={sharedBookshelfStyles.buttonContainer}>
                  <BookBorrowButton
                    bookID={item.id}
                    bookTitle={item.volumeInfo?.title ?? ""}
                    bookOwnerID={viewingUserID}
                    borrowInfo={lendingStatuses?.[item.id]?.borrowInfo}
                    requestStatus={lendingStatuses?.[item.id]?.requestStatus}
                    isLoading={isLoadingLendingStatus}
                  />
                </View>
              ) : (
                // Showing my lending status for my books
                lendingStatuses?.[item.id]?.borrowInfo?.borrowStatus ===
                  ServerBookBorrowStatus.BORROWING && (
                  <BookShelfLendingStatus
                    borrowingUserID={
                      lendingStatuses?.[item.id]?.borrowInfo?.borrowingUserID ??
                      ""
                    }
                  ></BookShelfLendingStatus>
                )
              ))}
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
