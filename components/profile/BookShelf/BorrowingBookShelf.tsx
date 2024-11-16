import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  BookRequestNotificationStatus,
  BOOKSHELF_DISPLAY_NAMES,
  BOOKSHELF_SUBTITLES,
  BORROWING_SHELF_NAME,
} from "../../../enums/Enums";

import { FontAwesome5 } from "@expo/vector-icons";
import { BOOKWORM_ORANGE } from "../../../constants/constants";
import { type BorrowingBookshelfModel } from "../../../types";
import { useNavigateToBookList } from "../hooks/useRouteHooks";
import BookBorrowButton from "./BookBorrowButton";
import BookShelfBook from "./BookShelfBook";
import { sharedBookshelfStyles } from "./styles/SharedBookshelfStyles";

interface BorrowingBookShelfProps {
  books: BorrowingBookshelfModel[];
  userID: string;
}

const BorrowingBookShelf = ({ books, userID }: BorrowingBookShelfProps) => {
  const shelfNameDisplay = BOOKSHELF_DISPLAY_NAMES[BORROWING_SHELF_NAME];
  const shelfSubtitle = BOOKSHELF_SUBTITLES[BORROWING_SHELF_NAME];
  const navigateToBookList = useNavigateToBookList(userID);

  return (
    <View style={sharedBookshelfStyles.list}>
      <View style={sharedBookshelfStyles.heading}>
        <TouchableOpacity
          onPress={() => {
            navigateToBookList(BORROWING_SHELF_NAME);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={sharedBookshelfStyles.title}>{shelfNameDisplay}</Text>
            <FontAwesome5
              style={{ paddingLeft: 5 }}
              name="chevron-right"
              size={16}
              color={BOOKWORM_ORANGE}
            />
          </View>
          <Text style={sharedBookshelfStyles.subtitle}>{shelfSubtitle}</Text>
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
