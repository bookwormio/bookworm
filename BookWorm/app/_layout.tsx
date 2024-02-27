import { Slot } from "expo-router";
import React from "react";
import { AuthenticationProvider } from "../components/auth/context";

// rendering AuthenticationProvider
// Slot is a child component within the AuthenticationProvider context
// AuthenticationProvider is a top level component where authentication context is provided
export default function AuthenticatedRoot() {
  return (
    <AuthenticationProvider>
      <Slot />
    </AuthenticationProvider>
  );
}
