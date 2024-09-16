import { FontAwesome5 } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const SearchLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="search"
        options={{ headerShown: true, headerTitle: "Search" }}
      />
      <Stack.Screen
        name="user/[friendUserID]"
        options={{
          headerShown: true,
          headerTitle: "User",
          headerLeft: () => (
            <View>
              {router.canGoBack() && (
                <TouchableOpacity
                  disabled={!router.canGoBack()}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="#FB6D0B" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="recommendation/[friendUserID]"
        options={{
          presentation: "modal",
          headerTitle: "Leave a Recommendation",
        }}
      />
      <Stack.Screen
        name="searchbook/[bookID]"
        options={{
          headerShown: true,
          headerTitle: "Book",
          headerLeft: () => (
            <View>
              {router.canGoBack() && (
                <TouchableOpacity
                  disabled={!router.canGoBack()}
                  onPress={() => {
                    router.back();
                  }}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="#FB6D0B" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
    </Stack>
  );
};

export default SearchLayout;
