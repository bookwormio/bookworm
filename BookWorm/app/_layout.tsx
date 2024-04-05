import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import React from "react";
import { AuthenticationProvider } from "../components/auth/context";

const queryClient = new QueryClient();

const AuthenticatedRoot = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticationProvider>
        <Slot />
      </AuthenticationProvider>
    </QueryClientProvider>
  );
};

export default AuthenticatedRoot;
