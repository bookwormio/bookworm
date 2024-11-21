import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { badgeDisplayTitleMap } from "../../enums/Enums";
import { type BadgeModel, type UserModel } from "../../types";
import { useUserID } from "../auth/context";
import { useNavigateToBadgePage } from "../profile/hooks/useRouteHooks";
import BadgeIcon from "./BadgeIcon";

interface BadgeOnPostProps {
  badge: BadgeModel;
  size: number;
  userInfo: UserModel;
}

const BadgeOnPost = ({ badge, size, userInfo }: BadgeOnPostProps) => {
  const { userID } = useUserID();
  const navigateToBadgePage = useNavigateToBadgePage(userInfo.id);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() => {
          navigateToBadgePage();
        }}
        disabled={userInfo.id !== userID}
      >
        <BadgeIcon badgeID={badge.badgeID} size={size} />
        <Text
          style={{
            alignSelf: "center",
            fontWeight: "bold",
            fontSize: 14.5,
          }}
          ellipsizeMode="tail"
        >
          {userInfo.id === userID ? "You" : userInfo.first} earned the{" "}
          {badgeDisplayTitleMap[badge.badgeID]} badge!
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BadgeOnPost;
