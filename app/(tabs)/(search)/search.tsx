import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BookSearch from "../../../components/searchbar/booksearch";
import UserSearch from "../../../components/searchbar/usersearch";
import {
  APP_BACKGROUND_COLOR,
  BOOKWORM_ORANGE,
  SEARCH_ROUTE_PREFIX,
} from "../../../constants/constants";

const Search = () => {
  const [searchType, setSearchType] = useState("book"); // Default to book search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [underlinePosition] = useState(new Animated.Value(0));
  const setParentSearchPhrase = (search: string) => {
    setSearchPhrase(search);
  };

  const animateUnderline = (toValue: number) => {
    Animated.timing(underlinePosition, {
      toValue,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
      {/* Toggle buttons */}
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, searchType === "book" && styles.activeButton]}
          onPress={() => {
            setSearchType("book");
            animateUnderline(0);
          }}
          disabled={searchType === "book"}
        >
          <Text style={styles.buttonText}>Book Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, searchType === "user" && styles.activeButton]}
          onPress={() => {
            setSearchType("user");
            animateUnderline(1);
          }}
          disabled={searchType === "user"}
        >
          <Text style={styles.buttonText}>User Search</Text>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.underline,
            {
              left: underlinePosition.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "50%"],
              }),
            },
          ]}
        />
      </View>

      {/* Render BookSearch or UserSearch based on searchType */}
      {searchType === "book" ? (
        <BookSearch
          searchPhrase={searchPhrase}
          setSearchPhrase={setParentSearchPhrase}
        />
      ) : (
        <UserSearch
          searchPhrase={searchPhrase}
          setSearchPhrase={setParentSearchPhrase}
          routePrefix={SEARCH_ROUTE_PREFIX}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    width: "50%",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  activeButton: {
    backgroundColor: "#FFDAB9",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "50%",
    backgroundColor: BOOKWORM_ORANGE,
  },
});

export default Search;
