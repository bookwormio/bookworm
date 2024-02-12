import { FIREBASE_AUTH } from "../firebase.config";
import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";

export default function Home() {
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
      <View style={styles.main}>
        <Text style={styles.title}>Home</Text>
        <Button title="LogOut" onPress={handleLogOut} />
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
