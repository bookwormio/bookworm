import React from "react";
import { Text, View } from "react-native";
import { type BadgeModel } from "../../types";

interface BadgeOnPostProps {
  badge: BadgeModel;
  size: number;
}

const BadgeOnPost = ({ badge, size }: BadgeOnPostProps) => {
  return (
    <View key={badge.badgeID}>
      <Text>
        {badge.badgeID} {badge.postID}
      </Text>
    </View>
  );
};

export default BadgeOnPost;
