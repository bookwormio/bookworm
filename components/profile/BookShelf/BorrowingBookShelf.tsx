import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  BookRequestNotificationStatus,
  bookShelfDisplayMap,
  bookShelfSubtitle,
  BORROWING_SHELF_NAME,
} from "../../../enums/Enums";
import { type BorrowingBookshelfModel } from "../hooks/useBookBorrowQueries";
import BookBorrowButton from "./BookBorrowButton";
import BookShelfBook from "./BookShelfBook";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BorrowingBookShelfProps {
  books: BorrowingBookshelfModel[];
  userID: string;
}

const BorrowingBookShelf = ({ books, userID }: BorrowingBookShelfProps) => {
  const shelfNameDisplay = bookShelfDisplayMap[BORROWING_SHELF_NAME];
  const shelfSubtitle = bookShelfSubtitle[BORROWING_SHELF_NAME];

  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <View>
          <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
          <Text style={sharedBookshelfStyles.subtitle}>{shelfSubtitle}</Text>
        </View>
        <Text style={sharedBookshelfStyles.length}>{books.length}</Text>
      </View>
      <FlatList
        horizontal
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sharedBookshelfStyles.listContainer}
        style={sharedBookshelfStyles.flatList}
        data={books}
        keyExtractor={(item) => item.bookShelfInfo.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity>
              {item.bookShelfInfo.volumeInfo != null && (
                <BookShelfBook
                  book={item.bookShelfInfo.volumeInfo}
                  bookID={item.bookShelfInfo.id}
                />
              )}
            </TouchableOpacity>
            <View style={sharedBookshelfStyles.buttonContainer}>
              <BookBorrowButton
                bookID={item.bookShelfInfo.id}
                bookTitle={item.bookShelfInfo.volumeInfo?.title ?? ""}
                bookOwnerID={item.borrowInfo.lendingUserID}
                borrowInfo={item.borrowInfo}
                requestStatus={BookRequestNotificationStatus.ACCEPTED}
                isLoading={false}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={sharedBookshelfStyles.emptyShelfText}>
            {"You aren't borrowing any books"}
          </Text>
        )}
      />
      <Toast />
    </View>
  );
};

export default BorrowingBookShelf;
