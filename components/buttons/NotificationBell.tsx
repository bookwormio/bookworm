import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NotificationBell = () => {
  const unreadCount = 15;
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({ pathname: "notifications" });
      }}
      disabled={false}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name="bell" size={20} color="#FB6D0B" />
        <Text style={styles.badge}>{unreadCount}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationBell;

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
    paddingRight: 10,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -4,
    color: "#FB6D0B",
    fontSize: 12,
    minWidth: 20,
    height: 1208,
    borderRadius: 8,
    textAlign: "left",
    overflow: "hidden",
    paddingLeft: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
