import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { fetchBookByVolumeID } from "../../../services/firebase-services/queries";
import { type BookVolumeInfo } from "../../../types";

const BookViewPage = () => {
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

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />

      <View>
        <Image
          // Using thumbnail here because the other image links (small / medium) may be different
          source={{ uri: bookData.imageLinks?.thumbnail }}
          style={styles.image}
        />
      </View>
      <Text style={styles.title}>{bookData.title}</Text>
      <Text style={styles.author}>Author: {bookData.authors?.join(", ")}</Text>

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
    resizeMode: "contain",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookViewPage;
