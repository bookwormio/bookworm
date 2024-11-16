import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { badgeDisplayTitleMap } from "../../enums/Enums";
import { type BadgeModel, type UserModel } from "../../types";
import { useAuth } from "../auth/context";
import { useNavigateToBadgePage } from "../profile/hooks/useRouteHooks";
import BadgeIcon from "./BadgeIcon";

interface BadgeOnPostProps {
  badge: BadgeModel;
  size: number;
  userInfo: UserModel;
}

const BadgeOnPost = ({ badge, size, userInfo }: BadgeOnPostProps) => {
  const { user } = useAuth();
  const navigateToBadgePage = useNavigateToBadgePage(userInfo.id);

  return (
    <TouchableOpacity
      style={{ flexDirection: "row" }}
      onPress={() => {
        navigateToBadgePage();
      }}
      disabled={userInfo.id !== user?.uid}
    >
      <BadgeIcon badgeID={badge.badgeID} size={size} />
      <Text
        style={{
          alignSelf: "center",
          fontWeight: "bold",
          fontSize: 15,
        }}
      >
        {userInfo.id === user?.uid ? "You" : userInfo.first} earned the{" "}
        {badgeDisplayTitleMap[badge.badgeID]} badge!
      </Text>
    </TouchableOpacity>
  );
};

export default BadgeOnPost;
