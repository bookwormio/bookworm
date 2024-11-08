import React from "react";
import { Text, View } from "react-native";
import WormLoader from "../wormloader/WormLoader";
import { useGetExistingEarnedBadges } from "./useBadgeQueries";

interface BadgePageProps {
  userID: string;
}

const BadgePage = ({ userID }: BadgePageProps) => {
  const { data: badges, isLoading: isLoadingBadges } =
    useGetExistingEarnedBadges(userID);

  if (isLoadingBadges) {
    return <WormLoader />;
  }
  return (
    <View>
      <Text>{userID}</Text>
      {badges?.map((badge) => (
        <View
          key={badge}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 8,
          }}
        >
          <Text>{badge}</Text>
        </View>
      ))}
    </View>
  );
};

export default BadgePage;
