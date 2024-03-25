import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";
import { fetchUsersBySearch } from "../../services/firebase-services/queries";
import SearchBar from "./searchbar";

const USER_SEARCH_PLACEHOLDER = "Search for users";

interface UserSearchProps {
  searchPhrase: string;
  setSearchPhrase: (searchString: string) => void;
}

const UserSearch = ({ searchPhrase, setSearchPhrase }: UserSearchProps) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(
    searchPhrase !== "",
  );

  const handleUserClick = ({ user }: { user: UserListItem }) => {
    router.push({
      pathname: "FriendProfile",
      params: {
        friendUserID: user.id,
      },
    });
  };

  useEffect(() => {
    const userSearchValue = searchPhrase;
    fetchUsersBySearch(userSearchValue)
      .then((fetchedUsers) => {
        setUsers(fetchedUsers); // Set the state with the fetched users
      })
      .catch((error) => {
        alert("Error fetching users: " + error);
      });
  }, [searchPhrase]); // Run this effect whenever searchPhrase changes

  return (
    <View style={styles.container}>
      <SearchBar
        clicked={searchClicked}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setSearchClicked}
        placeholderText={USER_SEARCH_PLACEHOLDER}
      />
      <View>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => {
              handleUserClick({ user });
            }}
          >
            <Text>
              {user.firstName} {user.lastName}
            </Text>
            {/* Add more user details to display */}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default UserSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
