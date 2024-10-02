import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
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
import HTMLView from "react-native-htmlview";
import Toast from "react-native-toast-message";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { type ServerBookShelfName } from "../../enums/Enums";
import { fetchBookByVolumeID } from "../../services/books-services/BookQueries";
import { type BookVolumeInfo } from "../../types";
import { useAuth } from "../auth/context";
import BookshelfAddButtons from "../profile/BookShelf/BookshelfAddButtons";
import {
  useAddBookToShelf,
  useGetShelvesForBook,
  useRemoveBookFromShelf,
} from "../profile/hooks/useBookshelfQueries";
import WormLoader from "../wormloader/WormLoader";

interface BookViewProps {
  bookID: string;
}

const BookViewPage = ({ bookID }: BookViewProps) => {
  const { user } = useAuth();
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
      setSelectedShelves((prev) => [...prev, shelfName]);
      setPendingChanges((prev) => ({
        add: [...prev.add, shelfName].filter((s) => !prev.remove.includes(s)),
        remove: prev.remove.filter((s) => s !== shelfName),
      }));
    }
  };

  const applyPendingChanges = async () => {
    if (user?.uid == null || bookID == null || queryBookData == null) return;

    const addPromises = pendingChanges.add.map(
      async (shelfName) =>
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
        }),
    );
    const removePromises = pendingChanges.remove.map(
      async (shelfName) =>
        await removeBookMutation.mutateAsync({
          userID: user.uid,
          bookID,
          shelfName,
        }),
    );

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
          <View>
            <Image
              source={{ uri: bookData.imageLinks?.thumbnail }}
              cachePolicy={"memory-disk"}
              contentFit={"contain"}
              style={styles.image}
            />
          </View>
          <Text style={styles.title}>{bookData.title}</Text>
          <Text style={styles.author}>
            Author: {bookData.authors?.join(", ")}
          </Text>
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
          {bookData.description !== null && (
            <Text style={styles.description}>
              Description: <HTMLView value={bookData.description ?? ""} />
            </Text>
          )}
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
      <Toast />
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  scrollContainer: {
    padding: 20,
    flex: 1,
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
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
  },
  image: {
    width: 128,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    width: "100%",
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "#FB6D0B",
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
});

export default BookViewPage;
