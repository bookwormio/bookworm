import { Slot } from "expo-router";
import React from "react";
import { AuthenticationProvider } from "../components/auth/context";

const AuthenticatedRoot = () => {
  return (
    <AuthenticationProvider>
      <Slot />
    </AuthenticationProvider>
  );
};

export default AuthenticatedRoot;
