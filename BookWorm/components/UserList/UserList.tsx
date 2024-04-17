import React from "react";
import { View } from "react-native";
import { type UserSearchDisplayModel } from "../../types";
import UserListItem from "./UserListItem";
interface UserListProps {
  users: UserSearchDisplayModel[];
  routePrefix: string;
}

const UserList = ({ users, routePrefix }: UserListProps) => {
  return (
    <View>
      {users.map((value) => (
        <UserListItem
          routePrefix={routePrefix}
          key={value.id}
          user={value}
        ></UserListItem>
      ))}
    </View>
  );
};

export default UserList;
