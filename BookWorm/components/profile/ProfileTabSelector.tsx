import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

interface ProfileTabSelectorProps {
  profileTab: string;
  setProfileTab: (profileTab: string) => void;
}

const ProfileTabSelector = ({
  profileTab,
  setProfileTab,
}: ProfileTabSelectorProps) => {
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
        <TouchableHighlight
          style={[
            styles.button,
            profileTab === "shelf"
              ? styles.activeButton
              : styles.inactiveButton,
          ]}
          onPress={() => {
            setProfileTab("shelf");
            animateUnderline(0);
          }}
          disabled={profileTab === "shelf"}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
        >
          <Text style={styles.buttonText}>Shelves</Text>
        </TouchableHighlight>

        {/* Posts Button */}
        <TouchableHighlight
          style={[
            styles.button,
            profileTab === "post" ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => {
            setProfileTab("post");
            animateUnderline(1);
          }}
          disabled={profileTab === "post"}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
        >
          <Text style={styles.buttonText}>Posts</Text>
        </TouchableHighlight>

        {/* Data Button */}
        <TouchableHighlight
          style={[
            styles.button,
            profileTab === "data" ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => {
            setProfileTab("data");
            animateUnderline(2);
          }}
          disabled={profileTab === "data"}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
        >
          <Text style={styles.buttonText}>Data</Text>
        </TouchableHighlight>

        {/* Animated underline */}
        <Animated.View
          style={[
            styles.underline,
            {
              left: underlinePosition.interpolate({
                inputRange: [0, 1, 2],
                outputRange: ["0%", "33.33%", "66.66%"],
              }),
            },
          ]}
        />
      </View>
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
    width: "33.33%",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  activeButton: {
    backgroundColor: "#FFDAB9",
  },
  inactiveButton: {
    backgroundColor: "#F2F2F2",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "33.33%",
    backgroundColor: "#FB6D0B",
  },
});
