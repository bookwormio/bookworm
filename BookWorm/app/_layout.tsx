import React from "react";
import { Slot } from "expo-router";
import { SessionProvider } from "../ctx";

export default function StackLayout() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
