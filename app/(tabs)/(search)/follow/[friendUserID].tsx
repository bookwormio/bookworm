import { useLocalSearchParams } from "expo-router";
import React from "react";
import FollowDetails from "../../../../components/followdetails/FollowDetails";

const FollowWrapper = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  const { followersfirst } = useLocalSearchParams<{
    followersfirst: string;
  }>();
  return (
    <FollowDetails
      userID={friendUserID ?? ""}
      followersfirst={followersfirst}
    ></FollowDetails>
  );
};
export default FollowWrapper;
