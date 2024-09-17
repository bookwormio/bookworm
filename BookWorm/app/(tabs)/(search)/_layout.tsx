import { Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="search"
        options={{ headerShown: true, headerTitle: "Search" }}
      />
      <Stack.Screen
        name="user/[friendUserID]"
        options={{ headerShown: true, headerTitle: "User" }}
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
        options={{ headerShown: true, headerTitle: "Book" }}
      />
    </Stack>
  );
};

export default SearchLayout;
