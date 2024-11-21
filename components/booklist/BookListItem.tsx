import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { closeKeyboardThen } from "../../app/util/keyboardHelpers";
import { BOOKWORM_ORANGE } from "../../constants/constants";
import {
  BookRequestNotificationStatus,
  BOOKSHELF_DISPLAY_NAMES,
  ServerBookShelfName,
} from "../../enums/Enums";
import {
  type BookStatusModel,
  type BookVolumeInfo,
  type BorrowingBookshelfModel,
} from "../../types";
import { useUserID } from "../auth/context";
import BookBorrowButton from "../profile/BookShelf/BookBorrowButton";
import { useRemoveBookFromShelf } from "../profile/hooks/useBookshelfQueries";
import { useNavigateToBook } from "../profile/hooks/useRouteHooks";
import BookshelfListChip from "./BookshelfListChip";

interface BookListItemProps {
  bookID: string;
  volumeInfo: BookVolumeInfo;
  handleBookClickOverride?: (
    bookID: string,
    volumeInfo: BookVolumeInfo,
  ) => void;
  bookShelf?: ServerBookShelfName;
  showRemoveButton?: boolean;
  viewingUserID?: string;
  lendingStatus?: BookStatusModel;
  isLoadingLendingStatus?: boolean;
  borrowingBookShelf?: boolean;
  borrwingBook?: BorrowingBookshelfModel;
}

const BookListItem = ({
  bookID,
  volumeInfo,
  handleBookClickOverride,
  bookShelf,
  showRemoveButton,
  viewingUserID,
  lendingStatus,
  isLoadingLendingStatus,
  borrowingBookShelf,
  borrwingBook,
}: BookListItemProps) => {
  const navigateToBook = useNavigateToBook(bookID);

  const handleBookClicked = () => {
    navigateToBook();
  };

  const { userID } = useUserID();

  const { mutate: removeBook, isPending: removeBookPending } =
    useRemoveBookFromShelf();

  // Function to call the mutation
  const handleRemoveBook = (bookID: string) => {
    if (bookID != null && bookShelf != null) {
      // Trigger the mutation with error handling
      removeBook(
        { userID, bookID, shelfName: bookShelf },
        {
          onError: (error) => {
            console.error("Failed to remove book:", error);
            // Here you might want to trigger some user notification or logging
          },
        },
      );
    } else {
      console.log("User or book ID or bookShelf is not available");
    }
  };

  const handleRemoveClick = (
    bookID: string,
    bookShelf: ServerBookShelfName,
    volumeInfo: BookVolumeInfo,
  ) => {
    Alert.alert(
      "Confirmation",
      `Do you want to remove ${volumeInfo.title} from ${BOOKSHELF_DISPLAY_NAMES[bookShelf]}?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            handleRemoveBook(bookID);
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.bookItemContainer}
        onPress={() => {
          closeKeyboardThen(() => {
            if (handleBookClickOverride != null) {
              handleBookClickOverride(bookID, volumeInfo);
            } else {
              handleBookClicked();
            }
          });
        }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              borrowingBookShelf != null && borrowingBookShelf
                ? { uri: borrwingBook?.bookShelfInfo.volumeInfo.thumbnail }
                : { uri: volumeInfo?.imageLinks?.smallThumbnail }
            }
            placeholder={require("../../assets/default_book.png")}
            cachePolicy={"memory-disk"}
            contentFit={"contain"}
            style={styles.image}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {volumeInfo?.title}
          </Text>

          <Text style={styles.author}>
            Author: {volumeInfo?.authors?.join(", ")}
          </Text>
          {/* TODO: Add more properties as needed */}
        </View>
        {bookShelf != null && <BookshelfListChip bookShelf={bookShelf} />}
      </TouchableOpacity>
      {bookShelf === ServerBookShelfName.LENDING_LIBRARY &&
        viewingUserID !== userID &&
        viewingUserID != null &&
        volumeInfo.title != null && (
          <View style={styles.lendBorrowButtonContainer}>
            <BookBorrowButton
              bookID={bookID}
              bookTitle={volumeInfo?.title}
              bookOwnerID={viewingUserID}
              borrowInfo={lendingStatus?.borrowInfo}
              requestStatus={lendingStatus?.requestStatus}
              isLoading={isLoadingLendingStatus ?? false}
            />
          </View>
        )}
      {borrowingBookShelf != null &&
        borrowingBookShelf &&
        borrwingBook != null && (
          <View style={styles.lendBorrowButtonContainer}>
            <BookBorrowButton
              bookID={borrwingBook?.bookShelfInfo?.id}
              bookTitle={borrwingBook?.bookShelfInfo?.volumeInfo?.title ?? ""}
              bookOwnerID={borrwingBook?.borrowInfo?.lendingUserID}
              borrowInfo={borrwingBook?.borrowInfo}
              requestStatus={BookRequestNotificationStatus.ACCEPTED}
              isLoading={false}
            />
          </View>
        )}
      {showRemoveButton != null &&
        showRemoveButton &&
        viewingUserID === userID &&
        bookID != null &&
        bookShelf != null && (
          <TouchableOpacity
            onPress={() => {
              handleRemoveClick(bookID, bookShelf, volumeInfo);
            }}
            disabled={removeBookPending}
            style={styles.removeButtonContainer}
          >
            <AntDesign
              name={"minuscircleo"}
              size={20}
              color={BOOKWORM_ORANGE}
            />
          </TouchableOpacity>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    borderBottomWidth: 1,
  },
  bookItemContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
  },
  imageContainer: {
    marginRight: 10, // Add some spacing between image and text
  },
  image: {
    width: 40,
    height: 50,
  },
  infoContainer: {
    flex: 1, // Take up remaining space
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
  },
  removeButtonContainer: {
    paddingRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lendBorrowButtonContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
  },
});

export default BookListItem;
