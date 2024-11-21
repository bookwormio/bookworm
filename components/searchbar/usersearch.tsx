import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import { MAX_PREFETCH_USERS } from "../../constants/constants";
import { fetchUsersBySearch } from "../../services/firebase-services/UserQueries";
import { type UserSearchDisplayModel } from "../../types";
import { useUserID } from "../auth/context";
import { useGetFollowingByIDStatic } from "../followdetails/useFollowDetailQueries";
import UserList from "../UserList/UserList";
import WormLoader from "../wormloader/WormLoader";
import SearchBar from "./searchbar";
import {
  filterFollowingUsersBySearchPhrase,
  removeDuplicatesByID,
} from "./util/searchBarUtils";

const USER_SEARCH_PLACEHOLDER = "Search for users";

interface UserSearchProps {
  searchPhrase: string;
  setSearchPhrase: (searchString: string) => void;
  routePrefix: string;
}

const UserSearch = ({
  searchPhrase,
  setSearchPhrase,
  routePrefix,
}: UserSearchProps) => {
  const { userID } = useUserID();
  const [users, setUsers] = useState<UserSearchDisplayModel[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(
    searchPhrase !== "",
  );

  const { data: followingUsersData } = useGetFollowingByIDStatic(
    userID,
    MAX_PREFETCH_USERS,
  );

  const { data: fetchUsersData, isLoading } = useQuery({
    queryKey: ["searchusers", searchPhrase],
    queryFn: async () => {
      if (searchPhrase != null && searchPhrase !== "") {
        return await fetchUsersBySearch(searchPhrase, userID);
      } else {
        return null;
      }
    },
    enabled: searchPhrase != null && searchPhrase !== "",
    staleTime: 60000, // Set stale time to 1 minute
  });

  useEffect(() => {
    // If search phrase is empty, just show following users
    if (searchPhrase == null || searchPhrase === "") {
      setUsers(followingUsersData ?? []);
      return;
    }

    // Get filtered following users if available
    const filteredFollowingUsers =
      followingUsersData != null
        ? filterFollowingUsersBySearchPhrase(followingUsersData, searchPhrase)
        : [];

    // If only following users data is available
    if (filteredFollowingUsers.length > 0 && fetchUsersData == null) {
      setUsers(filteredFollowingUsers);
      return;
    }

    // If only fetched users data is available
    if (fetchUsersData != null && followingUsersData == null) {
      setUsers(fetchUsersData);
      return;
    }

    // If both data sources are available, combine them
    if (fetchUsersData != null && followingUsersData != null) {
      setUsers(
        removeDuplicatesByID<UserSearchDisplayModel>([
          ...filteredFollowingUsers,
          ...fetchUsersData,
        ]),
      );
      return;
    }

    // If no data is available
    setUsers([]);
  }, [searchPhrase, followingUsersData, fetchUsersData]);

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
        keyboardShouldPersistTaps="handled"
      >
        {users.map((user) => (
          <View style={styles.userContainer} key={user.id}>
            <UserList users={[user]} showFollowStatus={true} />
          </View>
        ))}
        {isLoading && (
          <View style={styles.loading}>
            <WormLoader style={{ width: 50, height: 50 }} />
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
