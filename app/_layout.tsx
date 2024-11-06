import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthenticationProvider } from "../components/auth/context";

const queryClient = new QueryClient();

const AuthenticatedRoot = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          <Slot />
          <Toast />
        </AuthenticationProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default AuthenticatedRoot;
