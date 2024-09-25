import { useLocalSearchParams } from "expo-router";
import React from "react";
import RecommendationPage from "../../../../components/recommendation/RecommendationPage";

const RecommendationWrapper = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  return (
    <RecommendationPage friendUserID={friendUserID ?? ""}></RecommendationPage>
  );
};
export default RecommendationWrapper;
