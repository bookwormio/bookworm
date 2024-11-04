import React from "react";
import { View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";
import UserListItem from "./UserListItem";
interface UserListProps {
  users: UserSearchDisplayModel[];
  showFollowStatus?: boolean;
}

const UserList = ({ users, showFollowStatus }: UserListProps) => {
  return (
    <View>
      {users.map((value) => (
        <UserListItem
          key={value.id}
          user={value}
          showFollowStatus={showFollowStatus}
        ></UserListItem>
      ))}
    </View>
  );
};

export default UserList;
