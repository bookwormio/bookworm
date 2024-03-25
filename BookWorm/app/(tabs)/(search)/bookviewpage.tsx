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

const BookViewPage = () => {
  const [bookData, setBookData] = useState<BookVolumeInfo | null>(null);
  const { bookID } = useLocalSearchParams<{ bookID: string }>();

  useEffect(() => {
    const fetchBook = async () => {
      if (bookID !== undefined && bookID !== null) {
        // Check if bookID is not undefined or null
        try {
          const data = await fetchBookByVolumeID(bookID);
          setBookData(data); // Set bookData with fetched data
          console.log(data?.imageLinks);
        } catch (error) {
          console.error("Error fetching book:", error);
          // Handle error if fetchBookByVolumeID fails
        }
      }
    };

    void fetchBook(); // Call the fetchBook function upon entry to the page
  }, [bookID]); // Dependency array to trigger the effect when bookID changes

  const windowWidth = useWindowDimensions().width;

  if (bookData === null || bookData === undefined) {
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
