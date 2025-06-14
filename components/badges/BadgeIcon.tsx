import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import {
  ServerBookshelfBadge,
  ServerCompletionBadge,
  ServerLendingBadge,
  ServerPostBadge,
  ServerStreakBadge,
  type ServerBadgeName,
} from "../../enums/Enums";
interface BadgePictureProps {
  badgeID: ServerBadgeName;
  size: number;
  stylesOverride?: ViewStyle;
  sizeAddOverride?: number;
}

const BadgeIcon = ({
  badgeID,
  size,
  stylesOverride,
  sizeAddOverride = 0,
}: BadgePictureProps) => {
  const imageSize = size + sizeAddOverride;
  const dynamicStyles = {
    container: {
      height: size,
      width: size,
    },
    image: {
      height: imageSize,
      width: imageSize,
    },
  };

  const BAGDE_ICONS: Record<ServerBadgeName, any> = {
    [ServerPostBadge.FIRST_POST]: require("../../assets/badges/first_post.png"),
    [ServerBookshelfBadge.ADDED_FIRST_BOOK]: require("../../assets/badges/added_1_book.png"),
    [ServerBookshelfBadge.ADDED_TEN_BOOKS]: require("../../assets/badges/added_10_books.png"),
    [ServerBookshelfBadge.ADDED_TWENTY_FIVE_BOOKS]: require("../../assets/badges/added_25_books.png"),
    [ServerBookshelfBadge.ADDED_FIFTY_BOOKS]: require("../../assets/badges/added_50_books.png"),
    [ServerCompletionBadge.COMPLETED_FIRST_BOOK]: require("../../assets/badges/completed_1_book.png"),
    [ServerCompletionBadge.COMPLETED_FIVE_BOOKS]: require("../../assets/badges/completed_5_books.png"),
    [ServerCompletionBadge.COMPLETED_TEN_BOOKS]: require("../../assets/badges/completed_10_books.png"),
    [ServerCompletionBadge.COMPLETED_TWENTY_FIVE_BOOKS]: require("../../assets/badges/completed_25_books.png"),
    [ServerLendingBadge.LENT_A_BOOK]: require("../../assets/badges/lent_a_book.png"),
    [ServerLendingBadge.BORROWED_A_BOOK]: require("../../assets/badges/borrowed_a_book.png"),
    [ServerStreakBadge.SEVEN_DAY_STREAK]: require("../../assets/badges/seven_day_streak.png"),
    [ServerStreakBadge.THIRTY_DAY_STREAK]: require("../../assets/badges/thirty_day_streak.png"),
  };

  return (
    <View style={[styles.container, dynamicStyles.container, stylesOverride]}>
      {badgeID !== null && (
        <Image
          style={[styles.image, dynamicStyles.image]}
          source={BAGDE_ICONS[badgeID]}
          cachePolicy={"memory-disk"}
        />
      )}
    </View>
  );
};

export default BadgeIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    resizeMode: "cover",
  },
});
