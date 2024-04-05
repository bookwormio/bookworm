import { FontAwesome5 } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateAccount"
        options={{
          headerTitle: "Create Account",
          headerLeft: () => (
            <View>
              {router.canGoBack() && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  disabled={!router.canGoBack()}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <FontAwesome5
                    name="arrow-left"
                    size={20}
                    style={{ marginRight: 10 }}
                  />
                  <Text>Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <Stack.Screen name="MoreInfo" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
