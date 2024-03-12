import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { fetchUsersBySearch } from "../../services/firebase-services/queries";
import SearchBar from "../searchbar/searchbar";

const UserSearch = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>("");

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
      />
      <View>
        {users.map((user) => (
          <View key={user.id}>
            <Text>
              {user.firstName} {user.lastName}
            </Text>
            {/* Add more user details to display */}
          </View>
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
    padding: 24,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
});
