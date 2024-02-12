import { FIREBASE_AUTH } from "../firebase.config";
import { router, useRootNavigationState, useSegments } from "expo-router";
import { View } from "react-native";
import React, { useEffect } from "react";

export default function App() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  useEffect(() => {
    if (navigationState?.key == null) {
      return;
    }
    const user = FIREBASE_AUTH.currentUser;
    // Your async logic to check user authentication can be placed here
    // For simplicity, I'm using a synchronous check here
    if (user === null) {
      // Navigate to the 'login' route if the user is not authenticated
      router.replace("/login");
    } else {
      // Navigate to the 'home' route if the user is authenticated
      router.replace("/home");
    }
  }, [segments, navigationState?.key]);

  return <View></View>;
}
