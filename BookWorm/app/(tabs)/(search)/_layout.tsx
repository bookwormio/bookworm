import { Stack } from "expo-router";
import React from "react";

const SearchLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="FriendProfile" options={{ headerShown: false }} />
    </Stack>
  );
};

export default SearchLayout;
