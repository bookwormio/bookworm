import { Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen
        name="user/[friendUserID]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="bookviewpage" options={{ headerShown: false }} />
    </Stack>
  );
};

export default SearchLayout;
