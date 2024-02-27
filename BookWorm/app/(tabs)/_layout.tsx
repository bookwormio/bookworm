import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../components/auth/context";
/*
For everything in a directory file is rendered with whatever file
is being routed to. When we navigate to posts.tsx, its loading whatever is in the
_layout file first and then loading the posts.tsx on top of it
*/
export default function AppLayout() {
  const { isLoading } = useAuth();
  if (isLoading) {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: "center",
        padding: 40,
        justifyContent: "center",
      },
    });

    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

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
}
