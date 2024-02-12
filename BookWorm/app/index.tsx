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
    if (user === null) {
      router.replace("/login");
    } else {
      router.replace("/home");
    }
  }, [segments, navigationState?.key]);

  return <View></View>;
}
