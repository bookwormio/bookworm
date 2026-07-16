import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../components/auth/context";
import WormLoader from "../components/wormloader/WormLoader";

/**
 * Root entry route ("/"). Expo Router needs a screen for the root path;
 * this resolves the initial auth state and redirects into the correct group.
 */
const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <WormLoader />
      </View>
    );
  }

  return <Redirect href={user != null ? "/posts" : "/SignIn"} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
});

export default Index;
