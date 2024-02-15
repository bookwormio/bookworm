import React from "react";
import { StyleSheet } from "react-native";
import BottomTabs from "./components/ BottomTabs";

export default function Home() {
  return (
    <>
      <BottomTabs></BottomTabs>
    </>
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
