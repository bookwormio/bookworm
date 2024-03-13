import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BookSearch from "./booksearch";
import UserSearch from "./usersearch";

const Search = () => {
  const [searchType, setSearchType] = useState("book"); // Default to book search

  return (
    <View style={{ flex: 1 }}>
      {/* Toggle buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setSearchType("book");
          }}
        >
          <Text>Book Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSearchType("user");
          }}
        >
          <Text>User Search</Text>
        </TouchableOpacity>
      </View>

      {/* Render BookSearch or UserSearch based on searchType */}
      {searchType === "book" ? <BookSearch /> : <UserSearch />}
    </View>
  );
};

export default Search;
