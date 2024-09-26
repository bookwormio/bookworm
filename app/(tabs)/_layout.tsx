import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useAuth } from "../../components/auth/context";
import { PostsProvider } from "../../components/post/PostsContext";
import WormLoader from "../../components/wormloader/WormLoader";

const AppLayout = () => {
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
        <WormLoader />
      </View>
    );
  }

  return (
    <PostsProvider>
      <Tabs>
        <Tabs.Screen
          name="(posts)"
          options={{
            tabBarLabel: "Posts",
            headerShown: false,
            tabBarActiveTintColor: "#FB6D0B",
            tabBarInactiveTintColor: "grey",
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="stream" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(search)"
          options={{
            tabBarLabel: "Search",
            headerShown: false,
            tabBarActiveTintColor: "#FB6D0B",
            tabBarInactiveTintColor: "grey",
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(create)"
          options={{
            tabBarLabel: "Create",
            headerTitle: "Create",
            tabBarActiveTintColor: "#FB6D0B",
            tabBarInactiveTintColor: "grey",
            tabBarIcon: ({ size, focused, color }) => (
              <FontAwesome5 name="book-medical" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            tabBarLabel: "Profile",
            headerShown: false,
            tabBarActiveTintColor: "#FB6D0B",
            tabBarInactiveTintColor: "grey",
            tabBarIcon: ({ size, color }) => (
              <FontAwesome5 name="id-card" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </PostsProvider>
  );
};

export default AppLayout;
