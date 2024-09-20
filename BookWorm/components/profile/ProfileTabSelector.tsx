import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { TabsTitleMap } from "../../enums/Enums";

interface ProfileTabSelectorProps {
  profileTab: string;
  setProfileTab: (profileTab: string) => void;
  tabs: string[];
}

const ProfileTabSelector = ({
  profileTab,
  setProfileTab,
  tabs,
}: ProfileTabSelectorProps) => {
  const [underlinePosition] = useState(new Animated.Value(0));
  const tabWidth = 100 / tabs.length;

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
        {tabs.map((tab, index) => (
          <TouchableHighlight
            key={index}
            style={[
              styles.button,
              { width: `${tabWidth}%` },
              profileTab === tab ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={() => {
              setProfileTab(tab);
              animateUnderline(0);
            }}
            disabled={profileTab === tab}
            activeOpacity={0.6}
            underlayColor="#DDDDDD"
          >
            <Text style={styles.buttonText}>{TabsTitleMap[tab]}</Text>
          </TouchableHighlight>
        ))}

        {/* Animated underline */}
        <Animated.View
          style={[
            styles.underline,
            {
              width: `${tabWidth}%`,
              left: underlinePosition.interpolate({
                inputRange: tabs.map((_, i) => i),
                outputRange: tabs.map((_, i) => `${i * tabWidth}`),
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
