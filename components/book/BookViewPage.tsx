import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  APP_BACKGROUND_COLOR,
  BOOKWORM_ORANGE,
} from "../../constants/constants";
import {
  BOOKSHELF_BADGES,
  COMPLETION_BADGES,
  ServerBookShelfName,
  type ServerBadgeName,
} from "../../enums/Enums";
import { fetchBookByVolumeID } from "../../services/books-services/BookQueries";
import { type BookVolumeInfo } from "../../types";
import { useAuth } from "../auth/context";
import { areAllBadgesEarned } from "../badges/badgeUtils";
import {
  useCheckForBookShelfBadges,
  useCheckForCompletionBadges,
  useGetExistingEarnedBadges,
} from "../badges/useBadgeQueries";
import BookshelfAddButtons from "../profile/BookShelf/BookshelfAddButtons";
import { useGetUsersWithBookInLendingLibrary } from "../profile/hooks/useBookBorrowQueries";
import {
  useAddBookToShelf,
  useGetShelvesForBook,
  useRemoveBookFromShelf,
} from "../profile/hooks/useBookshelfQueries";
import { useNavigateToUser } from "../profile/hooks/useRouteHooks";
import ProfilePicture from "../profile/ProfilePicture/ProfilePicture";
import WormLoader from "../wormloader/WormLoader";
import SimilarBooksWrapper from "./SimilarBooksWrapper";

interface BookViewProps {
  bookID: string;
}

