import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Tabs } from "expo-router/tabs";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../components/auth/context";

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

  const styles = StyleSheet.create({
    newPost: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: 20,
    },
  });

  return (
    <Tabs>
      <Tabs.Screen
        name="(posts)"
        options={{
          tabBarLabel: "Posts",
          headerTitle: "Posts",
          headerRight: () => (
            <TouchableOpacity
              style={styles.newPost}
              onPress={() => {
                router.push("NewPost");
              }}
            >
              <FontAwesome5 name="plus" size={20} />
            </TouchableOpacity>
          ),
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
