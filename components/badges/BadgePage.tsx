import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { badgeDisplayTitleMap } from "../../enums/Enums";
import WormLoader from "../wormloader/WormLoader";
import BadgePicture from "./BadgePicture";
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
      <FlatList
        data={badges}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.badgeContainer}>
            <BadgePicture badgeID={item} size={125} />
            <Text style={styles.textStyle}>{badgeDisplayTitleMap[item]}</Text>
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
    justifyContent: "space-between",
  },
  badgeContainer: {
    flex: 1,
    alignItems: "center",
    marginVertical: 8,
    marginHorizontal: 5,
  },
  textStyle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BadgePage;
