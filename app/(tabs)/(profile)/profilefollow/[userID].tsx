import { useLocalSearchParams } from "expo-router";
import React from "react";
import FollowDetails from "../../../../components/followdetails/FollowDetails";
import { PROFILE_ROUTE_PREFIX } from "../../../../constants/constants";

const FollowWrapper = () => {
  const { userID } = useLocalSearchParams<{ userID: string }>();
  const { followersfirst } = useLocalSearchParams<{
    followersfirst: string;
  }>();
  return (
    <FollowDetails
      userID={userID ?? ""}
      followersfirst={followersfirst ?? ""}
      routePrefix={`${PROFILE_ROUTE_PREFIX}`}
    ></FollowDetails>
  );
};
export default FollowWrapper;
