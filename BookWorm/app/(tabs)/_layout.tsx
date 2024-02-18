import { Tabs } from "expo-router/tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";

export default () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="posts"
        options={{
          tabBarLabel: "Posts",
          headerTitle: "Posts",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: "Search",
          headerTitle: "Search",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="id-card" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};
