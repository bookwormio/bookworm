import { useLocalSearchParams } from "expo-router";
import React from "react";
import FriendProfile from "../../../../components/UserList/FriendProfile";

const SearchFriendProfileWrapper = () => {
  const { friendUserID } = useLocalSearchParams<{ friendUserID: string }>();
  return <FriendProfile friendUserID={friendUserID ?? ""}></FriendProfile>;
};
export default SearchFriendProfileWrapper;
