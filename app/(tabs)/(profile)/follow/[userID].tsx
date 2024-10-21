import { useLocalSearchParams } from "expo-router";
import React from "react";
import FollowDetails from "../../../../components/followdetails/FollowDetails";

const FollowWrapper = () => {
  const { userID } = useLocalSearchParams<{ userID: string }>();
  const { followersfirst } = useLocalSearchParams<{
    followersfirst: string;
  }>();
  return (
    <FollowDetails
      userID={userID ?? ""}
      followersfirst={followersfirst ?? ""}
    ></FollowDetails>
  );
};
export default FollowWrapper;
