import React from "react";
import { Slot } from "expo-router";
import { SessionProvider } from "../ctx";

export default function AuthenticatedRoot() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
