import { Stack } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import BackButton from "../../components/backbutton/BackButton";

const AuthLayout = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack>
        <Stack.Screen name="SignIn" options={{ headerShown: false }} />
        <Stack.Screen
          name="CreateAccount"
          options={{
            headerTitle: "Create Account",
            headerLeft: () => <BackButton />,
          }}
        />
        <Stack.Screen
          name="MoreInfo"
          options={{
            headerTitle: "Account Info",
            headerBackVisible: false,
          }}
        />
      </Stack>
    </KeyboardAvoidingView>
  );
};

export default AuthLayout;
