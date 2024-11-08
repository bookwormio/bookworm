import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { badgeDisplayTitleMap } from "../../enums/Enums";
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
    <View style={styles.container}>
      <Text>{userID}</Text>
      <FlatList
        data={badges}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3} // Display 3 items per row
        columnWrapperStyle={styles.columnWrapper} // Optional, to add spacing between rows
        renderItem={({ item }) => (
          <View style={styles.badgeContainer}>
            <Text>{badgeDisplayTitleMap[item]}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
  },
  columnWrapper: {
    justifyContent: "space-between", // Space between badges in a row
  },
  badgeContainer: {
    flex: 1,
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 5, // Add some spacing between badges
  },
});

export default BadgePage;
