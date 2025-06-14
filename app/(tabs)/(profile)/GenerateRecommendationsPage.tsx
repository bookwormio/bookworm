import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../components/auth/context";
import BookList from "../../../components/booklist/BookList";
import BookWormButton from "../../../components/buttons/BookWormButton";
import WormLoader from "../../../components/wormloader/WormLoader";
import { APP_BACKGROUND_COLOR } from "../../../constants/constants";
import { useGenerateRecommendationsQuery } from "./hooks/useProfileQueries";

const GenerateRecommendationsPage = () => {
  const { user } = useAuth();

  const {
    data: generatedRecommendations,
    isLoading: isLoadingRecommendations,
    isError: isErrorRecommendations,
    error: recommendationsError,
    isSuccess: isSuccessRecommendations,
    refetch: refetchRecommendations,
    isRefetching: isRefetchingRecommendations,
  } = useGenerateRecommendationsQuery(user?.uid ?? "");

  const handleRefetchRecommendations = () => {
    refetchRecommendations().catch((error) => {
      showToastError(error);
    });
  };

  const showToastError = (
    error: unknown,
    message = "Failed to generate recommendations",
  ) => {
    console.error(message, error);
    Toast.show({
      text1: "Error",
      text2: message,
      type: "error",
    });
  };

  if (
    isErrorRecommendations ||
    (isSuccessRecommendations && generatedRecommendations == null)
  ) {
    showToastError(recommendationsError ?? "No recommendations available");
  }

  if (
    isLoadingRecommendations ||
    isRefetchingRecommendations ||
    generatedRecommendations == null
  ) {
    return (
      <View style={styles.loadingContainer}>
        <WormLoader />
      </View>
    );
  }

  if (isErrorRecommendations) {
    Toast.show({
      text1: "Error",
      text2: "Failed to generate recommendations",
      type: "error",
    });
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <BookWormButton
          title="Refresh Recommendations"
          onPress={() => {
            handleRefetchRecommendations();
          }}
        />
        {generatedRecommendations.map((book, index) => (
          <View style={styles.bookContainer} key={index}>
            <BookList volumes={[book]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default GenerateRecommendationsPage;

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
