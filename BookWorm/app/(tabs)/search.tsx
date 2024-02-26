import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import SearchBar from "../../components/searchbar/searchbar";
import { DB } from "../../firebase.config";

export default function Search() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  // Function to fetch users based on the search phrase
  // TODO: makes sense down the line to put this in a utilities file
  const fetchUsers = async (mySearchValue: string): Promise<UserListItem[]> => {
    // Firestore is weird:
    // This is like a Select * from users where name LIKE "mySearchValue%"
    // TODO: down the line potentially may have to implement a more search friendly db
    const q = query(
      collection(DB, "user_collection"),
      where("isPublic", "==", true),
      where("name", ">=", mySearchValue),
      where("name", "<=", mySearchValue + "\uf8ff"),
    );
    const querySnapshot = await getDocs(q);
    const usersData: UserListItem[] = [];
    // Add each user data to the array
    querySnapshot.forEach((doc) => {
      usersData.push({ id: doc.id, name: doc.data().name });
      // Add more properties as needed
    });
    return usersData;
  };

  useEffect(() => {
    const mySearchValue = searchPhrase;
    fetchUsers(mySearchValue)
      .then((fetchedUsers) => {
        setUsers(fetchedUsers); // Set the state with the fetched users
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
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
            <Text>{user.name}</Text>
            {/* Add more user details to display */}
          </View>
        ))}
      </View>
      <SearchBar
        clicked={searchClicked}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setSearchClicked}
      />
      <View>
        {users.map((user) => (
          <View key={user.id}>
            <Text>{user.name}</Text>
            {/* Add more user details to display */}
          </View>
        ))}
      </View>
    </View>
  );
}

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
