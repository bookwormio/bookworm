import { router, useRootNavigationState, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { FIREBASE_AUTH } from "../firebase.config";

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
      router.replace("/posts");
    }
  }, [segments, navigationState?.key]);

  return <View></View>;
}
