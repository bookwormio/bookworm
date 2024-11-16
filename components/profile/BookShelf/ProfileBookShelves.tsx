import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { type ServerBookShelfName } from "../../../enums/Enums";
import { useAuth } from "../../auth/context";
import BookWormButton from "../../button/BookWormButton";
import WormLoader from "../../wormloader/WormLoader";
import { useGetAllBorrowingBooksForUser } from "../hooks/useBookBorrowQueries";
import { useGetBooksForBookshelves } from "../hooks/useBookshelfQueries";
import { useNavigateToRecommendation } from "../hooks/useRouteHooks";
import BookShelf from "./BookShelf";
import BorrowingBookShelf from "./BorrowingBookShelf";

interface BookShelvesProp {
  userID: string;
}

const ProfileBookShelves = ({ userID }: BookShelvesProp) => {
  const { user } = useAuth();

  const {
    data: bookShelves,
    isLoading: isLoadingBooks,
    isError: isErrorShelfBooks,
  } = useGetBooksForBookshelves(userID ?? "");

  const {
    data: borrowingBooks,
    isLoading: isLoadingBorrowingBooks,
    isError: isErrorBorrowingBooks,
  } = useGetAllBorrowingBooksForUser(userID);

  const navigateToRecommendation = useNavigateToRecommendation(userID);

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
      {userID !== user?.uid && (
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
          userID={userID}
        />
      ))}
      {/* Show borrowing shelf only if the user is viewing their own profile */}
      {user?.uid === userID && !isLoadingBorrowingBooks && (
        <BorrowingBookShelf
          key={"borrowing"}
          books={borrowingBooks ?? []}
          userID={userID}
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
