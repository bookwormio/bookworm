import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../../components/auth/context";
import BookList from "../../../components/booklist/BookList";
import WormLoader from "../../../components/wormloader/WormLoader";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { useGenerateRecommendationsQuery } from "./hooks/useProfileQueries";

const GenerateRecommendations = () => {
  const { user } = useAuth();
  const {
    data: generatedRecommendationIDs,
    isLoading: isLoadingRecommendations,
  } = useGenerateRecommendationsQuery(user?.uid ?? "");

  if (isLoadingRecommendations || generatedRecommendationIDs == null) {
    return (
      <View style={styles.loadingContainer}>
        <WormLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {generatedRecommendationIDs.map((book, index) => (
          <View style={styles.bookContainer} key={index}>
            <BookList volumes={[book]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default GenerateRecommendations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingRight: 16,
  },
  bookContainer: {
    marginBottom: 2,
  },
});
