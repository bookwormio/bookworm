import { Slot } from "expo-router";
import React from "react";
import { AuthenticationProvider } from "../components/auth/context";

export default function AuthenticatedRoot() {
  return (
    <AuthenticationProvider>
      <Slot />
    </AuthenticationProvider>
  );
}
