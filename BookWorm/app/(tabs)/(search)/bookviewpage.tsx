import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useAuth } from "../../../components/auth/context";
import {
  bookShelfDisplayMap,
  type ServerBookShelfName,
} from "../../../enums/Enums";
import {
  addBookToUserBookshelf,
  fetchBookByVolumeID,
} from "../../../services/firebase-services/queries";
import { type BookVolumeInfo } from "../../../types";

const BookViewPage = () => {
  const { user } = useAuth();
  const [bookData, setBookData] = useState<BookVolumeInfo | null>(null);
  const { bookID } = useLocalSearchParams<{ bookID: string }>();

  const { data: queryBookData, isLoading: isLoadingBook } = useQuery({
    queryKey:
      bookID !== undefined && bookID !== null
        ? ["bookdata", bookID]
        : ["bookdata"],
    queryFn: async () => {
      if (bookID != null && bookID !== undefined) {
        return await fetchBookByVolumeID(bookID);
      } else {
        return null;
      }
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  useEffect(() => {
    if (queryBookData !== null && queryBookData !== undefined) {
      setBookData(queryBookData);
    }
  }, [queryBookData]);

  const windowWidth = useWindowDimensions().width;

  if (bookData === null || bookData === undefined || isLoadingBook) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const addToBookshelf = async (bookshelfName: ServerBookShelfName) => {
    if (user !== null && bookID !== undefined) {
      try {
        const success = await addBookToUserBookshelf(
          user.uid,
          bookID,
          bookshelfName,
        );
        if (success) {
          // TODO: modify display to show that the book was added
          // TODO: remove console logs
          console.log("SUCCESS. Added to ", bookshelfName);
        } else {
          console.log("Failed to add the book to the bookshelf");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    } else {
      console.log("User or book ID is not available");
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      <View>
        <Image
          // Using thumbnail here because the other image links (small / medium) may be different
          source={{ uri: bookData.imageLinks?.thumbnail }}
          cachePolicy={"memory-disk"}
          contentFit={"contain"}
          style={styles.image}
        />
      </View>
      <Text style={styles.title}>{bookData.title}</Text>
      <Text style={styles.author}>Author: {bookData.authors?.join(", ")}</Text>
      {/* TODO break this into a separate component */}
      {/* This gives a button for every bookshelf to add the book to */}
      <View>
        {Object.entries(bookShelfDisplayMap).map(([status, title]) => (
          <Button
            key={status}
            onPress={() => {
              void (async () => {
                await addToBookshelf(status as ServerBookShelfName);
              })();
            }}
            title={`Add to ${title}`}
          />
        ))}
      </View>

      {bookData.description !== null && (
        <Text style={styles.description}>
          Description:{" "}
          <RenderHtml
            contentWidth={windowWidth}
            source={{ html: bookData.description ?? "" }}
          />
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
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
  image: {
    width: 128,
    height: 192,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookViewPage;
