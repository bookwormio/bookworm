import { useLocalSearchParams } from "expo-router";
import React from "react";
import FriendProfile from "../../../../components/UserList/FriendProfile";

const FriendProfileWrapper = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  return <FriendProfile friendUserID={friendUserID ?? ""}></FriendProfile>;
};
export default FriendProfileWrapper;
