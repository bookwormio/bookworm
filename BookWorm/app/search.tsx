import React from "react";
import { StyleSheet, Text, View } from "react-native";
export default function Search() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Page</Text>
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
