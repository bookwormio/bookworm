import { Stack } from "expo-router";
import React from "react";
import BackButton from "../../../components/backbutton/BackButton";

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
          headerLeft: () => <BackButton />,
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
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="posts/[postID]"
        options={{
          headerShown: true,
          headerTitle: "Post",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
};

export default SearchLayout;
