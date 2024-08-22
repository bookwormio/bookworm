import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const NotificationsScreen = () => {
  const handlePress = () => {
    alert("Hello World! This is a notification.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications Page</Text>
      <Button title="Show Alert" onPress={handlePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default NotificationsScreen;