const BookViewPage = ({ bookID }: BookViewProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookData, setBookData] = useState<BookVolumeInfo | null>(null);
  const [selectedShelves, setSelectedShelves] = useState<ServerBookShelfName[]>(
    [],
  );
  const [pendingChanges, setPendingChanges] = useState<{
    add: ServerBookShelfName[];
    remove: ServerBookShelfName[];
  }>({ add: [], remove: [] });
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { mutateAsync: checkForCompletion } = useCheckForCompletionBadges();
  const { mutateAsync: checkForBookshelf } = useCheckForBookShelfBadges();
  const { data: badges, isLoading: isLoadingBadges } =
    useGetExistingEarnedBadges(user?.uid ?? "");

  const { data: usersWithBook, isLoading: isLoadingUsersWithBook } =
    useGetUsersWithBookInLendingLibrary(user?.uid ?? "", bookID);

  const navigateToUser = useNavigateToUser();
  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "100%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const { data: queryBookData, isLoading: isLoadingBook } = useQuery({
    queryKey: ["bookdata", bookID],
    queryFn: async () =>
      bookID != null ? await fetchBookByVolumeID(bookID) : null,
    staleTime: 60000,
  });

  const { data: inBookshelves, isLoading: isLoadingInBookshelves } =
    useGetShelvesForBook(user?.uid ?? "", bookID ?? "");
  const addBookMutation = useAddBookToShelf();
  const removeBookMutation = useRemoveBookFromShelf();

  useEffect(() => {
    if (queryBookData != null) setBookData(queryBookData);
  }, [queryBookData]);

  useEffect(() => {
    if (inBookshelves != null) {
      setSelectedShelves(inBookshelves);
    }
  }, [inBookshelves]);

  // if book not loading in time, show toast message
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoadingBook) {
        Toast.show({
          type: "error",
          text1: "Loading Error",
          text2: "Failed to load book data. Please try again later.",
        });
      }
    }, 10000);
    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [isLoadingBook]);

  const handleToggleShelf = (shelfName: ServerBookShelfName) => {
    if (selectedShelves.includes(shelfName)) {
      setSelectedShelves((prev) => prev.filter((shelf) => shelf !== shelfName));
      setPendingChanges((prev) => ({
        add: prev.add.filter((s) => s !== shelfName),
        remove: [...prev.remove, shelfName].filter(
          (s) => !prev.add.includes(s),
        ),
      }));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        (error) => {
          console.error("Error creating haptic", error);
        },
      );
      setSelectedShelves((prev) => [...prev, shelfName]);
      setPendingChanges((prev) => ({
        add: [...prev.add, shelfName].filter((s) => !prev.remove.includes(s)),
        remove: prev.remove.filter((s) => s !== shelfName),
      }));
    }
  };

  const applyPendingChanges = async () => {
    if (user?.uid == null || bookID == null || queryBookData == null) return;

    const addPromises = pendingChanges.add.map(async (shelfName) => {
      await addBookMutation.mutateAsync({
        userID: user.uid,
        bookID,
        volumeInfo: {
          title: queryBookData?.title,
          subtitle: queryBookData?.subtitle,
          authors: queryBookData?.authors,
          publisher: queryBookData?.publisher,
          publishedDate: queryBookData?.publishedDate,
          description: queryBookData?.description,
          pageCount: queryBookData?.pageCount,
          categories: queryBookData?.categories,
          maturityRating: queryBookData?.maturityRating,
          previewLink: queryBookData?.previewLink,
          averageRating: queryBookData?.averageRating,
          ratingsCount: queryBookData?.ratingsCount,
          language: queryBookData?.language,
          mainCategory: queryBookData?.mainCategory,
          thumbnail: queryBookData?.imageLinks?.thumbnail,
        },
        shelfName,
      });
      if (shelfName === ServerBookShelfName.LENDING_LIBRARY) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["availableborrow", bookID],
          }),
          queryClient.refetchQueries({
            queryKey: ["availableborrow", bookID],
          }),
        ]);
      }
    });
    const removePromises = pendingChanges.remove.map(async (shelfName) => {
      await removeBookMutation.mutateAsync({
        userID: user.uid,
        bookID,
        shelfName,
      });
      if (shelfName === ServerBookShelfName.LENDING_LIBRARY) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["availableborrow", bookID],
          }),
          queryClient.refetchQueries({
            queryKey: ["availableborrow", bookID],
          }),
        ]);
      }
    });

    try {
      await Promise.all([...addPromises, ...removePromises]);
      if (pendingChanges.add.length > 0 || pendingChanges.remove.length > 0) {
        Toast.show({
          type: "success",
          text1: "Bookshelves Updated",
          text2: "Your changes have been saved.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error Updating Bookshelves",
        text2: "Failed to save your changes. Please try again.",
      });
    } finally {
      setPendingChanges({ add: [], remove: [] });
    }
    if (!isLoadingBadges && badges != null) {
      const badgesSet = new Set<ServerBadgeName>();
      for (const badge of badges) {
        badgesSet.add(badge.badgeID);
      }
      const checkBadgePromises = [];
      if (!areAllBadgesEarned(badgesSet, BOOKSHELF_BADGES)) {
        checkBadgePromises.push(checkForBookshelf({ userID: user?.uid ?? "" }));
      }
      if (!areAllBadgesEarned(badgesSet, COMPLETION_BADGES)) {
        checkBadgePromises.push(
          checkForCompletion({ userID: user?.uid ?? "" }),
        );
      }
      if (checkBadgePromises.length > 0) {
        await Promise.all(checkBadgePromises);
        await queryClient.invalidateQueries({
          queryKey: ["badges", user?.uid ?? ""],
        });
      }
    }
  };
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      // index = -1 means closing
      if (index === -1) {
        void applyPendingChanges();
      }
    },
    [applyPendingChanges],
  );

  function stripHTMLWithRegex(htmlString: string): string {
    let textWithNewlines = htmlString.replace(/<\/?(br|p)[^>]*>/gi, "\n");
    textWithNewlines = textWithNewlines.replace(/<\/?[^>]+(>|$)/g, "");

    return textWithNewlines
      .replace(/\s*\n\s*/g, "\n\n")
      .replace(/ +/g, " ")
      .trim();
  }
  if (bookData == null || isLoadingBook) {
    return (
      <View style={styles.container}>
        <WormLoader />
      </View>
    );
  }

  if (bookID == null || user == null) {
    return (
      <View style={styles.container}>
        <Text>Error: Book ID or user is not available</Text>
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.rowStyle}>
            <Image
              source={{ uri: bookData.imageLinks?.thumbnail }}
              cachePolicy={"memory-disk"}
              contentFit={"contain"}
              style={styles.image}
            />
            <View style={styles.titleText}>
              <Text style={styles.title}>{bookData.title}</Text>
              <Text style={styles.author}>
                by {bookData.authors?.join(", ")}
              </Text>
              {bookData?.mainCategory != null && (
                <Text>{bookData?.mainCategory}</Text>
              )}
              <Text>{bookData.pageCount} pages</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handlePresentModalPress}
                >
                  <View style={styles.addButtonContent}>
                    <AntDesign
                      name="pluscircleo"
                      size={20}
                      color="white"
                      style={styles.addButtonIcon}
                    />
                    <Text style={styles.addButtonText}>Add to Bookshelf</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {isLoadingUsersWithBook ? (
                <View style={styles.borrowFromContainer}>
                  <WormLoader style={styles.worm} />
                </View>
              ) : usersWithBook != null && usersWithBook.length > 0 ? (
                <View style={styles.borrowFromContainer}>
                  <Text style={styles.borrowFromText}>Borrow From:</Text>
                  {usersWithBook?.map((userID) => (
                    <TouchableOpacity
                      key={userID}
                      style={styles.borrowFromPics}
                      onPress={() => {
                        navigateToUser(user?.uid, userID);
                      }}
                    >
                      <ProfilePicture userID={userID} size={40} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.borrowFromContainer}>
                  <Text style={styles.borrowFromText}>
                    No friends have this book available
                  </Text>
                </View>
              )}
            </View>
          </View>
          {bookData.description != null && (
            <View style={[styles.textBox]}>
              <Text style={styles.textTitle}>Description</Text>
              <Text style={styles.text}>
                {"\n"}
                {stripHTMLWithRegex(bookData.description ?? "")}
              </Text>
            </View>
          )}
          {bookData.categories != null && (
            <View style={[styles.textBox]}>
              <Text style={styles.textTitle}>Categories</Text>
              {bookData?.categories?.map((category) => (
                <Text key={category} style={styles.text}>
                  {stripHTMLWithRegex(category)}
                </Text>
              ))}
            </View>
          )}
          {bookData?.publishedDate != null && bookData?.publisher != null && (
            <View style={[styles.textBox]}>
              <Text style={styles.textTitle}>Publisher</Text>
              <Text style={styles.text}>
                {stripHTMLWithRegex(bookData.publisher)} |{" "}
                {new Date(
                  stripHTMLWithRegex(bookData.publishedDate),
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
          <SimilarBooksWrapper
            userID={user.uid}
            bookID={bookID}
            bookTitle={bookData.title ?? ""}
          />
        </ScrollView>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={styles.modalBackground}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Bookshelf</Text>
            <BookshelfAddButtons
              selectedShelves={selectedShelves}
              onToggleShelf={handleToggleShelf}
              isDisabled={isLoadingInBookshelves}
            />
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    width: "100%",
  },
  scrollContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 10,
    flexWrap: "wrap",
  },
  author: {
    fontSize: 15,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  image: {
    width: 128,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "100%",
    paddingTop: 20,
  },
  addButton: {
    backgroundColor: BOOKWORM_ORANGE,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  handleIndicator: {
    backgroundColor: "#DDDDDD",
    width: 50,
  },
  modalBackground: {
    backgroundColor: "white",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  textBox: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    flex: 1,
    width: "100%",
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  textTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "bold",
  },
  borrowFromContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingTop: 15,
  },
  borrowFromText: { paddingRight: 10, fontWeight: "bold" },
  borrowFromPics: { flexDirection: "row", paddingRight: 5 },
  rowStyle: {
    flex: 1,
    flexDirection: "row",
  },
  titleText: { flex: 1, paddingLeft: 10 },
  worm: { width: 50, height: 50 },
});

export default BookViewPage;
