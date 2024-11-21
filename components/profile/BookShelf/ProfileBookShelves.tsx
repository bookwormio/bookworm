import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { type ServerBookShelfName } from "../../../enums/Enums";
import { useUserID } from "../../auth/context";
import BookWormButton from "../../buttons/BookWormButton";
import WormLoader from "../../wormloader/WormLoader";
import { useGetAllBorrowingBooksForUser } from "../hooks/useBookBorrowQueries";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";
import { useNavigateToRecommendation } from "../hooks/useRouteHooks";
import BookShelf from "./BookShelf";
import BorrowingBookShelf from "./BorrowingBookShelf";

interface BookShelvesProp {
  viewingUserID: string;
}

const ProfileBookShelves = ({ viewingUserID }: BookShelvesProp) => {
  const { userID } = useUserID();

  const {
    data: bookShelves,
    isLoading: isLoadingBooks,
    isError: isErrorShelfBooks,
  } = useGetBooksForBookshelves(viewingUserID ?? "");

  const {
    data: borrowingBooks,
    isLoading: isLoadingBorrowingBooks,
    isError: isErrorBorrowingBooks,
  } = useGetAllBorrowingBooksForUser(viewingUserID);

  const navigateToRecommendation = useNavigateToRecommendation(viewingUserID);

  if (isErrorBorrowingBooks || isErrorShelfBooks) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "An error occurred while fetching the books",
    });
  }

  if (isLoadingBooks) {
    return (
      <View style={styles.container}>
        <WormLoader style={{ width: 50, height: 50 }} />
      </View>
    );
  }

  return (
    <View style={styles.scrollContent}>
      {viewingUserID !== userID && (
        <View style={styles.recommendButton}>
          <BookWormButton
            title={"Recommend A Book"}
            onPress={() => {
              navigateToRecommendation();
            }}
          />
        </View>
      )}
      {Object.entries(bookShelves ?? {}).map(([shelfName, books]) => (
        <BookShelf
          key={shelfName}
          shelfName={shelfName as ServerBookShelfName}
          books={books}
          viewingUserID={viewingUserID}
        />
      ))}
      {/* Show borrowing shelf only if the user is viewing their own profile */}
      {userID === viewingUserID && !isLoadingBorrowingBooks && (
        <BorrowingBookShelf
          key={"borrowing"}
          books={borrowingBooks ?? []}
          viewingUserID={viewingUserID}
        />
      )}
    </View>
  );
};

export default ProfileBookShelves;

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  recommendButton: { paddingLeft: 40, paddingRight: 40, marginTop: 20 },
});
