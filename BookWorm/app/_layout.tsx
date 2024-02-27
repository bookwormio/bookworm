import { Slot } from "expo-router";
import React from "react";
import { AuthenticationProvider } from "../components/auth/context";

/*
loading AuthenticationProvider first then putting the entire app inside of it to make sure the user is there.
*/

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
