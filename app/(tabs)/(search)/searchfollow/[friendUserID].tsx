import { useLocalSearchParams } from "expo-router";
import React from "react";
import FollowDetails from "../../../../components/followdetails/FollowDetails";
import { SEARCH_ROUTE_PREFIX } from "../../../../constants/constants";

const FollowWrapper = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  const { followersfirst } = useLocalSearchParams<{
    followersfirst: string;
  }>();
  return (
    <FollowDetails
      userID={friendUserID ?? ""}
      followersfirst={followersfirst ?? ""}
      routePrefix={SEARCH_ROUTE_PREFIX}
    ></FollowDetails>
  );
};
export default FollowWrapper;
