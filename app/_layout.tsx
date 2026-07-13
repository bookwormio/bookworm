import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthenticationProvider } from "../components/auth/context";
import ErrorBoundary from "../components/errorBoundary/ErrorBoundary";

const originalGlobalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
  console.error("Global JS error handler caught:", error, { isFatal });
  originalGlobalHandler(error, isFatal);
});

const queryClient = new QueryClient();

const AuthenticatedRoot = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          <ErrorBoundary>
            <Slot />
          </ErrorBoundary>
          <Toast />
        </AuthenticationProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default AuthenticatedRoot;
