import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { FIREBASE_AUTH } from "../firebase.config";

export default function Profile() {
  const user = FIREBASE_AUTH.currentUser;
  const userStr: string = user?.email ?? "No email";
  const handleLogOut = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        router.replace("/login");
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
      <Text>Current User email: {userStr}</Text>
      <Button title="LogOut" onPress={handleLogOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
