import { useLocalSearchParams } from "expo-router";
import React from "react";
import BadgePage from "../../../../components/badges/BadgePage";

const BadgeWrapper = () => {
  const { userID } = useLocalSearchParams<{ userID: string }>();

  return <BadgePage userID={userID ?? ""} />;
};
export default BadgeWrapper;
