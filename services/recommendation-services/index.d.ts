// These types are specific to the recommendation API

interface RecommendationResponse {
  volume_ids: string[];
}

interface SimilarBooksResponse {
  // TODO make sure correct
  book_ids: string[];
}

interface RecommendationError {
  error: string;
}
