import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { fetchUsersBySearch } from "../../services/firebase-services/queries";
import { type UserSearchDisplayModel } from "../../types";
import UserList from "../UserList/UserList";
import SearchBar from "./searchbar";

const USER_SEARCH_PLACEHOLDER = "Search for users";

interface UserSearchProps {
  searchPhrase: string;
  setSearchPhrase: (searchString: string) => void;
}

const UserSearch = ({ searchPhrase, setSearchPhrase }: UserSearchProps) => {
  const [users, setUsers] = useState<UserSearchDisplayModel[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(
    searchPhrase !== "",
  );

  const { data: fetchUsersData, isLoading } = useQuery({
    queryKey: ["searchusers", searchPhrase],
    queryFn: async () => {
      if (searchPhrase != null && searchPhrase !== "") {
        return await fetchUsersBySearch(searchPhrase);
      } else {
        return null;
      }
    },
    staleTime: 60000, // Set stale time to 1 minute
  });

  useEffect(() => {
    if (fetchUsersData !== undefined && fetchUsersData !== null) {
      setUsers(fetchUsersData);
    }
  }, [fetchUsersData]);

  return (
    <View style={styles.container}>
      <SearchBar
        clicked={searchClicked}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setSearchClicked}
        placeholderText={USER_SEARCH_PLACEHOLDER}
      />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {users.map((user) => (
          <View style={styles.userContainer} key={user.id}>
            <UserList users={[user]} />
          </View>
        ))}
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default UserSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  userContainer: {
    marginBottom: 2,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingRight: 16, // Adjusted padding to accommodate scroll bar
  },
  loading: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
    bottom: 20,
    width: "100%",
  },
});
