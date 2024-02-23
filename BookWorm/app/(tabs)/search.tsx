import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import SearchBar from "../../components/SearchBar/SearchBar";
import { db } from "../../firebase.config";

interface User {
  id: string;
  name: string;
}

export default function Search() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  const fetchUsers = async (mySearchValue: string): Promise<User[]> => {
    const q = query(
      collection(db, "user_collection"),
      where("isPublic", "==", true),
      where("name", ">=", mySearchValue),
      where("name", "<=", mySearchValue + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);
    const usersData: User[] = [];
    querySnapshot.forEach((doc) => {
      // Add each user data to the array
      usersData.push({ id: doc.id, name: doc.data().name });
      // Add more properties as needed
    });
    return usersData;
  };

  useEffect(() => {
    const mySearchValue = ""; // Provide your search value here
    fetchUsers(mySearchValue)
      .then((fetchedUsers) => {
        setUsers(fetchedUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <SearchBar
        clicked={searchClicked}
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setSearchClicked}
      />
      <Text>Search phrase: {searchPhrase}</Text>
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
