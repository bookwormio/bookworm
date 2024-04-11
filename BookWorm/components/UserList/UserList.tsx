import React from "react";
import { View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";
import UserListItem from "./UserListItem";
interface UserListProps {
  users: UserSearchDisplayModel[];
}

const UserList = ({ users }: UserListProps) => {
  return (
    <View>
      {users.map((value, index) => (
        <UserListItem key={value.id} user={value}></UserListItem>
      ))}
    </View>
  );
};

export default UserList;
