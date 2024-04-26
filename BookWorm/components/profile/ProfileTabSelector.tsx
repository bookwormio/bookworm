import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProfileBookShelves from "./ProfileBookShelves";

const ProfileTabSelector = () => {
  const [searchType, setSearchType] = useState("shelf"); // Default to book search
  const [underlinePosition] = useState(new Animated.Value(0));
  const animateUnderline = (toValue: number) => {
    Animated.timing(underlinePosition, {
      toValue,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };
  return (
    <View>
      <View style={styles.container}>
        {/* Shelves Button */}
        <TouchableOpacity
          style={[styles.button, searchType === "shelf" && styles.activeButton]}
          onPress={() => {
            setSearchType("shelf");
            animateUnderline(0);
          }}
          disabled={searchType === "shelf"}
        >
          <Text style={styles.buttonText}>Shelves</Text>
        </TouchableOpacity>

        {/* Posts Button */}
        <TouchableOpacity
          style={[styles.button, searchType === "post" && styles.activeButton]}
          onPress={() => {
            setSearchType("post");
            animateUnderline(1);
          }}
          disabled={searchType === "post"}
        >
          <Text style={styles.buttonText}>Posts</Text>
        </TouchableOpacity>

        {/* Data Button */}
        <TouchableOpacity
          style={[styles.button, searchType === "data" && styles.activeButton]}
          onPress={() => {
            setSearchType("data");
            animateUnderline(2);
          }}
          disabled={searchType === "data"}
        >
          <Text style={styles.buttonText}>Data</Text>
        </TouchableOpacity>

        {/* Animated underline */}
        <Animated.View
          style={[
            styles.underline,
            {
              left: underlinePosition.interpolate({
                inputRange: [0, 1, 2],
                outputRange: ["0%", "33%", "66%"],
              }),
            },
          ]}
        />
      </View>

      {/* Conditional rendering based on searchType */}
      {searchType === "shelf" ? (
        <ProfileBookShelves />
      ) : searchType === "post" ? (
        <Text>PUT THE POSTS HERE</Text>
      ) : (
        <Text>PUT THE DATA HERE</Text>
      )}
    </View>
  );
};

export default ProfileTabSelector;

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
    width: "33%",
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
    width: "33%",
    backgroundColor: "#FB6D0B",
  },
});
