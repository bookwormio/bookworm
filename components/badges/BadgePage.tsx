import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { APP_BACKGROUND_COLOR } from "../../constants/constants";
import { badgeDisplayTitleMap } from "../../enums/Enums";
import { useNavigateToPost } from "../profile/hooks/useRouteHooks";
import WormLoader from "../wormloader/WormLoader";
import BadgeIcon from "./BadgeIcon";
import { useGetExistingEarnedBadges } from "./useBadgeQueries";

interface BadgePageProps {
  userID: string;
}

const BadgePage = ({ userID }: BadgePageProps) => {
  const { data: badges, isLoading: isLoadingBadges } =
    useGetExistingEarnedBadges(userID);

  const navigateToPost = useNavigateToPost();

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
          <TouchableOpacity
            style={styles.badgeContainer}
            onPress={() => {
              if (item.postID != null) {
                navigateToPost(item.postID);
              }
            }}
          >
            <BadgeIcon badgeID={item.badgeID} size={125} />
            <Text style={styles.textStyle}>
              {badgeDisplayTitleMap[item.badgeID]}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_BACKGROUND_COLOR,
    padding: 10,
    paddingRight: 15,
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
